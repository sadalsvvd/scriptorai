import React, { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import ReactMarkdown from "react-markdown";
import Link from "@docusaurus/Link";
import styles from "./TextTranslationPage.module.css";

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
      if (e.key === "ArrowLeft" && prevPageId) {
        window.location.href = buildPageLink(prevPageId);
      } else if (e.key === "ArrowRight" && nextPageId) {
        window.location.href = buildPageLink(nextPageId);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevPageId, nextPageId, leftView, rightView]);

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
    if (view === "transcription") {
      return (
        <div
          style={{
            overflowY: "auto",
            maxHeight: "70vh",
            background: "#f9f9f9",
            padding: 12,
          }}
        >
          <ReactMarkdown>{transcriptionText}</ReactMarkdown>
        </div>
      );
    }
    if (view === "translation") {
      return (
        <div
          style={{
            overflowY: "auto",
            maxHeight: "70vh",
            background: "#f9f9f9",
            padding: 12,
          }}
        >
          <ReactMarkdown>{translationText}</ReactMarkdown>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div style={{ padding: 24 }}>
        {/* Top navigation row with title/desc in center */}
        <div className={styles.navRow}>
          <PrevButton prevPageId={prevPageId} buildPageLink={buildPageLink} />
          <div
            style={{
              paddingLeft: 50,
              paddingRight: 50,
              textAlign: "center",
              flex: 1,
            }}
          >
            <h2 style={{ fontWeight: "bold", fontSize: 18 }}>
              {props.route.customData.textName} - Page {pageInt} of {pageCount}
            </h2>
            <p>
              PLEASE NOTE: This text was originally transcribed and translated
              with LLMs, provided as a starting point. There are likely to be
              errors. You can submit corrections with the "Suggest Corrections"
              button in the transcription and translation views.
            </p>
          </div>
          <NextButton nextPageId={nextPageId} buildPageLink={buildPageLink} />
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
          <PrevButton prevPageId={prevPageId} buildPageLink={buildPageLink} />
          <div style={{ flex: 1 }} />
          <NextButton nextPageId={nextPageId} buildPageLink={buildPageLink} />
        </div>
        {/* Info line about keyboard navigation */}
        <div className={styles.infoLine}>
          Tip: You can use the left and right arrow keys to navigate pages.
        </div>
      </div>
    </Layout>
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
