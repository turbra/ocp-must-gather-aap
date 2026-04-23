---
title: AAP Setup Runbook
---

# AAP Setup Runbook

This runbook is a deep admin reference for controller objects in the must-gather broker. Use the [Deployment Guide](deployment-guide.md) as the primary setup path. Refer to this runbook for detailed field values, injector behavior, local AWX development, and `oc` client version pinning. It does not cover multi-cluster routing, approvals, Vault, or custom download workflows.

## 1. Confirm Repo Content

The controller Project must expose these paths after sync:

```text
playbooks/ocp_must_gather.yml
roles/ocp_must_gather/
inventories/localhost.yml
aap/custom-credential-type-openshift-kubeconfig.yml
aap/custom-credential-type-s3-object-store.yml
aap/job-template-example.yml
aap/survey-spec.yml
aap/playbooks/configure-controller.yml
```

Run local validation before syncing a rollout branch:

```bash
scripts/validate-local.sh
```

## 1.1. Handle Deployment Values Safely

The repo examples use placeholders only. Do not put real kubeconfigs,
controller tokens, object-storage credentials, private keys, generated
must-gather archives, or extracted must-gather output in project files.

Use these locations for real deployment values:

- Repo examples: placeholder values only, such as
  `aap/controller-vars.example.yml` and `aap/job-template-example.yml`.
- Local vars file: operator-specific values used by
  `scripts/apply-aap-controller-mvp.sh`. Keep this file outside source
  control.
- Controller credentials: kubeconfig content, object-storage access key, and
  object-storage secret key.
- Job Template extra vars for platform-owned non-secret settings such as
  endpoint, bucket, prefix, TLS validation, cluster name, and output root.

Use `aap/controller-vars.example.yml` only as a template. Copy it to an
untracked path before editing:

```bash
cp aap/controller-vars.example.yml aap/controller-vars.local.yml
vi aap/controller-vars.local.yml
```

Controller-side state may still contain real environment-specific values even
when the Git repo is clean.

Before sharing controller exports, screenshots, copied YAML, or API output,
verify:

- Job Template extra vars contain only non-secret platform-owned settings.
- Kubeconfig content exists only in the controller kubeconfig credential.
- Object-storage access key and secret key exist only in the controller
  object-storage credential.
- Survey fields are limited to `support_case_id`, `reference_label`, and
  `ocp_must_gather_clean_enabled`.
- Real hostnames, bucket names, cluster names, usernames, tokens, keys, and
  credential content are redacted.

The `oc` client is downloaded during the EE build from the OpenShift mirror and
verified with a pinned SHA-256 checksum. The EE `oc` client should track the
target cluster major.minor version. Update the pinned version and checksum
together when the target cluster minor changes.

## 2. Prepare OpenShift Access

Create a dedicated OpenShift service account for the MVP. The service account
must have enough access for `oc adm must-gather`.

The Job Template runs as the OpenShift identity represented by the attached
kubeconfig credential. If you attach a personal cluster-admin kubeconfig, every
must-gather job is effectively running as that user.

> **Warning**
>
> Do not use a personal cluster-admin kubeconfig for real pilots. Use a
> dedicated platform-owned service account or equivalent non-human identity.

Build a kubeconfig for that service account and validate it from an environment
equivalent to the controller execution runtime:

```bash
export KUBECONFIG=/path/to/mustgather-sa.kubeconfig
oc whoami
oc auth can-i '*' '*' --all-namespaces
oc adm must-gather --help
```

Do not commit this kubeconfig. It belongs only in the controller credential.
Treat it as a high-value credential. It may need privileges equivalent to
cluster-admin, depending on the cluster and must-gather requirements.

## 3. Prepare The Execution Environment

The selected EE must contain:

- `ansible-playbook`
- `oc`
- `tar`
- `must-gather-clean`
- `amazon.aws`
- `boto3`
- `botocore`
- `find`
- `mv`
- standard shell runtime utilities

`ee/Containerfile` is a minimal EE build example. The build downloads the
pinned OpenShift `oc` client from
`https://mirror.openshift.com/pub/openshift-v4/clients/ocp/` and verifies the
archive checksum before installing it. Build and publish the EE using the
platform team's normal registry process. Then register the image in the controller as an
Execution Environment.

The pinned `oc` version is controlled by these build args in `ee/Containerfile`
and `ee/execution-environment.yml`. Keep the client on the same OpenShift
major.minor as the target cluster and refresh the pin when the target cluster
minor changes.

```text
OPENSHIFT_CLIENT_VERSION
OPENSHIFT_CLIENT_LINUX_AMD64_SHA256
OPENSHIFT_CLIENT_LINUX_ARM64_SHA256
```

To update `oc`, choose a stable OpenShift client artifact for the target cluster
major.minor, get the matching archive checksum from that version's
`sha256sum.txt` on the OpenShift mirror, update the build args, and rebuild the
EE. The build requires outbound HTTPS access to the OpenShift mirror unless your
platform provides an internal mirror with the same archive and checksum.

If your build process uses `ansible-builder`, use:

```bash
cd ee
ansible-builder build -t registry.example.invalid/aap/ocp-mustgather-ee:latest
```

The ansible-builder definition is:

```text
ee/execution-environment.yml
```

Before attaching it to the Job Template, verify from the EE runtime:

```bash
oc version --client=true
tar --version
must-gather-clean version
python3 -c "import boto3, botocore"
ansible-doc amazon.aws.s3_object >/dev/null
```

The `oc` client should be compatible with the target OpenShift cluster.
`must-gather-clean` is community-supported. It is used after must-gather
finishes to produce a cleaned handoff artifact from the raw must-gather
directory.

## 4. Decide Artifact Storage

Default output root:

```text
/runner/artifacts/ocp-must-gather
```

> **Note**
>
> The local path is temporary staging before upload. Dev users retrieve the
> archive from object storage, not from the runner filesystem.

For this MVP, this path is the local staging location before object storage
upload. It must have enough space for the archive while the job is running.

Do not expose `ocp_must_gather_output_root` through the survey.

When `ocp_must_gather_clean_enabled` is true, the final archive is the cleaned
must-gather output and is named with `must-gather_cleaned_...`. The raw
must-gather directory and the must-gather-clean report stay in the controlled
work directory and are removed after a successful run when cleanup is enabled.
When it is false, which is the survey default, the final archive is the raw
must-gather output and is named with `must-gather_raw_...`.

> **Caution**
>
> `must-gather-clean` writes `report.yaml`, which maps obfuscated values back
> to originals. Do not share this file. It is deliberately excluded from the
> handoff archive.

Object storage extra vars and the key pattern belong in the Job Template. See [Deployment Guide](deployment-guide.md) section 3.

Before the live pilot, run a platform-admin test and confirm:

```bash
ls -lh /runner/artifacts/ocp-must-gather
tar -tzf /runner/artifacts/ocp-must-gather/<archive-name>.tar.gz >/dev/null
```

Then confirm the same archive exists in the configured object storage bucket.

## 5. Create The Custom Credential Type

Create both credential types from the files listed in [Deployment Guide](deployment-guide.md) section 3. The kubeconfig credential type writes the kubeconfig to a temporary file and sets `KUBECONFIG` for the job. The injector uses `{{ tower.filename }}`, which is the variable documented by Red Hat AAP 2.5 for generated credential files.

## 6. Create The Platform-owned Credential

See [Deployment Guide](deployment-guide.md) section 3 for credential field values and creation steps. The kubeconfig content determines the OpenShift identity for every job. Do not grant dev users direct access to either credential.

## 7. Create The Project

See [Deployment Guide](deployment-guide.md) section 3 for Project field values and creation steps.

## 8. Create The Inventory

See [Deployment Guide](deployment-guide.md) section 3 for Inventory field values and creation steps. The sample inventory file is `inventories/localhost.yml`.

## 9. Create The Job Template

See [Deployment Guide](deployment-guide.md) section 3 for Job Template field values, extra vars, and creation steps.

For local AWX development only, you can set
`aap_must_gather_project_scm_type: manual` and
`aap_must_gather_project_local_path: ocp-mustgather-aap` after copying this repo
under `/var/lib/awx/projects/ocp-mustgather-aap` inside the AWX container:

```bash
scripts/stage-awx-manual-project.sh tools_awx_1 ocp-mustgather-aap
```

If AWX itself is running in a local Podman container, validate nested EE launch
before debugging the must-gather playbook. The job must at least reach Ansible.

Check the AWX task container can create and run the selected EE image:

```bash
sudo podman exec tools_awx_1 sh -lc \
  'podman run --rm --entrypoint /bin/sh localhost/ocp-mustgather-ee:latest -lc "oc version --client=true && tar --version | head -1"'
```

If this fails before the command starts, fix the AWX container runtime first.
For the AWX development compose layout, the AWX container needs the AWX
`containers.conf` mounted at `/etc/containers/containers.conf` and a writable
`/var/lib/containers` mount backed by real host storage. Without those, nested
Podman can fail with container-create errors before Ansible starts.

After recreating the local AWX container, re-stage the manual Project and ensure
the EE image exists inside the AWX container's Podman storage:

```bash
scripts/stage-awx-manual-project.sh tools_awx_1 ocp-mustgather-aap
sudo podman exec tools_awx_1 podman images
```

Use SCM-backed Projects for the real pilot.

## 10. Create The Survey

See [Deployment Guide](deployment-guide.md) section 3 for survey field values and regex patterns. Do not add survey fields beyond those defined there. The survey definition file is `aap/survey-spec.yml`.

## 11. Configure RBAC

See [Deployment Guide](deployment-guide.md) section 3 for RBAC configuration. Validate by logging in as a pilot dev user before the live pilot.

## 12. Post-deployment Checks

See [Deployment Guide: Post-deployment Checks](deployment-guide.md#post-deployment-checks).
