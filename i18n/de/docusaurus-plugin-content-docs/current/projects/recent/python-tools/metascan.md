---
id: metascan
title: PDF-Download-Werkzeug
sidebar_label: PDF-Download-Werkzeug
sidebar_position: 5
---


# PDF-Download- und Metadaten-Scan-Werkzeug

Dieses Repository enthält ein Python-Werkzeug, das alle PDFs einer Webseite herunterlädt und ihre Metadaten ausliest. Die Metadaten werden in eine CSV-Datei geschrieben.

:::danger[Nur für Testzwecke]
Dieses Werkzeug ist ausschließlich für Ausbildung und autorisierte Penetrationstests gedacht. Es gegen Systeme einzusetzen, für die du keine ausdrückliche Testerlaubnis hast, ist strafbar und unethisch.
:::

## Inhalt

- [Funktionen](#funktionen)
- [Loslegen](#loslegen)
  - [Voraussetzungen](#voraussetzungen)
  - [Installation](#installation)
- [Benutzung](#benutzung)
  - [Kommandozeilen-Optionen](#kommandozeilen-optionen)
  - [Beispiele](#beispiele)
- [Ausgabe-CSV](#ausgabe-csv)
- [Fehlerbehandlung](#fehlerbehandlung)

## Funktionen

Dieses Werkzeug bietet:

- **PDFs herunterladen**: lädt automatisch alle PDFs einer Webseite herunter.
- **Metadaten auslesen**: liest aus jedem PDF folgende Felder:
  - Title
  - Author
  - Creator
  - Created (Erstellungsdatum)
  - Modified (Änderungsdatum)
  - Subject
  - Keywords
  - Description
  - Producer
  - PDF Version
- **In CSV speichern**: schreibt die Metadaten in eine CSV, eine Zeile pro PDF.

## Loslegen

### Voraussetzungen

Vor dem Ausführen muss installiert sein:

- **Python 3.7 oder höher**
- Python-Bibliotheken:
  - `requests`
  - `beautifulsoup4`
  - `PyPDF2`

Installieren mit `pip`:

```shell
pip install requests beautifulsoup4 PyPDF2
```

### Installation

**Repository klonen**:

```shell
git clone https://github.com/yourusername/metascan.git
cd metascan
```

## Benutzung

Das Werkzeug läuft über die Kommandozeile und bietet ein paar Optionen.

### Kommandozeilen-Optionen

| Option | Beschreibung                                   | Pflicht |
| ------ | ---------------------------------------------- | -------- |
| `-u`   | URL der Webseite, die nach PDFs durchsucht wird | x        |
| `-n`   | Name der Ausgabe-CSV                           | x        |

### Beispiele

**PDFs von einer Webseite herunterladen und Metadaten auslesen**

```shell
python metascan.py -u https://example.com -n output.csv
```

- Dieser Befehl durchsucht `https://example.com` nach PDFs, lädt sie herunter und schreibt ihre Metadaten in `output.csv`.

**Anderen Ausgabedateinamen angeben**

```shell
python metascan.py -u https://example.com -n my_metadata.csv
```

- Speichert die Metadaten in `my_metadata.csv` statt in die Standarddatei `output.csv`.

## Ausgabe-CSV

Die Ausgabe-CSV enthält die Metadaten je PDF in strukturierter Form. Jede Zeile steht für ein PDF, mit diesen Feldern (Spalten):

## Beispielausgabe

Die vom Werkzeug erzeugte CSV sieht aus wie die Tabelle unten, mit Semikolon (;) als Trennzeichen:

| Title       | Author     | Creator   | Created    | Modified   | Subject | Keywords | Description   | Producer    | PDF Version |
| ----------- | ---------- | --------- | ---------- | ---------- | ------- | -------- | ------------- | ----------- | ----------- |
| Sample PDF  | John Doe   | PDF Tool  | 2022-01-01 | 2022-01-05 | Report  | Data     | Sample file   | Adobe       | 1.7         |
| Example Doc | Jane Roe   | PDFGen    | 2023-05-03 | 2023-05-10 | Invoice | Billing  | Invoice file  | LibreOffice | 1.6         |
| Test PDF    | None       | None      | 2020-12-12 | 2020-12-13 | Manual  | None     | User manual   | Foxit       | 1.4         |
| Report 2022 | Mark Smith | ReportGen | 2022-02-15 | 2022-02-16 | Annual  | Report   | Yearly Report | Adobe       | 1.7         |

Die Einträge in der CSV sind durch Semikolon (`;`) getrennt.

## Fehlerbehandlung

Lässt sich ein PDF nicht lesen oder sind die Metadaten unvollständig, protokolliert das Werkzeug den Fehler und macht mit der nächsten Datei weiter, ohne den ganzen Vorgang abzubrechen. Im Terminal erscheint zudem eine Meldung, welche Dateien Probleme hatten.

Beispiel für eine Fehlermeldung:

```shell
Error reading metadata from pdf_downloads/document.pdf: EOF marker not found
```

---

**Repository:** [https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/metascan](https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/metascan)
