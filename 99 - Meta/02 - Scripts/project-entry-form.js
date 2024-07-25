// project-entry-form.js

module.exports = async (tp) => {
    const form = await tp.system.prompt(`Create New Project

Project Name: {{project_name}}

Status: {{status}}
Priority: {{priority}}
Due Date (YYYY-MM-DD): {{due_date}}

Client: {{client}}
Project ID: {{project_id}}

Brief Description:
{{description}}

Main Objective:
{{objective}}

Key Stakeholders (comma-separated):
{{stakeholders}}

Estimated Budget: ${{budget}}

Team Members (comma-separated):
{{team_members}}

Key Milestones (one per line, up to 3):
{{milestones}}
`, 
    {
        project_name: tp.file.title,
        status: "planning",
        priority: "medium",
        due_date: tp.date.now("YYYY-MM-DD", 90),
        client: "",
        project_id: tp.date.now("YYYYMMDDHHmm"),
        description: "",
        objective: "",
        stakeholders: "",
        budget: "10000",
        team_members: "",
        milestones: ""
    });

    if (!form) return "Project creation cancelled.";

    const milestonesList = form.milestones.split('\n').filter(m => m.trim() !== '').slice(0, 3);
    const teamList = form.team_members.split(',').map(m => m.trim());
    const stakeholdersList = form.stakeholders.split(',').map(s => s.trim());

    return generateProjectNote(tp, form, milestonesList, teamList, stakeholdersList);
};

function generateProjectNote(tp, form, milestones, team, stakeholders) {
    const startDate = tp.date.now("YYYY-MM-DD");
    
    return `---
created: ${startDate}
modified: ${startDate}
type: project
status: ${form.status}
priority: ${form.priority}
due: ${form.due_date}
tags: [project, ${form.status}]
client: ${form.client}
folder: Projects/${form.project_name}
project_id: ${form.project_id}
team: [${team.join(', ')}]
budget:
  estimated: ${form.budget}
  actual: 0
start_date: ${startDate}
end_date: ${form.due_date}
progress: 0
---

# ${form.project_name}

## Project Overview
**Description**: ${form.description}

**Objective**: ${form.objective}

**Key Stakeholders**: ${stakeholders.join(', ')}

## Project Details
### Scope
- To be defined

### Timeline
- Start Date: ${startDate}
- End Date: ${form.due_date}

### Budget
- Estimated Cost: $${form.budget}
- Actual Cost: $0 (to be updated)

### Resources
- [ ] To be allocated

## Tasks
### To Do
- [ ] Define detailed project scope
- [ ] Create detailed timeline
- [ ] Allocate resources

### In Progress
- [ ] Project initiation

### Completed
- [x] Project created

## Milestones
${milestones.map((m, i) => `${i + 1}. [ ] ${m}\n   Due: ${tp.date.now("YYYY-MM-DD", 30 * (i + 1))}`).join('\n')}

## Risks and Mitigation
| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
|      |             |        |                     |

## Communication Plan
- Weekly Status Updates: Every Monday at 10:00 AM
- Stakeholder Meetings: Bi-weekly on Fridays at 2:00 PM
- Client Check-ins: Monthly on the last Thursday at 11:00 AM

## Notes and Updates
- ${startDate}: Project initiated

## Related Documents
- [[Project Proposal]]
- [[Budget Breakdown]]
- [[Resource Allocation]]

## Review and Approval
- [ ] Project Plan Reviewed by: ________________ Date: ________
- [ ] Project Plan Approved by: ________________ Date: ________

## Dataview Queries
\`\`\`dataview
TABLE status AS Status, priority AS Priority, due AS "Due Date", progress AS "Progress (%)"
WHERE project_id = "${form.project_id}"
\`\`\`

\`\`\`dataview
LIST
FROM #task AND [[${form.project_name}]]
GROUP BY status
\`\`\``;
}