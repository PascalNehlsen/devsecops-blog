import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
import { execSync } from 'child_process';

// GitHub-Konfiguration
const { TOKEN, ORG, EMAIL } = process.env
const MENU_FILE = "./menu.json"; // Pfad zur Menüdatei
const README_FOLDER = "./readmes"; // Ordner, in dem alle README.md gespeichert werden

const octokit = new Octokit({ auth: TOKEN });

// Stelle sicher, dass der Ordner existiert, andernfalls erstelle ihn
if (!fs.existsSync(README_FOLDER)) {
    fs.mkdirSync(README_FOLDER, { recursive: true });
    console.log(`Ordner ${README_FOLDER} wurde erstellt.`);
}

// Hilfsfunktion für das Datum von vor zwei Wochen im ISO-Format
const getISODateTwoWeeksAgo = () => {
    const today = new Date();
    today.setDate(today.getDate() - 14);  // Subtrahiere 14 Tage (2 Wochen)
    return today.toISOString();
};

const setGitConfig = () => {
    execSync(`git config --global user.name "${ORG}"`);
    execSync(`git config --global user.email "${EMAIL}"`);
};

(async () => {
    try {
        console.log("Fetching repositories updated since two weeks ago...");
        console.log(`GitHub Token: ${TOKEN ? 'Token ist gesetzt' : 'Kein Token gefunden'}`);

        const sinceDate = getISODateTwoWeeksAgo(); // Datum vor 2 Wochen
        console.log(`Prüfen ab: ${sinceDate}`);

        // Hole Repositories des Nutzers
        const repos = await octokit.repos.listForUser({
            username: ORG,
            per_page: 100, // Maximale Anzahl pro Seite
            sort: "updated", // Sortiere nach zuletzt aktualisiert
            direction: "desc", // Neueste zuerst
        });

        const menuEntries = [];
        const readmeChanges = [];

        for (const repo of repos.data) {
            const updatedAt = repo.updated_at;
            if (new Date(updatedAt) < new Date(sinceDate)) {
                console.log(`Überspringe Repository: ${repo.name}, zuletzt aktualisiert am ${updatedAt}`);
                continue;
            }

            console.log(`Prüfe Repository: ${repo.name}`);

            try {
                // Versuche, die README.md abzurufen
                const response = await octokit.repos.getContent({
                    owner: ORG,
                    repo: repo.name,
                    path: "README.md",
                });

                // Extrahiere den Inhalt der README.md
                const readmeContent = Buffer.from(response.data.content, 'base64').toString('utf-8');

                // Speicherort für die README.md im Ordner
                const readmePath = path.join(README_FOLDER, `${repo.name}_README.md`);
                const prevReadmePath = path.join(README_FOLDER, `${repo.name}_README_old.md`);

                // Vergleiche mit vorheriger Version, wenn vorhanden
                let contentChanged = false;
                if (fs.existsSync(prevReadmePath)) {
                    const prevContent = fs.readFileSync(prevReadmePath, 'utf-8');
                    if (prevContent !== readmeContent) {
                        contentChanged = true;
                    }
                }

                // Speichere die neue README.md, wenn sie geändert wurde
                if (contentChanged || !fs.existsSync(prevReadmePath)) {
                    console.log(`Änderungen erkannt in ${repo.name} - README.md wird gespeichert.`);
                    fs.writeFileSync(readmePath, readmeContent, "utf-8");
                    fs.writeFileSync(prevReadmePath, readmeContent, "utf-8"); // Speichert auch die alte Version
                    readmeChanges.push({
                        name: repo.name,
                        url: response.data.html_url,
                        updatedAt: repo.updated_at
                    });
                } else {
                    console.log(`Keine Änderungen in ${repo.name} - README.md bleibt unverändert.`);
                }

                // Menü-Eintrag hinzufügen
                menuEntries.push({
                    name: repo.name,
                    url: response.data.html_url,
                });

            } catch (error) {
                if (error.status === 404) {
                    console.warn(`README.md nicht gefunden in ${repo.name}, überspringe...`);
                } else {
                    console.error(`Fehler beim Zugriff auf ${repo.name}:`, error.message);
                }
            }
        }

        // Menü-Datei aktualisieren
        console.log("Aktualisiere Menü-Datei...");
        const menuFilePath = path.resolve(MENU_FILE);
        fs.writeFileSync(menuFilePath, JSON.stringify(menuEntries, null, 2), "utf-8");
        console.log("Menü-Datei erfolgreich aktualisiert!");

        // Commit und Push, wenn Änderungen vorliegen
        // if (readmeChanges.length > 0) {
        //     console.log("Änderungen committen und pushen...");
        //     setGitConfig();
        //     execSync(`git add ${menuFilePath}`);
        //     execSync(`git commit -m "Update menu with new repositories and README updates"`);
        //     execSync(`git push`);
        //     console.log("Menü erfolgreich aktualisiert und gepusht!");
        // } else {
        //     console.log("Keine Änderungen zum Committen.");
        // }

    } catch (error) {
        console.error("Ein Fehler ist aufgetreten:", error.message);
    }
})();
