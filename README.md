# OCP must-gather through AAP

Run OpenShift must-gather from AWX or Ansible Automation Platform without
handing cluster-admin access to development users. The project packages a fixed
brokered-execution workflow: approved users launch one controlled Job Template,
AAP runs the privileged collection using a platform-owned credential, and the
resulting archive is handed off through S3-compatible object storage.

## How it works

- Platform administrators own the Project, Inventory, credentials, Execution
  Environment, Job Template, survey, and RBAC.
- Approved users receive execute access to the must-gather Job Template only.
- The survey accepts only minimal metadata: `support_case_id`,
  `reference_label`, and the optional must-gather-clean toggle.
- The playbook validates inputs, runs a fixed `oc adm must-gather` workflow,
  optionally runs must-gather-clean with a platform-owned config, packages the
  final archive, and uploads it to object storage when enabled.
- AWX or AAP records who launched the job, when it ran, and what outcome it
  produced.

## Security model

This is brokered privileged execution, not delegated OpenShift RBAC. The
OpenShift credential attached to the Job Template still has the access required
to run must-gather, which may be effectively cluster-admin.

Development users do not receive the kubeconfig, S3 credential, project update
rights, inventory admin rights, or permission to change the playbook internals.
They launch a predefined job and provide constrained metadata only.

> [!WARNING]
> Do not use a personal cluster-admin kubeconfig for real pilots or real
> deployments. Use a dedicated platform-owned service account or equivalent
> non-human identity. Every job runs as the OpenShift identity in the attached
> kubeconfig.

## Quickstart

Start with the deployment guide if you are creating the workflow in an existing
AWX or AAP environment:

- [User Deployment Guide](docs/user-deployment-guide.md)

For a platform-admin rollout, use:

- [AAP Setup Runbook](docs/aap-setup-runbook.md)
- [Admin Implementation Checklist](docs/aap-admin-implementation-checklist.md)
- [Pilot Validation Checklist](docs/pilot-validation-checklist.md)

The Execution Environment downloads a pinned OpenShift `oc` client at build
time from the OpenShift mirror and verifies it with a pinned SHA-256 checksum.
Keep the client on the same OpenShift major.minor as the target cluster. Update
the version and checksums together when the target cluster minor changes.
Disconnected environments should mirror the same archive and checksum
internally.

## Documentation

- [Documentation index](docs/index.md): deployment, operations, and validation
  entry point.
- [Design and security notes](docs/aap-must-gather-mvp.md): brokered execution
  model, credential boundary, artifact flow, and limitations.
- [User Deployment Guide](docs/user-deployment-guide.md): create the workflow
  in an existing AWX or AAP environment.
- [AAP Setup Runbook](docs/aap-setup-runbook.md): step-by-step platform setup.
- [Pilot Validation Checklist](docs/pilot-validation-checklist.md): validate
  RBAC, survey inputs, artifacts, audit trail, and failure behavior.

## Local files and secrets

Do not commit kubeconfigs, controller vars, object-storage credentials, tokens,
`.env` files, private keys, certificates, generated must-gather archives, or
extracted must-gather output.

Real deployment values belong in AWX/AAP credentials, Job Template extra vars,
or an untracked local vars file. Copy `aap/controller-vars.example.yml` to an
untracked path such as `aap/controller-vars.local.yml` or a secure directory
outside the repo, then edit the copy.

AWX/AAP controller-side objects may contain real environment-specific values
even when the Git tree is clean. Review Job Template extra vars, credentials,
exports, API output, and screenshots before sharing.

## Validation

Run the local validation wrapper before publishing changes or syncing a rollout
branch:

```bash
scripts/validate-local.sh
```

Or run the core syntax check directly:

```bash
ansible-playbook --syntax-check -i inventories/localhost.yml playbooks/ocp_must_gather.yml
```

Do not run the playbook directly without a valid `KUBECONFIG` for the
platform-owned must-gather service account or equivalent privileged non-human
identity.
