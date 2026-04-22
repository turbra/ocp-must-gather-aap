# AAP Implementation Assets

These files are the apply-ready AAP or AWX assets for the one-cluster must-gather MVP.

## Files

- `custom-credential-type-openshift-kubeconfig.yml`: final custom credential
  type. It writes a kubeconfig to a temporary file and injects `KUBECONFIG`.
- `custom-credential-type-s3-object-store.yml`: final custom credential type
  for S3-compatible artifact upload access.
- `job-template-example.yml`: final Job Template shape, including survey,
  fixed extra vars, timeout, credential, inventory, project, EE names, and the
  constrained must-gather-clean survey toggle.
- `survey-spec.yml`: final survey definition for UI entry or API use.
- `controller-vars.example.yml`: copy-only template for local controller apply
  variables. The edited copy must stay outside the repo.
- `playbooks/configure-controller.yml`: idempotent controller setup playbook.

## Apply From CLI

Create a local vars file outside the repo:

```bash
cp aap/controller-vars.example.yml /secure/path/controller-vars.yml
vi /secure/path/controller-vars.yml
```

Set controller access:

```bash
export CONTROLLER_HOST=https://aap-controller.example.com
export CONTROLLER_OAUTH_TOKEN=<token>
```

Apply the MVP objects:

```bash
scripts/apply-aap-controller-mvp.sh /secure/path/controller-vars.yml
```

Set `aap_must_gather_kubeconfig_file` to a local service account kubeconfig
before creating a runnable pilot template. The script reads that file and sends
it to the controller as a secret credential input. Do not commit the kubeconfig or the
edited vars file.

> [!WARNING]
> Use a dedicated platform-owned service account kubeconfig for real pilots. A
> personal cluster-admin kubeconfig is acceptable only for homelab or temporary
> lab testing. The job runs as whatever OpenShift identity the kubeconfig
> represents.

Leaving `aap_must_gather_kubeconfig_file` empty creates the non-runnable
controller skeleton only. This is useful for checking Project, Inventory, EE,
survey, and RBAC wiring before the privileged OpenShift credential is ready.

## Created Objects

The apply playbook creates or updates:

- Custom credential type
- Execution Environment registration
- Project
- Localhost inventory and host
- Platform-owned kubeconfig credential, when a kubeconfig file is provided
- Platform-owned S3 object storage credential, when upload is enabled
- Controlled Job Template
- Survey
- Optional pilot team
- Optional Execute role assignment on the Job Template

The apply playbook does not create OpenShift service accounts, build the EE
image, push images, create buckets, customize the must-gather-clean config, or
validate object storage access. Those remain platform operations.

## Local AWX Manual Project Helper

For the local AWX development container only, stage this repo under
`/var/lib/awx/projects/ocp-mustgather-aap`:

```bash
scripts/stage-awx-manual-project.sh tools_awx_1 ocp-mustgather-aap
```

Then set these vars before applying controller objects:

```yaml
aap_must_gather_project_scm_type: manual
aap_must_gather_project_local_path: ocp-mustgather-aap
```

Use a Git-backed Project for the real pilot.
