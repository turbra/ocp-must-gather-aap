---
title: Brokered Execution
description: How AWX or AAP brokers privileged OpenShift must-gather execution.
---

# Brokered Execution

This project uses AWX or Ansible Automation Platform as the control plane for a
privileged OpenShift operation.

Development users do not receive cluster-admin access. They receive execute
permission on one predefined Job Template.

## What AAP Controls

AAP owns:

- the approved Project and playbook revision
- the Inventory
- the Execution Environment
- platform-owned credentials
- the survey shape
- Job Template settings
- launch history and audit metadata

## What Users Control

Users provide only constrained metadata:

- `support_case_id`
- `reference_label`
- `ocp_must_gather_clean_enabled`

Users cannot provide commands, flags, paths, credentials, bucket names, cleaner
configs, or upload destinations.

## Why This Boundary Matters

`oc adm must-gather` requires elevated cluster access. This design does not
turn that operation into normal delegated OpenShift RBAC. It centralizes the
privileged credential in the controller and exposes only a fixed launch path.
