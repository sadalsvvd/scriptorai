import React, { useState, useEffect, useRef } from "react";
import Layout from "@theme/Layout";
import ReactMarkdown from "react-markdown";
import Link from "@docusaurus/Link";
import styles from "./TextTranslationPage.module.css";
import BrowserOnly from "@docusaurus/BrowserOnly";

const VIEW_TYPES = ["image", "transcription", "translation"] as const;

type TextTranslationPageProps = {
  route: {
    customData: {
      textSlug: string;
      textName: string;
      pageId: string;
      pageInt: number;
      pageCount: number;
      prevPageId: string | null;
      nextPageId: string | null;
      image: string;
      transcription: string;
      translation: string;
      githubRepo: string;
    };
  };
};

// Helper to get query params
function getQueryParam(name: string, search: string) {
  const params = new URLSearchParams(search);
  return params.get(name);
}

// Helper to set query params
function setQueryParams(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams(window.location.search);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  });
  return `?${searchParams.toString()}`;
}

// Helper to extract filename from a URL
function getFilenameFromUrl(url: string) {
  try {
    return url.split("/").pop() || "";
  } catch {
    return "";
  }
}

export default function TextTranslationPage(props: TextTranslationPageProps) {
  const {
    pageId,
    pageInt,
    pageCount,
    image,
    transcription,
    translation,
    prevPageId,
    nextPageId,
  } = props.route.customData;
  // Read initial tab state from query string
  const initialLeft =
    typeof window !== "undefined"
      ? getQueryParam("left", window.location.search)
      : undefined;
  const initialRight =
    typeof window !== "undefined"
      ? getQueryParam("right", window.location.search)
      : undefined;

  const [leftView, setLeftView] = useState<(typeof VIEW_TYPES)[number]>(
    initialLeft && VIEW_TYPES.includes(initialLeft as any)
      ? (initialLeft as any)
      : "image"
  );
  const [rightView, setRightView] = useState<(typeof VIEW_TYPES)[number]>(
    initialRight && VIEW_TYPES.includes(initialRight as any)
      ? (initialRight as any)
      : "translation"
  );
  const [transcriptionText, setTranscriptionText] = useState("");
  const [translationText, setTranslationText] = useState("");
  const [goToPage, setGoToPage] = useState("");
  const goToInputRef = useRef(null);

  useEffect(() => {
    fetch(transcription)
      .then((res) => (res.ok ? res.text() : "Transcription not found."))
      .then(setTranscriptionText);
    fetch(translation)
      .then((res) => (res.ok ? res.text() : "Translation not found."))
      .then(setTranslationText);
  }, [transcription, translation]);

  // Update query string when tab changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newSearch = setQueryParams({ left: leftView, right: rightView });
      if (window.location.search !== newSearch) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${newSearch}`
        );
      }
    }
  }, [leftView, rightView]);

  // Helper to build link with current tab state
  function buildPageLink(pageId: string) {
    const params = setQueryParams({ left: leftView, right: rightView });
    return `/texts/${props.route.customData.textSlug}/${pageId}${params}`;
  }

  // Keyboard navigation: left/right arrow keys
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't navigate if any modifier key is held
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      if (e.key === "ArrowLeft" && prevPageId) {
        window.location.href = buildPageLink(prevPageId);
      } else if (e.key === "ArrowRight" && nextPageId) {
        window.location.href = buildPageLink(nextPageId);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevPageId, nextPageId, leftView, rightView]);

  function handleGoToPage(e) {
    e.preventDefault();
    const num = Number(goToPage);
    if (!num || num < 1 || num > pageCount) return;
    // Pad the page number to 4 digits
    const paddedPageId = num.toString().padStart(4, "0");
    window.location.href = buildPageLink(paddedPageId);
    setGoToPage("");
    if (goToInputRef.current) goToInputRef.current.blur();
  }

  const renderPane = (view: (typeof VIEW_TYPES)[number]) => {
    if (view === "image") {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "70vh",
            width: "100%",
          }}
        >
          <img
            src={image}
            alt={`Scan for page ${pageId}`}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              border: "1px solid #ccc",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>
      );
    }
    if (view === "transcription" || view === "translation") {
      // Get the right file URL and filename
      const fileUrl = view === "transcription" ? transcription : translation;
      const filename = getFilenameFromUrl(fileUrl);
      const githubRepo = props.route.customData.githubRepo;
      const fileLink = `${githubRepo}/blob/main/${view}/${filename}`;
      const editLink = `${githubRepo}/edit/main/${view}/${filename}`;
      const issueTitle = `Suggestion for ${view} corrections: ${filename}`;
      const issueBody = encodeURIComponent(
        `I have a suggestion for corrections to the following file:\n\n` +
          `[${filename}](${fileLink})\n\n` +
          `(If you know how to use GitHub, you can fork this repository and edit the file directly at this link and then send a pull request: [edit this file](${editLink}))\n`
      );
      const issueUrl = `${githubRepo}/issues/new?title=${encodeURIComponent(
        issueTitle
      )}&body=${issueBody}`;
      return (
        <div>
          <div
            style={{
              overflowY: "auto",
              maxHeight: "70vh",
              background: "#f9f9f9",
              padding: 12,
            }}
          >
            <ReactMarkdown>
              {view === "transcription" ? transcriptionText : translationText}
            </ReactMarkdown>
          </div>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <a
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <button
                className={styles.navButton}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {/* GitHub logo SVG */}
                <svg
                  height="20"
                  width="20"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Suggest Corrections on GitHub
              </button>
            </a>
          </div>
        </div>
      );
    }
    return null;
  };

  const pageTitle = `${props.route.customData.textName} - Page ${pageInt} of ${
    pageCount - 1
  }`;

  return (
    <BrowserOnly>
      {() => (
        <Layout
          title={`${pageTitle} - Scriptorai`}
          description="Scriptorai is an open source, community-oriented project which hosts first-pass, LLM-powered translations of public domain esoteric texts, seeking to make previously inaccessible texts browsable by human beings and real translators which can then be improved upon collaboratively."
        >
          <div style={{ padding: 24 }}>
            {/* Top navigation row with title/desc in center */}
            <div className={styles.navRow}>
              <PrevButton
                prevPageId={prevPageId}
                buildPageLink={buildPageLink}
              />
              <div
                style={{
                  paddingLeft: 50,
                  paddingRight: 50,
                  textAlign: "center",
                  flex: 1,
                }}
              >
                <h2 style={{ fontWeight: "bold", fontSize: 18 }}>
                  {props.route.customData.textName} - Page {pageInt} of{" "}
                  {pageCount - 1}
                </h2>
                <p>
                  PLEASE NOTE: This text was originally transcribed and
                  translated with LLMs, provided as a starting point. There are
                  likely to be errors. You can submit corrections with the
                  "Suggest Corrections" button in the transcription and
                  translation views.
                </p>
              </div>
              <NextButton
                nextPageId={nextPageId}
                buildPageLink={buildPageLink}
              />
            </div>
            {/* Viewer panes */}
            <div style={{ display: "flex", gap: 24 }}>
              {[
                { side: "left", view: leftView, setView: setLeftView },
                { side: "right", view: rightView, setView: setRightView },
              ].map(({ side, view, setView }) => (
                <div
                  key={side}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: "1px solid #eee",
                    borderRadius: 8,
                    background: "#fff",
                    boxShadow: "0 1px 4px #0001",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                      padding: 8,
                      borderBottom: "1px solid #eee",
                      background: "#f5f5f5",
                    }}
                  >
                    {VIEW_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setView(type)}
                        style={{
                          fontWeight: view === type ? "bold" : "normal",
                          background: view === type ? "#e0e0e0" : "transparent",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div style={{ padding: 12 }}>{renderPane(view)}</div>
                </div>
              ))}
            </div>
            {/* Bottom navigation row with extra margin */}
            <div className={`${styles.navRow} ${styles.navRowBelow}`}>
              <PrevButton
                prevPageId={prevPageId}
                buildPageLink={buildPageLink}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <form
                  onSubmit={handleGoToPage}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <input
                      ref={goToInputRef}
                      type="number"
                      min={1}
                      max={pageCount}
                      value={goToPage}
                      onChange={(e) =>
                        setGoToPage(e.target.value.replace(/[^\d]/g, ""))
                      }
                      placeholder={`Go to page (1-${pageCount})`}
                      style={{
                        width: 140,
                        padding: "10px 16px",
                        border: "1.5px solid #bfc3ca",
                        borderRadius: 6,
                        fontSize: 18,
                        marginRight: 4,
                      }}
                    />
                    <button
                      type="submit"
                      className={styles.navButton}
                      style={{ padding: "10px 24px", fontSize: 18 }}
                      disabled={
                        !goToPage ||
                        Number(goToPage) < 1 ||
                        Number(goToPage) > pageCount
                      }
                    >
                      Go
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                    Pages start at 0.
                  </div>
                </form>
              </div>
              <NextButton
                nextPageId={nextPageId}
                buildPageLink={buildPageLink}
              />
            </div>
            {/* Info line about keyboard navigation */}
            <div className={styles.infoLine}>
              Tip: You can use the left and right arrow keys to navigate pages.
            </div>
          </div>
        </Layout>
      )}
    </BrowserOnly>
  );
}

// Individual button components
function PrevButton({ prevPageId, buildPageLink }) {
  if (prevPageId) {
    return (
      <Link to={buildPageLink(prevPageId)}>
        <button className={styles.navButton}>← Prev</button>
      </Link>
    );
  }
  return (
    <button
      className={`${styles.navButton} ${styles.navButtonDisabled}`}
      disabled
    >
      ← Prev
    </button>
  );
}

function NextButton({ nextPageId, buildPageLink }) {
  if (nextPageId) {
    return (
      <Link to={buildPageLink(nextPageId)}>
        <button className={styles.navButton}>Next →</button>
      </Link>
    );
  }
  return (
    <button
      className={`${styles.navButton} ${styles.navButtonDisabled}`}
      disabled
    >
      Next →
    </button>
  );
}
