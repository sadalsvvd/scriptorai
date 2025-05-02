import type { ReactNode } from "react";
// import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import ReadCCAGCallout from "../components/ReadCCAGCallout";
// import Heading from "@theme/Heading";

// import styles from "./index.module.css";

// function HomepageHeader() {
//   const { siteConfig } = useDocusaurusContext();
//   return (
//     <header className={clsx("hero hero--primary", styles.heroBanner)}>
//       <div className="container">
//         <Heading as="h1" className="hero__title">
//           {siteConfig.title}
//         </Heading>
//       </div>
//     </header>
//   );
// }

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <main style={{ padding: 24 }}>
        <h3>What is Scriptorai?</h3>
        <p>
          <b>Scriptorai</b> is an open source community-oriented project which
          hosts first-pass, LLM-powered translations of public domain esoteric
          texts, seeking to make previously inaccessible texts browsable by
          human beings and real translators which can then be improved upon
          collaboratively. My first focus is to translate all available PDF
          volumes of the{" "}
          <a href="https://en.wikipedia.org/wiki/Catalogus_Codicum_Astrologorum_Graecorum">
            Catalogus Codicum Astrologorum Graecorum
          </a>{" "}
          (CCAG), a 12-volume catalogue of all known astrological writings in
          Greek, published between 1898 and 1953 and considered the most
          important modern survey of Greek astrological writing. Currently, due
          to cost, only the first volume has been translated.
        </p>
        <ReadCCAGCallout href="/texts/CCAG_1/0001" />
        <h3>Why AI translation?</h3>
        <p>
          AI translation (with{" "}
          <a href="https://en.wikipedia.org/wiki/Large_language_model">
            large language models
          </a>
          ) is far from perfect and cannot replace real skilled human
          translators, especially for obscure and niche topics like esoteric
          texts. However, it is much better at translation than you might think,
          good enough that it can let us <i>get started</i>. The preface to the
          first volume of CCAG refers to their decision to publish the volumes
          without every possible source with the Greek phrase{" "}
          <b>Πλέον ἡμίσυ παντός</b>, or "half is better than the whole". That is
          the spirit with which I have considered this project: it's not
          perfect, but something is better than nothing.
        </p>
        <p>
          With LLM translation, we can do things that are inaccessible to
          individual human translators. To even understand and convey the topics
          of a single text would take a human translator a great amount of time
          and effort. The reason these texts have not already been translated is
          simply that the number of people with the interest, knowledge, and
          opportunity to translate texts like these are vanishingly few,
          numbering in <i>maybe</i> the dozens. By batch-translating these
          texts, we can at least extract indices and topics that can indicate
          where skilled human effort should be applied to produce high-quality
          translations.
        </p>
        <p>
          By using the output of these AI translations, I have also been able to
          construct full indices of terms for each book, allowing you to browse
          by term. Full-text search will be available soon.
        </p>
        <p>
          Some have criticized AI for its high energy usage, but these claims
          are usually overexaggerated and underresearched.{" "}
          <a href="https://andymesley.substack.com/p/a-cheat-sheet-for-conversations-about">
            This is a good resource for understanding the real impact of AI on
            the environment in terms of its energy usage.
          </a>{" "}
          In any case, I feel that the benefits of making these texts accessible
          to English readers far outweigh the one-time cost of the energy used
          to translate them per text.
        </p>
        <h2>Known Issues</h2>
        <p>
          <ul>
            <li>Handling of sentences across pages is not perfect</li>
          </ul>
        </p>
      </main>
    </Layout>
  );
}
