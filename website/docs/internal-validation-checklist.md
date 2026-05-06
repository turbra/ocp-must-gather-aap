---
title: Internal Platform Validation Checklist
---

# Internal Platform Validation Checklist

**Internal platform team use only.** Use this checklist after deploying with the [Deployment Guide](deployment-guide.md) to validate the brokered-execution control model.

The validation proves that a development user can launch must-gather without
direct cluster-admin access, while the platform team keeps control over
credentials, logic, artifact handling, and auditability.

## Prerequisites

Complete the [Deployment Guide](deployment-guide.md) before running these checks. Confirm:

- Controller has the Job Template, Project, Inventory, and credentials created.
- Execution Environment includes `oc`, `tar`, `must-gather-clean`, `amazon.aws`, `boto3`, and `botocore`.
- Pilot dev user or group exists in the controller with execute access only.
- Target cluster and object storage endpoint are reachable from the EE runtime.

## 1. Controller Object Validation

Validate the controller control model:

- Dev user can see the Job Template.
- Dev user can launch the Job Template.
- Dev user cannot edit the Job Template.
- Dev user cannot edit the Project.
- Dev user cannot edit the Inventory.
- Dev user cannot edit the Credential.
- Dev user cannot see kubeconfig secret content.
- Platform admin can manage all required controller objects.

Pass criteria:

- Execute is allowed.
- Modification is denied.
- Privileged credential remains hidden from dev users.

## 2. Survey And Input Validation

Validate that only safe inputs are exposed.

Positive test:

- Launch with a valid `support_case_id`.
- Launch with a valid optional `reference_label`.

Negative tests:

- Blank `support_case_id` is rejected.
- `support_case_id` containing spaces is rejected.
- `support_case_id` containing unsafe characters is rejected.
- Excessively long `reference_label` is rejected.
- `reference_label` containing shell-sensitive characters is rejected.

Pass criteria:

- Valid inputs succeed.
- Invalid inputs are rejected before must-gather execution begins.

## 3. Credential Injection Validation

Validate that the controller injects the kubeconfig as expected:

- Job starts with the controller credential attached.
- Role preflight confirms `KUBECONFIG` presence.
- `oc whoami` shows the expected service account or non-human identity.
- If `oc whoami` shows a personal user, the run is treated as lab-only.
- No credential content is printed in logs.
- Missing credential test fails cleanly before any `oc` action.

Negative test:

- Remove or swap the credential and confirm the job fails early with a clear
      message.

Pass criteria:

- Correct credential is usable.
- Missing credential fails safely.
- No secret leakage appears in job output.

## 4. End-to-end Must-Gather Execution Test

Run one real must-gather against the pilot cluster.

Validate:

- Fixed command path is used.
- No user-controlled command modification occurs.
- Job completes successfully.
- Must-gather data is collected.
- Standard smoke test leaves `ocp_must_gather_clean_enabled` set to
      `false`.
- must-gather-clean runs only when the constrained toggle is set to
      `true`.
- Archive is created.
- Archive uploads to object storage when upload is enabled.
- Final local artifact path is printed clearly in job output.
- Object storage reference is printed clearly in job output.
- Cleanup behavior works as expected.

Pass criteria:

- Successful archive is created with no platform-team intervention during
      launch.

## 5. Artifact Validation

Validate that the output is usable in practice:

- Artifact is created in the expected path.
- Filename matches convention.
- Filename starts with `must-gather_raw_` when cleaning is disabled.
- Filename starts with `must-gather_cleaned_` when cleaning is enabled.
- Archive can be accessed after job completion.
- Object key follows `<prefix>/<cluster>/<filename>`.
- Archive is not corrupt.
- Archive is suitable for attachment to a Red Hat support case.
- `report.yaml` is not present in the archive.
- Retention behavior is understood.

Validate naming pattern:

- Cluster identifier is included.
- Support case number is included.
- Optional reference label is included only when provided.
- UTC timestamp is included.

Pass criteria:

- Artifact exists, is readable, and can be retrieved predictably.

## 6. Dev-user Experience Validation

Have a pilot dev user perform the flow with minimal coaching.

Observe:

- Can they find the template easily?
- Do the survey fields make sense?
- Do they understand what will happen?
- Can they recognize success versus failure?
- Can they locate the local artifact path afterward?
- Can they locate the object storage reference afterward?
- Can they complete the process under light time pressure?

Pass criteria:

- Pilot dev user can launch and understand the workflow without platform
      intervention.

## 7. Audit Trail Validation

Validate accountability.

Check controller job history for:

- Who launched the job.
- When it was launched.
- Which template ran.
- Job outcome.

Check audit retention:

- Job output is retained long enough for review.
- Launch is tied to an actual individual identity, not a shared generic
      login.

Pass criteria:

- Platform or security reviewer can determine who initiated the action and
      when.

## 8. Failure-mode Validation

Test controlled failures:

- Invalid survey input.
- Missing kubeconfig credential.
- Cluster API unreachable.
- Output path unavailable or unwritable.
- Object storage endpoint unreachable.
- S3 credential missing while upload is enabled.
- Insufficient disk space, if practical to simulate.
- `oc` missing from the EE.
- `must-gather-clean` missing from the EE while cleaning is enabled.

Validate:

- Failures happen clearly.
- Failures do not expose secrets.
- Failure messages are understandable.
- Partial artifacts are handled predictably.

Pass criteria:

- Failures are safe, visible, and diagnosable.

## 9. Security And Control Review

Confirm:

- No arbitrary commands can be passed by the dev user.
- No arbitrary flags can alter must-gather behavior.
- No user-controlled output path exists.
- No user-controlled bucket, endpoint, prefix, or object key exists.
- No user-controlled credential selection exists.
- No user-controlled must-gather-clean config or flags exist.
- must-gather-clean `report.yaml` is not shared.
- No embedded secrets exist in repo content.
- Privileged execution remains platform-owned.
- The privileged kubeconfig is treated as a high-value credential.
- Production-like use avoids personal cluster-admin kubeconfigs.
- The design is documented as brokered execution, not delegated OpenShift
      RBAC.

Pass criteria:

- Control boundary is intact and explainable.

## 10. Pilot Exit Criteria

The MVP pilot is successful when all of these are true:

- Dev user can launch the job independently.
- Dev user cannot modify privileged logic.
- Dev user cannot access the privileged credential.
- Must-gather runs successfully against the pilot cluster.
- Artifact is produced in a known location.
- Artifact can be retrieved reliably.
- Controller records who launched the job and when.
- Basic failure cases behave safely.
- Platform team is comfortable supporting the MVP operationally.

## 11. Capture Findings

After the pilot, document:

- What worked.
- What confused users.
- Where artifact retrieval was awkward.
- Whether controller RBAC behaved as intended.
- Whether logs were sufficient for audit.
- Any EE dependency issues.
- What must change before broader rollout.

## Recommended Internal Validation Sequence

1. Deploy the Job Template with the [Deployment Guide](deployment-guide.md).
2. Run one admin-led validation job first.
3. Run one pilot dev-user job with execute-only permissions.
4. Review artifact retrieval and audit trail before expanding.
