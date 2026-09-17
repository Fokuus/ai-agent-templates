# Tool spec: `tool_name`

Document a tool (function) that an agent can call, so both people and models know exactly
what it does.

## Purpose

One sentence: what the tool does and when the agent should reach for it.

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | yes | What to search for. |
| `limit` | integer | no | Max results, default 10. |

## Schema

```json
{
  "name": "tool_name",
  "description": "One sentence the model reads to decide when to call this.",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "What to search for." },
      "limit": { "type": "integer", "description": "Max results.", "default": 10 }
    },
    "required": ["query"]
  }
}
```

## Returns

Describe the shape of the result and what the agent should do with it.

## Example

> Call `tool_name` with `{ "query": "invoices 2026", "limit": 5 }` to get the five most
> recent matching records.

## Notes

- Keep the description action-oriented; it is the main signal the model uses to pick the tool.
- Fail loudly: return a clear error the agent can relay, not a silent empty result.
