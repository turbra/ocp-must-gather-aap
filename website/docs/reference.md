---
title: Reference
description: >-
  Complete reference entry point for controller objects, security boundaries,
  validation checks, and must-gather-clean behavior.
---

# Reference

Use this page when you need the authoritative details behind the deployment
guide. The deployment guide remains the setup path. The pages below define the
objects, controls, and validation checks that make the workflow supportable.

## Controller And Deployment

- [AAP Setup Runbook](aap-setup-runbook.md): controller object details,
  required values, `oc` client version handling, local AWX development, and
  post-deployment checks.
- [Deployment Guide](deployment-guide.md): primary path for creating the
  workflow in an existing AWX or AAP controller.
- [Admin Implementation Checklist](aap-admin-implementation-checklist.md):
  rollout tracking for platform administrators.

## Security And Controls

- [Architecture And Security Reference](architecture-and-security.md):
  brokered execution model, credential boundary, artifact flow, user RBAC
  intent, known limitations, and deliberately deferred capabilities.
- [Internal Platform Validation Checklist](internal-validation-checklist.md):
  platform-owned checks for RBAC, survey behavior, credential injection,
  artifact handling, audit trail, failure modes, and pilot exit criteria.

## Cleaning

- [must-gather-clean](must-gather-clean.md): survey toggle behavior,
  repository configuration, supported obfuscation behavior, custom config
  guidance, validation examples, and report handling.

## Repository References

These files are part of the implemented workflow and should stay aligned with
the docs:

| Area | File |
| --- | --- |
| Controller apply playbook | `aap/playbooks/configure-controller.yml` |
| Controller vars template | `aap/controller-vars.example.yml` |
| Job Template example | `aap/job-template-example.yml` |
| Survey shape | `aap/survey-spec.yml` |
| OpenShift kubeconfig credential type | `aap/custom-credential-type-openshift-kubeconfig.yml` |
| S3 credential type | `aap/custom-credential-type-s3-object-store.yml` |
| Must-gather playbook | `playbooks/ocp_must_gather.yml` |
| Execution Environment | `ee/execution-environment.yml` |
| Local validation wrapper | `scripts/validate-local.sh` |
