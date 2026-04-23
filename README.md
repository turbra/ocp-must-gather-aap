<p align="center">
  <a href="https://turbra.github.io/ocp-must-gather-aap/"><strong>OCP must-gather through AAP</strong></a>
</p>

<p align="center">
  <strong>Broker privileged OpenShift must-gather through AWX/AAP without giving development users direct cluster-admin access.</strong>
</p>

<p align="center">
  <a href="https://www.apache.org/licenses/LICENSE-2.0"><img src="https://img.shields.io/badge/License-Apache--2.0-2C7A7B?style=flat-square" alt="License: Apache-2.0"></a>
</p>

<p align="center">
  <a href="https://turbra.github.io/ocp-must-gather-aap/">Documentation</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#security-model">Security Model</a> •
  <a href="#validation">Validation</a> •
  <a href="#license">License</a>
</p>

---

Run a fixed OpenShift must-gather workflow from AWX or Ansible Automation
Platform. Approved users launch one controlled Job Template, AAP runs the
privileged collection with a platform-owned credential, and the final archive is
handed off through S3-compatible object storage.

## How It Works

Platform administrators own the Project, Inventory, credentials, Execution
Environment, Job Template, survey, and RBAC. Development users receive execute
access to the Job Template only.

The survey accepts only constrained metadata: `support_case_id`,
`reference_label`, and the optional must-gather-clean toggle. Users cannot pass
commands, flags, paths, bucket names, credentials, or cleanup configuration.

The playbook validates inputs, runs a fixed `oc adm must-gather` workflow,
optionally sanitizes the output with must-gather-clean, creates the final
archive, uploads it to object storage when enabled, and records the launch in
controller job history.

## Quick Start

Start with the [Deployment Guide](docs/deployment-guide.md) when you
are creating the workflow in an existing AWX or AAP controller.

After deployment, platform admins can use the
[Admin Implementation Checklist](docs/aap-admin-implementation-checklist.md)
for rollout tracking and the
[Internal Platform Validation Checklist](docs/internal-validation-checklist.md)
to validate RBAC, survey inputs, artifacts, audit trail, and failure behavior.

For controller object detail, `oc` version pinning, and local AWX development,
see the [AAP Setup Runbook](docs/aap-setup-runbook.md).

The Execution Environment downloads a pinned OpenShift `oc` client during the
image build and verifies it with a pinned SHA-256 checksum. Keep the client on
the same OpenShift major.minor version as the target cluster. Update the version
and checksums together when the target cluster minor changes. Disconnected
environments should mirror the same archive and checksum internally.

## Security Model

This is brokered privileged execution, not delegated OpenShift RBAC. The
OpenShift credential attached to the Job Template still has the access required
to run must-gather, which may be effectively cluster-admin.

Development users do not receive the kubeconfig, S3 credential, Project update
rights, inventory admin rights, or permission to change the playbook internals.
They launch a predefined job and provide constrained metadata only.

> **Warning**
>
> Do not use a personal cluster-admin kubeconfig for real pilots or real
> deployments. Use a dedicated platform-owned service account or equivalent
> non-human identity. Every job runs as the OpenShift identity in the attached
> kubeconfig.

## Documentation

- [Documentation site](https://turbra.github.io/ocp-must-gather-aap/):
  deployment, operations, and validation entry point.
- [Deployment Guide](docs/deployment-guide.md): primary setup path for creating
  the workflow in an existing AWX or AAP environment.
- [AAP Setup Runbook](docs/aap-setup-runbook.md): deep admin reference for
  controller object detail, `oc` version pinning, and local AWX development.
- [Internal Platform Validation Checklist](docs/internal-validation-checklist.md):
  internal platform team use only; validate RBAC, survey, artifacts, and audit after deployment.
- [Architecture and security reference](docs/architecture-and-security.md): brokered execution
  model, credential boundary, artifact flow, and limitations.

## Local Files And Secrets

Do not commit kubeconfigs, controller vars, object-storage credentials, tokens,
`.env` files, private keys, certificates, generated must-gather archives, or
extracted must-gather output.

Real deployment values belong in controller credentials, Job Template extra vars,
or an untracked local vars file. Copy `aap/controller-vars.example.yml` to an
untracked path such as `aap/controller-vars.local.yml` or a secure directory
outside the repo, then edit the copy.

Controller-side objects may contain real environment-specific values
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

## License

[Apache License 2.0](LICENSE)
