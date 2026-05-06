---
title: Controller Setup
description: Create the AWX or AAP objects with the controller apply wrapper.
---

# Controller Setup

Use the controller apply wrapper when you are creating the workflow in an
existing AWX or AAP controller.

## Copy Vars

Copy the example vars file to an untracked path and fill in environment values:

```bash
cp aap/controller-vars.example.yml /secure/path/controller-vars.yml
vi /secure/path/controller-vars.yml
```

Keep the vars file and kubeconfig outside the repository.

## Apply Objects

Run the wrapper with a controller token:

```bash
export CONTROLLER_HOST=https://aap.example.com
export CONTROLLER_OAUTH_TOKEN=<token>
scripts/apply-aap-controller-mvp.sh /secure/path/controller-vars.yml
```

The wrapper runs:

```text
aap/playbooks/configure-controller.yml
```

The apply playbook creates or updates controller objects with the `awx.awx`
collection.

## What Gets Created

The controller setup creates the platform-owned objects needed by the workflow:

| Object | Purpose |
| --- | --- |
| Project | Syncs the approved repository and playbook |
| Inventory | Runs the playbook on controller-local `localhost` |
| Credential Types | Inject kubeconfig and S3-compatible object storage values |
| Credentials | Hold platform-owned OpenShift and object-storage secrets |
| Job Template | Exposes one controlled launch path |
| Survey | Accepts only constrained metadata |
| RBAC | Grants execute access to the authorized team |

## Manual Fallback

Use the [manual fallback](../deployment-guide.md#3-manual-fallback) only when
the apply wrapper is not available or when you need to verify every field in the
controller UI.
