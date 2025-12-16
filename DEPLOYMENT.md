# Deployment Guide

Follow these steps to update your code and publish changes to the live website.

## 1. Save Your Code (Source)

This updates the `main` branch on GitHub (where your readable code lives).

```bash
git add .
git commit -m "Update site"
git push origin main
```

## 2. Publish Live Website

This updates the link that agents and users access.
_The `gh-pages` branch is automatically managed by this command._

```bash
npm run deploy
```

## 3. Sync from GitHub (Download Updates)

If you edited files on GitHub directly, run this to download them to your computer.

```bash
git pull origin main
```

---

### Troubleshooting

- If `git push` fails, try `git pull` first to sync with GitHub.
- If `npm run deploy` fails, check if you have unsaved changes or authentication issues.
