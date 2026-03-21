# 🚀 Project Workflow Guide

This document explains how to start working on the project after forking the repository and how multiple developers should collaborate using a clean branch strategy.

---

# 📌 Overview

This project uses a **clean start approach** using an orphan branch called **`new`**.
All development will happen from this branch, and contributors will create their own feature branches from it.

---

# 🧑‍💻 1. Initial Setup (After Forking the Repository)

## Step 1: Fork the Repository

Fork the repository **vi-slides** to your GitHub account.

## Step 2: Clone Your Fork

```bash
git clone https://github.com/<your-username>/vi-slides.git
cd vi-slides
```

Open the project in VS Code:

```bash
code .
```

---

# 🧹 2. Create a Clean Branch

We will create a completely fresh branch without the previous project history in the working directory.

## Step 1: Create an Orphan Branch

```bash
git checkout --orphan new
```

## Step 2: Remove All Existing Files

```bash
rm -rf *
```

After running this command, the project folder in VS Code will appear empty (except hidden Git files).

## Step 3: Reset Git State

```bash
git add .
git commit -m "Clean start (orphan branch)"
```

---

# 📦 3. Initialize the New Project

Now you can start building the project from scratch.

Example:

```bash
npm init -y
mkdir src
touch src/index.ts
```

Commit the new project:

```bash
git add .
git commit -m "Initial project setup"
git push origin new
```

---

# 🌍 4. Set `new` as the Default Branch

To avoid confusion for contributors:

1. Go to the repository on GitHub
2. Open **Settings**
3. Click **Branches**
4. Change the default branch to:

```
new
```

---

# 👥 5. Team Development Workflow

## Important Rule

No one should work directly on the **`new`** branch.

Every developer must create a feature branch.

---

## Step 1: Get Latest Code

```bash
git checkout new
git pull origin new
```

## Step 2: Create a Feature Branch

```bash
git checkout -b feature/<feature-name>
```

Example:

```bash
git checkout -b feature/auth-system
```

---

## Step 3: Work on the Feature

Make your changes, then commit them.

```bash
git add .
git commit -m "Add authentication system"
```

---

## Step 4: Push the Feature Branch

```bash
git push origin feature/<feature-name>
```

Example:

```bash
git push origin feature/auth-system
```

---

# 🔁 6. Create a Pull Request (PR)

After pushing your branch:

1. Go to GitHub
2. Open the repository
3. Click **Compare & Pull Request**
4. Set:

* Base branch → `new`
* Compare branch → your feature branch

Submit the PR for review.

After approval, it will be merged into **`new`**.

---

# 🔄 7. Keeping Your Branch Updated

Before continuing work on your branch:

Update the base branch:

```bash
git checkout new
git pull origin new
```

Merge the latest changes into your branch:

```bash
git checkout feature/<your-branch>
git merge new
```

---

# 🌳 8. Branch Structure

The repository will follow this structure:

```
new (base branch)
│
├── feature/auth
├── feature/dashboard
├── feature/api
├── feature/ui
├── bugfix/login-error
```

---

# ⚡ 9. VS Code Tips

Check current branch:
Bottom-left corner of VS Code shows the active branch.

Switch branch:

```bash
git checkout <branch-name>
```

Open Source Control panel:

* Stage changes
* Commit changes
* Push updates

---

# 🚫 10. Rules & Best Practices

Do not work on the main branch
Do not push directly to the `new` branch
Always pull the latest changes before starting work
Keep feature branches small and focused
Write clear commit messages

---

# 🔒 11. Recommended Repository Settings

To maintain code quality:

Enable branch protection for `new`:

* Require pull request before merging
* Require at least one code review
* Prevent direct pushes

---

# 🧠 Workflow Summary

```
Fork Repo
   ↓
Clone Repo
   ↓
Create Orphan Branch (new)
   ↓
Start Fresh Project
   ↓
Develop Using Feature Branches
   ↓
Create Pull Requests
   ↓
Merge into new
```

---

# ✅ Ready to Contribute

You can now start building features and collaborating with the team using this workflow.
