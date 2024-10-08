---
sidebar_label: Branches
title: Branches
---

# Git Branches

Branches in Git allow for parallel development by creating separate lines of work. Each branch represents an independent version of the codebase.

## Key Concepts

- **Branch**: A pointer to a specific commit, allowing for isolated changes.
- **Default Branch**: Typically called `main` or `master`.

## Common Commands

- **List Branches**:

  ```bash
  git branch
  ```

- **Create a New Branch**:

  ```bash
  git branch [branch-name]
  ```

- **Switch to a Branch**:

  ```bash
  git checkout [branch-name]
  ```

- **Create and Switch**:

  ```bash
  git checkout -b [branch-name]
  ```

- **Merge a Branch**:

  ```bash
  git merge [branch-name]
  ```

- **Delete a Branch**:
  ```bash
  git branch -d [branch-name]
  ```
