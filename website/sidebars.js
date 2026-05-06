const sidebars = {
  docsSidebar: [
    'home',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/prerequisites',
        'getting-started/controller-setup',
        'getting-started/first-launch',
        'getting-started/artifact-handoff',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        'concepts/brokered-execution',
        'concepts/credential-boundary',
        'concepts/survey-contract',
        'concepts/artifact-lifecycle',
        'concepts/cleaning-behavior',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      collapsed: false,
      items: [
        'deployment-guide',
        'aap-setup-runbook',
        'aap-admin-implementation-checklist',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: ['reference', 'must-gather-clean', 'architecture-and-security'],
    },
    {
      type: 'category',
      label: 'Validation',
      collapsed: false,
      items: ['validation/index', 'internal-validation-checklist'],
    },
    {
      type: 'category',
      label: 'Examples',
      collapsed: false,
      items: ['examples/index'],
    },
    {
      type: 'category',
      label: 'Project',
      collapsed: false,
      items: ['project/local-validation'],
    },
  ],
};

module.exports = sidebars;
