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
Platform. Start with the deployment guide when creating the workflow in an
existing controller. Use the validation and architecture references after the
deployment path is clear.

## Start Here

- <a href="{{ '/deployment-guide.html' | relative_url }}"><kbd>DEPLOYMENT GUIDE</kbd></a>
  for creating the workflow in an existing AAP or AWX environment

## Admin Reference

- <a href="{{ '/aap-setup-runbook.html' | relative_url }}"><kbd>SETUP RUNBOOK</kbd></a>
  deep admin reference for controller object detail, `oc` version pinning, and local AWX development
- <a href="{{ '/aap-admin-implementation-checklist.html' | relative_url }}"><kbd>ADMIN CHECKLIST</kbd></a>
  for rollout readiness tracking

## Internal Platform Validation

Internal platform team use only.

- <a href="{{ '/internal-validation-checklist.html' | relative_url }}"><kbd>INTERNAL PLATFORM VALIDATION</kbd></a>
  for platform-owned pilot checks after deployment

## Reference

- <a href="{{ '/architecture-and-security.html' | relative_url }}"><kbd>ARCHITECTURE AND SECURITY</kbd></a>
  for the brokered-execution model, credential boundary, artifact flow, and
  known limitations

## Key Rules

- The controller brokers the privileged must-gather operation.
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
- The controller remains the control and audit plane. S3-compatible object storage is
  the preferred download handoff plane.
- Object storage settings are platform-owned extra vars and credentials, not
  survey input.
