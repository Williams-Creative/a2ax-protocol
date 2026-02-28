#!/usr/bin/env bash
# Build PDFs from LaTeX sources.
# Requires: pdflatex (e.g. TeX Live, MiKTeX)
# Usage: ./build.sh [output_dir]
# Default output: whitepapers/pdf/

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="${1:-$SCRIPT_DIR/pdf}"
mkdir -p "$OUT_DIR"

for tex in "$SCRIPT_DIR"/*.tex; do
  [ -f "$tex" ] || continue
  name=$(basename "$tex" .tex)
  echo "[build] $name.tex -> $OUT_DIR/$name.pdf"
  (cd "$SCRIPT_DIR" && pdflatex -interaction=nonstopmode -output-directory="$OUT_DIR" "$(basename "$tex")" > /dev/null 2>&1)
  # Second run for TOC/cross-refs
  (cd "$SCRIPT_DIR" && pdflatex -interaction=nonstopmode -output-directory="$OUT_DIR" "$(basename "$tex")" > /dev/null 2>&1)
done

# Move PDFs from output dir (pdflatex writes to cwd when -output-directory is used, so we need to handle aux/log)
# Actually pdflatex -output-directory writes PDF there. Let me simplify - run from script dir, output to OUT_DIR
# pdflatex -output-directory=dir file.tex writes file.pdf to dir. Good.

echo "[build] Done. PDFs in $OUT_DIR"
