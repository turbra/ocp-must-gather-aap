#!/usr/bin/env python3
"""Run must-gather-clean with stdin detached from Ansible module input."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys


def main() -> int:
    executable = shutil.which("must-gather-clean")
    if executable is None:
        print("must-gather-clean not found in PATH", file=sys.stderr)
        return 127

    with open(os.devnull, "rb") as stdin:
        completed = subprocess.run(
            [executable, *sys.argv[1:]],
            stdin=stdin,
            check=False,
        )

    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())
