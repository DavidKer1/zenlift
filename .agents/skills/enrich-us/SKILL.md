---
name: enrich-us
description: Analyze and enhance Notion pages with complete, implementation-ready technical detail.
---
# enrich-us Skill

Use it when this workflow is required in the project.

## Instructions

Analyze and enrich the Notion page identified by `$ARGUMENTS`. `$ARGUMENTS` must be a **Notion page URL**.

## Notion Workflow

### Prerequisites

A Notion integration must be configured. Check for a `NOTION_API_KEY` environment variable or a `.env` / `.env.local` file in the workspace. If no key is found, ask the user to provide one or to set up an integration at `https://www.notion.so/my-integrations`. The integration must have been explicitly invited to the Notion page/database via the "Connections" menu in Notion.

### Extracting the page ID from a Notion URL

A Notion URL looks like:
`https://www.notion.so/{workspace-slug}/{Page-Title}-{32-char-hex-id}`

Extract the 32-character hex ID from the end of the URL (the part after the last `-`). If the ID already has hyphens (format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`), use it as-is. If it has no hyphens, insert them at positions 8, 12, 16, and 20 to form a standard UUID.

Example:
- URL: `https://www.notion.so/acme/Feature-X-implement-dark-mode-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6`
- Page ID: `a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d6`

### Steps

1. **Fetch the Notion page** using the Notion API:
   ```bash
   curl -s -H "Authorization: Bearer $NOTION_API_KEY" \
        -H "Notion-Version: 2022-06-28" \
        "https://api.notion.com/v1/pages/{page_id}"
   ```
   Parse the response to extract the page title (from `properties.title.title[0].plain_text` or the appropriate property) and the current body content.

2. **Fetch the page blocks** to get the full body:
   ```bash
   curl -s -H "Authorization: Bearer $NOTION_API_KEY" \
        -H "Notion-Version: 2022-06-28" \
        "https://api.notion.com/v1/blocks/{page_id}/children?page_size=100"
   ```

3. **Act as a product expert** with technical knowledge. Understand the problem described in the Notion page.

4. **Evaluate completeness** — decide whether the task is completely detailed according to product best practices:
   - Full description of the functionality
   - Comprehensive list of fields to be updated
   - Structure and URLs of the necessary endpoints (if applicable)
   - Files to be modified according to the architecture and best practices
   - Steps required for the task to be considered complete (acceptance criteria)
   - How to update any relevant documentation or create unit tests
   - Non-functional requirements (security, performance, offline support, etc.)

5. **Generate the enriched story** if the original lacks detail. Provide an improved, clearer, more specific, and more concise version. Use the technical context from the repository. Return it in markdown format.

6. **Update the Notion page** by clearing existing content and writing the enriched version. First, delete all existing children blocks (archive them), then append the new enriched content as blocks.

   To delete existing blocks, for each block ID from step 2:
   ```bash
   curl -s -X DELETE -H "Authorization: Bearer $NOTION_API_KEY" \
        -H "Notion-Version: 2022-06-28" \
        "https://api.notion.com/v1/blocks/{block_id}"
   ```

   Then append the enriched content using:
   ```bash
   curl -s -X PATCH -H "Authorization: Bearer $NOTION_API_KEY" \
        -H "Content-Type: application/json" \
        -H "Notion-Version: 2022-06-28" \
        -d '{
          "children": [
            {
              "object": "block",
              "type": "heading_1",
              "heading_1": { "rich_text": [{ "type": "text", "text": { "content": "Enriched User Story" } }] }
            },
            ...additional blocks...
          ]
        }' \
        "https://api.notion.com/v1/blocks/{page_id}/children"
   ```

   Convert the enriched markdown to Notion block JSON. Use the following block type mappings:
   - `# Heading` → `heading_1`
   - `## Heading` → `heading_2`
   - `### Heading` → `heading_3`
   - `- list item` → `bulleted_list_item`
   - `1. list item` → `numbered_list_item`
   - Code blocks → `code` with `language` property
   - Regular paragraphs → `paragraph`
   - Tables → `table`, `table_row` blocks
   - Callouts / notes → `callout`

   Apply proper formatting: bold, italic, code (`rich_text` annotations and inline code).

7. **Do not** append the original content, do not create `[original]` or `[enhanced]` sections, and do not add an `Enhanced` heading. The enriched content replaces the original.

8. **Status tracking**: If the Notion page is inside a database with a "Status" property, and the current status is "To refine" or equivalent, update it to "Pending refinement validation" if that option exists. Use:
   ```bash
   curl -s -X PATCH -H "Authorization: Bearer $NOTION_API_KEY" \
        -H "Content-Type: application/json" \
        -H "Notion-Version: 2022-06-28" \
        -d '{"properties": {"Status": {"select": {"name": "Pending refinement validation"}}}}' \
        "https://api.notion.com/v1/pages/{page_id}"
   ```
   If the page is not in a database or the status does not exist, leave it as-is and report clearly.
