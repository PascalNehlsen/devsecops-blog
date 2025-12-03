---
id: metadata
title: PDF Metadata Scan Tool
sidebar_label: PDF Metadata Scan Tool
sidebar_position: 4
---

import GithubLinkAdmonition from '@site/src/components/GithubLinkAdmonition';

<GithubLinkAdmonition link="https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/metadata" text="Github Repository" type="info">
**Reach me out via** [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen)**,** [Portfolio Contact Form](https://pascal-nehlsen.de/#contact) **or** [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)
</GithubLinkAdmonition>

# My PDF Metadata Scan Tool

This repository contains the source code for my custom implementation of the `metadata` tool. This lightweight tool automates the extraction of metadata from PDF documents and exports them into a CSV file. It supports both individual PDF files and directories containing multiple PDFs.

:::danger[Only for Testing Purposes]
This tool is intended for educational and authorized penetration testing purposes only. Unauthorized use of this tool against systems that you do not have explicit permission to test is illegal and unethical.
:::

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Usage Examples](#usage-examples)
  - [Options](#options)
  - [Extract Metadata from a Single File](#extract-metadata-from-a-single-file)
  - [Extract Metadata from a Directory](#extract-metadata-from-a-directory)

## Features

This implementation covers the following features/options:

- **Metadata Extraction**: Extracts metadata such as title, author, creation date, and more from PDF documents.
- **Single File or Directory Support**: Handles both individual PDFs and directories containing multiple PDFs.
- **CSV Export**: Outputs metadata into a CSV file with semicolon-separated values.
- **Configurable Output**: User can specify the output filename.

## Getting Started

To get started with this `metadata` tool, follow these steps:

1. **Clone the Repository**:

```shell
git clone https://github.com/yourusername/metadata-tool.git
cd metadata-tool
```

2. **Install Dependencies**:

```shell
pip install PyPDF2
```

## Usage Examples

### Options

| Option        | Shorthand | Description                              | Required |
| ------------- | --------- | ---------------------------------------- | -------- |
| `--directory` | `-d`      | Specify path to a single PDF file        |          |
| `--file`      | `-f`      | Specify path to a directory of PDF files |          |
| `--name`      | `-n`      | Specify output CSV file name             | x        |

- One option is required: `--directory` or `--file`

### Extract Metadata from a Single File

To extract metadata from a single PDF file and save it to a CSV file, use the following command:

```shell
python metadata.py -f <path_to_pdf> -n <output_filename>
```

- `path_to_pdf`: The path to the PDF file.
- `output_filename`: The name of the CSV file where the metadata will be stored.

Example:

```shell
python metadata.py -f example.pdf -n metadata.csv
```

### Extract Metadata from a Directory

To extract metadata from all PDF files in a directory and save them to a CSV file, use the following command:

```shell
python metadata.py -d <path_to_directory> -n <output_filename>
```

- `path_to_directory`: The path to the directory containing PDF files.
- `output_filename`: The name of the CSV file where the metadata will be stored.

Example:

```shell
python metadata.py -d /path/to/pdf/folder -n metadata.csv
```

## CSV Output Format

The output CSV file will contain the following metadata fields for each PDF:

- Title
- Author
- Creator
- Created
- Modified
- Subject
- Keywords
- Description
- Producer
- PDF Version

Each entry will be separated by a semicolon (`;`) as per your specification.
