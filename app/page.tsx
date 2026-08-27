"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";

type ExtractedQuestion = {
  id: string;
  number: string;
  text: string;
  maxMarks: number;
  marks?: string;
  score?: number;
  status?: "answered" | "unanswered";
  page?: number;
  feedback?: string;
  answerRegions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  }>;
};

const PdfViewer = dynamic(() => import("./components/PdfViewer"), {
  ssr: false,
});

const PdfThumbnails = dynamic(() => import("./components/PdfThumbnails"), {
  ssr: false,
});

function UploadIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16.5v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.7 9a2.5 2.5 0 1 1 4.4 1.6c-.9 1-2.1 1.4-2.1 2.9" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21V5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M5 5.5V21" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 8h6M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="5"
        width="14"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M9 5V3h6v2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M19 13.5a7.8 7.8 0 0 0 0-3l2-1.5-2-3-2.3.9a8 8 0 0 0-2.5-1.5L14 3h-4l-.4 2.4a8 8 0 0 0-2.5 1.5L4.8 6 3 9l2 1.5a7.8 7.8 0 0 0 0 3L3 15l1.8 3 2.3-.9a8 8 0 0 0 2.5 1.5L10 21h4l.4-2.4a8 8 0 0 0 2.5-1.5l2.3.9 1.8-3-2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TeacherIllustration() {
  return (
    <div className="teacher-wrap">
      <div className="teacher-ring teacher-ring-outer" />
      <div className="teacher-ring teacher-ring-inner" />

      <div className="teacher-avatar">
        <div className="teacher-hair" />
        <div className="teacher-face">
          <div className="glasses">
            <span />
            <span />
          </div>
          <div className="teacher-eyes">
            <i />
            <i />
          </div>
          <div className="teacher-smile" />
        </div>
        <div className="teacher-body">
          <div className="teacher-shirt" />
          <div className="teacher-book">
            <span />
            <span />
          </div>
        </div>
      </div>

      <span className="floating-icon floating-one">✦</span>
      <span className="floating-icon floating-two">◌</span>
      <span className="floating-icon floating-three">⌁</span>
      <span className="floating-icon floating-four">✦</span>
    </div>
  );
}

type UploadCardProps = {
  title: string;
  type: "question" | "answer";
  file: File | null;
  onSelect: (file: File | null) => void;
};

function UploadCard({ title, type, file, onSelect }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    const allowed =
      selectedFile.type === "application/pdf" ||
      selectedFile.type.startsWith("image/");

    if (!allowed) {
      alert("Please upload a PDF or image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    onSelect(selectedFile);
  };

  return (
    <div
      className={`upload-card ${file ? "has-file" : ""}`}
      onClick={() => {
        if (!file) {
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add("dragging");
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove("dragging");
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove("dragging");
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="upload-icon">
        <UploadIcon />
      </div>

      {file ? (
        <div className="selected-file-wrapper">
          <button
            className="remove-file"
            aria-label={`Remove ${file.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);

              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
          >
            ×
          </button>

          <div className="selected-file">
            <div className="pdf-icon">PDF</div>

            <div className="selected-file-info">
              <div className="selected-file-name">{file.name}</div>

              <div className="selected-file-meta">
                {(file.size / 1024 / 1024).toFixed(1)} MB
                <span>•</span>
                PDF
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="upload-title">
            Upload <span>{title}</span>
          </div>

          <div className="upload-meta">Max 10MB</div>
        </>
      )}

      <div className={`file-type ${type}`}>{file ? "✓" : ""}</div>
    </div>
  );
}

export default function Home() {
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [screen, setScreen] = useState<"upload" | "extracting" | "results">(
    "upload",
  );
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);

  const handleStartMapping = async () => {
    if (!questionFile || !answerFile) return;

    setIsAnalyzing(true);
    setAnalysisError("");
    setScreen("extracting");

    try {
      const formData = new FormData();
      formData.append("questionFile", questionFile);
      formData.append("answerFile", answerFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }
      const extracted = data.questionPaper?.questions;

      if (!Array.isArray(extracted) || extracted.length === 0) {
        throw new Error(
          "No questions could be extracted from the question paper.",
        );
      }

      const normalizedQuestions: ExtractedQuestion[] = extracted.map(
        (question: Record<string, unknown>, index: number) => {
          const maxMarks =
            typeof question.maxMarks === "number" ? question.maxMarks : 2;

          const score =
            typeof question.score === "number" ? question.score : undefined;

          const status: "answered" | "unanswered" =
            question.status === "unanswered" || score === 0
              ? "unanswered"
              : "answered";

          const marks =
            typeof question.marks === "string"
              ? question.marks
              : score !== undefined
                ? `${score}/${maxMarks}`
                : `${maxMarks}/${maxMarks}`;

          return {
            id: typeof question.id === "string" ? question.id : `q${index + 1}`,

            number:
              typeof question.number === "string"
                ? question.number
                : `${index + 1}`,

            text:
              typeof question.text === "string"
                ? question.text
                : "Question text unavailable",

            maxMarks,

            marks,

            score,

            status,

            page: typeof question.page === "number" ? question.page : undefined,

            feedback:
              typeof question.feedback === "string"
                ? question.feedback
                : undefined,

            answerRegions: Array.isArray(question.answerRegions)
              ? question.answerRegions
                  .filter(
                    (region): region is Record<string, unknown> =>
                      typeof region === "object" && region !== null,
                  )
                  .map((region) => ({
                    x: typeof region.x === "number" ? region.x : 0,

                    y: typeof region.y === "number" ? region.y : 0,

                    width: typeof region.width === "number" ? region.width : 0,

                    height:
                      typeof region.height === "number" ? region.height : 0,

                    page: typeof region.page === "number" ? region.page : 1,
                  }))
              : [],
          };
        },
      );

      setQuestions(normalizedQuestions);
      console.log("Extracted questions:", normalizedQuestions);

      console.log("ANALYSIS RESULT:", data);
      setAnalysisResult(data);
      setScreen("results");
    } catch (error) {
      console.error(error);
      setAnalysisError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
      setScreen("upload");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ready = Boolean(questionFile && answerFile);

  if (screen === "extracting") {
    return (
      <main className="app-shell">
        <aside className="sidebar extracting-sidebar">
          <div className="brand-row">
            <div className="brand-mark">V</div>
          </div>

          <div className="sidebar-extract-icon">✦</div>

          <nav className="sidebar-mini-nav">
            <GridIcon />
            <BookIcon />
            <DocumentIcon />
            <ClipboardIcon />
            <ClockIcon />
          </nav>

          <div className="sidebar-bottom">
            <div className="school-logo">DPS</div>
            <div className="sidebar-expand">»</div>
          </div>
        </aside>

        <section className="main-area">
          <header className="topbar">
            <button className="back-button" aria-label="Go back">
              <BackIcon />
            </button>

            <div className="breadcrumb">
              <ClipboardIcon />
              <span>Exams</span>
            </div>

            <div className="topbar-right">
              <button className="icon-button help">
                <HelpIcon />
              </button>

              <button className="icon-button notification">
                <BellIcon />
                <span className="notification-dot" />
              </button>

              <button className="sparkle-button">✦</button>

              <div className="profile">
                <div className="profile-avatar">🔥</div>
                <strong>Madhur Rastogi</strong>
                <span className="chevron">⌄</span>
              </div>

              <button className="mobile-menu">
                <MenuIcon />
              </button>
            </div>
          </header>

          <div className="extracting-panel">
            <div className="extracting-content">
              <div className="extracting-sparkles">
                <span className="sparkle-large">✦</span>
                <span className="sparkle-medium">✦</span>
                <span className="sparkle-small">✦</span>
              </div>

              <h1>Extracting...</h1>
              <p>This may take a while</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "results") {
    return (
      <ResultsScreen
        answerFile={answerFile}
        onBack={() => setScreen("upload")}
        questions={questions}
      />
    );
  }

  return (
    <main className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">V</div>
          <div className="brand-name">VedaAI</div>

          <button className="collapse-button" aria-label="Collapse sidebar">
            ◧
          </button>
        </div>

        <div className="tool-pill">
          <span>✦</span>
          AI Teacher&apos;s Toolkit
        </div>

        <nav className="sidebar-nav">
          <a>
            <GridIcon />
            <span>Home</span>
          </a>

          <a>
            <BookIcon />
            <span>My Classroom</span>
          </a>

          <a>
            <DocumentIcon />
            <span>Assignments</span>
          </a>

          <a className="active">
            <ClipboardIcon />
            <span>Exams</span>
          </a>

          <a>
            <ClockIcon />
            <span>My Library</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a className="settings-link">
            <SettingsIcon />
            <span>Settings</span>
          </a>

          <div className="school-card">
            <div className="school-logo">DPS</div>
            <div>
              <strong>Delhi Public School</strong>
              <span>Bokaro Steel City</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="main-area">
        <header className="topbar">
          <button className="back-button" aria-label="Go back">
            <BackIcon />
          </button>

          <div className="breadcrumb">
            <ClipboardIcon />
            <span>Exams</span>
          </div>

          <div className="topbar-right">
            <button className="icon-button help">
              <HelpIcon />
            </button>

            <button className="icon-button notification">
              <BellIcon />
              <span className="notification-dot" />
            </button>

            <button className="sparkle-button">✦</button>

            <div className="profile">
              <div className="profile-avatar">🔥</div>
              <strong>Madhur Rastogi</strong>
              <span className="chevron">⌄</span>
            </div>

            <button className="mobile-menu">
              <MenuIcon />
            </button>
          </div>
        </header>

        <div className="content">
          <div className="hero">
            <h1>
              Upload <span>Question Paper &amp; Answer Sheets</span>
            </h1>

            <p>Upload both files to get started</p>

            <TeacherIllustration />
          </div>

          <div className="upload-container">
            <UploadCard
              title="Question Paper"
              type="question"
              file={questionFile}
              onSelect={setQuestionFile}
            />

            <UploadCard
              title="Answer Sheet"
              type="answer"
              file={answerFile}
              onSelect={setAnswerFile}
            />
          </div>

          <button
            className={`mapping-button ${ready && !isAnalyzing ? "ready" : ""}`}
            disabled={!ready || isAnalyzing}
            onClick={handleStartMapping}
          >
            <span>{isAnalyzing ? "Analyzing..." : "Start Mapping"}</span>
            <ArrowRight />
          </button>

          {analysisError && (
            <p
              className="analysis-error"
              style={{
                color: "#ef5350",
                marginTop: "12px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Error: {analysisError}
            </p>
          )}

          <p className="mapping-help">
            Once both files are uploaded, you&apos;ll able to map answers with
            questions
          </p>
        </div>
      </section>
    </main>
  );
}


function ResultsScreen({
  answerFile,
  onBack,
  questions,
}: {
  answerFile: File | null;
  onBack: () => void;
  questions: ExtractedQuestion[];
}) {
  const extractedQuestions = questions;
  const [selectedQuestion, setSelectedQuestion] = useState(
    questions[0]?.id || "",
  );
  const [mobileView, setMobileView] = useState<"questions" | "answers">(
    "questions",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const selected = extractedQuestions.find(
    (question) => question.id === selectedQuestion,
  );

  const currentHighlights =
    selected?.answerRegions
      ?.filter((region) => region.page === currentPage)
      .map((region) => ({
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
        label: selected.number,
      })) ?? [];

  return (
    <main className="results-shell">
      <aside className="results-sidebar">
        <div className="results-brand">
          <div className="brand-mark">V</div>
        </div>

        <div className="results-ai-icon">✦</div>

        <nav className="results-nav">
          <GridIcon />
          <BookIcon />
          <DocumentIcon />
          <ClipboardIcon />
          <ClockIcon />
        </nav>

        <div className="results-sidebar-bottom">
          <div className="school-logo">DPS</div>
          <div className="sidebar-expand">»</div>
        </div>
      </aside>

      <section className="results-main">
        <header className="topbar">
          <button className="back-button" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>

          <div className="breadcrumb">
            <ClipboardIcon />
            <span>Exams</span>
          </div>

          <div className="topbar-right">
            <button className="icon-button help">
              <HelpIcon />
            </button>

            <button className="icon-button notification">
              <BellIcon />
              <span className="notification-dot" />
            </button>

            <button className="sparkle-button">✦</button>

            <div className="profile">
              <div className="profile-avatar">🔥</div>
              <strong>Madhur Rastogi</strong>
              <span className="chevron">⌄</span>
            </div>

            <button className="mobile-menu">
              <MenuIcon />
            </button>
          </div>
        </header>

        <div className="mobile-results-tabs">
          <button
            className={mobileView === "questions" ? "active" : ""}
            onClick={() => setMobileView("questions")}
          >
            Questions
          </button>

          <button
            className={mobileView === "answers" ? "active" : ""}
            onClick={() => setMobileView("answers")}
          >
            Answer Sheet
          </button>
        </div>

        <div className="results-content">
          <section
            className={`questions-panel ${
              mobileView === "answers" ? "mobile-hidden" : ""
            }`}
          >
            <div className="questions-header">
              <h2>
                Extracted Questions <span>(from question paper)</span>
              </h2>

              <button className="expand-all">Expand All</button>
            </div>

            <div className="question-list">
              {extractedQuestions.map((question) => {
                const isSelected = question.id === selectedQuestion;

                return (
                  <button
                    key={question.id}
                    className={`question-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedQuestion(question.id);

                      if (question.page) {
                        setCurrentPage(question.page);
                      }

                      if (window.innerWidth <= 900) {
                        setMobileView("answers");
                      }
                    }}
                  >
                    <div
                      className={`question-number ${
                        question.status === "unanswered"
                          ? "unanswered-number"
                          : ""
                      }`}
                    >
                      {question.number}
                    </div>

                    <div className="question-body">
                      <p>{question.text}</p>

                      {isSelected && question.feedback && (
                        <div className="feedback-box">
                          <strong>AI Feedback</strong>
                          <p>{question.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div
                      className={`marks ${
                        question.status === "unanswered" ? "marks-zero" : ""
                      }`}
                    >
                      {question.marks}
                    </div>

                    <div className="question-chevron">
                      {isSelected ? "⌃" : "⌄"}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            className={`answer-panel ${
              mobileView === "questions" ? "mobile-hidden" : ""
            }`}
          >
            <div className="answer-header">
              <strong>Answer Sheet</strong>

              <div className="answer-controls">
                <button
                  onClick={() => {
                    setZoom((value) => Math.max(0.5, value - 0.1));
                  }}
                >
                  −
                </button>

                <span>{Math.round(zoom * 100)}%</span>

                <button
                  onClick={() => {
                    setZoom((value) => Math.min(2, value + 0.1));
                  }}
                >
                  +
                </button>
              </div>

              <div className="page-control">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((page) => Math.max(1, page - 1));
                  }}
                >
                  ‹
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((page) => Math.min(totalPages, page + 1));
                  }}
                >
                  ›
                </button>
              </div>
            </div>

            <div className="answer-viewer">
              {answerFile && (
                <PdfThumbnails
                  file={answerFile}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              )}

              <div className="answer-document">
                {answerFile ? (
                  <PdfViewer
                    file={answerFile}
                    pageNumber={currentPage}
                    zoom={zoom}
                    highlights={currentHighlights}
                    onPageCount={setTotalPages}
                  />
                ) : (
                  <div className="answer-placeholder">
                    <div className="placeholder-page">
                      <div>Q1.</div>

                      <div className="placeholder-lines">
                        Artificial Intelligence is a field of computer
                        science...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
