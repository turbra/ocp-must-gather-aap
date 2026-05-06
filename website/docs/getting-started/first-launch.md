---
title: First Launch
description: Run the first platform-admin and development-user launches.
---

# First Launch

Run the first launch as a platform administrator before granting production
users access to the Job Template.

## Platform-admin Smoke Test

Launch the Job Template with:

```text
support_case_id=SMOKE001
reference_label=admin-smoke
ocp_must_gather_clean_enabled=false
```

Confirm the job completes and prints:

- OpenShift identity used by the attached kubeconfig
- local artifact path
- object storage reference when upload is enabled

## Dev-user Launch

Launch once as a user in the authorized team.

Confirm the user can:

- launch the Job Template
- answer only the three survey fields
- see the final object storage reference

Confirm the user cannot:

- edit the Job Template
- change credentials
- view the OpenShift kubeconfig
- change Project, Inventory, or Execution Environment settings

## Cleaning Toggle

Run a second launch with cleaning enabled:

```text
support_case_id=SMOKE002
reference_label=clean-smoke
ocp_must_gather_clean_enabled=true
```

Confirm the handoff archive is the cleaned archive and does not include
`report.yaml`.

Use the [internal platform validation checklist](../internal-validation-checklist.md)
for the full pilot validation pass.
