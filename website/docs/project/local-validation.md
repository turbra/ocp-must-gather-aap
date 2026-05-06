---
title: Local Validation
description: Validate Ansible syntax and the Docusaurus documentation site locally.
---

# Local Validation

Run validation before publishing workflow or documentation changes.

## Playbook Syntax

Use the repository validation wrapper:

```bash
scripts/validate-local.sh
```

Or run the core syntax check directly:

```bash
ansible-playbook --syntax-check -i inventories/localhost.yml playbooks/ocp_must_gather.yml
```

Do not run the must-gather playbook directly without a valid `KUBECONFIG` for
the platform-owned must-gather identity.

## Documentation Site

Validate the Docusaurus site with:

```bash
scripts/validate-docs-site.sh
```

The wrapper runs the Docusaurus production build and checks generated HTML for
paths that would break under the GitHub Pages project base URL.

## Generated Files

The Docusaurus build writes generated files under:

```text
website/build/
website/.docusaurus/
website/node_modules/
```

These paths are local artifacts and should remain untracked.
