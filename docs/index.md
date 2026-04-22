---
title: Documentation
description: >-
  Deployment and validation documentation for the AAP OpenShift must-gather
  broker.
---

# Documentation

<div class="sc-badge-row">
  <a href="https://www.apache.org/licenses/LICENSE-2.0"><img src="https://img.shields.io/badge/License-Apache--2.0-2C7A7B?style=flat-square" alt="License: Apache-2.0"></a>
</div>

Controlled OpenShift must-gather collection through AWX or Ansible Automation
Platform. Start with the deployment guide when creating the job in an existing
controller, then use the validation checklist before expanding beyond the pilot
team.

## Deploy

- <a href="{{ '/user-deployment-guide.html' | relative_url }}"><kbd>USER DEPLOYMENT GUIDE</kbd></a>
  for creating the Project, Inventory, Credential, Job Template, Survey, and
  RBAC in an existing AAP or AWX environment
- <a href="{{ '/aap-setup-runbook.html' | relative_url }}"><kbd>AAP SETUP RUNBOOK</kbd></a>
  for the platform-admin setup sequence, including local AWX development notes
- <a href="{{ '/aap-admin-implementation-checklist.html' | relative_url }}"><kbd>ADMIN CHECKLIST</kbd></a>
  for first pilot rollout readiness

## Validate

- <a href="{{ '/pilot-validation-checklist.html' | relative_url }}"><kbd>PILOT VALIDATION CHECKLIST</kbd></a>
  for RBAC, survey input, credential injection, artifact handling, and audit
  trail checks
- <a href="{{ '/aap-must-gather-mvp.html' | relative_url }}"><kbd>DESIGN AND SECURITY NOTES</kbd></a>
  for the brokered-execution model, credential boundary, artifact flow, and
  known limitations

## Key Rules

- AAP/AWX brokers the privileged must-gather operation.
- Dev users receive execute access to one Job Template only.
- Dev users must not receive credential access.
- The OpenShift identity used by the job comes from the attached kubeconfig
  credential.
- Personal cluster-admin kubeconfigs are for homelab or temporary lab testing
  only. Use a platform-owned service account or equivalent non-human identity
  for real environments.
- Survey inputs are limited to `support_case_id` and optional
  `reference_label`, plus the constrained `ocp_must_gather_clean_enabled`
  choice.
- The must-gather command and flags are fixed by the playbook.
- must-gather-clean is optional. The survey may only turn it on or off, while
  the config path and flags stay platform-owned.
- `report.yaml` from must-gather-clean is not a shareable artifact.
- AWX/AAP remains the control and audit plane. S3-compatible object storage is
  the preferred download handoff plane.
- Object storage settings are platform-owned extra vars and credentials, not
  survey input.
