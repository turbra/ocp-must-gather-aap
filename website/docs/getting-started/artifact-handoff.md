---
title: Artifact Handoff
description: Verify local archive staging and object-storage handoff.
---

# Artifact Handoff

The controller runner is the staging location. Object storage is the preferred
handoff location.

## Archive Name

Archives follow this pattern:

```text
must-gather_<raw|cleaned>_<cluster>_<support_case_id>[_<reference_label>]_<UTC timestamp>.tar.gz
```

Example:

```text
must-gather_cleaned_clustera_03912345_INC123_20260421T171530Z.tar.gz
```

## Object Key

When object storage upload is enabled, the object key pattern is:

```text
<prefix>/<cluster>/<archive-name>
```

The job emits both references:

```text
Object storage: s3://<bucket>/<prefix>/<cluster>/<archive-name>
Download reference: <endpoint>/<bucket>/<prefix>/<cluster>/<archive-name>
```

The URL-shaped value is a handoff reference, not a presigned URL.

## Verify The Archive

Retrieve the archive from object storage and confirm it is readable:

```bash
tar -tzf <downloaded archive> >/dev/null
```

When cleaning is enabled, confirm the shared archive does not contain:

```text
report.yaml
```

`must-gather-clean` writes `report.yaml`, which maps obfuscated values back to
originals. Do not share that file.
