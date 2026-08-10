---
id: metadata
title: PDF-Metadaten-Scan-Werkzeug
sidebar_label: PDF-Metadaten-Scan-Werkzeug
sidebar_position: 4
---


# Mein PDF-Metadaten-Scan-Werkzeug

Dieses Repository enthält den Quellcode meiner eigenen Umsetzung des `metadata`-Werkzeugs. Es liest Metadaten aus PDFs aus und exportiert sie in eine CSV-Datei. Es verarbeitet einzelne PDFs und Verzeichnisse mit mehreren PDFs.

:::danger[Nur für Testzwecke]
Dieses Werkzeug ist ausschließlich für Ausbildung und autorisierte Penetrationstests gedacht. Es gegen Systeme einzusetzen, für die du keine ausdrückliche Testerlaubnis hast, ist strafbar und unethisch.
:::

## Inhalt

- [Funktionen](#funktionen)
- [Loslegen](#loslegen)
- [Beispiele](#beispiele)
  - [Optionen](#optionen)
  - [Metadaten aus einer einzelnen Datei](#metadaten-aus-einer-einzelnen-datei)
  - [Metadaten aus einem Verzeichnis](#metadaten-aus-einem-verzeichnis)

## Funktionen

Diese Umsetzung deckt folgende Funktionen ab:

- **Metadaten auslesen**: liest Metadaten wie Titel, Autor, Erstellungsdatum und mehr aus PDFs.
- **Einzeldatei oder Verzeichnis**: verarbeitet einzelne PDFs und ganze Verzeichnisse.
- **CSV-Export**: schreibt die Metadaten in eine CSV-Datei mit Semikolon als Trennzeichen.
- **Konfigurierbare Ausgabe**: der Dateiname der Ausgabe ist wählbar.

## Loslegen

So kommst du mit dem `metadata`-Werkzeug los:

1. **Repository klonen**:

```shell
git clone https://github.com/yourusername/metadata-tool.git
cd metadata-tool
```

2. **Abhängigkeiten installieren**:

```shell
pip install PyPDF2
```

## Beispiele

### Optionen

| Option        | Kurzform  | Beschreibung                              | Pflicht |
| ------------- | --------- | ---------------------------------------- | -------- |
| `--directory` | `-d`      | Pfad zu einem einzelnen PDF              |          |
| `--file`      | `-f`      | Pfad zu einem Verzeichnis mit PDFs       |          |
| `--name`      | `-n`      | Name der Ausgabe-CSV                     | x        |

- Eine Option ist Pflicht: `--directory` oder `--file`

### Metadaten aus einer einzelnen Datei

Um Metadaten aus einem einzelnen PDF in eine CSV zu schreiben:

```shell
python metadata.py -f <path_to_pdf> -n <output_filename>
```

- `path_to_pdf`: der Pfad zum PDF.
- `output_filename`: der Name der CSV, in der die Metadaten landen.

Beispiel:

```shell
python metadata.py -f example.pdf -n metadata.csv
```

### Metadaten aus einem Verzeichnis

Um Metadaten aus allen PDFs eines Verzeichnisses in eine CSV zu schreiben:

```shell
python metadata.py -d <path_to_directory> -n <output_filename>
```

- `path_to_directory`: der Pfad zum Verzeichnis mit den PDFs.
- `output_filename`: der Name der CSV, in der die Metadaten landen.

Beispiel:

```shell
python metadata.py -d /path/to/pdf/folder -n metadata.csv
```

## Format der CSV

Die Ausgabe-CSV enthält je PDF diese Metadatenfelder:

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

Die Einträge sind wie vorgesehen durch Semikolon (`;`) getrennt.

---

**Repository:** [https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/metadata](https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/metadata)
