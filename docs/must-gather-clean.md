---
title: must-gather-clean
description: >-
  How the optional must-gather-clean step is exposed, configured, and
  validated in the AAP must-gather broker.
---

# must-gather-clean

The workflow can optionally sanitize the collected must-gather output before
creating the handoff archive. The sanitizer is
[openshift/must-gather-clean](https://github.com/openshift/must-gather-clean),
a community-supported tool for obfuscating and omitting sensitive data from
must-gather directories.

## How Users Enable It

The Job Template survey exposes one cleaning control:

| Prompt | Variable | Values | Default |
| --- | --- | --- | --- |
| Run must-gather-clean | `ocp_must_gather_clean_enabled` | `false`, `true` | `false` |

When the value is `false`, the role archives the raw must-gather output.

When the value is `true`, the role:

1. Runs the fixed `oc adm must-gather` collection.
2. Runs `must-gather-clean` against the raw output directory.
3. Writes the cleaned files to a separate cleaned output directory.
4. Keeps `report.yaml` in a separate local report directory.
5. Builds the final handoff archive from the cleaned directory.

Users cannot provide cleaner flags, paths, or config through the survey.

## Repository Configuration

The platform-owned cleaner config is stored in:

```text
config/must-gather-clean/openshift_default.yaml
```

The role default points to that file:

```yaml
ocp_must_gather_clean_config: >-
  {{ playbook_dir }}/../config/must-gather-clean/openshift_default.yaml
```

Controller deployments may set the same path explicitly as a Job Template extra
var:

```yaml
ocp_must_gather_clean_config: /runner/project/config/must-gather-clean/openshift_default.yaml
```

Do not expose `ocp_must_gather_clean_config` as a survey field. Changes to the
cleaner config should be reviewed and versioned in this repository.

## Current Behavior

The current config obfuscates these values in retained files:

| Type | Replacement | Target |
| --- | --- | --- |
| `IP` | consistent token such as `x-ipv4-0000000022-x` | paths and file contents |
| `MAC` | consistent token such as `x-mac-0000000001-x` | paths and file contents |
| `Domain` | consistent token such as `domain0000000001` | paths and file contents |

The current config omits Kubernetes resources with these kinds when they are
present in the must-gather:

- `Secret`
- `ConfigMap`
- `CertificateSigningRequest`
- `CertificateSigningRequestList`
- `MachineConfig`

Some must-gather collections may not contain Secrets or ConfigMaps before
cleaning. In that case, validate cleaning by comparing obfuscated values in
retained files instead of expecting omission counts to differ.

## Custom Obfuscation

`must-gather-clean` supports built-in obfuscators for IP addresses, MAC
addresses, and configured domain names. It also supports custom obfuscators
through `Keywords` and `Regex`.

Use `Keywords` when specific known strings should be replaced:

```yaml
config:
  obfuscate:
    - type: Keywords
      replacement:
        internal-cluster-name: cluster-name-redacted
```

Use `Regex` when sensitive values follow a predictable pattern:

```yaml
config:
  obfuscate:
    - type: Regex
      regex: "token-[A-Za-z0-9]+"
```

The upstream project also supports targeting file contents, file paths, or both.
For path-sensitive values, use `target: All` or `target: FilePath` intentionally.
Custom obfuscators should be specific and reviewed carefully because broad
patterns can make the cleaned output less useful for support.

See the upstream configuration reference for the complete schema and examples:

- [must-gather-clean README](https://github.com/openshift/must-gather-clean)
- [OpenShift default example](https://github.com/openshift/must-gather-clean/blob/main/examples/openshift_default.yaml)
- [Schema](https://github.com/openshift/must-gather-clean/blob/main/pkg/schema/schema.json)

## Validation Example

A practical validation is to compare the same retained file in raw and cleaned
archives. For example:

```text
cluster-scoped-resources/operator.openshift.io/networks/cluster.yaml
```

Raw must-gather:

```yaml
spec:
  clusterNetwork:
    - cidr: 10.128.0.0/14
```

Cleaned must-gather:

```yaml
spec:
  clusterNetwork:
    - cidr: x-ipv4-0000000022-x/14
```

This proves the file was retained, the YAML structure stayed usable, and the IP
address portion of the CIDR was obfuscated.

## Report Handling

`must-gather-clean` writes a `report.yaml` file that maps original values to
their replacements. Treat that report as sensitive.

The role writes the report outside the final handoff directory and validates
that it is not bundled into the cleaned archive. The normal successful cleanup
path removes the local work directory after the archive has been produced and
any configured upload has completed.

## Runtime Notes

Cleaning can be significantly slower than raw collection because the tool reads
and rewrites retained files. In current validation, a raw must-gather completed
successfully while a clean-enabled run took substantially longer. Use the survey
toggle intentionally when a cleaned artifact is required.
