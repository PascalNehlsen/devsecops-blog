---
id: hashcat
title: Hashcat-Werkzeug
sidebar_label: Hashcat-Werkzeug
sidebar_position: 2
---


# Mein Hash-Cracker

Dieses Repository enthält den Quellcode meiner eigenen Umsetzung des **hashcat**-Werkzeugs.

:::danger[Nur für Testzwecke]
Dieses Werkzeug ist ausschließlich für Ausbildung und autorisierte Penetrationstests gedacht. Es gegen Systeme einzusetzen, für die du keine ausdrückliche Testerlaubnis hast, ist strafbar und unethisch.
:::

## Inhalt

- [Funktionen](#funktionen)
- [Loslegen](#loslegen)
- [Beispiele](#beispiele)
  - [Brute-Force](#brute-force)
  - [Wörterbuchangriff](#wörterbuchangriff)
  - [Hashcat-Optionen](#optionen)
- [Logging](#logging)

## Funktionen

Diese Umsetzung deckt folgende Funktionen ab:

- **Brute-Force**: probiert alle Kombinationen innerhalb einer gegebenen Länge und eines Zeichensatzes.
- **Wörterbuchangriff**: nutzt eine vorgegebene Wortliste, um das richtige Passwort zu finden.
- **Konfigurierbar**: Passwortlänge, Zeichensatz und Hash-Modi (MD5, SHA-1, SHA-256, SHA-512) sind einstellbar.
- **Logging**: liefert unstrukturierte, ausführliche Protokolle aller Versuche und Ergebnisse.

**Technologien**:

- Python 3
- Pip

## Loslegen

So kommst du mit dem `hashcat`-Werkzeug los:

1. **Repository klonen**:

```shell
git clone https://github.com/pascalnehlsen/hashcat.git
cd hashcat
```

## Beispiele

### Optionen

| Option         | Kurzform  | Beschreibung                                    | Standardwert  | Pflicht |
| -------------- | --------- | ----------------------------------------------- | ------------- | -------- |
| `--mode`       | `-m`      | Hash-Modus: 0=MD5, 1=SHA-1, 2=SHA-256, 3=SHA-512 | 2             |          |
| `--attack`     | `-a`      | Angriffsmodus: 0=Brute-Force, 1=Wörterbuch      | 0             |          |
| `--hash`       | -         | Ziel-Hash                                       | -             | x        |
| `--hash-file`  | -         | Pfad zur Datei mit dem Ziel-Hash                | -             | x        |
| `--dictionary` | `-d`      | Pfad zur Wortliste für den Wörterbuchangriff    | -             |          |
| `--max-length` | `-ml`     | Maximale Länge beim Brute-Force                 | 4             |          |
| `--charset`    | `-c`      | Zeichensatz beim Brute-Force                    | alphanumerisch |          |

- Eines von beiden ist Pflicht: `--hash` oder `--hash-file`

### Brute-Force

Für einen Brute-Force ohne Wortliste:

```shell
python hashcat.py \
    -m 2 \
    -a 0 \
    --hash 826ecad4ae11c8196ab3432ccbb22400691c248131b97fa4fe6f02dcf20f6049 \
    --max-length 7 \
    --charset 'abcdefghijklmnopqrstuvwxyz'
```

### Wörterbuchangriff

Für einen Wörterbuchangriff mit Wortliste:

```shell
python hashcat.py \
    -m 0 \
    -a 1 \
    --hash 826ecad4ae11c8196ab3432ccbb22400691c248131b97fa4fe6f02dcf20f6049 \
    -dictionary ./small-password-list.txt
```

## Logging

Die Logs gehen auf die Konsole. Die Log-Stufe lässt sich im Code ändern, wenn du die Ausführlichkeit anpassen willst.

---

**Repository:** [https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/hashcat](https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/hashcat)
