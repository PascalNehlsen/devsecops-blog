import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.TOKEN;
const GITHUB_ORG = process.env.GITHUB_ORG || process.env.ORG;
const GITHUB_EMAIL = process.env.GITHUB_EMAIL || process.env.EMAIL;

const MENU_FILE = "./menu.json";
const README_FOLDER = "./readmes";

if (!GITHUB_TOKEN || !GITHUB_ORG) {
    console.error("ERROR: Missing required environment variables");
    console.error("Required: GITHUB_TOKEN, GITHUB_ORG");
    process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

if (!fs.existsSync(README_FOLDER)) {
    fs.mkdirSync(README_FOLDER, { recursive: true });
    console.log(`Created directory: ${README_FOLDER}`);
}

const setGitConfig = () => {
    try {
        execSync(`git config --global user.name "${GITHUB_ORG}"`);
        execSync(`git config --global user.email "${GITHUB_EMAIL || 'bot@github.com'}"`);
        console.log("Git configuration set successfully");
    } catch (error) {
        console.error("Failed to set git config:", error.message);
        throw error;
    }
};

const fetchRepositories = async () => {
    try {
        console.log(`Fetching repositories for: ${GITHUB_ORG}`);
        const repos = await octokit.repos.listForUser({
            username: GITHUB_ORG,
            per_page: 100,
            sort: "updated",
            direction: "desc",
        });
        console.log(`Found ${repos.data.length} repositories`);
        return repos.data;
    } catch (error) {
        console.error("Failed to fetch repositories:", error.message);
        throw error;
    }
};

const fetchReadme = async (repoName) => {
    try {
        const response = await octokit.repos.getContent({
            owner: GITHUB_ORG,
            repo: repoName,
            path: "README.md",
        });
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
    } catch (error) {
        if (error.status === 404) {
            return null;
        }
        throw error;
    }
};

const hasReadmeChanged = (repoName, newContent) => {
    const prevReadmePath = path.join(README_FOLDER, `${repoName}_README_old.md`);
    if (!fs.existsSync(prevReadmePath)) {
        return true;
    }
    const prevContent = fs.readFileSync(prevReadmePath, 'utf-8');
    return prevContent !== newContent;
};

const saveReadme = (repoName, content) => {
    const readmePath = path.join(README_FOLDER, `${repoName}_README.md`);
    const prevReadmePath = path.join(README_FOLDER, `${repoName}_README_old.md`);

    fs.writeFileSync(readmePath, content, "utf-8");
    fs.writeFileSync(prevReadmePath, content, "utf-8");
    console.log(`Saved README for: ${repoName}`);
};

const updateMenu = (menuEntries) => {
    const menuFilePath = path.resolve(MENU_FILE);
    fs.writeFileSync(menuFilePath, JSON.stringify(menuEntries, null, 2), "utf-8");
    console.log(`Menu file updated: ${menuFilePath}`);
    return menuFilePath;
};

const commitAndPush = (filePath) => {
    try {
        setGitConfig();
        execSync(`git add ${filePath} ${README_FOLDER}`);
        const hasChanges = execSync('git diff --cached --quiet', { encoding: 'utf-8' }).toString();

        if (hasChanges === '') {
            console.log("No changes to commit");
            return false;
        }

        const commitMessage = "chore: update repository menu and READMEs";
        execSync(`git commit -m "${commitMessage}"`);
        execSync('git push');
        console.log("Changes committed and pushed successfully");
        return true;
    } catch (error) {
        if (error.message.includes('nothing to commit')) {
            console.log("No changes to commit");
            return false;
        }
        console.error("Failed to commit and push:", error.message);
        throw error;
    }
};

const main = async () => {
    try {
        const repos = await fetchRepositories();
        const menuEntries = [];
        const changedRepos = [];

        for (const repo of repos) {
            console.log(`Processing: ${repo.name}`);

            const readmeContent = await fetchReadme(repo.name);

            if (!readmeContent) {
                console.warn(`No README.md found in ${repo.name}, skipping...`);
                continue;
            }

            const hasChanged = hasReadmeChanged(repo.name, readmeContent);

            if (hasChanged) {
                saveReadme(repo.name, readmeContent);
                changedRepos.push({
                    name: repo.name,
                    url: repo.html_url,
                    updatedAt: repo.updated_at
                });
            } else {
                console.log(`No changes in ${repo.name}`);
            }

            menuEntries.push({
                name: repo.name,
                url: repo.html_url,
            });
        }

        const menuFilePath = updateMenu(menuEntries);

        if (changedRepos.length > 0 || process.env.CI) {
            console.log(`\nChanges detected in ${changedRepos.length} repositories`);
            commitAndPush(menuFilePath);
        } else {
            console.log("\nNo repository changes detected");
        }

        console.log("\nProcess completed successfully");
        console.log(`Total repositories: ${menuEntries.length}`);
        console.log(`Updated repositories: ${changedRepos.length}`);

    } catch (error) {
        console.error("\nERROR:", error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

main();
