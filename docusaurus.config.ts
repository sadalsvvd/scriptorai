// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { themes as prismThemes } from "prism-react-renderer";
import type { Config, PluginContentLoadedActions } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// Type definitions for text collections
export interface TextManifestPage {
  /** Page ID, e.g. "0000" */
  pageId: string;
  /** Path to the image file */
  imagePath: string;
  /** Path to the translation file */
  translationPath: string;
  /** Path to the transcription file */
  transcriptionPath: string;
}

export interface TextManifest {
  /** Slug for the text, e.g. "ccag-01" */
  textSlug: string;
  /** Name of the text, e.g. "CCAG 1" */
  textName: string;
  /** URL to the GitHub repository for the text */
  githubRepo: string;
  /** List of pages in the text */
  pages: TextManifestPage[];
}

const gatherManifests = (): TextManifest[] => {
  const textsDir = join(process.cwd(), "static/texts_assets");
  let allManifests: TextManifest[] = [];
  console.log("GATHER MANIFESTS");
  try {
    // Get all subdirectories within static/texts
    const textDirs = readdirSync(textsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    console.log("TEXT DIRS");

    // Process each subdirectory
    textDirs.forEach((textDir) => {
      console.log("TEXT DIR");
      console.log(textDir);
      const manifestPath = join(textsDir, textDir, "manifest.json");
      if (existsSync(manifestPath)) {
        const manifest = loadManifest(manifestPath);
        allManifests = [...allManifests, manifest];
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`Error scanning text directories: ${errorMessage}`);
  }

  return allManifests;
};

const loadManifest = (manifestFile: string): TextManifest => {
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  console.log("MANIFEST");
  console.log(manifest);

  const mappedPages = manifest.pages.map((page: any) => ({
    pageId: page.page_id,
    // Here we prefix the paths with our local direct path to static files
    imagePath: `/texts_assets/${manifest.text_slug}/${page.image_path}`,
    translationPath: `/texts_assets/${manifest.text_slug}/${page.translation_path}`,
    transcriptionPath: `/texts_assets/${manifest.text_slug}/${page.transcription_path}`,
  }));

  return {
    textSlug: manifest.text_slug,
    textName: manifest.text_name,
    githubRepo: manifest.github_repo,
    pages: mappedPages,
  };
};

const config: Config = {
  title: "Scriptorai",
  tagline: "More than half done",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://scriptorai.sadalsvvd.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "sadalsvvd", // Usually your GitHub org/user name.
  projectName: "scriptorai", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: false,
        blog: false,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Scriptorai",
      logo: {
        alt: "Scriptorai Logo",
        src: "img/scriptorai_logo_64px.png",
      },
      items: [
        // {
        //   type: "docSidebar",
        //   sidebarId: "tutorialSidebar",
        //   position: "left",
        //   label: "Tutorial",
        // },
        {
          href: "https://github.com/sadalsvvd/scriptorai",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} @sadalsvvd. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    async function manifestPagesPlugin() {
      return {
        name: "manifest-pages-plugin",
        async loadContent() {
          return gatherManifests();
        },
        async contentLoaded({
          content,
          actions,
        }: {
          content: TextManifest[];
          actions: PluginContentLoadedActions;
        }) {
          const { addRoute } = actions;

          // Process dynamic manifests from static/texts directories
          content.forEach((manifest) => {
            // Sort pages by pageId to ensure consistent ordering
            // This assumes pageIds follow a sortable pattern like "0001", "0002", etc.
            const sortedPages = [...manifest.pages].sort((a, b) =>
              a.pageId.localeCompare(b.pageId, undefined, { numeric: true })
            );

            // Loop through pages to create routes with prev/next navigation
            sortedPages.forEach((page, index) => {
              // Calculate previous and next page IDs if they exist
              const prevPage = index > 0 ? sortedPages[index - 1] : null;
              const nextPage =
                index < sortedPages.length - 1 ? sortedPages[index + 1] : null;

              addRoute({
                textSlug: manifest.textSlug,
                path: `/texts/${manifest.textSlug}/${page.pageId}`,
                component: require.resolve(
                  "./src/components/TextTranslationPage.tsx"
                ),
                exact: true,
                modules: {},
                customData: {
                  textSlug: manifest.textSlug,
                  textName: manifest.textName,
                  pageId: page.pageId,
                  pageInt: parseInt(page.pageId, 10),
                  pageCount: manifest.pages.length,
                  prevPageId: prevPage ? prevPage.pageId : null,
                  nextPageId: nextPage ? nextPage.pageId : null,
                  image: page.imagePath,
                  transcription: page.transcriptionPath,
                  translation: page.translationPath,
                  githubRepo: manifest.githubRepo,
                },
              });
            });
          });
        },
      };
    },
  ],
};

export default config;
