---
id: index
slug: /
title: OCP must-gather through AAP
description: Controlled brokered OpenShift must-gather collection through AWX or Ansible Automation Platform.
sidebar_position: 1
---

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-2C7A7B?style=flat-square)](https://www.apache.org/licenses/LICENSE-2.0)

Run one controlled OpenShift must-gather workflow from AWX or Ansible
Automation Platform without giving development users direct cluster-admin
access.

Platform administrators own the Project, Inventory, credentials, Execution
Environment, Job Template, survey, RBAC, and artifact handoff. Development
users receive execute access to the finished Job Template only.

## Start Here

Use the [Deployment Guide](deployment-guide.md) to create the workflow in an
existing AWX or AAP controller.

After deployment, use:

- [Admin Implementation Checklist](aap-admin-implementation-checklist.md) for
  rollout tracking.
- [Internal Platform Validation Checklist](internal-validation-checklist.md) for
  platform-owned pilot checks.
- [AAP Setup Runbook](aap-setup-runbook.md) for controller object details,
  `oc` version pinning, and local AWX development.

## Workflow

1. A platform admin creates the controller objects and attaches platform-owned
   credentials.
2. A development user launches the approved Job Template.
3. The survey accepts only `support_case_id`, `reference_label`, and the
   `ocp_must_gather_clean_enabled` toggle.
4. The playbook validates inputs, runs the fixed `oc adm must-gather` workflow,
   optionally runs `must-gather-clean`, creates the archive, and uploads it when
   object storage is enabled.
5. The controller job history records the launch and prints the final artifact
   reference.

## Quick Start

Copy the controller vars template to an untracked path:

```bash
cp aap/controller-vars.example.yml /secure/path/controller-vars.yml
vi /secure/path/controller-vars.yml
```

Run the controller apply wrapper:

```bash
export CONTROLLER_HOST=https://aap.example.com
export CONTROLLER_OAUTH_TOKEN=<token>
scripts/apply-aap-controller-mvp.sh /secure/path/controller-vars.yml
```

Run one platform-admin smoke launch with:

```text
support_case_id=SMOKE001
reference_label=admin-smoke
ocp_must_gather_clean_enabled=false
```

## Security Boundary

This is brokered privileged execution, not delegated OpenShift RBAC. The
OpenShift credential attached to the Job Template still has the access required
to run must-gather, which may be effectively cluster-admin.

Do not use a personal cluster-admin kubeconfig for real pilots or deployments.
Use a dedicated platform-owned service account or equivalent non-human
identity.

## Reference

- [Reference index](reference.md): complete map of controller, validation,
  cleaning, and source files.
- [must-gather-clean](must-gather-clean.md): cleaning toggle, repository
  config, obfuscation behavior, and validation examples.
- [Architecture And Security](architecture-and-security.md): execution model,
  credential boundary, artifact flow, RBAC intent, and limitations.
