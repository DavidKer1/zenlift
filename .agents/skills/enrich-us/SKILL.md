---
name: enrich-us
description: Analyze and enhance GitHub Project issues with complete, implementation-ready technical detail.
---
# enrich-us Skill

Use it when this workflow is required in the project.

## Instructions

Please analyze and enhance the GitHub Project issue identified by itemId: $ARGUMENTS.

Follow these steps:

1. Use GitHub CLI to get the issue details from the canonical GitHub Project. The `$ARGUMENTS` will be the GitHub Project itemId. For this repository, use project `Zenlift` at `https://github.com/users/DavidKer1/projects/4` and repository `DavidKer1/zenlift` unless the user explicitly says otherwise. Issue IDs follow the format `ZEN-XXXX`.
2. You will act as a product expert with technical knowledge
3. Understand the problem described in the ticket
4. Decide whether or not the User Story is completely detailed according to product's best practices: Include a full description of the functionality, a comprehensive list of fields to be updated, the structure and URLs of the necessary endpoints, the files to be modified according to the architecture and best practices, the steps required for the task to be considered complete, how to update any relevant documentation or create unit tests, and non-functional requirements related to security, performance, etc
5. If the user story lacks the technical and specific detail necessary to allow the developer to be fully autonomous when completing it, provide an improved story that is clearer, more specific, and more concise in line with product best practices described in step 4. Use the technical context you will find in the repository. Return it in markdown format.
6. Update the GitHub issue body directly with only the enriched user story content. Do not append the original content, do not create `[original]` or `[enhanced]` sections, and do not add an `Enhanced` heading. Apply proper Markdown formatting to make it readable and visually clear, using appropriate text types (lists, code snippets, tables where useful...).
7. If the issue status in the GitHub Project was "To refine" or an equivalent refinement column, move the item to "Pending refinement validation" if that status exists in the Project. If the target status does not exist, leave the item in its current status and report that clearly.
