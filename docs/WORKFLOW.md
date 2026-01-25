# CinéConnect Team Workflow

This document outlines the standard development process for the CinéConnect team.

## 1. The Golden Rule
**Never push directly to `main` or `develop`.** Always work on a feature branch.

## 2. The Process

### Step 1: Create an Issue
Before writing code, create an Issue on GitHub to track the work.
- **Title**: Clear description (e.g., "Add Login Page").
- **Labels**: Tag it appropriately (e.g., `front-end`, `feature`).
- **Assignee**: Assign it to yourself.

### Step 2: Create a Branch
**The Easy Way (Recommended):**
1.  Go to the Issue on GitHub.
2.  Click **"Create a branch"** in the sidebar.
3.  GitHub will automatically create the branch from `develop` (ensure `develop` is your Default Branch).
4.  Copy the commands GitHub gives you:

```bash
git fetch origin
git checkout feat/42-add-login-page
```

### Step 3: Develop & Commit
Write your code. Commit often with clear messages.

```bash
git add .
./p gac  # Use our CLI for smart commit messages!
```

### Step 4: Push & Pull Request
Push your branch to GitHub.
```bash
./p gp
# The pipeline logs will automatically stream in your terminal 🚀
```

1.  Go to GitHub and create a **Pull Request (PR)**.
2.  **Base**: Set the base to `develop` (NOT `main`).
3.  **Reviewers**: Request a review from a teammate.
4.  **Link Issue**: meaningful description, e.g., "Closes #42".

### Step 5: Code Review & Merge
- A teammate must review and approve code.
- Ensure all CI checks (pipeline) pass.
- Squash and Merge into `develop`.

## 3. Deployment
- **`develop`**: Automatically deployed to the Staging environment (future setup).
- **`main`**: Production code. We merge `develop` into `main` only when we are ready for a release.
