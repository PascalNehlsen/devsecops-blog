---
id: hydra
title: Hydra-Werkzeug
sidebar_label: Hydra-Werkzeug
sidebar_position: 3
---


# Mein SSH-Cracker

Dieses Repository enthält den Quellcode meiner eigenen Umsetzung des `hydra`-Werkzeugs, eines Netzwerk-Logon-Crackers für Brute-Force gegen verschiedene Protokolle. Diese leichtgewichtige Umsetzung konzentriert sich auf SSH-Brute-Force und Wörterbuchangriffe.

:::danger[Nur für Testzwecke]
Dieses Werkzeug ist ausschließlich für Ausbildung und autorisierte Penetrationstests gedacht. Es gegen Systeme einzusetzen, für die du keine ausdrückliche Testerlaubnis hast, ist strafbar und unethisch.
:::

## Inhalt

- [Funktionen](#funktionen)
- [Loslegen](#loslegen)
- [Beispiele](#beispiele)
  - [Brute-Force](#brute-force)
  - [Wörterbuchangriff](#wörterbuchangriff)
  - [Alle Hydra-Optionen](#alle-hydra-optionen)
- [Logging](#logging)

## Funktionen

Diese Umsetzung deckt folgende Funktionen ab:

- **SSH-Brute-Force**: probiert SSH-Passwörter über alle Kombinationen innerhalb einer gegebenen Länge und eines Zeichensatzes.
- **Wörterbuchangriff**: nutzt eine vorgegebene Wortliste.
- **Konfigurierbar**: minimale und maximale Passwortlänge sowie Zeichensätze sind einstellbar.
- **Logging**: liefert unstrukturierte, ausführliche Protokolle aller Versuche und Ergebnisse.

## Loslegen

So kommst du mit dem `hydra`-Werkzeug los:

1. **Repository klonen**:

```shell
git clone https://github.com/pascalnehlsen/hydra.git
cd hydra
```

2. **Virtuelle Umgebung anlegen**:

```bash
python -m venv myenv
```

- myenv ist der Name der Umgebung. Du kannst ihn beliebig wählen.

3. **Virtuelle Umgebung aktivieren**:

Eine virtuelle Umgebung schafft isolierte Python-Umgebungen pro Projekt, sodass Abhängigkeiten und Paketversionen sich nicht in die Quere kommen.

- Windows (Eingabeaufforderung oder PowerShell):

```bash
myenv\Scripts\activate
```

- macOS/Linux:

```bash
source myenv/bin/activate
```

- Windows (Git Bash oder MINGW64):

```bash
source myenv/Scripts/activate
```

Nach dem Aktivieren siehst du den Namen der Umgebung (etwa `(myenv)`) im Prompt, du arbeitest also nun darin.

4. **Abhängigkeiten installieren**:
   Stelle sicher, dass **paramiko** installiert ist. Über die requirements.txt:

```bash
pip install -r requirements.txt
```

## Beispiele

### Brute-Force

Für einen Brute-Force ohne Wortliste:

```shell
python hydra.py \
    -u <username> \
    -s <server> \
    -p <port> \
    --min <min_length> \
    --max <max_length> \
    -c <charset>
```

Beispiel:

```shell
python hydra.py \
    -u root \
    -s localhost \
    -p 2222 \
    --min 1 \
    --max 4 \
    -c abc123
```

### Wörterbuchangriff

Für einen Wörterbuchangriff mit Wortliste:

```shell
python hydra.py \
    -u <username> \
    -s <server> \
    -p <port> \
    -w <path_to_wordlist>
```

- path_to_wordlist (`-w`): Pfad zur Wortliste (für den Wörterbuchangriff nötig)

Beispiel:

```shell
python hydra.py \
    -u root \
    -s localhost\
    -p 2222 \
    -w ./password.txt
```

### Alle Hydra-Optionen

| Option        | Kurzform  | Beschreibung                                   | Standardwert  | Pflicht |
| ------------- | --------- | ---------------------------------------------- | ------------- | -------- |
| `--username`  | `-u`      | Benutzername für den SSH-Login                 | root          | x        |
| `--server`    | `-s`      | Server-IP oder DNS                             | -             | x        |
| `--port`      | `-p`      | Port für die SSH-Verbindung                    | 22            |          |
| `--wordlist`  | `-w`      | Pfad zur Wortliste für den Wörterbuchangriff   | -             |          |
| `--character` | `-c`      | Zeichensatz für den Brute-Force                | alphanumerisch |          |
| `--minimum`   | `--min`   | Minimale Passwortlänge beim Brute-Force        | 1             |          |
| `--maximum`   | `--max`   | Maximale Passwortlänge beim Brute-Force        | 4             |          |

## Logging

Die Logs gehen nach **hydra.log** im Quellcode-Ordner. Liegt dort schon eine **hydra.log**, werden die neuen Einträge angehängt. In dieser Datei findest du die Details zu Verbindungsversuchen und Ergebnissen.

---

**Repository:** [https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/hydra](https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/hydra)
