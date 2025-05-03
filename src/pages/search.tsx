import React, { useState, useEffect, useRef } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import lunr from "lunr";

// Available texts (expandable in the future)
const AVAILABLE_TEXTS = [
  {
    slug: "CCAG_1",
    label: "CCAG 1",
    indexPath: "/texts_indices/CCAG_1.json",
  },
  // Add more texts here as needed
];

export default function SearchPage() {
  // State for which texts are selected
  const [selectedTexts, setSelectedTexts] = useState([AVAILABLE_TEXTS[0].slug]);
  // State for loaded index data: { slug: [entries] }
  const [indicesData, setIndicesData] = useState({});
  // State for search query
  const [query, setQuery] = useState("");
  // State for search results
  const [results, setResults] = useState([]);
  // State for loading/fetching
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Debug log state
  const [debugLogs, setDebugLogs] = useState([]);
  const didAutoSearch = useRef(false);
  // Store the last submitted search term
  const [lastSearchTerm, setLastSearchTerm] = useState("");

  // On mount, check for ?q= in the URL and set query if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    if (q && !query) {
      setQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When query changes, if it was set from the URL and we haven't auto-searched, auto-search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    if (q && query === q && !didAutoSearch.current) {
      didAutoSearch.current = true;
      setTimeout(() => {
        document
          .getElementById("search-form")
          ?.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
          );
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Helper to add to debug log (and console)
  function logDebug(msg, data) {
    setDebugLogs((prev) => [
      {
        msg,
        data: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
      ...prev.slice(0, 19), // keep last 20
    ]);
    // eslint-disable-next-line no-console
    console.log("[DEBUG]", msg, data);
  }

  // Handle checkbox change for selecting texts
  function handleTextSelect(slug) {
    setSelectedTexts((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  // Fetch index data for all selected texts (if not already loaded)
  async function ensureIndicesLoaded() {
    const missing = selectedTexts.filter((slug) => !indicesData[slug]);
    if (missing.length === 0) return indicesData;
    setLoading(true);
    setError(null);
    try {
      const newData = {};
      for (const slug of missing) {
        const meta = AVAILABLE_TEXTS.find((t) => t.slug === slug);
        logDebug(`Fetching index for ${slug} from ${meta.indexPath}`, null);
        const resp = await fetch(meta.indexPath);
        if (!resp.ok) throw new Error(`Failed to fetch ${meta.indexPath}`);
        const data = await resp.json();
        logDebug(`Fetched data for ${slug}`, {
          length: data.length,
          sample: data[0],
        });
        newData[slug] = data;
      }
      const merged = { ...indicesData, ...newData };
      setIndicesData(merged);
      return merged;
    } catch (e) {
      setError(e.message || "Unknown error");
      logDebug("Error fetching indices", e.message || e);
      return indicesData;
    } finally {
      setLoading(false);
    }
  }

  // Handle search submit
  async function handleSearch(e) {
    e.preventDefault();
    // Update the URL with the search term as a query param
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    const newUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);

    setResults([]);
    setError(null);
    setDebugLogs([]);
    setLastSearchTerm(query); // Only update on submit
    const upToDateIndices = await ensureIndicesLoaded();
    logDebug("Starting search", { selectedTexts, query });
    // After loading, build lunr indices and search
    const allResults = [];
    for (const slug of selectedTexts) {
      const entries = upToDateIndices[slug];
      if (!entries) {
        logDebug(`No entries loaded for ${slug}`, null);
        continue;
      }
      logDebug(`Building lunr index for ${slug}`, {
        count: entries.length,
        sample: entries[0],
      });
      // Build a lunr index for this text
      let idx;
      try {
        idx = lunr(function () {
          this.ref("id");
          this.field("title");
          this.field("text");
          this.field("page");
          entries.forEach((entry) => {
            this.add(entry);
          });
        });
      } catch (err) {
        logDebug(`Error building lunr index for ${slug}`, err.message || err);
        continue;
      }
      logDebug(`Lunr index built for ${slug}`, null);
      // Run the query
      let matches = [];
      try {
        matches = idx.search(query);
        logDebug(`Lunr search results for ${slug}`, matches);
      } catch (err) {
        logDebug(`Error running lunr search for ${slug}`, err.message || err);
        continue;
      }
      // Map results to full entry data
      const mapped = matches.map((m) => {
        const entry = entries.find((e) => e.id === m.ref);
        if (!entry)
          logDebug(`No entry found for ref ${m.ref} in ${slug}`, null);
        return {
          ...entry,
          score: m.score,
          slug,
        };
      });
      logDebug(`Mapped results for ${slug}`, mapped);
      allResults.push(...mapped);
    }
    // Sort results by score descending
    allResults.sort((a, b) => b.score - a.score);
    logDebug("Final sorted results", allResults);
    setResults(allResults);
  }

  // Helper to get all matches with context, highlighting only the match
  function getContextualMatches(text, term) {
    if (!term) return [];
    const matches = [];
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    let idx = 0;
    while ((idx = lowerText.indexOf(lowerTerm, idx)) !== -1) {
      const start = Math.max(0, idx - 100);
      const end = Math.min(text.length, idx + lowerTerm.length + 100);
      const prefix = start > 0 ? "..." : "";
      const suffix = end < text.length ? "..." : "";
      const before = text.slice(start, idx);
      const match = text.slice(idx, idx + lowerTerm.length);
      const after = text.slice(idx + lowerTerm.length, end);
      matches.push(
        <>
          {prefix}
          {before}
          <span style={{ background: "#ffe066", fontWeight: 600 }}>
            {match}
          </span>
          {after}
          {suffix}
        </>
      );
      idx += lowerTerm.length;
    }
    return matches;
  }

  return (
    <Layout
      title={`Scriptorai - Search`}
      description="Scriptorai is an open source, community-oriented project which hosts first-pass, LLM-powered translations of public domain esoteric texts, seeking to make previously inaccessible texts browsable by human beings and real translators which can then be improved upon collaboratively."
    >
      <main className={"container"} style={{ padding: 24, maxWidth: 900 }}>
        <h1>Search</h1>
        {/* Text selection UI */}
        <form
          id="search-form"
          onSubmit={handleSearch}
          style={{ marginBottom: 24 }}
        >
          <fieldset style={{ border: "none", marginBottom: 16 }}>
            <legend style={{ fontWeight: 600 }}>Select texts to search:</legend>
            {AVAILABLE_TEXTS.map((t) => (
              <label key={t.slug} style={{ marginRight: 16 }}>
                <input
                  type="checkbox"
                  checked={selectedTexts.includes(t.slug)}
                  onChange={() => handleTextSelect(t.slug)}
                />
                {t.label}
              </label>
            ))}
          </fieldset>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search query..."
            style={{ width: 300, marginRight: 12 }}
            required
          />
          <button
            type="submit"
            disabled={loading || !query || selectedTexts.length === 0}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
        {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
        {/* Results rendering */}
        <div>
          {results.length === 0 && !loading && (
            <div style={{ color: "#888" }}>No results yet. Try a search.</div>
          )}
          {results.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {results.map((r, i) => {
                // Compute contextual matches for this result
                const snippets = r.text
                  ? getContextualMatches(r.text, lastSearchTerm)
                  : [];
                return (
                  <li
                    key={r.id + i}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 6,
                      marginBottom: 16,
                      padding: 16,
                      background: "#fafbfc",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      <a
                        href={`/texts/${r.project}/${r.page_id_string}`}
                        style={{
                          color: "#1a0dab",
                          textDecoration: "underline",
                        }}
                      >
                        {r.title}
                      </a>
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#666", marginBottom: 6 }}
                    >
                      <span>Text: {r.slug}</span> |{" "}
                      <span>Page: {r.page_name || r.page}</span>
                    </div>
                    {/* Show contextual snippets for each match */}
                    {snippets.length > 0 && (
                      <ul
                        style={{ paddingLeft: 18, margin: 0, marginBottom: 8 }}
                      >
                        {snippets.map((snippet, idx) => (
                          <li
                            key={idx}
                            style={{
                              fontSize: 15,
                              marginBottom: 6,
                              // background: "#fffbe6",
                              borderRadius: 4,
                              padding: "4px 8px",
                            }}
                          >
                            {snippet}
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* Fallback: if no matches, show a snippet of the text */}
                    {snippets.length === 0 && r.text && (
                      <div style={{ fontSize: 15, whiteSpace: "pre-line" }}>
                        {r.text.length > 400
                          ? r.text.slice(0, 400) + "..."
                          : r.text}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {/* Debug info section */}
        <details
          style={{
            marginTop: 32,
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>
            Debug Info (expand for logs)
          </summary>
          <div
            style={{
              fontSize: 13,
              color: "#333",
              maxHeight: 300,
              overflow: "auto",
            }}
          >
            {debugLogs.length === 0 && <div>No debug logs yet.</div>}
            {debugLogs.map((log, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 500 }}>{log.msg}</div>
                <pre
                  style={{
                    margin: 0,
                    background: "#eee",
                    padding: 6,
                    borderRadius: 4,
                  }}
                >
                  {log.data}
                </pre>
              </div>
            ))}
          </div>
        </details>
      </main>
    </Layout>
  );
}
