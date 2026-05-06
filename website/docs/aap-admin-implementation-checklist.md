---
title: AAP Admin Implementation Checklist
---

# AAP Admin Implementation Checklist

Use this checklist when standing up the MVP in AAP or AWX for the first pilot
cluster. It assumes the repo has already been synced to source control and that
the platform team owns the OpenShift service account and controller objects.

## Cluster Access

> **Warning**
>
> Do not use a personal cluster-admin kubeconfig for real pilots. Every job
> runs as the OpenShift identity in the attached kubeconfig.

- Create a dedicated OpenShift service account for must-gather.
- Bind the required elevated cluster role to the service account.
- Confirm the service account or equivalent non-human identity has the
      access required for must-gather, which may effectively be cluster-admin.
- Build a kubeconfig for only that service account.
- Do not use a personal cluster-admin kubeconfig except for homelab or
      temporary lab testing.
- Store the kubeconfig outside this repo until it is entered into the controller.
- Confirm the target cluster API is reachable from the controller execution
      runtime.
- Confirm from an equivalent runtime that the credential can run:

  ```bash
  oc whoami
  oc auth can-i '*' '*' --all-namespaces
  oc adm must-gather --help
  ```

- Confirm `oc whoami` returns the intended service account or non-human
      identity.

## Execution Environment

- Select or build an Execution Environment that contains `oc`.
- Confirm the EE contains `tar`.
- Confirm the EE contains `must-gather-clean`.
- Confirm the EE contains the `amazon.aws` collection.
- Confirm the EE contains Python `boto3` and `botocore`.
- Confirm the EE can run `find`, `mv`, and standard shell utilities.
- Confirm the `oc` client version is compatible with the target cluster.
- Confirm `must-gather-clean version` works inside the EE.
- Confirm the EE can reach the OpenShift API endpoint.
- Confirm the EE can reach the S3-compatible object storage endpoint.
- Register the EE in the controller as `ocp-mustgather-ee` or update the Job
      Template name consistently.

## Artifact Storage

- Confirm the local staging path has enough space for the archive.
- Create or select the S3-compatible bucket for handoff.
- Decide the object key prefix.
- Confirm the platform team knows how users retrieve from object storage.
- Confirm endpoint TLS behavior and set `validate_certs` accordingly.
- Confirm `report.yaml` from must-gather-clean is not treated as a
      shareable artifact.
- Do not expose artifact path selection in the survey.

## Controller Project And Inventory

- Create a controller Project pointing to this repo.
- Sync the Project to the intended revision.
- Confirm `playbooks/ocp_must_gather.yml` is visible in the Project.
- Create a static localhost inventory.
- Add host `localhost` with `ansible_connection: local`.

## Controller Credential

- Create the custom credential type from
      `aap/custom-credential-type-openshift-kubeconfig.yml`.
- Create one credential named `mustgather-clustera-sa`.
- Paste the service account kubeconfig into the credential field.
- Confirm this kubeconfig does not belong to a personal user for real
      pilots.
- Attach the credential to the must-gather Job Template.
- Do not grant dev users access to the credential.
- Do not store the kubeconfig in this repo.
- Create the custom credential type from
      `aap/custom-credential-type-s3-object-store.yml`.
- Create one credential named `mustgather-artifact-s3`.
- Store only the object storage access key, secret key, and optional region
      in that credential.
- Attach the S3 credential to the Job Template when upload is enabled.
- Do not grant dev users access to the S3 credential.

## Job Template

- Create one Job Template named `OpenShift Must-Gather - ClusterA`.
- Set Playbook to `playbooks/ocp_must_gather.yml`.
- Set Inventory to the localhost inventory.
- Attach the platform-owned OpenShift kubeconfig credential.
- Set Execution Environment to the EE containing `oc`.
- Set `Allow simultaneous jobs` to disabled.
- Set `Prompt on launch` for inventory, credentials, and variables to
      disabled.
- Enable the survey.
- Set a Job Template timeout that is longer than
      `ocp_must_gather_command_timeout`; `7200` seconds is a practical pilot
      value.
- Set platform-owned extra vars:

  ```yaml
  ocp_must_gather_cluster_name: clustera
  ocp_must_gather_output_root: /runner/artifacts/ocp-must-gather
  ocp_must_gather_clean_config: /runner/project/config/must-gather-clean/openshift_default.yaml
  ocp_must_gather_s3_upload_enabled: true
  ocp_must_gather_s3_endpoint_url: https://s3.example.invalid
  ocp_must_gather_s3_bucket: must-gather-artifacts
  ocp_must_gather_s3_region: us-east-1
  ocp_must_gather_s3_prefix: must-gather
  ocp_must_gather_s3_validate_certs: true
  ```

## Survey

- Add required text field `support_case_id`.
- Add optional text field `reference_label`.
- Add required constrained choice field `ocp_must_gather_clean_enabled`
      with choices `false` and `true`; set the default to `false`.
- Do not add fields for cluster selection, command flags, image, namespace,
      credential, output path, arbitrary cleaner flags, or must-gather-clean
      configuration.
- If the controller version supports survey regex validation, enforce:

  ```text
  support_case_id: ^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$
  reference_label: ^$|^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$
  ```

## RBAC

- Create or select the pilot dev team.
- Grant the pilot dev team Execute on the Job Template only.
- Do not grant project update or admin access.
- Do not grant inventory admin access.
- Do not grant credential access.
- Validate with a pilot dev user login before the live pilot.

## Smoke Test

- Launch once as a platform admin with a test support case ID.
- Confirm the job runs `oc adm must-gather`.
- Confirm the standard smoke test leaves cleaning disabled and creates a
      `must-gather_raw_` archive.
- Confirm must-gather-clean runs after must-gather when enabled.
- Confirm the archive is created in the local staging artifact path.
- Confirm the archive uploads to object storage.
- Confirm the printed object key follows `<prefix>/<cluster>/<filename>`.
- Confirm the archive name starts with `must-gather_cleaned_` when cleaning
      is enabled.
- Confirm `report.yaml` is not present in the archive.
- Confirm the archive can be retrieved and opened.
- Confirm controller job history shows who launched the job and when.
- Launch once as a pilot dev user with execute-only access.
- Confirm the dev user cannot edit the Job Template or view the credential.
