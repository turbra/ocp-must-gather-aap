---
title: Artifact Lifecycle
description: How raw, cleaned, staged, and uploaded must-gather artifacts move through the workflow.
---

# Artifact Lifecycle

The workflow creates a local archive in the controller runner and optionally
uploads the final archive to S3-compatible object storage.

## Raw Collection

The fixed collection command is:

```bash
oc adm must-gather --dest-dir <controlled_work_dir>
```

The raw output directory is temporary job data.

## Cleaning

When `ocp_must_gather_clean_enabled` is true, the workflow runs
`must-gather-clean` with a platform-owned config:

```bash
must-gather-clean -c <platform_config> -i <raw_dir> -o <cleaned_dir> -r <report_dir> -d
```

The cleaned archive is the handoff artifact. `report.yaml` is excluded from the
shared archive.

## Upload

When upload is enabled, the final archive is uploaded through
`amazon.aws.s3_object` to platform-owned object storage.

Users retrieve the archive from object storage. They should not depend on AWX
runner storage as the download plane.
