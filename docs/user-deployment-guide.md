---
title: User Deployment Guide
---

# User Deployment Guide

Use this guide to create the OpenShift must-gather Job Template in an existing
AAP or AWX controller. It assumes the repo is already available in source
control and that a platform admin is performing the setup.

This deployment uses brokered execution. The OpenShift credential is stored in
AAP or AWX and attached to one controlled Job Template. Dev users can launch the
template, but they must not be allowed to edit the template, change credentials,
change variables, or access the kubeconfig.

The playbook runs cluster commands as whatever OpenShift identity is
represented by the attached kubeconfig credential. If that kubeconfig belongs
to a human cluster-admin user, the job is effectively running as that user.
That is fine for homelab or temporary lab testing, but real usage should use a
dedicated platform-owned service account or equivalent non-human credential.

## Required Inputs

Collect these before starting:

| Value | Example | Notes |
| --- | --- | --- |
| Controller URL | `https://aap.example.com` | Existing AAP or AWX controller |
| Organization | `Default` | Use your platform-owned organization |
| Project name | `ocp-mustgather-aap` | AAP/AWX Project name |
| Repo URL | `https://git.example.com/platform/ocp-mustgather-aap.git` | Source repo containing this code |
| Repo branch | `main` | Use the approved rollout branch |
| EE image | `registry.example.com/aap/ocp-mustgather-ee:latest` | Must contain `oc`, `tar`, `must-gather-clean`, `amazon.aws`, `boto3`, and `botocore` |
| Cluster label | `clustera` | Used only in artifact names |
| Credential name | `mustgather-clustera-sa` | Platform-owned kubeconfig credential |
| S3 credential name | `mustgather-artifact-s3` | Platform-owned object storage credential |
| S3 endpoint URL | `https://s3.example.invalid` | S3-compatible API endpoint |
| S3 bucket | `must-gather-artifacts` | Bucket must already exist |
| S3 prefix | `must-gather` | Optional object key prefix |
| Local artifact path | `/runner/artifacts/ocp-must-gather` | Local staging path before upload |
| Pilot team | `dev-mustgather-pilot` | Team receiving execute access |

Do not use a personal kubeconfig for a production pilot. Use a dedicated
platform-owned OpenShift identity with the access required for
`oc adm must-gather`.

## 1. Prepare The Execution Environment

The selected execution environment must include:

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

A minimal EE definition is provided:

```text
ee/Containerfile
ee/execution-environment.yml
```

Build and publish the image using your normal platform process. Example:

```bash
cd ee
ansible-builder build -t registry.example.com/aap/ocp-mustgather-ee:latest
podman push registry.example.com/aap/ocp-mustgather-ee:latest
```

Register the image in AAP/AWX:

- Name: `ocp-mustgather-ee`
- Image: `registry.example.com/aap/ocp-mustgather-ee:latest`
- Pull policy: `If newer` for registry-backed images, or `Never` only for local
  development images already present on the execution node

Before continuing, confirm the EE contains every tool the playbook depends on.
Run the following commands inside the EE container (via `podman run --rm <image>
<cmd>`, an AWX ad hoc job, or equivalent) and confirm each exits without error.

```bash
# oc: required for oc whoami, oc auth can-i, and oc adm must-gather
oc version --client=true

# tar: required to create the final archive
tar --version

# must-gather-clean: required when ocp_must_gather_clean_enabled is true
# If missing, set the toggle to false until the EE is rebuilt
must-gather-clean version

# boto3 and botocore: required by amazon.aws.s3_object for artifact upload
python3 -c "import boto3, botocore"

# amazon.aws collection: required for the S3 upload task
ansible-doc amazon.aws.s3_object >/dev/null
```

This checks full EE readiness for the complete workflow, not just
`must-gather-clean`. Standard must-gather needs `oc` and `tar`. Object storage
upload needs `boto3`, `botocore`, and `amazon.aws`. `must-gather-clean` is only
called when the cleaning toggle is enabled, but it should be present in the EE
so the option is available without a rebuild.

`must-gather-clean` is a community-supported OpenShift tool for obfuscating and
omitting sensitive data from a generated must-gather. It is not a
Red Hat-supported product. This MVP uses it only after `oc adm must-gather`
completes, against the generated must-gather directory.

## Choose A Deployment Path

Two paths are supported for creating the required controller objects.

> **Tip**
>
> The command-line path is preferred. If the apply script completes without
> errors, skip sections 2 through 8 and continue from section 9.

**Preferred: command-line deployment**

Copy the example vars file, fill in your values, and run the apply script:

```bash
cp aap/controller-vars.example.yml /secure/path/controller-vars.yml
vi /secure/path/controller-vars.yml
export CONTROLLER_HOST=https://aap.example.com
export CONTROLLER_OAUTH_TOKEN=<token>
scripts/apply-aap-controller-mvp.sh /secure/path/controller-vars.yml
```

This runs `aap/playbooks/configure-controller.yml` via the `awx.awx`
collection. Set `aap_must_gather_kubeconfig_file` in the vars file to load the
SA kubeconfig directly. Keep the vars file and kubeconfig outside this repo.

If the script completes without errors, skip to section 9 (Configure RBAC).

**Fallback: manual web console**

Sections 2 through 8 step through creating each controller object by hand in
the AWX or AAP web console. These steps are also useful for verifying that a
script-driven deployment produced the expected objects.

## Sections 2 through 8: Manual Controller Object Creation

Skip this section if you applied the controller objects from the command line.
Steps that are optional or conditional are noted inline.

## 2. Create The Project

Create a Project:

- Name: `ocp-mustgather-aap`
- Organization: platform-owned organization
- Source Control Type: `Git`
- Source Control URL: repo URL for this project
- Source Control Branch: approved rollout branch
- Update Revision on Launch: enabled for pilot

Sync the Project.

Confirm this playbook is visible after sync:

```text
playbooks/ocp_must_gather.yml
```

## 3. Create The Inventory

Create one static Inventory:

- Name: `clustera-localhost`
- Organization: platform-owned organization

Add one host:

- Name: `localhost`
- Variables:

```yaml
ansible_connection: local
```

The repo also includes the inventory shape in:

```text
inventories/localhost.yml
```

## 4. Create The Custom Credential Type

Create a custom credential type:

- Name: `OpenShift Must-Gather Kubeconfig`
- Kind: `Cloud`

Use the definitions from:

```text
aap/custom-credential-type-openshift-kubeconfig.yml
```

Input configuration:

```yaml
fields:
  - id: kubeconfig
    type: string
    label: Kubeconfig
    secret: true
    multiline: true
required:
  - kubeconfig
```

Also create the S3-compatible object storage custom credential type:

- Name: `S3 Object Store Access`
- Kind: `Cloud`

Use the definitions from:

```text
aap/custom-credential-type-s3-object-store.yml
```

Kubeconfig injector configuration:

```yaml
file:
  template.kubeconfig: "{{ kubeconfig }}"
env:
  KUBECONFIG: "{{ tower.filename }}"
```

The kubeconfig credential type writes the kubeconfig into the execution
environment as a temporary file and sets `KUBECONFIG` to that path.

S3 credential injector configuration:

```yaml
env:
  AWS_ACCESS_KEY_ID: "{{ access_key }}"
  AWS_SECRET_ACCESS_KEY: "{{ secret_key }}"
  AWS_REGION: "{{ region }}"
```

## 5. Create The Platform Credential

Create one credential:

- Name: `mustgather-clustera-sa`
- Organization: platform-owned organization
- Credential Type: `OpenShift Must-Gather Kubeconfig`
- Kubeconfig: paste the dedicated OpenShift must-gather kubeconfig

This kubeconfig is the cluster identity for every job launch. Verify it with
`oc whoami` before attaching it to the Job Template.

> **Warning**
>
> Do not use a personal cluster-admin kubeconfig for real pilots. Use a
> dedicated platform-owned service account. If `oc whoami` shows a personal
> user, treat that credential as lab-only.

Create a second credential when object storage upload is enabled:

- Name: `mustgather-artifact-s3`
- Organization: platform-owned organization
- Credential Type: `S3 Object Store Access`
- Access key: platform-owned object storage access key
- Secret key: platform-owned object storage secret key
- Region: optional region value for the S3-compatible endpoint

Do not grant dev users direct access to either credential.

Before attaching it to the Job Template, validate the kubeconfig from an
equivalent runtime if possible:

```bash
export KUBECONFIG=/secure/path/mustgather-sa.kubeconfig
oc whoami
oc auth can-i '*' '*' --all-namespaces
oc adm must-gather --help
```

`oc whoami` should show the dedicated service account or equivalent non-human
identity. If it shows a personal user, do not use that credential for a real
pilot.

## 6. Choose Artifact Storage

The default Job Template extra var is:

```yaml
ocp_must_gather_output_root: /runner/artifacts/ocp-must-gather
```

> **Note**
>
> The local path is temporary staging before upload. Dev users retrieve the
> archive from object storage, not from the runner filesystem.

For this MVP, the local path is a staging location before object storage
upload. It only needs enough space for the final archive during the job.

Do not expose the artifact path in the survey.

Expected archive naming pattern:

```text
must-gather_<raw|cleaned>_<cluster>_<support_case_id>[_reference_label]_<UTC timestamp>.tar.gz
```

Example:

```text
must-gather_cleaned_clustera_SMOKE001_admin-smoke_20260421T200537Z.tar.gz
```

When cleaning is enabled, the final archive contains the cleaned must-gather
output. The raw must-gather directory remains only in the controlled work
directory and is removed after a successful run when cleanup is enabled.

> **Caution**
>
> `must-gather-clean` writes `report.yaml`, which maps obfuscated values back
> to originals. Do not share this file. The playbook excludes it from the
> handoff archive, but verify its absence before distributing the archive.

Configure object storage with platform-owned Job Template extra vars and a
platform-owned S3 credential. Do not expose any of these values in the survey.

```yaml
ocp_must_gather_s3_upload_enabled: true
ocp_must_gather_s3_endpoint_url: https://s3.example.invalid
ocp_must_gather_s3_bucket: must-gather-artifacts
ocp_must_gather_s3_region: us-east-1
ocp_must_gather_s3_prefix: must-gather
ocp_must_gather_s3_validate_certs: true
```

Use `ocp_must_gather_s3_validate_certs: false` only for lab endpoints with
self-signed TLS while you are validating the pilot. Prefer a trusted CA bundle
or valid endpoint certificate for real use.

The object key is controlled by the playbook:

```text
<prefix>/<cluster>/<archive-name>
```

## 7. Create The Job Template

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

Set platform-owned extra vars on the Job Template:

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

Keep enough local staging space under `/runner/artifacts/ocp-must-gather` for
the archive. Users should retrieve from object storage, not AWX runner storage.

Cleaning is controlled by the constrained survey choice
`ocp_must_gather_clean_enabled`. The default is `false` so the standard smoke
test packages the raw must-gather output. The platform-owned config lives in:

```text
config/must-gather-clean/openshift_default.yaml
```

This file is based on the upstream OpenShift default example. It obfuscates
IPs, MACs, domains listed in the config, and Azure resource identifiers. It
omits Secrets, ConfigMaps, certificate signing requests, and MachineConfigs.
Add organization-specific domain names in that file through platform review,
not as user input.

## 8. Create The Survey

Enable the survey with exactly these fields.

Required field:

- Prompt: `Red Hat support case ID`
- Answer variable name: `support_case_id`
- Answer type: `Text`
- Required: yes
- Minimum length: `3`
- Maximum length: `64`

Optional field:

- Prompt: `Short reference label`
- Answer variable name: `reference_label`
- Answer type: `Text`
- Required: no
- Minimum length: `0`
- Maximum length: `32`

Cleaning toggle:

- Prompt: `Run must-gather-clean`
- Answer variable name: `ocp_must_gather_clean_enabled`
- Answer type: `Multiple choice`
- Choices: `false`, `true`
- Required: yes
- Default: `false`

If your controller supports survey regex validation, use:

```text
support_case_id: ^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$
reference_label: ^$|^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$
```

Do not add survey fields for commands, flags, namespaces, credentials, output
paths, images, cluster selection, arbitrary cleaner flags, or
must-gather-clean configuration.

The repo includes the final survey shape in:

```text
aap/survey-spec.yml
```

## 9. Configure RBAC

Create or select the pilot dev team:

- Team: `dev-mustgather-pilot`

Grant this team:

- Execute on `OpenShift Must-Gather - ClusterA`

Do not grant this team:

- Credential access
- Job Template admin access
- Project admin or update access
- Inventory admin access
- Execution Environment admin access
- Organization admin access

Validate with a real pilot dev user before the pilot run.

## 10. Run The Admin Smoke Test

Launch the Job Template as a platform admin:

```text
support_case_id=SMOKE001
reference_label=admin-smoke
```

Expected milestones in job output:

```text
Validate kubeconfig injected by AAP credential
Check oc client is available
Check tar is available
Confirm OpenShift identity from injected credential
Confirm credential has broad cluster access
Run fixed OpenShift must-gather command
Create must-gather archive
Upload final artifact to S3-compatible storage
Print must-gather artifact reference
```

A successful run prints a final message similar to:

```text
OpenShift must-gather completed.
Launched as OpenShift identity: <identity>
Artifact: <artifact path>
Size bytes: <size>
Object storage: s3://<bucket>/<prefix>/<cluster>/<archive-name>
Download reference: <endpoint>/<bucket>/<prefix>/<cluster>/<archive-name>
```

After the job finishes, retrieve the archive from object storage and validate
it:

```bash
tar -tzf <downloaded archive> >/dev/null
```

## 11. Run The Pilot Dev Test

Log in as a pilot dev user.

Confirm the user can:

- See `OpenShift Must-Gather - ClusterA`
- Launch the Job Template
- Enter only `support_case_id`, optional `reference_label`, and the constrained
  `ocp_must_gather_clean_enabled` choice
- View job output and final artifact reference

Confirm the user cannot:

- Edit the Job Template
- Change credentials
- View the kubeconfig credential
- Change Project, Inventory, Variables, or Execution Environment
- Add command flags or arbitrary commands
- Change must-gather-clean configuration

## Troubleshooting

If the job fails before Ansible starts:

- Verify the EE exists on the execution node or can be pulled.
- Verify the EE image pull policy matches the deployment model.
- Verify the AAP/AWX execution node can start EE containers.
- Verify the Project sync succeeded and the playbook path is visible.

If the job fails at `KUBECONFIG is not set`:

- Attach `mustgather-clustera-sa` to the Job Template.
- Confirm the credential uses `OpenShift Must-Gather Kubeconfig`.
- Confirm the credential injector sets `KUBECONFIG`.

If the job completes but the archive cannot be found:

- Confirm the job printed an object storage reference.
- Confirm the S3 credential is attached to the Job Template.
- Confirm endpoint, bucket, prefix, region, and TLS settings are correct.
- Confirm the execution environment can reach the object storage endpoint.

If the job fails before must-gather starts because `must-gather-clean` is
missing:

- Build and register the updated EE.
- Confirm `must-gather-clean version` works in the EE.
- Leave `ocp_must_gather_clean_enabled` set to `false` for standard smoke
  tests until the EE is updated.

If `oc auth can-i '*' '*' --all-namespaces` returns `no`:

- The OpenShift identity does not have enough access for this MVP.
- Fix the service account or cluster role binding before testing again.

If `oc whoami` prints a personal user:

- Continue only for homelab or temporary lab testing.
- Replace the kubeconfig with a dedicated service account or equivalent
  platform-owned non-human identity before a real pilot.

## MVP Limits

This deployment intentionally does not include:

- Multi-cluster selection
- Approval workflows
- Vault integration
- Custom portal or UI
- User-provided commands
- User-provided `oc` flags
- User-controlled output paths
