import React from "react";
import Link from "@docusaurus/Link";

/**
 * Big callout link for reading CCAG Volume 1. Used on the homepage.
 * The link target is passed as a prop.
 */
export default function ReadCCAGCallout({ href }: { href: string }) {
  return (
    <Link
      to={href}
      style={{
        display: "block",
        background: "#e3f0ff",
        color: "#174ea6",
        fontWeight: 700,
        fontSize: 22,
        padding: "32px 24px",
        borderRadius: 16,
        textAlign: "center",
        margin: "32px 0",
        boxShadow: "0 2px 12px rgba(23, 78, 166, 0.08)",
        textDecoration: "none",
        transition: "background 0.2s, color 0.2s",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#d0e6ff";
        (e.currentTarget as HTMLElement).style.color = "#0d326f";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#e3f0ff";
        (e.currentTarget as HTMLElement).style.color = "#174ea6";
      }}
    >
      Catalogus Codicum Astrologorum Graecorum - Volume 1
    </Link>
  );
}
