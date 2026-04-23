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

