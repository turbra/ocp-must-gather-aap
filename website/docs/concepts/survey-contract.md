---
title: Survey Contract
description: The constrained survey inputs accepted by the Job Template.
---

# Survey Contract

The survey is part of the security boundary. It accepts metadata only.

## Fields

| Prompt | Variable | Required | Type |
| --- | --- | ---: | --- |
| Red Hat support case ID | `support_case_id` | yes | text |
| Short reference label | `reference_label` | no | text |
| Run must-gather-clean | `ocp_must_gather_clean_enabled` | yes | multiple choice, `false` or `true`, default `false` |

## Recommended Validation

Use these patterns when the controller supports survey regex validation:

```text
support_case_id: ^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$
reference_label: ^$|^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$
```

## Do Not Add

Do not add survey fields for:

- commands
- `oc` flags
- namespaces
- kubeconfigs
- output paths
- must-gather images
- cleaner flags
- cleaner configs
- bucket names
- endpoints
- upload settings

Platform-owned settings belong in Job Template extra vars or credentials.
