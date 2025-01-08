# git clone

The `git clone` command is used to create a copy of a Git repository from a remote server (e.g., GitHub, GitLab) to your local machine. This includes all branches, commits, and files.

## Syntax

```bash
git clone <repository-url> [<directory>]
```

- `<repository-url>`: The URL of the remote repository you want to clone.
- `<directory>` (optional): The name of the directory where the repository will be cloned. If not specified, Git uses the repository's name by default.

## Example

To clone a repository from GitHub:

```bash
git clone https://github.com/user/repository.git
```

This will create a folder named `repository` containing the cloned repository.

To clone into a specific directory:

```bash
git clone https://github.com/user/repository.git my-folder
```

This will clone the repository into a folder named `my-folder`.

## Common Use Cases

- Downloading the source code of a project to contribute or study.
- Setting up a local copy of a remote repository for development.
- Starting work on a project shared by a team.
