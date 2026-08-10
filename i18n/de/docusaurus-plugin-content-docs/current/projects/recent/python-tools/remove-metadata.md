---
id: remove-metadata
title: PDF-Metadaten-Entferner
sidebar_label: PDF-Metadaten-Entferner
sidebar_position: 7
---


# PDF-Metadaten entfernen

Dieses Repository enthält ein Python-Werkzeug, das Metadaten aus einem PDF entfernt und es für bessere Web-Performance linearisiert. Die ursprüngliche Datei wird durch die bereinigte ersetzt.

:::danger[Nur für Testzwecke]
Dieses Werkzeug ist ausschließlich für Ausbildung und autorisierte Penetrationstests gedacht. Es gegen Systeme einzusetzen, für die du keine ausdrückliche Testerlaubnis hast, ist strafbar und unethisch.
:::

## Inhalt

- [Funktionen](#funktionen)
- [Loslegen](#loslegen)
  - [Voraussetzungen](#voraussetzungen)
  - [Installation](#installation)
- [Benutzung](#benutzung)
  - [Skript anpassen](#skript-anpassen)
  - [Werkzeug ausführen](#werkzeug-ausführen)
- [Ausgabe](#ausgabe)

## Funktionen

Dieses Werkzeug bietet:

- **Metadaten bereinigen**: entfernt alle Metadaten aus dem angegebenen PDF.
- **Metadaten anzeigen**: gibt alte und bereinigte Metadaten zum Vergleich auf der Konsole aus.

## Loslegen

### Voraussetzungen

Vor dem Ausführen muss installiert sein:

- **Python 3.7 oder höher**
- Python-Bibliotheken:
  - `pikepdf`
  - `exiftool`

Installieren mit `pip`:

```shell
pip install pikepdf exiftool
```

### Installation

**Repository klonen**:

```shell
git clone https://github.com/yourusername/pdf-metadata-cleaner.git
cd pdf-metadata-cleaner
```

## Benutzung

### Skript anpassen

Öffne vor dem Ausführen `remove-metadata.py` und ändere in der Funktion `clean_pdf` den Pfad zum PDF, das du bearbeiten willst. Achte darauf, dass das PDF im selben Ordner wie das Skript liegt.

### Werkzeug ausführen

Führe das Skript in der Kommandozeile aus:

```shell
python remove-metadata.py
```

## Ausgabe

Das Skript gibt die alten und die bereinigten Metadaten auf der Konsole aus, sodass du die Änderungen vergleichen kannst. Die ursprüngliche PDF-Datei wird durch die bereinigte ersetzt.

---

**Repository:** [https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/remove-metadata](https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/remove-metadata)
