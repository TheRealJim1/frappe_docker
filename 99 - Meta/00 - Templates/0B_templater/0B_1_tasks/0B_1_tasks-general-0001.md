---
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
aliases: []
tags: [task, project, microsoft-todo, <% tp.date.now("YYYY") %>, <% tp.file.title.split(" ")[0] %>]
state: Drafting
---

# Task: <% tp.file.title %>

**Due Date**: <% tp.date.now("YYYY-MM-DD", await tp.system.prompt("Enter due date (YYYY-MM-DD):")) %>

**Priority**: 
- [ ] None
- [ ] Low
- [ ] Medium
- [ ] High

**Steps**:
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

**Notes**:
<!-- Additional notes -->

**Microsoft To Do Integration**:
<!-- You can add a link or reference to the task in Microsoft To Do here -->
