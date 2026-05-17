---
name: github-projects
description: "Create and manage GitHub Projects tickets for https://github.com/users/DavidKer1/projects/4. Use when asked to create issues, add tickets, manage project tasks, update issue status, or organize GitHub Project boards. Supports creating issues with labels, assignees, and project fields."
version: 1.0.0
license: MIT
allowed-tools: Bash, github_text_search, github_repo
---

# GitHub Projects Ticket Management

## Overview

Create and manage tickets in the GitHub Project board at `https://github.com/users/DavidKer1/projects/4`. This skill enables automated issue creation, status updates, and project organization based on user requests.

## Project Configuration

- **Project URL**: `https://github.com/users/DavidKer1/projects/4`
- **Owner**: `DavidKer1` (user-level project, not repo-specific)
- **Project Type**: User-owned GitHub Project board
- **Project ID**: `4`

## Project Fields

| Field       | Type           | ID                             |
| ----------- | -------------- | ------------------------------ |
| Title       | ProjectV2Field | PVTF_lAHOAjWWL84BX7TnzhTEvmI   |
| Status      | Single Select  | PVTSSF_lAHOAjWWL84BX7TnzhTEvmQ |
| Priority    | Single Select  | PVTSSF_lAHOAjWWL84BX7TnzhTEvm8 |
| Size        | Single Select  | PVTSSF_lAHOAjWWL84BX7TnzhTEvnA |
| Assignees   | ProjectV2Field | PVTF_lAHOAjWWL84BX7TnzhTEvmM   |
| Labels      | ProjectV2Field | PVTF_lAHOAjWWL84BX7TnzhTEvmU   |
| Milestone   | ProjectV2Field | PVTF_lAHOAjWWL84BX7TnzhTEvmc   |
| Start date  | ProjectV2Field | PVTF_lAHOAjWWL84BX7TnzhTEvnI   |
| Target date | ProjectV2Field | PVTF_lAHOAjWWL84BX7TnzhTEvnM   |

### Status Options

To get available status options:

```bash
gh project field-list 4 --owner DavidKer1 --format json | jq '.fields[] | select(.name == "Status")'
```

Common statuses: `Backlog`, `Todo`, `In Progress`, `In Review`, `Done`

### Priority Options

To get available priority options:

```bash
gh project field-list 4 --owner DavidKer1 --format json | jq '.fields[] | select(.name == "Priority")'
```

Common priorities: `High`, `Medium`, `Low`

### Size Options

To get available size options:

```bash
gh project field-list 4 --owner DavidKer1 --format json | jq '.fields[] | select(.name == "Size")'
```

Common sizes: `XS`, `S`, `M`, `L`, `XL`

## When to Use

Use this skill when the user asks to:

- Create new tickets/issues for the project
- Add tasks to the GitHub Project board
- Write up feature requests or bug reports
- Organize project work items
- Update issue status or fields
- Add labels, assignees, or milestones to project items

## Creating Issues via GitHub CLI

### Basic Issue Creation

```bash
# Create a new issue with title and body
gh issue create \
  --title "Feature: Add user authentication" \
  --body "## Description\n\nImplement OAuth2 authentication flow...\n\n## Acceptance Criteria\n- [ ] User can login\n- [ ] User can logout" \
  --label "enhancement" \
  --assignee "DavidKer1"
```

### Issue with Project Association

```bash
# Create issue and add to project
ISSUE_URL=$(gh issue create \
  --title "Task title" \
  --body "Task description" \
  --label "feature" \
  --json url --jq '.url')

# Extract issue number
ISSUE_NUM=$(echo $ISSUE_URL | grep -o '[0-9]*$')

# Add to project (requires project ID)
gh project item-add 4 --owner DavidKer1 --number $ISSUE_NUM
```

### Setting Project Fields

```bash
# Get project fields
gh project field-list 4 --owner DavidKer1 --limit 100

# Set field value (e.g., Status, Priority)
ITEM_ID=$(gh project item-list 4 --owner DavidKer1 --limit 10 --format json | jq '.items[] | select(.content.number == ISSUE_NUM) | .id')

gh project item-edit --id $ITEM_ID --field-id $FIELD_ID --single-select-option-id $OPTION_ID
```

## Issue Templates

### Feature Request Template

```markdown
## Feature Description

[Clear and concise description of the feature]

## User Story

As a [role], I want [goal] so that [benefit].

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes

[Any implementation details, API considerations, etc.]

## Dependencies

- [ ] Related issue #X
```

### Bug Report Template

```markdown
## Bug Description

[Clear description of the bug]

## Steps to Reproduce

1. Step one
2. Step two
3. See error

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Environment

- **OS**: [e.g., iOS, Android, web]
- **Browser/Device**: [e.g., Chrome 120, Safari]
- **Version**: [app version]

## Screenshots/Logs

[Attach if applicable]

## Priority

- [ ] Critical (blocks release)
- [ ] High (major functionality broken)
- [ ] Medium (minor issue)
- [ ] Low (cosmetic/nice-to-have)
```

### Task/Chore Template

```markdown
## Task Description

[What needs to be done]

## Scope

- Files affected: [list files]
- Estimated effort: [S/M/L/XL]

## Checklist

- [ ] Implementation
- [ ] Testing
- [ ] Documentation
- [ ] Code review
```

## Common Labels

| Label              | Use Case                       |
| ------------------ | ------------------------------ |
| `bug`              | Bug fixes and error resolution |
| `enhancement`      | New features and improvements  |
| `documentation`    | Docs updates                   |
| `refactor`         | Code restructuring             |
| `performance`      | Speed/optimization work        |
| `ui/ux`            | Design and interface changes   |
| `backend`          | Server-side work               |
| `frontend`         | Client-side work               |
| `testing`          | Test-related tasks             |
| `ci/cd`            | Pipeline and deployment        |
| `priority: high`   | Urgent tasks                   |
| `priority: medium` | Normal priority                |
| `priority: low`    | Can wait                       |
| `good first issue` | Beginner-friendly              |

## Workflow

### 1. Understand the Request

When a user asks to create a ticket:

1. Identify the type of work (feature, bug, task, etc.)
2. Determine priority and complexity
3. Gather requirements from the conversation
4. Ask clarifying questions if needed

### 2. Create the Issue

```bash
# Example: Create a feature ticket
gh issue create \
  --repo "DavidKer1/zenlift" \
  --title "Feature: [brief description]" \
  --body "[formatted markdown body]" \
  --label "enhancement" \
  --assignee "DavidKer1"
```

### 3. Add to Project

```bash
# Get the issue number from the output
ISSUE_NUM=123

# Add to project board
gh project item-add 4 --owner DavidKer1 --number $ISSUE_NUM
```

### 4. Set Project Fields (Optional)

```bash
# Get the project item ID
ITEM_ID=$(gh project item-list 4 --owner DavidKer1 --limit 10 --format json | \
  jq -r '.items[] | select(.content.number == ISSUE_NUM) | .id')

# Set Status to "In Progress"
gh project item-edit --project-id 4 --id $ITEM_ID \
  --field-id PVTSSF_lAHOAjWWL84BX7TnzhTEvmQ \
  --single-select-option-id "In Progress"

# Set Priority to "High"
gh project item-edit --project-id 4 --id $ITEM_ID \
  --field-id PVTSSF_lAHOAjWWL84BX7TnzhTEvm8 \
  --single-select-option-id "High"

# Set Size to "M"
gh project item-edit --project-id 4 --id $ITEM_ID \
  --field-id PVTSSF_lAHOAjWWL84BX7TnzhTEvnA \
  --single-select-option-id "M"
```

### 5. Verify Creation

```bash
# List recent issues
gh issue list --limit 5

# View project items
gh project item-list 4 --owner DavidKer1 --limit 10
```

## Project Status Fields

Common GitHub Project status fields:

| Status        | Meaning                   |
| ------------- | ------------------------- |
| `Backlog`     | Planned but not started   |
| `Todo`        | Ready to work on          |
| `In Progress` | Currently being worked on |
| `In Review`   | PR open or code review    |
| `Done`        | Completed and merged      |

## Best Practices

1. **Be specific**: Write clear, actionable titles and descriptions
2. **Include acceptance criteria**: Define what "done" looks like
3. **Use templates**: Maintain consistency across tickets
4. **Add context**: Link related issues, PRs, or discussions
5. **Set priorities**: Help with triage and planning
6. **Break down large tasks**: Split epics into smaller, manageable issues
7. **Assign appropriately**: Clear ownership prevents confusion

## Error Handling

### Common Issues

| Error                     | Solution                                      |
| ------------------------- | --------------------------------------------- |
| `command not found: gh`   | Install GitHub CLI: `brew install gh` (macOS) |
| `authentication required` | Run `gh auth login` first                     |
| `project not found`       | Verify owner and project number               |
| `permission denied`       | Check repo access and authentication          |

### Authentication Check

```bash
# Verify gh is authenticated
gh auth status

# If not authenticated
gh auth login
```

## Example Usage Scenarios

### Scenario 1: User asks to create a feature ticket

**User**: "Create a ticket for adding dark mode support"

**Actions**:

1. Determine type: `enhancement`, label: `ui/ux`
2. Create issue with proper template
3. Add to project board
4. Confirm creation with issue URL

### Scenario 2: User asks to organize backlog

**User**: "Add all unlabelled issues to the project"

**Actions**:

1. List issues without labels
2. Add each to project
3. Set initial status to `Backlog`

### Scenario 3: User reports a bug

**User**: "The login page crashes on iOS Safari"

**Actions**:

1. Create bug report issue
2. Request reproduction steps if missing
3. Set priority based on severity
4. Add to project with `bug` label

## Notes

- This skill uses GitHub CLI (`gh`) for all operations
- Ensure `gh` is installed and authenticated before use
- Project number `4` refers to the user-level project at the specified URL
- For repo-specific projects, add `--repo "owner/repo"` flag
- Always confirm issue creation with the user and provide the issue URL
