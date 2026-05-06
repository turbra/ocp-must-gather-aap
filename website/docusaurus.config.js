const config = {
  title: 'OCP must-gather through AAP',
  tagline:
    'Controlled brokered OpenShift must-gather collection through AWX or Ansible Automation Platform.',
  favicon: 'img/favicon.svg',

  url: 'https://turbra.github.io',
  baseUrl: '/ocp-must-gather-aap/',
  organizationName: 'turbra',
  projectName: 'ocp-must-gather-aap',
  trailingSlash: true,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/turbra/ocp-must-gather-aap/edit/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.svg',
    metadata: [
      {
        name: 'description',
        content:
          'Documentation for brokered OpenShift must-gather collection through AWX or Ansible Automation Platform.',
      },
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'OCP must-gather through AAP',
      logo: {
        alt: 'OCP must-gather through AAP',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/deployment-guide/',
          label: 'Deploy',
          position: 'left',
        },
        {
          to: '/validation/',
          label: 'Validate',
          position: 'left',
        },
        {
          to: '/reference/',
          label: 'Reference',
          position: 'left',
        },
        {
          href: 'https://github.com/turbra/ocp-must-gather-aap',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Deployment Guide', to: '/deployment-guide/' },
            { label: 'Getting Started', to: '/getting-started/prerequisites/' },
            { label: 'Validation', to: '/validation/' },
            { label: 'Reference', to: '/reference/' },
            { label: 'Examples', to: '/examples/' },
            { label: 'Local Validation', to: '/project/local-validation/' },
            { label: 'Architecture And Security', to: '/architecture-and-security/' },
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'Repository',
              href: 'https://github.com/turbra/ocp-must-gather-aap',
            },
            {
              label: 'Issues',
              href: 'https://github.com/turbra/ocp-must-gather-aap/issues',
            },
          ],
        },
        {
          title: 'Related',
          items: [
            {
              label: 'must-gather-clean',
              href: 'https://github.com/openshift/must-gather-clean',
            },
            {
              label: 'OpenShift must-gather',
              href: 'https://docs.redhat.com/en/documentation/openshift_container_platform/',
            },
          ],
        },
      ],
      copyright: `Apache-2.0 licensed documentation generated from this repository.`,
    },
    prism: {
      additionalLanguages: ['bash', 'yaml', 'json', 'powershell'],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
  },
};

module.exports = config;
