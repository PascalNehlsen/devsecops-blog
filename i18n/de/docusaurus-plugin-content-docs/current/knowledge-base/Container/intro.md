---
id: intro
title: Einführung
sidebar_label: Einführung
sidebar_position: 1
---

# Einführung in Container

Container haben verändert, wie Anwendungen gepackt, verteilt und ausgerollt werden. Indem sie eine Anwendung samt ihrer Abhängigkeiten in einer isolierten Umgebung einkapseln, sorgen sie für gleiches Verhalten in Entwicklung, Test und Produktion.

## Grundlagen

**Was Container sind**: Container packen Anwendungen und deren Abhängigkeiten in standardisierte Einheiten, die in unterschiedlichen Rechenumgebungen gleich laufen. Anders als virtuelle Maschinen teilen Container den Kernel des Host-Betriebssystems, was sie leichtgewichtig macht und schnell startbar.

**Container gegen virtuelle Maschine**: Eine virtuelle Maschine bringt eine vollständige Kopie eines Betriebssystems, eine Hypervisor-Schicht und zugewiesene Ressourcen mit. Container teilen den Host-Kernel und isolieren Prozesse über Linux-Namespaces und cgroups, was deutlich weniger Overhead bedeutet.

**Container-Images**: Unveränderliche Vorlagen, die den Inhalt eines Containers definieren. Images werden in Layern gebaut, wobei jeder Layer eine Änderung oder Ergänzung am Dateisystem darstellt. Layer-Caching verkürzt Build-Zeiten und senkt den Speicherbedarf.

**Container-Registry**: Zentrale Ablagen zum Speichern und Verteilen von Images. Docker Hub, Amazon ECR, Google Container Registry und Harbor dienen als Verteilpunkte, mit Zugriffskontrolle, Vulnerability-Scanning und automatisierten Builds.

## Container-Sicherheit in DevSecOps

Container bringen eigene Sicherheitsfragen mit, die über den ganzen Entwicklungszyklus hinweg beantwortet werden müssen:

**Auswahl des Base-Images**: Fang mit minimalen, vertrauenswürdigen Base-Images aus offiziellen Quellen an. Alpine Linux und Distroless-Images verkleinern die Angriffsfläche, weil sie unnötige Pakete und Werkzeuge weglassen. Aktualisiere Base-Images regelmäßig, damit Sicherheitspatches einfließen.

**Image-Scanning**: Scanne Container-Images vor dem Ausrollen auf bekannte Schwachstellen. Werkzeuge wie Trivy, Clair und Anchore analysieren die Layer und vergleichen installierte Pakete gegen Schwachstellendatenbanken. Bau das Scanning in CI/CD ein, damit anfällige Images nicht in Produktion gelangen.

**Secrets-Verwaltung**: Bette niemals Credentials, API-Keys oder Zertifikate direkt in ein Image ein. Nutze Umgebungsvariablen, gemountete Secret-Volumes oder eigene Secret-Management-Werkzeuge, um sensible Daten zur Laufzeit einzuspeisen. Scanne Images mit Werkzeugen wie git-secrets oder TruffleHog auf versehentlich committete Secrets.

**Prinzip der geringsten Rechte**: Lass Container so oft wie möglich als Non-Root-Nutzer laufen. Definiere konkrete User-IDs im Dockerfile und beschränke die Capabilities auf das, was die Anwendung wirklich braucht. Vermeide privilegierte Container, die direkt auf Host-Ressourcen zugreifen können.

**Images signieren und prüfen**: Setze Content Trust ein, um Echtheit und Integrität eines Images zu prüfen. Docker Content Trust und Notary erlauben kryptografisches Signieren, sodass ausgerollte Container nachweislich aus vertrauenswürdigen Quellen stammen und nicht manipuliert wurden.

**Laufzeit-Sicherheit**: Beobachte das Verhalten von Containern in Produktion auf Auffälligkeiten. Werkzeuge wie Falco erkennen ungewöhnliche Systemaufrufe, unerlaubte Dateizugriffe und unerwartete Netzwerkverbindungen. Lege Policies fest, die akzeptables Container-Verhalten beschreiben.

## Bewährte Praxis

**Multi-Stage-Builds**: Trenne mit mehrstufigen Dockerfiles die Build-Abhängigkeiten von den Laufzeitanforderungen. Build-Stufen kompilieren Code und führen Tests aus, während die Endstufe nur die minimalen Artefakte enthält, die zum Betrieb nötig sind. Das verkleinert das Image und hält Build-Werkzeuge aus dem Produktions-Image heraus.

**Layer-Optimierung**: Ordne die Dockerfile-Anweisungen so, dass Layer-Caching maximal greift. Setze häufig wechselnde Anweisungen wie COPY nach hinten, damit gecachte Layer nicht ungültig werden. Fasse mehrere RUN-Befehle zusammen, um Layer-Anzahl und Image-Größe zu senken.

**Health Checks**: Definiere Health Checks, die Startbereitschaft und Lebendigkeit der Anwendung prüfen. Damit können Orchestratoren fehlgeschlagene Container automatisch neu starten und Traffic nicht auf ungesunde Instanzen leiten.

**Ressourcengrenzen**: Setze Speicher- und CPU-Grenzen, um Ressourcenerschöpfung zu verhindern und in geteilten Umgebungen faire Verteilung sicherzustellen. Solche Grenzen schützen vor Denial-of-Service-Zuständen und vor lauten Nachbarn.

**Netzwerksegmentierung**: Nutze Container-Netzwerke, um Komponenten zu isolieren. Frontend-Container brauchen keinen direkten Zugriff auf Datenbank-Container. Definiere Netzwerk-Policies, die die nötige Kommunikation ausdrücklich erlauben und alles andere verbieten.

**Log-Verwaltung**: Konfiguriere Container so, dass sie nach stdout/stderr schreiben und nicht in Dateien. Der Orchestrator kann Logs dann zentral einsammeln, etwa mit Fluentd, Logstash oder einem Logging-Dienst der Cloud. Strukturierte Formate (JSON) machen Auswertung und Analyse deutlich einfacher.

**Unveränderliche Container**: Behandle Container als unveränderliche Infrastruktur. Ändere niemals einen laufenden Container direkt. Baue stattdessen ein neues Image mit der Änderung und rolle es aus. Das sorgt für Konsistenz und macht Rollbacks verlässlich.

import DocCardList from '@theme/DocCardList';

<DocCardList/>
