# Installing NightMarquee

NightMarquee is a remote MCP server. There is nothing to download or build.

## Add the server

Add NightMarquee as a remote MCP server named `nightmarquee`. Do not clone or build this repository: the remote server needs no local files.

For Cline, add this entry to `cline_mcp_settings.json`, keeping any servers already there. Set `"type": "streamableHttp"`; without it Cline uses the older SSE transport and the connection fails.

```json
{
  "mcpServers": {
    "nightmarquee": {
      "type": "streamableHttp",
      "url": "https://mcp.nightmarquee.com/mcp",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Other clients take the same address in their remote server settings: `https://mcp.nightmarquee.com/mcp`.

- Transport: streamable HTTP.
- Sign-in: OAuth. No API key or environment variable is needed. Search and free designs work without signing in; the client opens the NightMarquee sign-in in a browser the first time a tool needs an account (footage, starters and the site check).

## Check that it works

Call `search_designs` with the query `observatory`. It returns designs, each with a live demo link.

## Only if the client cannot add a remote server

Use the older local package instead (Node.js 20 or newer):

```json
{
  "mcpServers": {
    "nightmarquee": {
      "command": "npx",
      "args": ["-y", "nightmarquee"]
    }
  }
}
```

Its tools have different names; the README lists them under "The older way: this npm package".
