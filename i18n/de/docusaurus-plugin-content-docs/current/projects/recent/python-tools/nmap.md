---
id: nmap
title: Portscanner-Werkzeug
sidebar_label: Portscanner-Werkzeug
sidebar_position: 6
---


# Mein nmap-Portscanner

Dieses Repository enthält den Quellcode meiner eigenen Umsetzung des `nmap`-Werkzeugs. Diese leichtgewichtige Umsetzung konzentriert sich auf Port-Scanning und Diensterkennung und bietet einen einfachen Funktionsumfang, um offene Ports und laufende Dienste auf einem Ziel zu finden.

:::danger[Nur für Testzwecke]
Dieses Werkzeug ist ausschließlich für Ausbildung und autorisierte Penetrationstests gedacht. Es gegen Systeme einzusetzen, für die du keine ausdrückliche Testerlaubnis hast, ist strafbar und unethisch.
:::

## Inhalt

- [Funktionen](#funktionen)
- [Loslegen](#loslegen)
- [Beispiele](#beispiele)
  - [Optionen](#optionen)
  - [Ports scannen](#ports-scannen)
- [DNS-Namen anlegen](#dns-namen-anlegen)

## Funktionen

Diese Umsetzung deckt folgende Funktionen ab:

- **Port-Scanning**: scannt angegebene Ports oder alle Ports eines Ziels.
- **Diensterkennung**: erkennt gängige Dienste auf offenen Ports (bei den ersten 100 Ports).
- **Konfigurierbar**: der Portbereich für den Scan ist einstellbar.
- **DNS und IP**: unterstützt sowohl numerische IP-Adressen als auch DNS-Namen.

## Loslegen

So kommst du mit dieser `nmap`-Umsetzung los:

1. **Repository klonen**:

```shell
git clone https://github.com/yourusername/nmap.git
cd nmap
```

## Beispiele

### Optionen

| Option    | Kurzform  | Beschreibung                               | Pflicht |
| --------- | --------- | ----------------------------------------- | -------- |
| `--ports` | `-p`      | Portbereich angeben oder `-p-` für alle Ports | x        |
| `-s`      | -         | Ziel-IP oder DNS-Name                     | x        |

### Ports scannen

Um bestimmte oder alle Ports eines Ziels zu scannen:

#### Bestimmten Portbereich scannen

```shell
python nmap.py -s <target> -p <port_range>
```

- `target`: IP-Adresse oder DNS-Name des Ziels.
- `port_range`: der zu scannende Bereich (etwa `22,80,443` oder `1-1000`).

Beispiel:

```shell
python nmap.py -s 10.0.2.41 -p 22,80,443
```

#### Alle Ports scannen

```shell
python nmap.py -s <target> -p-
```

- `target`: IP-Adresse oder DNS-Name des Ziels.

Beispiel:

```shell
python nmap.py -s 10.0.2.41 -p-
```

### Diensterkennung

Bei den ersten 100 Ports versucht das Werkzeug zusätzlich, die laufenden Dienste zu erkennen.

## DNS-Namen anlegen

Um statt einer IP-Adresse einen DNS-Namen wie `yourtarget.abc` zu nutzen, trägst du diesen Namen in die `hosts`-Datei deines Systems ein. Sie ordnet Hostnamen IP-Adressen zu.

### Unter Windows

1. **Die `hosts`-Datei als Administrator öffnen**:

- Suche in der Windows-Suchleiste nach Notepad.
- Rechtsklick auf Notepad, "Als Administrator ausführen".
- In Notepad **Datei** > **Öffnen** und zu `C:\Windows\System32\drivers\etc\hosts` navigieren.
- Setze den Dateityp auf **Alle Dateien**, damit die `hosts`-Datei sichtbar wird.

2. **Den DNS-Eintrag ergänzen**:

```shell
<IP_ADDRESS>    yourtarget.abc
```

- Ersetze `<IP_ADDRESS>` durch die tatsächliche IP deines Ziels.
- Speichern und schließen.

### Unter Linux/macOS

1. **Die `hosts`-Datei mit root-Rechten öffnen**:

- Öffne ein Terminal.
- Bearbeite die Datei mit einem Editor wie `nano` oder `vi`:

```shell
sudo nano /etc/hosts
```

oder

```shell
sudo vi /etc/hosts
```

2. **Den DNS-Eintrag ergänzen**:

```shell
<IP_ADDRESS>    yourtarget.abc
```

- Ersetze `<IP_ADDRESS>` durch die tatsächliche IP deines Ziels.
  Speichern und den Editor verlassen (`Strg+X`, dann `Y` bei `nano`, oder `:wq` bei `vi`).

---

**Repository:** [https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/nmap](https://github.com/PascalNehlsen/dso-python-tasks/tree/main/module-5/nmap)
