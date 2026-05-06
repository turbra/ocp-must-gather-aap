---
title: Validation
description: Validate controller objects, survey behavior, artifacts, audit trail, and failure modes.
---

# Validation

Validate the broker before using it for a real support workflow.

## Validation Sequence

1. Complete the [Deployment Guide](../deployment-guide.md).
2. Run a platform-admin smoke launch.
3. Run a development-user launch.
4. Verify survey inputs and RBAC boundaries.
5. Verify the archive and object-storage reference.
6. Run one cleaning-enabled launch.
7. Capture findings and pilot exit criteria.

## Platform-admin Smoke Launch

```text
support_case_id=SMOKE001
reference_label=admin-smoke
ocp_must_gather_clean_enabled=false
```

Confirm the job prints:

- OpenShift identity
- local artifact path
- object storage reference when upload is enabled

## Full Checklist

Use the [Internal Platform Validation Checklist](../internal-validation-checklist.md)
for the full validation pass. It covers:

- controller objects
- survey and input validation
- credential injection
- end-to-end must-gather execution
- artifact validation
- development-user experience
- audit trail
- failure modes
- security and control review
