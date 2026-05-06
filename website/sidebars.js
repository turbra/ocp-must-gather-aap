const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Start',
      collapsed: false,
      items: ['index', 'deployment-guide'],
    },
    {
      type: 'category',
      label: 'Operations',
      collapsed: false,
      items: [
        'aap-setup-runbook',
        'aap-admin-implementation-checklist',
        'internal-validation-checklist',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: ['reference', 'must-gather-clean', 'architecture-and-security'],
    },
  ],
};

module.exports = sidebars;
