---
name: "nightmarquee-twist-stop"
description: "Twist Stop: A soft-serve shop site where you hold the lever and pour your own cone.. The first screen is the shop's machine, and it works. Pick one or two flavours, hold the red lever and a striped twist pours in 3D, one turn at a time up to 6, where the amber lamp lights. Add sprinkles or chocolate pearls, then send the link, and your friend opens that exact cone. Builds the NightMarquee \"Twist Stop\" page; live demo at https://nightmarquee.com/demo/twist-stop."
---

# Twist Stop

A soft-serve shop site where you hold the lever and pour your own cone.. Live demo: https://nightmarquee.com/demo/twist-stop

The first screen is the shop's machine, and it works. Pick one or two flavours, hold the red lever and a striped twist pours in 3D, one turn at a time up to 6, where the amber lamp lights. Add sprinkles or chocolate pearls, then send the link, and your friend opens that exact cone.

## Get the prompt

The prompt is kept current on nightmarquee.com, so fetch it rather than writing the page from this summary.

- With the NightMarquee MCP server (https://mcp.nightmarquee.com/mcp): `get_design(slug: "twist-stop", tool: "claude")`. Pass the `tool` for the editor you are in (lovable, bolt, cursor, claude or codex) and `brand` for the person's brand or site name, up to 24 characters.
- Without it: ask the person to open https://nightmarquee.com/p/twist-stop, choose their tool and copy the prompt. The page loads it in the browser, so fetching the page will not show it.

## Starter and footage

These need a connected NightMarquee account.

- Starter: `get_starter(slug: "twist-stop")`. `get_design`'s result has `starter.available`. If you cannot see it, call `get_starter` anyway; a `not_found` answer means there is none. It returns a download link that lasts ten minutes. The zip unpacks to `twist-stop-starter/`: run `npm install` and `npm run dev` inside it. Each account gets 5 starters a day, and asking again for the same one within ten minutes is not counted twice.
- Footage: `get_footage(slug: "twist-stop")`. The starter already plays the clips online, so download them only to work offline or to build from the prompt. Save each file into `public/drops/twist-stop/` under its `name`, while the links work (ten minutes); a starter then uses them when started with `NEXT_PUBLIC_FOOTAGE_LOCAL=1 npm run dev`. Skip the files named `*-original.mp4`: they are the large original masters, needed only to re-encode. Quote each link in the shell, since it contains `&`: `curl -fL --create-dirs -o public/drops/twist-stop/hero.mp4 "<url>"`.

Build the page, then compare it with the demo. Prompt licence: https://nightmarquee.com/license
