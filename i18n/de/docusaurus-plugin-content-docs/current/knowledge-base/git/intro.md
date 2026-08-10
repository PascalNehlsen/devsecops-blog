---
id: intro
title: Git-Einführung
sidebar_label: Git-Einführung
sidebar_position: 1
---

# Git-Einführung

Git ist das Fundament moderner Entwicklungsabläufe: verteilte Versionskontrolle, Zusammenarbeit und Code-Review, alles drei unverzichtbar für DevSecOps-Praxis.

## Git im DevSecOps-Kontext

Versionskontrolle heißt nicht nur, Codeänderungen zu verfolgen. In DevSecOps wird das Git-Repository zur einzigen Quelle der Wahrheit für Anwendungscode, Infrastrukturdefinitionen, Konfigurationsdateien und Security-Policies.

**Sicherheit der Quellcodeverwaltung**: Schütze Repositories über Branch-Protection-Regeln, verpflichtende Reviews und Status-Checks. Committe niemals sensible Daten wie Passwörter, API-Keys oder private Zertifikate. Nutze Pre-commit-Hooks, die auf Secrets scannen, bevor sie im Repository landen.

**Branching-Strategien**: Wähle eine Strategie, die Security-Reviews und Tests trägt. Feature-Branches erlauben isolierte Entwicklung, geschützte Main-Branches sorgen dafür, dass jede Änderung Review und automatisierte Tests durchläuft, bevor sie integriert wird. Für schnelle Feedback-Schleifen bietet sich trunk-based Development an, für stärker strukturierte Releases GitFlow.

**Code-Review-Prozess**: Verpflichtende Reviews sind Sicherheitskontrollpunkte, an denen Kolleginnen und Kollegen Code auf Schwachstellen, Logikfehler und Einhaltung von Sicherheitsvorgaben prüfen. Pull Requests sollten Checklisten mit Security-Fokus enthalten: Eingabevalidierung, Authentifizierung, Autorisierung, Umgang mit Daten.

**Commits signieren**: Signiere Commits kryptografisch mit GPG-Keys, um die Identität der Autorin oder des Autors nachzuweisen und die Integrität zu sichern. Signierte Commits verhindern Identitätsmissbrauch und machen Manipulation an der Historie erkennbar.

**Audit-Trails**: Die Git-Historie zeigt vollständig, wer welche Änderung wann und warum gemacht hat. Aussagekräftige Commit-Messages und verknüpfte Tickets ergeben eine Dokumentation, die Compliance-Anforderungen und Vorfalluntersuchungen trägt.

## Einbindung in den Workflow

**Auslöser für Continuous Integration**: Git-Webhooks starten CI/CD-Pipelines automatisch bei einem Push oder wenn ein Pull Request geöffnet wird. Die Pipeline führt Tests, Security-Scans und Qualitätsprüfungen aus, bevor gemergt werden kann.

**GitOps-Praxis**: Zieh den Git-Workflow auf Infrastruktur und Deployment aus. Lege Kubernetes-Manifeste, Terraform-Konfigurationen und Ansible-Playbooks in Git ab. Änderungen daran lösen automatische Deployments aus, sodass die Infrastruktur dem deklarierten Zustand entspricht.

**Nachvollziehbarkeit von Artefakten**: Verknüpfe Build-Artefakte und Container-Images mit dem konkreten Git-Commit. Damit lässt sich jedes Deployment reproduzieren, jedes Produktionsproblem untersuchen und jede problematische Änderung zurückrollen.

**Promotion zwischen Umgebungen**: Nutze Branches oder Repositories, um Umgebungen abzubilden. Bewege Code über Merges oder aktualisierte Referenzen durch Entwicklung, Staging und Produktion, mit klaren Wegen und Kontrollpunkten.

## Sicherheitsfragen

**Zugriffskontrolle**: Setze feingranulare Repository-Rechte über Teams und Berechtigungen. Beschränke Schreibzugriff auf vertrauenswürdige Personen und erlaube Lesezugriff breiter, damit Einblick möglich bleibt. Verlange Mehrfaktor-Authentifizierung von allen mit Schreibrechten.

**Secret-Scanning**: Aktiviere automatisches Secret-Scanning, damit versehentlich committete Credentials, Tokens oder Keys auffallen. GitHub Secret Scanning, GitLab Secret Detection und git-secrets verhindern, dass sensible Daten offenliegen.

**Abhängigkeiten verwalten**: Lege Dependency-Manifeste (package.json, requirements.txt, go.mod) unter Versionskontrolle. Automatische Werkzeuge prüfen sie auf anfällige Abhängigkeiten und öffnen Pull Requests mit Sicherheitsupdates.

**Repository-Backup**: Sichere Repositories regelmäßig an einen getrennten Ort. Backups schützen vor Datenverlust durch Löschung, Beschädigung oder böswilliges Handeln. Übe die Wiederherstellung, sonst weißt du nicht, ob sie funktioniert.

import DocCardList from '@theme/DocCardList';

<DocCardList/>
