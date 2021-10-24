const { Toolkit } = require("actions-toolkit");
const { readFileSync, writeFileSync } = require("fs");
const { stripIndents } = require("common-tags");
const { spawn } = require("child_process");
const { default: axios } = require("axios");

async function getText() {
	const data = await axios.get("46.4.114.111:6999/info");
	console.log(data);

	return stripIndents`
		Placeholder for now
	`;
}

/**
 * @param {Toolkit} tools
 * @param {string} cmd
 * @param {string[]} args
 */
async function execute(cmd, args = []) {
	new Promise((resolve, reject) => {
		const child = spawn(cmd, args);

		child.stderr.on("data", (data) => {
			return reject(data);
		});

		child.stdout.on("data", (data) => {
			console.log(data);
		});

		child.on("data", (data) => console.log(data));

		resolve();
	});
}

Toolkit
	.run(async (tools) => {
		const readmeContent = readFileSync("./README.md", "utf-8").split("\n");

		const startIndex = readmeContent.findIndex(content => content.trim() === "<!--STATS-DISPLAY:start-->");
		const endIndex = readmeContent.findIndex(content => content.trim() === "<!--STATS-DISPLAY:end-->");

		if(startIndex === -1) return tools.exit.failure("Couldn't find the <!--STATS-DISPLAY:start--> comment! Exiting the process...");
		if(endIndex === -1) return tools.exit.failure("Couldn't find the <!--STATS-DISPLAYBOT:end--> comment! Exiting the process...");

		if(startIndex !== endIndex) readmeContent.splice(startIndex + 1, (endIndex - startIndex) - 1);

		const quote = await getText();

		readmeContent.splice(startIndex + 1, 0, quote);

		writeFileSync("./README.md", readmeContent.join("\n").toString());

		await execute("git", ["config", "--local", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
		await execute("git", ["config", "--local", "user.name", "Readme Programmer"]);
		await execute("git", ["add", "-A"]);
		await execute("git", ["commit", "-m", "Put some commit message here @SpiderMath"]);
		await execute("git", ["push"]);
	}, {
		events: ["schedule", "workflow_dispatch"],
	});