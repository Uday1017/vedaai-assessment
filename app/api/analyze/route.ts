import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = "nodejs";

/* =========================================================
   TYPES
========================================================= */

type ExtractedQuestion = {
  id: string;
  number: string;
  text: string;
  maxMarks: number;
};

type AnswerRegion = {
  page: number;

  // Normalized coordinates from 0 to 1000
  x: number;
  y: number;
  width: number;
  height: number;

  label?: string;
};

type EvaluatedQuestion = ExtractedQuestion & {
  score: number;

  status: "answered" | "unanswered" | "unclear";

  answerText: string;

  feedback: string;

  answerRegions: AnswerRegion[];
};

type UnmatchedAnswer = {
  page: number;

  answerText: string;

  region: AnswerRegion;
};

/* =========================================================
   SUPPORTED FILE TYPES
========================================================= */

const SUPPORTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

function isSupportedFile(file: File) {
  return SUPPORTED_TYPES.includes(file.type);
}

/* =========================================================
   GEMINI CLIENT
========================================================= */

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({
    apiKey,
  });
}

/* =========================================================
   FILE → GEMINI INLINE DATA
========================================================= */

async function fileToInlineData(file: File) {
  const bytes = await file.arrayBuffer();

  return {
    mimeType: file.type,
    data: Buffer.from(bytes).toString("base64"),
  };
}

/* =========================================================
   STEP 1
   EXTRACT QUESTIONS FROM QUESTION PAPER
========================================================= */

async function extractQuestionsWithGemini(
  file: File,
): Promise<ExtractedQuestion[]> {
  const ai = getGeminiClient();

  const inlineData = await fileToInlineData(file);

  console.log("Extracting questions with Gemini...");

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: [
      {
        text: `
You are an expert assessment document parser.

Analyze the uploaded question paper carefully.

Your task is to extract EVERY question from the document.

IMPORTANT RULES:

1. Preserve the exact printed question order.

2. Preserve the original question numbering.

3. Treat labelled sub-parts as separate questions.

For example:

11(a)
11(b)

must become two separate question objects.

4. Handle formats such as:

1.
1)
Q1
Q.1
3(a)
3 (a)
3(i)
3(ii)

5. Do not combine sub-questions.

6. Do not skip questions.

7. Do not invent questions.

8. Ignore:

- school/college names
- exam titles
- instructions
- section headings
- page numbers
- dates
- student information
- decorative text

9. Preserve the actual wording of every question as accurately as possible.

10. If marks are explicitly shown, extract them.

11. If marks are not shown, use 2.

12. The "id" must be stable and based on the question number.

Examples:

Question 1 → q1
Question 2 → q2
Question 3(a) → q3a
Question 3(b) → q3b

13. Return ONLY the structured JSON requested by the schema.
                `,
      },

      {
        inlineData,
      },
    ],

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: Type.ARRAY,

        items: {
          type: Type.OBJECT,

          properties: {
            id: {
              type: Type.STRING,
            },

            number: {
              type: Type.STRING,
            },

            text: {
              type: Type.STRING,
            },

            maxMarks: {
              type: Type.NUMBER,
            },
          },

          required: ["id", "number", "text", "maxMarks"],
        },
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty question response.");
  }

  try {
    const questions = JSON.parse(response.text) as ExtractedQuestion[];

    return questions;
  } catch {
    throw new Error("Gemini returned invalid question data.");
  }
}

/* =========================================================
   STEP 2
   EVALUATE ANSWER SHEET
========================================================= */

async function evaluateAnswersWithGemini(
  questions: ExtractedQuestion[],
  answerFile: File,
): Promise<{
  questions: EvaluatedQuestion[];
  unmatchedAnswers: UnmatchedAnswer[];
}> {
  const ai = getGeminiClient();

  const inlineData = await fileToInlineData(answerFile);

  console.log("Analyzing handwritten answer sheet with Gemini...");

  /*
   * Give Gemini the extracted questions so it knows
   * exactly what it needs to find in the answer sheet.
   */

  const questionList = questions
    .map(
      (question) =>
        `${question.number}. ${question.text} [${question.maxMarks} marks]`,
    )
    .join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: [
      {
        text: `
You are an expert exam answer-sheet analyzer.

You are given:

1. A list of questions extracted from a question paper.
2. A student's handwritten answer sheet.

Your job is to locate, identify, and evaluate the student's answers.

QUESTIONS:

${questionList}


========================
ANSWER MAPPING
========================

For EVERY question:

1. Determine whether the student attempted it.

2. Find the student's answer even if the student answered questions OUT OF ORDER.

3. Match the handwritten answer to the correct question number.

4. Do NOT assume that answers appear in question-paper order.

5. If the student did not answer a question:

status = "unanswered"

score = 0

answerText = ""

answerRegions = []


========================
SUB-PARTS
========================

Treat sub-parts separately.

For example:

3(a)
3(b)

must have separate evaluation objects.


========================
SCORING
========================

Evaluate the answer against the question.

Give a score between:

0 and maxMarks

The score should reflect how correctly the student answered.

Do not give marks simply because text exists.

For a clearly correct answer:
give full or near-full marks.

For a partially correct answer:
give partial marks.

For an incorrect answer:
give 0.

For an unanswered question:
give 0.


========================
HANDWRITTEN TEXT
========================

Read the student's handwriting as accurately as possible.

Return a concise transcription in "answerText".

Do not invent text that cannot reasonably be read.


========================
ANSWER REGIONS
========================

This is extremely important.

For every answered question, identify the EXACT region of the answer on the answer sheet.

Return one or more regions.

Coordinates MUST be normalized from 0 to 1000.

Coordinate system:

x = horizontal position from left
y = vertical position from top
width = region width
height = region height

Examples:

left edge = x 0
right edge = x 1000

top = y 0
bottom = y 1000


The region should cover the student's ACTUAL ANSWER TEXT.

Do NOT highlight:

- unrelated text
- another question
- large blank areas
- the whole page
- the question paper
- page margins


========================
MULTI-PAGE ANSWERS
========================

If an answer continues onto another page:

return multiple answerRegions.

For example:

[
  {
    "page": 1,
    "x": 100,
    "y": 300,
    "width": 700,
    "height": 250
  },
  {
    "page": 2,
    "x": 120,
    "y": 100,
    "width": 700,
    "height": 300
  }
]


========================
UNMATCHED ANSWERS
========================

If the answer sheet contains an answer that cannot be matched to any
question in the provided question list:

DO NOT force it into a question.

Put it inside "unmatchedAnswers".

Examples:

- unclear question number
- answer to a question that does not exist
- unrelated handwritten content


========================
IMPORTANT
========================

Return one evaluation object for EVERY provided question.

Keep the original question order.

Do not remove unanswered questions.

Do not invent missing answers.

Return ONLY the JSON requested by the schema.
                `,
      },

      {
        inlineData,
      },
    ],

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: Type.OBJECT,

        properties: {
          questions: {
            type: Type.ARRAY,

            items: {
              type: Type.OBJECT,

              properties: {
                id: {
                  type: Type.STRING,
                },

                number: {
                  type: Type.STRING,
                },

                text: {
                  type: Type.STRING,
                },

                maxMarks: {
                  type: Type.NUMBER,
                },

                score: {
                  type: Type.NUMBER,
                },

                status: {
                  type: Type.STRING,
                  enum: ["answered", "unanswered", "unclear"],
                },

                answerText: {
                  type: Type.STRING,
                },

                feedback: {
                  type: Type.STRING,
                },

                answerRegions: {
                  type: Type.ARRAY,

                  items: {
                    type: Type.OBJECT,

                    properties: {
                      page: {
                        type: Type.NUMBER,
                      },

                      x: {
                        type: Type.NUMBER,
                      },

                      y: {
                        type: Type.NUMBER,
                      },

                      width: {
                        type: Type.NUMBER,
                      },

                      height: {
                        type: Type.NUMBER,
                      },

                      label: {
                        type: Type.STRING,
                      },
                    },

                    required: ["page", "x", "y", "width", "height"],
                  },
                },
              },

              required: [
                "id",
                "number",
                "text",
                "maxMarks",
                "score",
                "status",
                "answerText",
                "feedback",
                "answerRegions",
              ],
            },
          },

          unmatchedAnswers: {
            type: Type.ARRAY,

            items: {
              type: Type.OBJECT,

              properties: {
                page: {
                  type: Type.NUMBER,
                },

                answerText: {
                  type: Type.STRING,
                },

                region: {
                  type: Type.OBJECT,

                  properties: {
                    page: {
                      type: Type.NUMBER,
                    },

                    x: {
                      type: Type.NUMBER,
                    },

                    y: {
                      type: Type.NUMBER,
                    },

                    width: {
                      type: Type.NUMBER,
                    },

                    height: {
                      type: Type.NUMBER,
                    },

                    label: {
                      type: Type.STRING,
                    },
                  },

                  required: ["page", "x", "y", "width", "height"],
                },
              },

              required: ["page", "answerText", "region"],
            },
          },
        },

        required: ["questions", "unmatchedAnswers"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty answer evaluation.");
  }

  try {
    const result = JSON.parse(response.text) as {
      questions: EvaluatedQuestion[];
      unmatchedAnswers: UnmatchedAnswer[];
    };

    return result;
  } catch {
    throw new Error("Gemini returned invalid answer evaluation data.");
  }
}

/* =========================================================
   MAIN API
========================================================= */

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const questionFile = formData.get("questionFile");

    const answerFile = formData.get("answerFile");

    /* -----------------------------
           Validate question file
        ----------------------------- */

    if (!(questionFile instanceof File)) {
      return NextResponse.json(
        {
          error: "Question paper is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* -----------------------------
           Validate answer file
        ----------------------------- */

    if (!(answerFile instanceof File)) {
      return NextResponse.json(
        {
          error: "Answer sheet is required.",
        },
        {
          status: 400,
        },
      );
    }

    /* -----------------------------
           Validate file types
        ----------------------------- */

    if (!isSupportedFile(questionFile)) {
      return NextResponse.json(
        {
          error:
            "Unsupported question paper format. Please upload a PDF, JPG, PNG, or WebP file.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isSupportedFile(answerFile)) {
      return NextResponse.json(
        {
          error:
            "Unsupported answer sheet format. Please upload a PDF, JPG, PNG, or WebP file.",
        },
        {
          status: 400,
        },
      );
    }

    /* =================================================
           STEP 1 — QUESTION EXTRACTION
        ================================================= */

    const questions = await extractQuestionsWithGemini(questionFile);

    console.log(`Gemini extracted ${questions.length} questions.`);

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: "No questions could be extracted from the question paper.",
        },
        {
          status: 422,
        },
      );
    }

    /* =================================================
           STEP 2 — ANSWER ANALYSIS
        ================================================= */

    const evaluation = await evaluateAnswersWithGemini(questions, answerFile);

    console.log(`Gemini evaluated ${evaluation.questions.length} questions.`);

    /* =================================================
           STEP 3 — SAFETY VALIDATION
        ================================================= */

    const evaluatedQuestions = evaluation.questions.map((question) => {
      /*
       * Make sure score never exceeds
       * the maximum marks.
       */

      const safeScore = Math.max(
        0,
        Math.min(question.score, question.maxMarks),
      );

      /*
       * Unanswered questions must
       * never have answer regions.
       */

      if (question.status === "unanswered") {
        return {
          ...question,
          score: 0,
          answerText: "",
          answerRegions: [],
        };
      }

      return {
        ...question,
        score: safeScore,
      };
    });

    /* =================================================
           STEP 4 — RETURN COMPLETE RESULT
        ================================================= */

    return NextResponse.json({
      success: true,

      extractionMethod: "gemini-vision",

      questionPaper: {
        fileName: questionFile.name,

        fileType: questionFile.type,

        questions: evaluatedQuestions,
      },

      answerPaper: {
        fileName: answerFile.name,

        fileType: answerFile.type,

        size: answerFile.size,
      },

      unmatchedAnswers: evaluation.unmatchedAnswers,

      message: "Questions extracted and answers mapped successfully.",
    });
  } catch (error) {
    console.error("Analyze error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze the uploaded files.",
      },
      {
        status: 500,
      },
    );
  }
}
