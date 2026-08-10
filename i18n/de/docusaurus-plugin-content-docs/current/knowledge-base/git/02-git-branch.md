---
id: git-branch
title: Git-Branching
sidebar_label: Git-Branching
---


# Git-Branching

Branching ist eine mächtige Funktion in Git: du zweigst von der Hauptlinie der Entwicklung ab und arbeitest weiter, ohne diese Hauptlinie zu berühren. Hier die üblichen Befehle, um Branches anzulegen und zu verwalten.

| Befehl                                    | Beschreibung                                           |
|-------------------------------------------|--------------------------------------------------------|
| `git branch <branch-name>`                | Neuen Branch mit dem angegebenen Namen anlegen          |
| `git checkout -b <branch-name>`           | Neuen Branch anlegen und in einem Schritt wechseln      |
| `git checkout <branch-name>`              | Auf einen bestehenden Branch wechseln                   |
| `git branch`                              | Alle Branches im Repository auflisten                   |
| `git branch -m <new-branch-name>`         | Aktuellen Branch auf den angegebenen Namen umbenennen   |
| `git branch -d <branch-name>`             | Branch löschen (wenn gemergt)                           |
| `git branch -D <branch-name>`             | Löschen erzwingen (wenn nicht gemergt)                  |
| `git merge <branch-name>`                 | Angegebenen Branch in den aktuellen mergen              |


## Neuen Branch anlegen

Um einen neuen Branch anzulegen:

```bash
git branch <branch-name>
```

Oder anlegen und direkt wechseln, in einem Befehl:

```bash
git checkout -b <branch-name>

git switch -c <branch-name>
```

## Auf einen Branch wechseln

Um auf einen bestehenden Branch zu wechseln:

```bash
git checkout <branch-name>

git switch <branch-name>
```


## Branches auflisten

Um alle Branches im Repository aufzulisten:

```bash
git branch

# remote branches only
git branch -r
```

Der aktive Branch ist mit einem Sternchen (*) markiert.

## Branch umbenennen

Um den aktuellen Branch umzubenennen:

```bash
git branch -m <new-branch-name>
```

## Branch löschen

Um einen Branch zu löschen, den du nicht mehr brauchst:

```bash
git branch -d <branch-name>
```

Wenn der Branch nicht gemergt ist, kannst du das Löschen erzwingen:

```bash
git branch -D <branch-name>
```

## Branches vom Remote aktualisieren

```bash
git fetch

# git fetch + git merge
git pull
```

## Branches mergen

Um Änderungen aus einem Branch in den aktuellen zu übernehmen:

```bash
git merge <branch-name>
```

Dieser Befehl mergt den angegebenen Branch in den aktuellen.



## Zusammenfassung

Branching macht Git-Workflows flexibel. Mit den Befehlen oben legst du Branches an, verwaltest und mergst sie und hältst deinen Entwicklungsprozess dadurch geradlinig.
