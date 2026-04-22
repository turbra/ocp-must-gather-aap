#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/apply-aap-controller-mvp.sh <vars-file>

Required environment for awx.awx modules:
  CONTROLLER_HOST=https://aap-controller.example.com
  CONTROLLER_OAUTH_TOKEN=<token>

Alternative username/password authentication is also supported by awx.awx:
  CONTROLLER_USERNAME=<username>
  CONTROLLER_PASSWORD=<password>

Required vars file values:
  aap_controller_organization
  aap_must_gather_project_scm_type
  aap_must_gather_project_scm_url, when using git project source
  aap_must_gather_project_local_path, when using manual project source
  aap_must_gather_execution_environment_image

Optional but required before the job can run successfully:
  aap_must_gather_kubeconfig_file

Start from:
  cp aap/controller-vars.example.yml /secure/path/controller-vars.yml
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

vars_file="${1:-}"
if [[ -z "${vars_file}" ]]; then
  usage >&2
  exit 2
fi

if [[ ! -f "${vars_file}" ]]; then
  echo "Vars file not found: ${vars_file}" >&2
  exit 2
fi

if [[ -z "${CONTROLLER_HOST:-}" ]]; then
  echo "CONTROLLER_HOST is required" >&2
  exit 2
fi

if [[ -z "${CONTROLLER_OAUTH_TOKEN:-}" ]]; then
  if [[ -z "${CONTROLLER_USERNAME:-}" || -z "${CONTROLLER_PASSWORD:-}" ]]; then
    echo "Set CONTROLLER_OAUTH_TOKEN or CONTROLLER_USERNAME/CONTROLLER_PASSWORD" >&2
    exit 2
  fi
fi

ansible-playbook \
  -i inventories/localhost.yml \
  aap/playbooks/configure-controller.yml \
  -e "@${vars_file}"
