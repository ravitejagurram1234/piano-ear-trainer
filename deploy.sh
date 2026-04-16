#!/usr/bin/env bash
# =============================================================================
#  Piano Ear Trainer — One-click deploy to GitHub + GitHub Pages
#  Run this once from inside the project folder:  bash deploy.sh
# =============================================================================

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
GH_TOKEN=""
GH_USER="ravitejagurram1234"
REPO="piano-ear-trainer"
REMOTE_URL="https://${GH_TOKEN}@github.com/${GH_USER}/${REPO}.git"
PAGES_URL="https://${GH_USER}.github.io/${REPO}/"

echo ""
echo "🎹  Piano Ear Trainer — GitHub Deploy"
echo "────────────────────────────────────────"

# ── Step 1: Create GitHub repository ─────────────────────────────────────────
echo ""
echo "▶  Step 1/4: Creating GitHub repository..."

HTTP_STATUS=$(curl -s -o /tmp/gh_create_response.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: token ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"${REPO}\",
    \"description\": \"Piano Ear Trainer — Enterprise Angular 17 app for musical note recognition across 8 octaves\",
    \"homepage\": \"${PAGES_URL}\",
    \"private\": false,
    \"auto_init\": false
  }")

if [ "$HTTP_STATUS" = "201" ]; then
  echo "   ✅  Repository created: https://github.com/${GH_USER}/${REPO}"
elif [ "$HTTP_STATUS" = "422" ]; then
  echo "   ℹ️   Repository already exists — continuing with push..."
else
  echo "   ❌  Failed to create repository (HTTP $HTTP_STATUS)"
  cat /tmp/gh_create_response.json
  exit 1
fi

# ── Step 2: Initialise git ────────────────────────────────────────────────────
echo ""
echo "▶  Step 2/4: Initialising git..."

git init -b main
git config user.email "deploy@piano-ear-trainer"
git config user.name  "Piano Ear Trainer Deploy"

# ── Step 3: Commit all source files ──────────────────────────────────────────
echo ""
echo "▶  Step 3/4: Committing source files..."

git add .
git commit -m "feat: initial Piano Ear Trainer — Angular 17 enterprise app

- Synthesised piano audio via Web Audio API (8 harmonics, ADSR envelope)
- Full 8-octave visual keyboard with white & black key support
- Octave range selector (dual sliders, octaves 1–8)
- Black key toggle (diatonic ↔ chromatic mode)
- Interactive note guessing with click-on-keyboard UX
- Confetti + chord fanfare success animation
- Shake + error tone on wrong guess
- Live score, accuracy %, streak counter
- GitHub Actions CI/CD — auto builds & deploys on every push"

# ── Step 4: Push to GitHub ────────────────────────────────────────────────────
echo ""
echo "▶  Step 4/4: Pushing to GitHub..."

git remote add origin "${REMOTE_URL}"
git push -u origin main

# ── Enable GitHub Pages (source: gh-pages branch) ────────────────────────────
echo ""
echo "▶  Enabling GitHub Pages..."

curl -s -o /dev/null -w "   Pages API: %{http_code}\n" \
  -X POST \
  -H "Authorization: token ${GH_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/${GH_USER}/${REPO}/pages" \
  -d '{"source":{"branch":"gh-pages","path":"/"}}'

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo "  ✅  All done!"
echo ""
echo "  📦  Repository : https://github.com/${GH_USER}/${REPO}"
echo "  ⚙️   Actions    : https://github.com/${GH_USER}/${REPO}/actions"
echo "  🌐  Live URL   : ${PAGES_URL}"
echo ""
echo "  GitHub Actions is now building your app."
echo "  The live URL will be ready in ~2 minutes."
echo "════════════════════════════════════════"
echo ""
echo "  ⚠️   Security tip: Revoke your PAT after deployment:"
echo "      github.com → Settings → Developer settings → Personal access tokens"
echo ""
