#!/bin/bash
# deploy.sh — pousse les modifs en ligne automatiquement
set -e

cd "$(dirname "$0")"

git add -A
git commit -m "${1:-update}" 2>/dev/null || echo "Rien à committer."

TOKEN=$(gh auth token)
git remote set-url origin "https://YoussefJlidi:${TOKEN}@github.com/YoussefJlidi/neopulsion.git"
git push origin main
git remote set-url origin "https://github.com/YoussefJlidi/neopulsion.git"

echo "✓ Déployé — site live dans ~30s sur https://neopulsion.com"
