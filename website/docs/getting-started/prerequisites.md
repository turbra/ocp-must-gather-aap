---
title: Prerequisites
description: Values, access, and platform objects needed before creating the must-gather broker.
---

# Prerequisites

Collect the controller, cluster, credential, execution environment, and storage
values before creating the Job Template.

## Required Values

| Value | Example | Notes |
| --- | --- | --- |
| Controller URL | `https://aap.example.com` | Existing AWX or AAP controller |
| Organization | `Default` | Platform-owned organization |
| Project name | `ocp-mustgather-aap` | AWX/AAP Project name |
| Repo URL | `https://git.example.com/platform/ocp-mustgather-aap.git` | Approved source repo |
| Repo branch | `main` | Approved rollout branch |
| EE image | `registry.example.com/aap/ocp-mustgather-ee:latest` | Execution Environment image |
| Cluster label | `clustera` | Used in artifact names |
| Kubeconfig credential | `mustgather-clustera-sa` | Platform-owned OpenShift credential |
| S3 credential | `mustgather-artifact-s3` | Platform-owned object storage credential |
| S3 endpoint URL | `https://s3.example.invalid` | S3-compatible API endpoint |
| S3 bucket | `must-gather-artifacts` | Bucket must already exist |
| S3 prefix | `must-gather` | Optional object key prefix |
| Local staging path | `/runner/artifacts/ocp-must-gather` | Temporary archive staging path |
| Authorized team | `dev-mustgather-users` | Team granted execute access |

## Controller Access

The user applying controller configuration needs permission to create or update
Projects, Inventories, Credential Types, Credentials, Execution Environments,
Job Templates, Surveys, and RBAC grants in the target organization.

```bash
export CONTROLLER_HOST=https://aap.example.com
export CONTROLLER_OAUTH_TOKEN=<token>
```

Do not place real controller tokens in this repository.

## OpenShift Access

Use a dedicated platform-owned service account or equivalent non-human identity
for real deployments. The attached kubeconfig determines the OpenShift identity
used by every job.

The identity must have enough access to run:

```bash
oc adm must-gather
```

A personal cluster-admin kubeconfig is only appropriate for homelab or temporary
lab validation.

## Execution Environment

The selected Execution Environment must include:

- `ansible-playbook`
- `oc`
- `tar`
- `must-gather-clean`
- `amazon.aws`
- `boto3`
- `botocore`
- standard shell utilities

See the [Deployment Guide](../deployment-guide.md#1-prepare-the-execution-environment)
for the build and registration flow.
