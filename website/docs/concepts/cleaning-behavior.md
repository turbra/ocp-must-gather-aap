---
title: Cleaning Behavior
description: How the must-gather-clean toggle affects the final archive.
---

# Cleaning Behavior

The cleaning toggle lets a user request a cleaned handoff archive without
controlling cleaner flags or config.

## Toggle

The survey field is:

```text
ocp_must_gather_clean_enabled
```

Allowed values are:

```text
false
true
```

The default is `false`.

## Config

The cleaner config is platform-owned and lives in the repository:

```text
config/must-gather-clean/openshift_default.yaml
```

Users cannot select a cleaner config from the survey.

## Report Handling

`must-gather-clean` writes `report.yaml`, which maps obfuscated values back to
originals. Do not share it.

The playbook excludes the report from the handoff archive. See
[must-gather-clean](../must-gather-clean.md) for the full behavior reference.
