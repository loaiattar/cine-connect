import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import pc from "picocolors";
import { intro, outro, select, isCancel, cancel, text } from "@clack/prompts";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error(pc.red("Error: GEMINI_API_KEY is not defined in .env file"));
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const command = process.argv[2];
const args = process.argv.slice(3);

async function generateAICommit(diff: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = `Write a professional git commit message based on this diff: ${diff}. 
        Follow Conventional Commits. Return ONLY the message text, no quotes, no markdown, no explanations.`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        return text.replace(/```/g, '').replace(/^(commit message:)/i, '').trim();
    } catch (e: any) {
        console.error(pc.yellow(`\n⚠️ AI Error: ${e.message}\n`));
        return `chore: update projects ${new Date().toLocaleDateString()}`;
    }
}


async function createComponent(name: string) {
    if (!name) {
        console.error(pc.red("Error: Component name missing. Usage: pnpm cine gen component <Name>"));
        return;
    }

    // Ensure first letter is uppercase
    const componentName = name.charAt(0).toUpperCase() + name.slice(1);
    const dir = path.join(process.cwd(), 'apps', 'frontend', 'src', 'components');
    const filePath = path.join(dir, `${componentName}.tsx`);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
        console.error(pc.red(`Error: Component ${componentName} already exists at ${filePath}`));
        return;
    }

    const template = `import React from 'react';

interface ${componentName}Props {
  children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ children }) => {
  return (
    <div className="">
      <h1>${componentName}</h1>
      {children}
    </div>
  );
};
`;

    fs.writeFileSync(filePath, template);
    console.log(pc.green(`✔ Component created: `) + pc.dim(filePath));
}

const commands: Record<string, () => void | Promise<void>> = {
    gt: () => {
        const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        console.log(pc.cyan(`Current Branch: `) + pc.bold(branch));
    },
    cb: async () => {
        const branchName = args[0];
        if (branchName) {
            execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
            return;
        }

        const branches = execSync('git branch --format="%(refname:short)"').toString().trim().split('\n');

        const selectedBranch = await select({
            message: 'Select a branch to info:',
            options: branches.map(b => ({ value: b, label: b })),
        });

        if (isCancel(selectedBranch)) {
            cancel('Operation cancelled.');
            process.exit(0);
        }

        execSync(`git checkout ${selectedBranch}`, { stdio: 'inherit' });
    },
    gac: async () => {
        console.log(pc.dim("Staging and thinking..."));
        execSync('git add .');
        const diff = execSync('git diff --cached').toString();
        if (!diff) return console.log("No changes detected.");

        const msg = await generateAICommit(diff.substring(0, 5000));
        console.log(pc.green(`AI Message: `) + msg);

        execSync(`git commit -m "${msg}"`);
    },
    gp: () => {
        console.log(pc.cyan("Pushing to cloud..."));
        execSync('git push', { stdio: 'inherit' });
    },
    db: () => {
        console.log(pc.cyan("Starting Database Container..."));
        try {
            execSync('docker-compose up -d', { stdio: 'inherit' });
            console.log(pc.green("Database is running on port 5432"));
        } catch (e) {
            console.error(pc.red("Docker is not running or docker-compose.yml is missing."));
        }
    },
    gen: async () => {
        const type = args[0];
        const name = args[1];

        if (type === 'component') {
            await createComponent(name);
        } else {
            console.log(pc.yellow("Usage: pnpm cine gen component <Name>"));
        }
    },
    gg: () => {
        console.log(pc.magenta("\nThe awesome CinéConnect CLI Helpers:"));
        console.table([
            { cmd: "p gt", task: "Get Current Branch" },
            { cmd: "p cb <name>", task: "Change Branch" },
            { cmd: "p gac", task: "Add + AI Commit" },
            { cmd: "p gp", task: "Push to GitHub" },
            { cmd: "p db", task: "Start Docker Database" },
            { cmd: "p cine gen component <Name>", task: "Generate React Component" },
            { cmd: "p gg", task: "Show this help menu" },
        ]);
    }
};

if (commands[command]) {
    const result = commands[command]();
    if (result instanceof Promise) {
        result.catch(err => console.error("Command failed:", err.message));
    }
} else {
    console.log(pc.yellow("Unknown command. Use 'pnpm gg' for help."));
}