---
id: vm-setup
title: VM-Setup
sidebar_label: VM-Setup
sidebar_position: 4
---


# Virtuelle Maschine mit nginx und SSH einrichten

In diesem Beitrag richtest du eine bestehende virtuelle Maschine (VM) mit nginx als Webserver ein und konfigurierst SSH sicher. Wir gehen durch das Erzeugen von SSH-Keys, das Abschalten der Passwort-Anmeldung, SSH-Aliase und den Umgang mit mehreren SSH-Identitäten.

## Schnellstart (README)

### Voraussetzungen

- Ein Linux-Server mit SSH-Zugang
- root- oder sudo-Rechte

1. SSH-Key erzeugen
   Erzeuge auf deiner lokalen Maschine einen SSH-Key, um den Zugriff auf den Server abzusichern:

```bash
ssh-keygen -t ed25519
```

Folge den Hinweisen und lege den Key an einem sicheren Ort ab. Optional kannst du eine Passphrase setzen.

2. An der VM anmelden
   Melde dich per SSH an deiner VM an (die IP-Adresse ersetzen):

```bash
ssh USER@192.655.265.55
```

Akzeptiere den Fingerprint und gib das Serverpasswort ein.

3. SSH-Key auf der VM ablegen
   Kopiere deinen öffentlichen SSH-Key auf die VM:

```bash
ssh-copy-id -i ~/.ssh/key.pub USER@192.655.265.55
```

Jetzt kannst du dich mit dem Key anmelden:

```bash
ssh -i ~/.ssh/key.pub USER@192.655.265.55
```

4. Passwort-Anmeldung abschalten
   Für mehr Sicherheit schaltest du die Anmeldung per Passwort auf dem Server ab.

- Prüfe zuerst, dass die Anmeldung mit dem SSH-Key funktioniert.
- Bearbeite die SSH-Konfiguration auf dem Server:

```bash
sudo nano /etc/ssh/sshd_config
```

Finde die Zeile `PasswordAuthentication` und ändere sie von:

```bash
#PasswordAuthentication no
```

zu:

```bash
PasswordAuthentication no
```

4. Datei speichern und den SSH-Dienst neu starten:

```bash
sudo systemctl restart ssh.service
```

5. nginx installieren und konfigurieren
   Installiere nginx, damit der Server als Webserver arbeitet:

- Paketquellen aktualisieren:

```bash
sudo apt update
```

- nginx installieren:

```bash
sudo apt install nginx -y
```

Öffne den Server im Browser (über die IP-Adresse der VM).

6. Zweite Index-Seite für nginx einrichten
   Lege eine alternative Index-Seite an und lass nginx sie auf einem anderen Port (8081) ausliefern.

- Neues Verzeichnis für die zweite Seite anlegen:

```bash
sudo mkdir /var/www/alternatives
```

- Die neue index.html erzeugen:

```bash
sudo touch /var/www/alternatives/your-index.html
```

- Inhalt in `your-index.html` schreiben:

```bash
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Index</title>
</head>
<body>
    <h1>Hello, this is my new index.html!</h1>
</body>
</html>
```

- nginx so konfigurieren, dass die Seite auf Port 8081 läuft:

```bash
sudo nano /etc/nginx/sites-enabled/alternatives
```

- Diese Konfiguration eintragen:

```nginx
server {
    listen 8081;
    listen [::]:8081;

    root /var/www/alternatives;
    index your-index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

- nginx neu starten:

```bash
sudo service nginx restart
```

Öffne den Server im Browser mit der IP-Adresse der VM und Port 8081.

# Ausführliche Erklärung (Writeup)

1. Warum SSH-Keys und warum Passwort-Anmeldung abschalten?
   SSH-Keys authentifizieren stärker als Passwörter. Wer die Passwort-Anmeldung abschaltet, nimmt Brute-Force-Angriffen die Angriffsfläche. Das zählt besonders, wenn du Server in Produktion betreibst.

2. nginx für mehrere Seiten einrichten
   Wenn nginx eine zweite `index.html` auf einem anderen Port ausliefert, kannst du mehrere Websites oder Testumgebungen auf demselben Server betreiben. Praktisch, um Staging zu trennen oder mehrere Microservices zu hosten.

3. SSH-Aliase für kürzere Befehle
   Statt jedes Mal einen langen SSH-Befehl zu tippen, legst du für häufig genutzte Server einen Alias an. Zum Beispiel in deiner Shell-Konfiguration (~/.bashrc oder ~/.zshrc):

```bash
alias myserver="ssh -o StrictHostKeyChecking=False -i ~/.ssh/key.pub USER@192.655.265.55"
```

Damit verbindest du dich mit:

```bash
myserver
```

4. Mehrere SSH-Identitäten verwalten
   Wenn du mit mehreren Servern arbeitest, die je einen eigenen SSH-Key haben, verwaltest du sie über die SSH-Konfigurationsdatei. Dann musst du den Key nicht bei jeder Verbindung angeben.

Bearbeite `~/.ssh/config` und lege pro Server einen Eintrag an:

```bash
Host myserver
    User your_username
    HostName 192.655.265.55
    IdentityFile ~/.ssh/key
```

Jetzt verbindest du dich mit:

```bash
ssh myserver
```

### Fazit

Mit dieser Anleitung steht eine virtuelle Maschine, die nginx als Webserver betreibt und den Zugang über SSH-Keys regelt. Aliase und mehrere Identitäten machen die Verwaltung schlanker, gerade bei mehreren Umgebungen.

Bei Fragen oder wenn etwas hängt, schreib mir gerne.

---

**Repository:** [https://github.com/PascalNehlsen/v-server-setup](https://github.com/PascalNehlsen/v-server-setup)
