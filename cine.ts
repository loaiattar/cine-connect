import { execSync } from 'child_process';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not defined in .env file");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const command = process.argv[2];
const args = process.argv.slice(3);

async function generateAICommit(diff: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Write a professional git commit message based on this diff: ${diff}. 
        Follow Conventional Commits. Return ONLY the message text, no quotes, no markdown, no explanations.`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        return text.replace(/```/g, '').replace(/^(commit message:)/i, '').trim();
    } catch (e) {
        return `chore: update projects ${new Date().toLocaleDateString()}`;
    }
}

const commands: Record<string, () => void | Promise<void>> = {
    gt: () => {
        const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        console.log(`Current Branch: ${branch}`);
    },
    cb: () => {
        const branchName = args[0];
        if (!branchName) return console.error("Error: Branch name missing.");
        execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
    },
    gac: async () => {
        console.log("Staging and thinking...");
        execSync('git add .');
        const diff = execSync('git diff --cached').toString();
        if (!diff) return console.log("No changes detected.");

        const msg = await generateAICommit(diff.substring(0, 5000));
        console.log(`AI Message: ${msg}`);

        execSync(`git commit -m "${msg}"`);
    },
    gp: () => {
        console.log("Pushing to cloud...");
        execSync('git push', { stdio: 'inherit' });
    },
    db: () => {
        console.log("Starting Database Container...");
        try {
            execSync('docker-compose up -d', { stdio: 'inherit' });
            console.log("Database is running on port 5432");
        } catch (e) {
            console.error("Docker is not running or docker-compose.yml is missing.");
        }
    },
    gg: () => {
        console.log("\n🎬 CinéConnect CLI Helpers:");
        console.table([
            { cmd: "pnpm gt", task: "Get Current Branch" },
            { cmd: "pnpm cb <name>", task: "Change Branch" },
            { cmd: "pnpm gac", task: "Add + AI Commit" },
            { cmd: "pnpm gp", task: "Push to GitHub" },
            { cmd: "pnpm db", task: "Start Docker Database" },
            { cmd: "pnpm gg", task: "Show this help menu" },
        ]);
    }
};

if (commands[command]) {
    const result = commands[command]();
    if (result instanceof Promise) {
        result.catch(err => console.error("Command failed:", err.message));
    }
} else {
    console.log("Unknown command. Use 'pnpm gg' for help.");
}