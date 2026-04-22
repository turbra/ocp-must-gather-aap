---
title: Deployment Guide
---

# Deployment Guide

Use this guide to create the OpenShift must-gather broker in an existing AWX
or Ansible Automation Platform controller.

A platform administrator performs this setup. Development users receive execute
access to the finished Job Template only. They must not receive access to the
OpenShift kubeconfig credential, S3 credential, Project, Inventory, Job
Template internals, or platform-owned extra vars.

The Job Template runs as the OpenShift identity in the attached kubeconfig.
Use a dedicated platform-owned service account or equivalent non-human
credential for real deployments. A personal cluster-admin kubeconfig is only
appropriate for homelab or temporary lab testing.

## Required Values

Collect these values before starting:

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

## 1. Prepare The Execution Environment

The selected Execution Environment must include:

- `ansible-playbook`
- `oc`
- `tar`
- `must-gather-clean`
- `amazon.aws`
- `boto3`
- `botocore`
- `find`
- `mv`
- standard shell utilities

Build and publish the EE through your normal platform registry process. The repo
includes a minimal build example:

```text
ee/Containerfile
ee/execution-environment.yml
```

Example build:

```bash
cd ee
ansible-builder build -t registry.example.com/aap/ocp-mustgather-ee:latest
podman push registry.example.com/aap/ocp-mustgather-ee:latest
```

Register the image in AWX/AAP:

- Name: `ocp-mustgather-ee`
- Image: `registry.example.com/aap/ocp-mustgather-ee:latest`
- Pull policy: `If newer` for registry-backed images

Verify the required tools are available before attaching the EE to the Job Template. See the [Setup Runbook](aap-setup-runbook.md) section 3 for verification commands. `must-gather-clean` is community-supported and is only called when the survey toggle is enabled.

## 2. Use The Preferred Deployment Path

The preferred path is the controller apply playbook.

Copy the example vars file to an untracked path and fill in your environment
values:

```bash
cp aap/controller-vars.example.yml /secure/path/controller-vars.yml
vi /secure/path/controller-vars.yml
```

Keep the vars file and kubeconfig outside the repo.

Run the apply wrapper:

```bash
export CONTROLLER_HOST=https://aap.example.com
export CONTROLLER_OAUTH_TOKEN=<token>
scripts/apply-aap-controller-mvp.sh /secure/path/controller-vars.yml
```

The wrapper runs `aap/playbooks/configure-controller.yml` with the `awx.awx`
collection. If it completes successfully, continue with
[Post-deployment checks](#post-deployment-checks).

## 3. Manual Fallback

Use this section only if you are creating the controller objects by hand or
verifying a scripted deployment. For detailed field values, injector behavior,
and object reference, see the [Setup Runbook](aap-setup-runbook.md).

### Project

Create a Project:

- Name: `ocp-mustgather-aap`
- Organization: platform-owned organization
- Source Control Type: `Git`
- Source Control URL: approved repo URL
- Source Control Branch: approved rollout branch
- Update Revision on Launch: enabled if that matches your rollout process

Sync the Project and confirm this playbook is visible:

```text
playbooks/ocp_must_gather.yml
```

### Inventory

Create one static Inventory:

- Name: `clustera-localhost`
- Organization: platform-owned organization

Add one host:

- Name: `localhost`
- Variables:

```yaml
ansible_connection: local
```

### Credential Types

Create the OpenShift kubeconfig custom credential type from:

```text
aap/custom-credential-type-openshift-kubeconfig.yml
```

Create the S3-compatible object storage custom credential type from:

```text
aap/custom-credential-type-s3-object-store.yml
```

The kubeconfig credential type writes the kubeconfig to a temporary file and
sets `KUBECONFIG` for the job. The S3 credential type injects object storage
access through AWS-compatible environment variables.

### Credentials

Create the platform-owned OpenShift credential:

- Name: `mustgather-clustera-sa`
- Credential Type: `OpenShift Must-Gather Kubeconfig`
- Kubeconfig: dedicated service account kubeconfig for must-gather

Create the platform-owned object storage credential when upload is enabled:

- Name: `mustgather-artifact-s3`
- Credential Type: `S3 Object Store Access`
- Access key: platform-owned object storage access key
- Secret key: platform-owned object storage secret key
- Region: optional region value for the S3-compatible endpoint

Do not grant development users direct access to either credential.

### Artifact Storage

Object storage settings are platform-owned extra vars on the Job Template. Do not expose
these values in the survey. The final object key pattern is:

```text
<prefix>/<cluster>/<archive-name>
```

Users retrieve the archive from object storage, not from AWX runner storage.

### Job Template

Create one Job Template:

- Name: `OpenShift Must-Gather - ClusterA`
- Job Type: `Run`
- Organization: platform-owned organization
- Inventory: `clustera-localhost`
- Project: `ocp-mustgather-aap`
- Playbook: `playbooks/ocp_must_gather.yml`
- Execution Environment: `ocp-mustgather-ee`
- Credentials:
  - `mustgather-clustera-sa`
  - `mustgather-artifact-s3` when object storage upload is enabled
- Verbosity: `1`
- Timeout: `7200`
- Allow Simultaneous: disabled

Disable these launch prompts:

- Inventory
- Credentials
- Variables

Set platform-owned extra vars:

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

### Survey

Enable the survey with exactly these fields:

| Prompt | Variable | Required | Type |
| --- | --- | ---: | --- |
| Red Hat support case ID | `support_case_id` | yes | text |
| Short reference label | `reference_label` | no | text |
| Run must-gather-clean | `ocp_must_gather_clean_enabled` | yes | multiple choice, `false` or `true`, default `false` |

If your controller supports survey regex validation, use:

```text
support_case_id: ^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$
reference_label: ^$|^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$
```

Do not add survey fields for commands, flags, namespaces, credentials, output
paths, images, cluster selection, cleaner flags, cleaner config, bucket,
endpoint, object key, or upload settings.

The repo includes the survey shape in:

```text
aap/survey-spec.yml
```

### RBAC

Grant the authorized team:

- Execute on `OpenShift Must-Gather - ClusterA`

Do not grant that team:

- Credential access
- Job Template admin access
- Project admin or update access
- Inventory admin access
- Execution Environment admin access
- Organization admin access

## Post-deployment Checks

Run one platform-admin launch first:

```text
support_case_id=SMOKE001
reference_label=admin-smoke
ocp_must_gather_clean_enabled=false
```

Confirm the job completes and prints:

- OpenShift identity used by the attached kubeconfig
- local artifact path
- object storage reference when upload is enabled

A successful object storage handoff looks like:

```text
Object storage: s3://<bucket>/<prefix>/<cluster>/<archive-name>
Download reference: <endpoint>/<bucket>/<prefix>/<cluster>/<archive-name>
```

Retrieve the archive from object storage and confirm it is readable:

```bash
tar -tzf <downloaded archive> >/dev/null
```

Then launch once as an authorized development user and confirm:

- the user can launch the Job Template
- the user can only answer the three survey fields
- the user cannot edit the Job Template
- the user cannot view or change credentials
- the user can see the final object storage reference

Use the [internal platform validation checklist](internal-validation-checklist.md)
for a full platform validation pass.

## Troubleshooting

If the job fails before Ansible starts:

- Verify the EE exists on the execution node or can be pulled.
- Verify the EE image pull policy matches the deployment model.
- Verify the controller can start EE containers.
- Verify the Project sync succeeded and the playbook path is visible.

If the job fails at `KUBECONFIG is not set`:

- Attach `mustgather-clustera-sa` to the Job Template.
- Confirm the credential uses `OpenShift Must-Gather Kubeconfig`.
- Confirm the credential injector sets `KUBECONFIG`.

If the job completes but no object storage reference is printed:

- Confirm `ocp_must_gather_s3_upload_enabled` is true.
- Confirm the S3 credential is attached to the Job Template.
- Confirm endpoint, bucket, prefix, region, and TLS settings are correct.
- Confirm the EE can reach the object storage endpoint.

If `oc auth can-i '*' '*' --all-namespaces` returns `no`:

- The OpenShift identity does not have enough access for this workflow.
- Fix the service account or cluster role binding before testing again.

If `oc whoami` prints a personal user:

- Continue only for homelab or temporary lab testing.
- Replace the kubeconfig with a dedicated service account or equivalent
  platform-owned non-human identity before real use.

## Boundaries

This deployment intentionally does not support multi-cluster selection,
approval workflows, Vault integration, custom portals, user-provided commands,
user-provided `oc` flags, user-controlled output paths, or user-controlled
upload destinations.
