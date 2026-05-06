---
title: Credential Boundary
description: How OpenShift and object-storage credentials are protected.
---

# Credential Boundary

The OpenShift kubeconfig and object-storage credential are platform-owned
controller credentials.

Development users must not receive direct access to either credential.

## OpenShift Credential

The OpenShift identity in the attached kubeconfig is the identity used for
every cluster action in the job.

Use a dedicated platform-owned service account or equivalent non-human identity
for real deployments. A personal cluster-admin kubeconfig is only suitable for
homelab or short-lived lab validation.

## Object-storage Credential

The S3-compatible credential is injected into the job environment by the
controller credential type. Users retrieve the resulting archive from object
storage, but they do not control the endpoint, bucket, prefix, or key.

## RBAC Intent

The authorized team should receive only:

| Permission | Target |
| --- | --- |
| Execute | `OpenShift Must-Gather - ClusterA` Job Template |

Do not grant the team admin access to credentials, Project, Inventory,
Execution Environment, organization settings, or Job Template internals.
