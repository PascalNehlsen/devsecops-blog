---
id: nmap
title: Portscanner Tool
sidebar_label: Portscanner Tool
sidebar_position: 6
---

import GithubLinkAdmonition from '@site/src/components/GithubLinkAdmonition';

<GithubLinkAdmonition link="https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/nmap" text="Github Repository" type="info">
**Reach me out via** [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen)**,** [Portfolio Contact Form](https://pascal-nehlsen.de/#contact) **or** [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)
</GithubLinkAdmonition>

# My Nmap - Portscanner Tool

This repository contains the source code for my custom implementation of the `nmap` tool. This lightweight implementation focuses on port scanning and service detection, offering a basic feature set to identify open ports and running services on a target machine.

:::danger[Only for Testing Purposes]
This tool is intended for educational and authorized penetration testing purposes only. Unauthorized use of this tool against systems that you do not have explicit permission to test is illegal and unethical.
:::

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Usage Examples](#usage-examples)
  - [Options](#options)
  - [Scanning Ports](#scanning-ports)
- [Creating DNS name](#creating-dns-name)
- [Contact](#contact)

## Features

This implementation covers the following features/options:

- **Port Scanning**: Scans specified ports or all ports on a target machine.
- **Service Detection**: Identifies common services running on open ports (for the first 100 ports).
- **Configurable Parameters**: Allows customization of port ranges for scanning.
- **DNS and IP Support**: Supports both numerical IP addresses and DNS names.

## Getting Started

To get started with this `nmap` implementation, follow these steps:

1. **Clone the Repository**:

```shell
git clone https://github.com/yourusername/nmap.git
cd nmap
```

## Usage Examples

### Options

| Option    | Shorthand | Description                               | Required |
| --------- | --------- | ----------------------------------------- | -------- |
| `--ports` | `-p`      | Specify port range or `-p-` for all ports | x        |
| `-s`      | -         | Target IP address or DNS name             | x        |

### Scanning Ports

To scan specific ports or all ports on a target machine, use the following commands:

#### Scan Specific Port Range

```shell
python nmap.py -s <target> -p <port_range>
```

- `target`: The IP address or DNS name of the target machine.
- `port_range`: The range of ports to scan (e.g., `22,80,443` or `1-1000`).

Example:

```shell
python nmap.py -s 10.0.2.41 -p 22,80,443
```

#### Scan all Ports

```shell
python nmap.py -s <target> -p-
```

- `target`: The IP address or DNS name of the target machine.

Example:

```shell
python nmap.py -s 10.0.2.41 -p-
```

### Service Detection

For the first 100 ports, the tool will also attempt to identify the running services.

## Creating DNS Name

To use a DNS name like `yourtarget.abc` instead of an IP address, you need to add this name to your system's `hosts` file. This file maps hostnames to IP addresses.

### On Windows

1. **Open the `hosts` File as Administrator**:

- Search for Notepad in the Windows search bar.
- Right-click on Notepad and select Run as administrator.
- In Notepad, go to **File** > **Open** and navigate to `C:\Windows\System32\drivers\etc\hosts`.
- Ensure the file type is set to **All Files** to see the `hosts` file.

2. **Add the DNS Entry**:

```shell
<IP_ADDRESS>    yourtarget.abc
```

- Replace `<IP_ADDRESS>` with the actual IP address of your target machine.
- Save and close the file.

### On Linux/MacOS

1. **Open the `hosts` File with Root Permissions**:

- Open a terminal.
- Use the following command to edit the file with a text editor like `nano` or `vi`:

```shell
sudo nano /etc/hosts
```

or

```shell
sudo vi /etc/hosts
```

2. **Add the DNS Entry**:

```shell
<IP_ADDRESS>    yourtarget.abc
```

- Replace `<IP_ADDRESS>` with the actual IP address of your target machine.
  Save and exit the editor (`Ctrl+X` then `Y` for `nano`, or `:wq` for `vi`).

## Contact

- Pascal Nehlsen - [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen) - [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)
- Project Link: [https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/nmap](https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/nmap)
