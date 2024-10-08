# My `hydra` Tool

This repository contains the source code for my own implementation of the `hydra` tool, a network logon cracker used for brute-force attacks against various protocols. This lightweight implementation focuses on SSH brute-force and dictionary attacks.

> [!CAUTION]  
> **Only for Testing Purposes.**  
> This tool is intended for educational and authorized penetration testing purposes only. Unauthorized use of this tool against systems that you do not have explicit permission to test is illegal and unethical.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Usage Examples](#usage-examples)
  - [Brute-Force Attack](#brute-force-attack)
  - [Dictionary Attack](#dictionary-attack)
  - [All Hydra-Options](#all-hydra-Options)
- [Logging](#logging)
- [Contact](#contact)

## Features

This implementation covers the following features/options:

- **SSH Brute-Force Attack**: Attempts to crack SSH passwords by trying all combinations within a given length and character set.
- **Dictionary Attack**: Uses a provided wordlist to attempt to find the correct password.
- **Configurability**: Allows customization of minimum and maximum password lengths, as well as character sets.
- **Logging**: Provides unstructured detailed logs of all connection attempts and results.

## Getting Started

To get started with the `hydra` tool, follow these steps:

1. **Clone the Repository**:

```shell
git clone https://github.com/pascalnehlsen/hydra.git
cd hydra
```

2. **Create a Virtual Environment**:

```bash
python -m venv myenv
```

- Here, myenv is the name of the virtual environment. You can name it anything you like.

3. **Activate the Virtual Environment**:

Using a virtual environment allows you to create isolated Python environments for different projects, ensuring that dependencies and package versions do not conflict with each other.

- For Windows (using Command Prompt or PowerShell):

```bash
myenv\Scripts\activate
```

- For macOS/Linux:

```bash
source myenv/bin/activate
```

- For Windows (using Git Bash or MINGW64):

```bash
source myenv/Scripts/activate
```

Once activated, you should see the name of your virtual environment (e.g., `(myenv)`) in your command prompt, indicating that you are now working inside that environment.

4. **Install Dependencies**:
   Ensure you have **paramiko** installed. You can install it using the requirements.txt:

```bash
pip install -r requirements.txt
```

## Usage Examples

### Brute-Force Attack

To perform a brute-force attack without a wordlist, use the following command:

```shell
python hydra.py \
    -u <username> \
    -s <server> \
    -p <port> \
    --min <min_length> \
    --max <max_length> \
    -c <charset>
```

Example:

```shell
python hydra.py \
    -u root \
    -s localhost \
    -p 2222 \
    --min 1 \
    --max 4 \
    -c abc123
```

### Dictionary Attack

To perform a dictionary attack using a wordlist, use the following command:

```shell
python hydra.py \
    -u <username> \
    -s <server> \
    -p <port> \
    -w <path_to_wordlist>
```

- path_to_wordlist (`-w`): Path to the wordlist file (required for dictionary attack)

Example:

```shell
python hydra.py \
    -u root \
    -s localhost\
    -p 2222 \
    -w ./password.txt
```

### All Hydra-Options

| Option        | Shorthand | Description                                    | Default value | Required |
| ------------- | --------- | ---------------------------------------------- | ------------- | -------- |
| `--username`  | `-u`      | Username for SSH login                         | root          | x        |
| `--server`    | `-s`      | Server IP address or DNS                       | -             | x        |
| `--port`      | `-p`      | Port for SSH connection                        | 22            |          |
| `--wordlist`  | `-w`      | Path to the wordlist for dictionary attack     | -             |          |
| `--character` | `-c`      | Charset for brute force attack                 | alphanumeric  |          |
| `--minimum`   | `--min`   | Minimum password length for brute force attack | 1             |          |
| `--maximum`   | `--max`   | Maximum password length for brute force attack | 4             |          |

## Logging

Logs are written to **hydra.log**. The **hydra.log** will be placed in your source code folder. If there is already a **hydra.log** in this folder, the generated log files are appended to the content You can check this file to review detailed information about the connection attempts and outcomes.

## Contact

- Pascal Nehlsen - [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen) - [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)
- Project Link: [https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/hydra](https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/hydra)
