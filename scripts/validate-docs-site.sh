#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
website_dir="${repo_root}/website"
build_dir="${website_dir}/build"

rm -rf "${build_dir}"

if [[ ! -d "${website_dir}/node_modules" ]]; then
  npm ci --prefix "${website_dir}"
fi

(
  cd "${website_dir}"
  npm run build
)

if rg --pcre2 -n 'href="/(?!ocp-must-gather-aap/)|src="/(?!ocp-must-gather-aap/)' "${build_dir}" --glob '*.html'; then
  echo "Found root-relative internal paths that are not safe for the GitHub Pages base URL" >&2
  exit 1
fi
