---
state: Drafting
---
<%*
// Function to prompt for project type
async function getProjectType() {
    const projectTypes = ["Standard", "Agile", "Research", "Client Service"];
    return await tp.system.suggester(projectTypes, projectTypes);
}

// Function to prompt for yes/no questions
async function promptYesNo(question) {
    return await tp.system.suggester(["Yes", "No"], ["Yes", "No"], false, question) === "Yes";
}

// Get project details
const projectType = await getProjectType();
const projectName = await tp.system.prompt("Enter project name");
const startDate = tp.date.now("YYYY-MM-DD");
const dueDate = await tp.system.prompt("Enter due date (YYYY-MM-DD)", tp.date.now("YYYY-MM-DD", 30));
const manager = await tp.system.prompt("Enter project manager name");
const priority = await tp.system.suggester(["Low", "Medium", "High"], ["Low", "Medium", "High"], false, "Select priority");
const description = await tp.system.prompt("Enter brief project description");
const enableKanban = await promptYesNo("Enable Kanban board?");
const enableGamification = projectType === "Agile" ? await promptYesNo("Enable gamification?") : false;

// Generate tags based on project type
let tags = ["project", projectType.toLowerCase().replace(" ", "-")];
if (enableKanban) tags.push("kanban");
if (enableGamification) tags.push("gamification");

// Function to generate milestone prompts
async function getMilestones(count) {
    let milestones = [];
    for (let i = 1; i <= count; i++) {
        const milestone = await tp.system.prompt(`Enter milestone ${i}`);
        if (milestone) milestones.push(milestone);
    }
    return milestones;
}

// Get milestones
const milestones = await getMilestones(3);

// Generate the frontmatter
let frontmatter = `---
created: ${startDate}
modified: ${startDate}
type: ${projectType.toLowerCase().replace(" ", "-")}-project
status: planning
priority: ${priority.toLowerCase()}
due: ${dueDate}
tags: ${JSON.stringify(tags)}
project_name: ${projectName}
manager: ${manager}
enable_kanban: ${enableKanban}
enable_gamification: ${enableGamification}
---`;

// Start generating the content
tR = frontmatter + "\n\n";

tR += `# ${projectName}\n\n`;
tR += `## Project Overview\n`;
tR += `**Type**: ${projectType}\n`;
tR += `**Description**: ${description}\n\n`;
tR += `**Manager**: ${manager}\n\n`;

tR += `## Timeline\n`;
tR += `- Start Date: ${startDate}\n`;
tR += `- Due Date: ${dueDate}\n\n`;

tR += `## Milestones\n`;
milestones.forEach((milestone, index) => {
    tR += `${index + 1}. [ ] ${milestone}\n`;
});
tR += "\n";

// Conditional sections based on project type
if (projectType === "Agile") {
    const sprintLength = await tp.system.prompt("Enter sprint length in weeks", "2");
    tR += `## Agile Specifics\n`;
    tR += `- Sprint Length: ${sprintLength} weeks\n`;
    tR += `- Current Sprint: 1\n\n`;
    if (enableGamification) {
        tR += `## Gamification\n`;
        tR += `- Points: 0\n`;
        tR += `- Level: 1\n\n`;
    }
} else if (projectType === "Research") {
    const hypothesis = await tp.system.prompt("Enter research hypothesis");
    tR += `## Research Specifics\n`;
    tR += `- Hypothesis: ${hypothesis}\n\n`;
    tR += `## Literature Review\n`;
    tR += `- [ ] Conduct initial literature review\n`;
    tR += `- [ ] Identify key papers\n\n`;
} else if (projectType === "Client Service") {
    const client = await tp.system.prompt("Enter client name");
    const contractValue = await tp.system.prompt("Enter contract value");
    tR += `## Client Information\n`;
    tR += `- Client: ${client}\n`;
    tR += `- Contract Value: $${contractValue}\n\n`;
}

// Common sections for all project types
tR += `## Tasks\n`;
tR += `### To Do\n`;
tR += `- [ ] Define detailed project scope\n`;
tR += `- [ ] Create detailed timeline\n`;
tR += `- [ ] Allocate resources\n\n`;

tR += `### In Progress\n`;
tR += `- [ ] Project initiation\n\n`;

tR += `### Completed\n`;
tR += `- [x] Project template created\n\n`;

if (enableKanban) {
    tR += `## Kanban Board\n`;
    tR += `![[${projectName} Kanban]]\n\n`;
}

tR += `## Notes and Updates\n`;
tR += `- ${startDate}: Project initiated\n\n`;

tR += `## Related Documents\n`;
tR += `- [[Project Proposal]]\n`;
tR += `- [[Resource Allocation]]\n\n`;

// Add Dataview queries
tR += `## Project Overview\n`;
tR += "```dataview\n";
tR += `TABLE WITHOUT ID
    file.link AS "Document",
    type AS "Type",
    priority AS "Priority",
    due AS "Due Date"
WHERE project_name = "${projectName}"\n`;
tR += "```\n\n";

tR += `## Task Status\n`;
tR += "```dataview\n";
tR += `LIST
FROM #task AND [[${projectName}]]
GROUP BY status\n`;
tR += "```\n";

%>