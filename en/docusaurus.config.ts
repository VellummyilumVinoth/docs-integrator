import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {
  sharedColorMode,
  sharedDocsSidebar,
  sharedNavbarLogo,
  sharedFooterStyle,
  sharedFooterCopyright,
  sharedCommunityNavbarItem,
  sharedDiscordNavbarItem,
  sharedStackOverflowNavbarItem,
  sharedLinkedInNavbarItem,
  sharedYoutubeNavbarItem,
  sharedXNavbarItem,
  sharedGithubNavbarItem,
  sharedBlogNavbarItem,
  sharedFaqNavbarItem,
  sharedContributeNavbarItem,
  sharedReleasesNavbarItem,
  sharedPrism,
  sharedImage,
  CROSS_PRODUCT_BASE,
} from './src/theme-shared/themeConfig';

const config: Config = {
  title: 'WSO2 Integrator Documentation',
  tagline: 'Build integrations with low-code simplicity and pro-code power',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://wso2.com',
  baseUrl: process.env.BASE_URL || '/',

  // Exposes CROSS_PRODUCT_BASE to client-side code (SidebarProductHeader) --
  // config-time TS modules like themeConfig.ts aren't importable from
  // browser-bundled components, so Docusaurus's customFields is the
  // sanctioned bridge. See themeConfig.ts's CROSS_PRODUCT_BASE docstring.
  customFields: {
    crossProductBase: CROSS_PRODUCT_BASE,
  },

  organizationName: 'wso2',
  projectName: 'docs-integrator',
  trailingSlash: false,

  onBrokenLinks: 'warn',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    './plugins/docusaurus-plugin-markdown-export',
    './src/plugins/expose-sidebars',
    './src/plugins/guidesCatalogPlugin',
  ],

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        // See saas's docusaurus.config.ts for why this is off.
        highlightSearchTermsOnTargetPage: false,
        explicitSearchResultPath: true,
        docsRouteBasePath: '/',
        indexBlog: false,
        indexPages: true,
        searchBarShortcutHint: false,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/wso2/docs-integrator/tree/wso2-integrator/en/',
          showLastUpdateTime: true,
          // Lets docs link to a sibling product with `product://<product>/<path>`
          // instead of a hardcoded production path -- see the plugin's docstring.
          remarkPlugins: [[require('./src/plugins/crossProductLinks'), { base: CROSS_PRODUCT_BASE }]],
          // Serve Next (docs/, the new IA) at the site root by default —
          // matching reactnative.dev's model of latest/current up front,
          // older releases behind the version switcher. Without this,
          // Docusaurus defaults to serving the last *released* version
          // (5.0.0, the frozen pre-migration snapshot) at the root and
          // hiding Next behind /next/.
          lastVersion: 'current',
          versions: {
            // No `path` here: leaving it unset is what makes `lastVersion`
            // actually serve at the site root with no prefix. Setting an
            // explicit path (e.g. 'next') overrides that and pushes this
            // version's content to /next/ instead, leaving the root empty
            // — verified by build inspection after getting this wrong once.
            current: {
              label: 'Next',
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: sharedImage,
    colorMode: sharedColorMode,
    docs: sharedDocsSidebar,
    navbar: {
      logo: sharedNavbarLogo,
      items: [
        {
          // Real <a> tag (via pathname:// + autoAddBaseUrl:false), not a
          // client-side route -- /integration-platform/docs/connectors/
          // is a completely separate build/bundle. See
          // SidebarProductHeader's docstring for the isInternalUrl pitfall
          // this sidesteps. `html` (not `label`) so Docusaurus doesn't
          // auto-append its external-link arrow icon. Goes straight to
          // the catalog, not just the connectors site's homepage.
          href: `pathname://${CROSS_PRODUCT_BASE}connectors/catalog`,
          autoAddBaseUrl: false,
          // See saas's docusaurus.config.ts for why target:'_self' is here.
          target: '_self',
          html: 'Connectors',
          position: 'left',
        },
        // Same 8 sections as the homepage's "Explore the platform" grid --
        // one source of truth would need lifting that data out of
        // src/pages/index.tsx into a shared module; kept in sync by hand
        // for now, matching how SidebarProductHeader's own product list
        // note already handles the analogous config-vs-component split.
        {
          type: 'custom-exploreDropdown',
          label: 'Explore',
          position: 'left',
          items: [
            { title: 'Platform Overview', description: "Understand the platform's architecture and core concepts.", href: '/platform-overview' },
            { title: 'Editor Tour', description: 'Tour the WSO2 Integrator editor and its Copilot.', href: '/editor' },
            { title: 'Develop and Test', description: 'Build services, transform data, and test integrations.', href: '/develop-and-test' },
            { title: 'Deploy and Run', description: 'Deploy to WSO2 Cloud or your own infrastructure, CI/CD, and security.', href: '/deploy-and-run' },
            { title: 'Manage', description: 'Control plane: WSO2 Cloud or the self-hosted ICP.', href: '/manage' },
            { title: 'Observe', description: 'Monitor metrics, logs, and traces.', href: '/observe' },
            { title: 'Migrate', description: 'Move existing MuleSoft, TIBCO, and Azure Logic Apps integrations.', href: '/migrate' },
            { title: 'Guides', description: 'End-to-end tutorials and integration patterns.', href: '/guides/overview' },
            { title: 'Integration Control Plane', description: 'Monitor and manage self-hosted integrations with ICP.', href: '/icp', fullWidth: true, badge: 'ICP' },
          ],
        },
        sharedReleasesNavbarItem('/reference/release-notes'),
        sharedContributeNavbarItem(),
        sharedCommunityNavbarItem,
        sharedBlogNavbarItem,
        sharedFaqNavbarItem('/reference/faq'),
        sharedGithubNavbarItem,
        sharedDiscordNavbarItem,
        sharedStackOverflowNavbarItem,
        sharedLinkedInNavbarItem,
        sharedYoutubeNavbarItem,
        sharedXNavbarItem,
      ]
    },
    footer: {
      style: sharedFooterStyle,
      links: [
        {
          title: 'Get Started',
          items: [
            { label: 'Platform Overview', to: '/platform-overview' },
            { label: 'Concepts', to: '/get-started/concepts' },
            { label: 'Setup', to: '/get-started/setup' },
            { label: 'Quickstarts', to: '/get-started/quickstarts/build-automation' },
          ],
        },
        {
          title: 'Editor Tour',
          items: [
            { label: 'Flow Canvas', to: '/editor/canvases/flow-canvas' },
            { label: 'Copilot', to: '/editor/copilot' },
            { label: 'Project View', to: '/editor/views/project-view' },
          ],
        },
        {
          // One column for the whole develop -> deploy -> manage ->
          // observe journey (each linking to that section's own landing
          // page), same as saas. The Integration Control Plane is this
          // product's self-hosted manage/observe surface, so it sits here too.
          title: 'Integration Lifecycle',
          items: [
            { label: 'Develop and Test', to: '/develop-and-test' },
            { label: 'Deploy and Run', to: '/deploy-and-run' },
            { label: 'Manage', to: '/manage' },
            { label: 'Observe', to: '/observe' },
            { label: 'Integration Control Plane', to: '/icp' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'Migrate', to: '/migrate' },
            { label: 'Guides', to: '/guides/overview' },
            { label: 'FAQ', to: '/reference/faq' },
          ],
        },
      ],
      copyright: sharedFooterCopyright,
    },
    prism: sharedPrism,
  } satisfies Preset.ThemeConfig,
};

export default config;
