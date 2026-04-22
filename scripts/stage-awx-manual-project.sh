#!/usr/bin/env bash
set -euo pipefail

container_name="${1:-tools_awx_1}"
project_name="${2:-ocp-mustgather-aap}"

stage_dir="$(mktemp -d /tmp/${project_name}.XXXXXX)"
cleanup() {
  rm -rf "${stage_dir}"
}
trap cleanup EXIT

cp -a \
  README.md \
  ansible.cfg \
  .gitignore \
  playbooks \
  roles \
  config \
  inventories \
  aap \
  docs \
  ee \
  scripts \
  "${stage_dir}/"

sudo -n podman exec "${container_name}" \
  rm -rf "/var/lib/awx/projects/${project_name}"

sudo -n podman cp \
  "${stage_dir}" \
  "${container_name}:/var/lib/awx/projects/${project_name}"

sudo -n podman exec "${container_name}" \
  sh -lc "find /var/lib/awx/projects/${project_name} -maxdepth 3 -type f | sort"
