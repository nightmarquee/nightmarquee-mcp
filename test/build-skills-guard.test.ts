import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AI_LOOK, buildSkills, checkOutDir, main, readServedSlugs, syncRepoSkills } from "../scripts/build-skills.mjs";
import { inMainRepo, pkgRoot, repoRoot } from "./main-repo";

const catalog = {
  version: 1,
  tools: ["claude"],
  categories: [],
  prompts: [
    {
      slug: "glasshouse-nine",
      title: "Glasshouse Nine",
      category: "hero",
      tier: "free",
      tagline: "A greenhouse hero that breathes",
      description: "Scroll scrubs a glasshouse at dawn.",
      demoUrl: "https://nightmarquee.com/demo/glasshouse-nine",
      pageUrl: "https://nightmarquee.com/p/glasshouse-nine",
    },
  ],
};

const fakeFetch = async () => new Response(JSON.stringify(catalog), { status: 200 });
const tempDir = () => mkdtempSync(join(tmpdir(), "nm-skills-guard-"));

/** A folder that looks like the public plugin repo: .claude-plugin/plugin.json with the given name. */
function pluginRepo(name: string): string {
  const dir = tempDir();
  mkdirSync(join(dir, ".claude-plugin"));
  writeFileSync(join(dir, ".claude-plugin", "plugin.json"), JSON.stringify({ name }));
  return dir;
}

afterEach(() => vi.restoreAllMocks());

describe("build-skills out dir guard", () => {
  it("refuses an out dir that is not the package or the plugin repo", () => {
    const empty = tempDir();
    expect(() => checkOutDir(empty)).toThrow(/not the nightmarquee package or the plugin repo/);

    const other = tempDir();
    writeFileSync(join(other, "package.json"), JSON.stringify({ name: "someone-else" }));
    expect(() => checkOutDir(other)).toThrow(/not the nightmarquee package or the plugin repo/);

    expect(() => checkOutDir(pkgRoot)).not.toThrow();
    expect(() => checkOutDir(pluginRepo("nightmarquee"))).not.toThrow();
  });

  it("refuses a folder whose package.json is named nightmarquee but is not this package", () => {
    const copy = tempDir();
    writeFileSync(join(copy, "package.json"), JSON.stringify({ name: "nightmarquee" }));
    expect(() => checkOutDir(copy)).toThrow(/not the nightmarquee package or the plugin repo/);
  });

  it.skipIf(!inMainRepo)("refuses the main repo's root, whose package.json is named nightmarquee too", () => {
    expect(JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")).name).toBe("nightmarquee");
    expect(() => checkOutDir(repoRoot)).toThrow(/not the nightmarquee package or the plugin repo/);
  });

  it("refuses another Claude plugin's checkout", () => {
    expect(() => checkOutDir(pluginRepo("someone-elses-plugin"))).toThrow(/not the nightmarquee package or the plugin repo/);
    const empty = tempDir();
    mkdirSync(join(empty, ".claude-plugin"));
    writeFileSync(join(empty, ".claude-plugin", "plugin.json"), "{}");
    expect(() => checkOutDir(empty)).toThrow(/not the nightmarquee package or the plugin repo/);
  });

  it("refuses an unknown flag or an extra argument before deleting anything", async () => {
    const dir = pluginRepo("nightmarquee");
    mkdirSync(join(dir, "skills", "old"), { recursive: true });
    await expect(main([dir, "--dryrun"], fakeFetch)).rejects.toThrow(/unknown option --dryrun/);
    await expect(main([dir, dir], fakeFetch)).rejects.toThrow(/one out dir at most/);
    expect(existsSync(join(dir, "skills", "old"))).toBe(true);
  });

  it("deletes nothing in a refused out dir", async () => {
    const dir = tempDir();
    mkdirSync(join(dir, "skills", "old"), { recursive: true });
    await expect(main([dir], fakeFetch)).rejects.toThrow(/not the nightmarquee package/);
    expect(existsSync(join(dir, "skills", "old"))).toBe(true);
  });

  it("a dry run deletes nothing", async () => {
    const dir = pluginRepo("nightmarquee");
    mkdirSync(join(dir, "skills", "old"), { recursive: true });
    const lines: string[] = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => void lines.push(line));

    await main([dir, "--dry-run"], fakeFetch);

    expect(existsSync(join(dir, "skills", "old"))).toBe(true);
    expect(existsSync(join(dir, "skills", "nightmarquee"))).toBe(false);
    expect(lines).toContain("would delete skills/old/");
    expect(lines).toContain("would write skills/nightmarquee/SKILL.md");
    expect(lines).toContain("would write skills/nightmarquee-ai-look-test/fixes.md");
  });

  it("a real run removes a stale skill folder, writes every listed file, and leaves the rest of the repo alone", async () => {
    const dir = pluginRepo("nightmarquee");
    mkdirSync(join(dir, "skills", "nightmarquee-retired", "nested"), { recursive: true });
    writeFileSync(join(dir, "skills", "nightmarquee-retired", "nested", "SKILL.md"), "old");
    mkdirSync(join(dir, "docs"));
    writeFileSync(join(dir, "docs", "keep.md"), "mine");
    writeFileSync(join(dir, "README.md"), "readme");
    vi.spyOn(console, "log").mockImplementation(() => {});

    await main([dir], fakeFetch);

    expect(existsSync(join(dir, "skills", "nightmarquee-retired"))).toBe(false);
    const expected = buildSkills(catalog, AI_LOOK, readServedSlugs());
    expect(expected.length).toBeGreaterThan(1);
    for (const { path, content } of expected) expect(readFileSync(join(dir, path), "utf8"), path).toBe(content);
    expect(readdirSync(join(dir, "skills")).sort()).toEqual([...new Set(expected.map((s) => s.path.split("/")[1]))].sort());
    expect(readFileSync(join(dir, "docs", "keep.md"), "utf8")).toBe("mine");
    expect(readFileSync(join(dir, "README.md"), "utf8")).toBe("readme");
    expect(JSON.parse(readFileSync(join(dir, ".claude-plugin", "plugin.json"), "utf8")).name).toBe("nightmarquee");
  });

  it("refuses a catalog with no free designs before deleting anything", async () => {
    const paidOnly = { ...catalog, prompts: catalog.prompts.map((p) => ({ ...p, tier: "unlimited" })) };
    for (const answer of [{ ...catalog, prompts: [] }, paidOnly]) {
      const dir = pluginRepo("nightmarquee");
      mkdirSync(join(dir, "skills", "nightmarquee-glasshouse-nine"), { recursive: true });
      writeFileSync(join(dir, "skills", "nightmarquee-glasshouse-nine", "SKILL.md"), "kept");
      const fetchIt = async () => new Response(JSON.stringify(answer), { status: 200 });
      for (const args of [[dir], [dir, "--dry-run"]]) {
        await expect(main(args, fetchIt)).rejects.toThrow(/no free designs/);
      }
      expect(readFileSync(join(dir, "skills", "nightmarquee-glasshouse-nine", "SKILL.md"), "utf8")).toBe("kept");
    }
  });
});

/**
 * A checkout of the main repo as the drop release sees it: the builder at its place, a served.json naming one
 * design whose pack key still matches, and one retired skill folder.
 */
function releaseTree(): string {
  const dir = tempDir();
  const put = (path: string, text: string) => {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), text);
  };
  put("packages/nightmarquee-mcp/scripts/build-skills.mjs", "// the builder\n");
  put("packages/nightmarquee-mcp/skills/nightmarquee-retired/SKILL.md", "old");
  put("packages/nightmarquee-mcp/README.md", "readme");
  put("src/lib/registry/item.ts", "export const REGISTRY_MAPPING_VERSION = 3;\n");
  put("src/lib/registry/served.json", JSON.stringify({ mappingVersion: 3, items: { "glasshouse-nine": "source/glasshouse-nine/a.json" } }));
  put("src/lib/source/packs.json", JSON.stringify({ "glasshouse-nine": { key: "source/glasshouse-nine/a.json" } }));
  return dir;
}

describe("syncRepoSkills, the drop release's writer", () => {
  it("writes the skills into the tree's package with that tree's served designs, and removes retired folders", () => {
    const dir = releaseTree();
    const result = syncRepoSkills(dir, catalog);

    const out = join(dir, "packages", "nightmarquee-mcp");
    const expected = buildSkills(catalog, AI_LOOK, ["glasshouse-nine"]);
    for (const { path, content } of expected) expect(readFileSync(join(out, path), "utf8"), path).toBe(content);
    expect(readFileSync(join(out, "skills", "nightmarquee-glasshouse-nine", "SKILL.md"), "utf8")).toContain("npx shadcn@latest add @nightmarquee/glasshouse-nine");
    expect(existsSync(join(out, "skills", "nightmarquee-retired"))).toBe(false);
    expect(readFileSync(join(out, "README.md"), "utf8")).toBe("readme");
    expect(result).toEqual({ deleted: ["nightmarquee-retired"], written: expected.length });
  });

  it("leaves the shadcn line out when the tree's served.json no longer matches the pack", () => {
    const dir = releaseTree();
    writeFileSync(join(dir, "src/lib/source/packs.json"), JSON.stringify({ "glasshouse-nine": { key: "source/glasshouse-nine/b.json" } }));
    syncRepoSkills(dir, catalog);
    expect(readFileSync(join(dir, "packages/nightmarquee-mcp/skills/nightmarquee-glasshouse-nine/SKILL.md"), "utf8")).not.toContain("npx shadcn@latest add");
  });

  it("refuses a folder that is not a checkout of the main repo", () => {
    const dir = tempDir();
    mkdirSync(join(dir, "packages", "nightmarquee-mcp", "skills", "keep"), { recursive: true });
    writeFileSync(join(dir, "packages", "nightmarquee-mcp", "skills", "keep", "SKILL.md"), "kept");
    expect(() => syncRepoSkills(dir, catalog)).toThrow(/not a checkout of the main repo/);
    expect(readFileSync(join(dir, "packages", "nightmarquee-mcp", "skills", "keep", "SKILL.md"), "utf8")).toBe("kept");
  });

  it("refuses a catalog with no free designs before deleting anything", () => {
    const dir = releaseTree();
    expect(() => syncRepoSkills(dir, { ...catalog, prompts: [] })).toThrow(/no free designs/);
    expect(readFileSync(join(dir, "packages/nightmarquee-mcp/skills/nightmarquee-retired/SKILL.md"), "utf8")).toBe("old");
  });
});
