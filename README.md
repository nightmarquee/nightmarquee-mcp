# NightMarquee

Cinematic, animated website designs for AI coding tools: live demos, build
prompts, runnable starter projects and a check for AI-look problems, the signs
that a page was made by AI.

Designs for hero sections, landing pages, SaaS, portfolios, online shops and
3D/WebGL scenes. Each build prompt is written for Lovable, Bolt, Cursor, Claude
or Codex, and each design has a live demo you can scroll.

NightMarquee is a remote MCP (Model Context Protocol) server. Add one address
to your AI tool, and search designs, get build prompts and starters, and check
a site from there:

```
https://mcp.nightmarquee.com/mcp
```

Some designs and tools ask you to sign in. Your tool opens the sign-in the
first time it needs it. The same steps, with buttons, are on
<https://nightmarquee.com/mcp>.

## Install

- **Claude**: Settings, then Connectors, add a custom connector, paste the address.
- **ChatGPT**: open chatgpt.com/plugins, choose the plus button, then Add custom MCP server. Paste the address, name it NightMarquee, add our icon (<https://nightmarquee.com/brand/nightmarquee-256.png>), choose OAuth or no authentication, create it, then install it. ChatGPT shows only the name and icon you enter. Not every ChatGPT account can add one.
- **Cursor**: use the Add to Cursor button on <https://nightmarquee.com/mcp>, then confirm in Cursor.
- **VS Code**: use the Add to VS Code button on <https://nightmarquee.com/mcp>, check the server details, then install.
- **Claude Code**: `claude mcp add --transport http nightmarquee https://mcp.nightmarquee.com/mcp`, or as a plugin, which adds the remote server plus the skills below: `/plugin install nightmarquee --marketplace nightmarquee/nightmarquee-mcp`
- **Codex**: `codex mcp add nightmarquee --url https://mcp.nightmarquee.com/mcp`
- **Any other tool**: paste the address where it asks for a remote MCP server. It uses the streamable HTTP transport and signs you in with OAuth. In a JSON config:

```json
{ "mcpServers": { "nightmarquee": { "url": "https://mcp.nightmarquee.com/mcp" } } }
```

## Tools

The remote server at `https://mcp.nightmarquee.com/mcp` has these tools:

- `search_designs`: list designs by words, category, or free and paid, each with a poster, a short preview and a live demo link
- `get_design`: one design's build prompt for your coding tool, its live demo and whether a starter exists; pass a brand name to have the prompt use it
- `get_footage`: short-lived download links for the clips and images a design's demo uses
- `get_starter`: a short-lived link to the design's runnable Next.js starter project, with the steps to run it
- `open_in_studio`: a link to the design's page on nightmarquee.com, where you can make your own version of its footage
- `list_scenes`: the scenes your account has finished on nightmarquee.com
- `get_account`: your plan, credit balance and what is left today
- `check_site`: start NightMarquee's AI-look check of a public website
- `get_job`: read a check's result: the score and each problem with its fix

Search and free designs need no account. Footage, starters and the site check
need a free account, and the other designs need a plan. Your AI tool opens the
sign-in the first time it is needed. Recent versions of Claude Code also load the
skills below straight from the server.

## The older way: this npm package

This package is the earlier way: a local stdio server (Node 20 or newer) with
its own tools, listed below. The tool names differ from the remote server's. It still works. Pick it if your tool cannot
add a remote address.

**Claude Code**

```bash
claude mcp add nightmarquee -- npx -y nightmarquee
```

**Claude Desktop / Cursor**: add to your MCP config:

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

Claude Desktop reads `~/Library/Application Support/Claude/claude_desktop_config.json`
on macOS and `%APPDATA%\Claude\claude_desktop_config.json` on Windows. Cursor
reads `~/.cursor/mcp.json`, or `.cursor/mcp.json` inside a project.

**Codex**: the CLI, the IDE extension and the ChatGPT app share one config.

```bash
codex mcp add nightmarquee -- npx -y nightmarquee
```

That writes this to `~/.codex/config.toml`, which you can also add by hand
(or to `.codex/config.toml` in a trusted project):

```toml
[mcp_servers.nightmarquee]
command = "npx"
args = ["-y", "nightmarquee"]
```

Codex uses the tools but does not show MCP prompts as commands yet, so ask for
a design in plain language and it calls `nightmarquee_search_prompts`. Prompts
come back in the Codex dialect unless you pass another `tool`.

The package needs no account for free prompts.

### Tools of the local package only

- `nightmarquee_search_prompts`: browse by `query`, `category` or `tier`
- `nightmarquee_get_prompt`: fetch one by `slug`, optionally with your own
  `brand` name and a `tool` dialect (`lovable`, `bolt`, `cursor`, `claude`,
  `codex`). Without one you get `codex` in Codex and `claude` elsewhere
- `nightmarquee_get_footage`: fresh download links for a demo's footage, when
  the ones from `nightmarquee_get_prompt` have expired
- `nightmarquee_sign_in`: connect an account, so the prompts that come with a plan open
- `nightmarquee_whoami`: check what's connected

`category` takes a slug such as `hero`, `landing` or `3d`.

Ask for a design in plain language and the model will usually reach for
`nightmarquee_search_prompts` on its own. Or drive it directly:

```
nightmarquee_get_prompt(slug: "<slug from search>", tool: "cursor", brand: "<your brand>")
```

Every prompt in the catalog is also registered as an MCP prompt, so the whole
library shows up in your client's command palette. In Claude Code that means a
slash command per design:

```
/mcp__nightmarquee__<slug>
```

Other clients surface MCP prompts their own way. Claude Desktop lists them in
the attachment (`+`) menu; Codex does not list them yet. The list is built from the catalog fetched at
startup, so if the server can't reach nightmarquee.com when your editor
launches, the tools still work but the per-prompt commands won't appear until
you restart.

### Footage in the local package

Most demos play video. When your account may download it, `nightmarquee_get_prompt`
returns the footage from the demo, every clip, with a signed link per file, and
the prompt text ends with a note naming each clip. The agent downloads the files
into `public/` under their names and then builds, so the page you get plays the
same footage as the demo. The links are short-lived; `nightmarquee_get_footage`
fetches fresh ones without the prompt.

A free prompt's footage needs a free account, and the rest come with any
plan. Without an account, the prompt text still arrives in full, with one
line saying how many clips the demo plays and that `nightmarquee_sign_in` gets
them. Downloads are rate-limited per account, shared with the site.

In Lovable and Bolt, download the files from the prompt page on
nightmarquee.com and upload them there.

## Skills

The same catalog also installs as agent skills, for editors that read
`SKILL.md` files:

```
npx skills add nightmarquee/nightmarquee-mcp
```

That adds a `nightmarquee` guide and one skill per free prompt. They carry no
prompt text: each fetches the current prompt through the remote server,
`https://mcp.nightmarquee.com/mcp`, when it is connected, and otherwise asks
you to copy it from the design's page on nightmarquee.com.

The remote server also serves the same skills over MCP. Recent versions of
Claude Code load them by themselves once the server is added, named after the
server, so there is nothing else to install there.

## Plans

Some designs are free and the rest come with
[any plan](https://nightmarquee.com/pricing?ref=mcp). For the live list of free
ones, ask the remote server's `search_designs` for free designs, or run this
package's `nightmarquee_search_prompts` with `tier: "free"`.

Run `nightmarquee_sign_in` and approve the code in your browser. It waits a short
while; if you took longer, run it again and it picks up the same request
rather than issuing a new code. Either way the rest unlock in the same session,
no restart. Fetching a locked prompt without an entitlement returns a
teaser and a pricing link, never the body.

For headless environments where no browser is reachable, carry a token across
instead: sign in once on a machine that has a browser, copy the `token` value
(`nm_live_…`) out of `~/.nightmarquee/credentials.json`, and set it there.

```json
{ "env": { "NIGHTMARQUEE_TOKEN": "nm_live_..." } }
```

Connections are listed on [your account page](https://nightmarquee.com/account)
and can be revoked from there; the next call falls back to free-only.

## Configuration

| Variable | Effect |
|---|---|
| `NIGHTMARQUEE_TOKEN` | Use this token instead of the stored one. Wins over `credentials.json`. |
| `NIGHTMARQUEE_API` | Point at a different backend. Defaults to `https://nightmarquee.com`. |
| `NIGHTMARQUEE_HOME` | Directory for `credentials.json`. Defaults to `~/.nightmarquee`. |
| `NIGHTMARQUEE_TIMEOUT_MS` | Ceiling on every API request, in milliseconds. Defaults to `10000`; unparseable or non-positive values fall back to the default, and anything above `2147483647` is clamped to it. |
| `NIGHTMARQUEE_NO_TELEMETRY` | Set to `1` (any non-empty value works) to stop sending the install ID and your client's name. See below for exactly what this does and doesn't cover. |

## Network calls

The remote server runs on our side and this package is not involved. When you
run the package, it makes HTTPS requests to `nightmarquee.com` (or the address
in `NIGHTMARQUEE_API`), and to no other host:

- `https://nightmarquee.com/api/mcp/*`: the catalog, the prompt text and the
  sign-in.
- `https://nightmarquee.com/api/footage/<slug>`: the footage links for a demo.

Each request carries the headers listed under Privacy Policy.

## Privacy Policy

Full policy: <https://nightmarquee.com/privacy>

### What is collected

Credentials are stored locally at `~/.nightmarquee/credentials.json`, mode 0600.

Fetching a prompt is an HTTP request to nightmarquee.com, so the server
necessarily sees which prompt slug and tool dialect you asked for, and logs
that. That is true in every configuration.

On top of that, each request carries three headers by default:

- `x-nm-install`: a random UUID generated on your machine on first run and
  kept in `credentials.json`. Not derived from anything, tied to nothing else.
- `x-nm-client`: the name and version your MCP client reports, e.g.
  `claude-code/<version>`. In Codex this package also asks for the Codex dialect
  itself, so turning telemetry off does not change which prompt text you get.
- `x-nm-version`: the version of this package.

If you are signed in, the request also carries a bearer token identifying your
NightMarquee account.

**Never sent, in any configuration:** the prompts or code you write, file
paths, file contents, or anything else from your project.

### How it is used and stored

Request records are used to operate the service and to understand which prompts
people use, nothing else. They are held in our Supabase database.

### Opting out

`NIGHTMARQUEE_NO_TELEMETRY=1` drops `x-nm-install` and `x-nm-client`.
**`x-nm-version` is still sent**, and requests are still made and still logged
server-side, and the log rows just carry no install ID and no client name. If you
are signed in, the bearer token identifies your account regardless of this
setting.

### Third-party sharing

Your data is not sold, rented, or shared with third parties for their own
purposes. It is processed only by the infrastructure providers running the
service on our behalf: Vercel (hosting), Supabase (database), and our payment
provider (for purchases only). No advertising or analytics networks receive
any of it.

### Retention

Account data is kept while your account exists. Email
<support@nightmarquee.com> to delete your account and we remove your data
within 30 days, except records we must keep for tax and accounting (held by the
merchant of record).

Request records are not currently expired on a fixed schedule; they are deleted
on request along with your account.

Tokens and local credentials are under your control at any time: revoke a
connected editor from your [account page](https://nightmarquee.com/account),
which stops the token working at once (the record is kept, marked revoked), or delete `~/.nightmarquee/credentials.json`
to remove the local copy.

### Contact

Privacy questions, data access, and deletion requests:
<support@nightmarquee.com>

## License

The server code in this package is MIT.

The prompt text it fetches is licensed separately: free prompts cover personal
and non-commercial projects, a plan adds commercial use, and the prompt text
itself may not be republished or resold. Full terms:
<https://nightmarquee.com/license>.

MIT © NightMarquee
