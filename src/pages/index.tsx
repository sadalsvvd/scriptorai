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
      title={`Scriptorai - Translating the CCAG`}
      description="Scriptorai is an open source, community-oriented project which hosts first-pass, LLM-powered translations of public domain esoteric texts, seeking to make previously inaccessible texts browsable by human beings and real translators which can then be improved upon collaboratively."
    >
      <style>{`
        .scriptorai-logo {
          display: block;
          max-width: 200px;
          width: 100%;
          height: auto;
          margin-bottom: 24px;
        }
        @media (min-width: 768px) {
          .scriptorai-logo {
            float: left;
            margin-right: 32px;
            margin-bottom: 24px;
            margin-left: 0;
            margin-top: 4px;
          }
        }
        @media (max-width: 767px) {
          .scriptorai-logo {
            float: none;
            margin-left: auto;
            margin-right: auto;
            display: block;
          }
        }
      `}</style>
      <main style={{ padding: 24 }}>
        <img
          src={require("@site/static/img/scriptorai_logo_200px.png").default}
          alt="Scriptorai Logo"
          className="scriptorai-logo"
        />
        <h3>What is Scriptorai?</h3>
        <p>
          <b>Scriptorai</b> is an open source, community-oriented project which
          hosts first-pass, LLM-powered translations of public domain esoteric
          texts, seeking to make previously inaccessible texts browsable by
          human beings and real translators which can then be improved upon
          collaboratively. My first focus is to translate all available PDF
          volumes of the{" "}
          <a
            href="https://en.wikipedia.org/wiki/Catalogus_Codicum_Astrologorum_Graecorum"
            target="_blank"
          >
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
          <a
            href="https://en.wikipedia.org/wiki/Large_language_model"
            target="_blank"
          >
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
          texts, we can at least make it easier to understand their contents and
          choose where skilled human effort should be applied to produce
          high-quality translations.
        </p>
        <p>
          Some have criticized AI for its high energy usage, but these claims
          are usually overexaggerated and underresearched.{" "}
          <a
            href="https://andymesley.substack.com/p/a-cheat-sheet-for-conversations-about"
            target="_blank"
          >
            This is a good resource for understanding the real impact of AI on
            the environment in terms of its energy usage.
          </a>{" "}
          In any case, I feel that the benefits of making these texts accessible
          to English readers far outweigh the one-time cost of the energy used
          to translate them per text.
        </p>
        <p>
          For a longer (but similar) post on my thought of the significance of
          the CCAG and why I'm doing this, see my{" "}
          <a
            href="https://sadalsvvd.substack.com/p/scriptorai-translating-the-most-important"
            target="_blank"
          >
            Scriptorai announcement post on Substack.
          </a>
        </p>
        <h2>Full text search</h2>
        <p>
          One major benefit is that with the full transcription produced, I have
          implemented a full text search feature that can help you find passages
          of interest in the texts.{" "}
          <a href="/search">
            <b>Try it out here!</b>
          </a>
        </p>
        <h2>Help with translation</h2>
        <p>
          If you spot an issue or have a correction for either transcription or
          translation, you can help suggest changes under any page by clicking
          the "Suggest Corrections on GitHub" button, which will allow you to
          contribute suggestions directly to the{" "}
          <a
            href="https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories"
            target="_blank"
          >
            GitHub repository
          </a>{" "}
          which contains the image, translation, and transcription files for the
          given text.
        </p>
        <h2>Open source and public domain</h2>
        <p>
          Considering that the source texts are in the public domain, it is
          important to me that all of the tools used to produce the
          transcriptions, translations, and this site, are open source and
          publicly available.
        </p>
        <p>
          Scriptorai is fully open source, and the code for the project is
          available on GitHub at{" "}
          <a href="https://github.com/sadalsvvd/scriptorai">
            <b>sadalsvvd/scriptorai</b>
          </a>
          . Scriptorai is this site itself, which is licensed under the{" "}
          <a href="https://choosealicense.com/licenses/mit/" target="_blank">
            MIT license
          </a>
          .
        </p>
        <p>
          The individual CCAG volumes' repositories and associated
          transcriptions and translations are licensed into the public domain
          under the{" "}
          <a
            href="https://choosealicense.com/licenses/cc0-1.0/"
            target="_blank"
          >
            Creative Commons Zero v1.0 Universal
          </a>{" "}
          license. You can find the repository for the first volume of the CCAG
          on GitHub at{" "}
          <a
            href="https://github.com/sadalsvvd/scriptorai-ccag-01"
            target="_blank"
          >
            <b>sadalsvvd/scriptorai-ccag-01</b>
          </a>
          .
        </p>
        <p>
          The tool used to produce the translations and transcriptions is called{" "}
          <b>hemiplon</b>, or "half-doubling", available on GitHub at{" "}
          <a href="https://github.com/sadalsvvd/hemiplon" target="_blank">
            <b>sadalsvvd/hemiplon</b>
          </a>
          . It is also licensed under the MIT license.
        </p>
        <h2>Known Issues</h2>
        <ul>
          <li>Occasional issues capturing footnotes</li>
          <li>
            Translation of sentences across pages does not work well yet; make
            sure to check sentences which continue across multiple pages
          </li>
          <li>
            Certain numerical values may be transliterated incorrectly, such as
            years and months being changed to incorrect decimal year values.
            Check these values carefully.
          </li>
        </ul>
        <h2>Contact</h2>
        <p>
          If you have any questions or feedback, you can email me at{" "}
          <a href="mailto:sadalsvvd@gmail.com">sadalsvvd@gmail.com</a>, or @ me
          on Bluesky at{" "}
          <a href="https://bsky.app/profile/sadalsvvd.space" target="_blank">
            sadalsvvd.space
          </a>
          . You can find my personal website at{" "}
          <a href="https://sadalsvvd.space/" target="_blank">
            sadalsvvd.space
          </a>
          .
        </p>
      </main>
    </Layout>
  );
}
