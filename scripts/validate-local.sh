#!/usr/bin/env bash
set -euo pipefail

ansible-playbook --syntax-check \
  -i inventories/localhost.yml \
  playbooks/ocp_must_gather.yml

ansible-playbook --syntax-check \
  -i inventories/localhost.yml \
  aap/playbooks/configure-controller.yml

yamllint playbooks roles inventories aap ee config

if command -v ansible-lint >/dev/null 2>&1; then
  ansible-lint \
    playbooks/ocp_must_gather.yml \
    aap/playbooks/configure-controller.yml
else
  echo "ansible-lint not found, skipping"
fi

bash -n scripts/apply-aap-controller-mvp.sh
bash -n scripts/stage-awx-manual-project.sh
