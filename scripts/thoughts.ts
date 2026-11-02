/**
 * Write thoughts as markdown files in `thoughts/` and sync them to the Post
 * table.
 *
 *   pnpm thought:new "Why I run"          # scaffold thoughts/why-i-run.md
 *   pnpm thought:sync                     # sync every file in thoughts/
 *   pnpm thought:sync thoughts/why-i-run.md
 *   pnpm thought:sync --dry-run           # show what would change, write nothing
 *   pnpm thought:pull                     # download posts that have no local file yet
 *
 * Each file is frontmatter plus a markdown body:
 *
 *   ---
 *   title: Why I run
 *   date: 2026-10-31
 *   published: true
 *   coverImage:
 *   slug:
 *   ---
 *
 *   The body, in markdown.
 *
 * `slug` is the link between a file and its row. Leave it blank on a new
 * file: the first sync creates the post, picks a free slug from the title the
 * same way the admin API does, and writes it back into the file. After that,
 * re-syncing updates that row in place — editing the title changes the
 * heading but keeps the URL, so links already shared keep working.
 *
 * `pull` is the way back: it writes a file for every post in the database,
 * drafts included, whose slug no local file claims yet, so a post written in
 * the admin dashboard or on another machine can be edited here. It never
 * overwrites a file that already exists.
 *
 * The folder is gitignored: the database is the source of truth, and these
 * files are local scratch for writing in the terminal. Files whose names start
 * with `_` are skipped, and deleting a file does not delete its post; use the
 * admin dashboard for that.
 *
 * Writes go straight to the database, so they skip the revalidatePost() the
 * admin API makes. The script asks the deployed site to purge its cache
 * through /api/revalidate afterwards; if that fails the post still appears,
 * just within the hour rather than immediately.
 */
import { PrismaClient, type Post } from "@prisma/client";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";
import { slugify } from "@/lib/slugify";
import { SITE_URL } from "@/constants/site";

const THOUGHTS_DIR = path.join(process.cwd(), "thoughts");

interface Frontmatter {
  title: string;
  date: string;
  published: boolean;
  coverImage: string | null;
  slug: string | null;
}

interface Thought {
  file: string;
  frontmatter: Frontmatter;
  content: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Strips one layer of matching quotes, so `title: "A: B"` reads as `A: B`. */
function unquote(value: string): string {
  const match = value.match(/^(["'])([\s\S]*)\1$/);
  return match ? match[2] : value;
}

/**
 * Reads the flat `key: value` frontmatter these files use. Deliberately not a
 * YAML parser: every field is a scalar, and splitting on the first colon keeps
 * titles like "Notes: on running" intact without a dependency.
 */
function parseThought(file: string): Thought {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error("missing frontmatter (a --- block at the top of the file)");
  }

  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon === -1 || line.trim().startsWith("#")) continue;
    fields[line.slice(0, colon).trim()] = unquote(line.slice(colon + 1).trim());
  }

  const title = fields.title ?? "";
  if (title.length < 3 || title.length > 200) {
    throw new Error("title must be 3-200 characters");
  }

  const date = fields.date || today();
  if (!DAY_RE.test(date) || Number.isNaN(Date.parse(date))) {
    throw new Error(`date "${date}" is not a YYYY-MM-DD day`);
  }

  const publishedRaw = (fields.published ?? "true").toLowerCase();
  if (publishedRaw !== "true" && publishedRaw !== "false") {
    throw new Error(`published must be true or false, got "${fields.published}"`);
  }

  const coverImage = fields.coverImage || null;
  if (coverImage && !/^https?:\/\//.test(coverImage)) {
    throw new Error("coverImage must be an http(s) URL");
  }

  const slug = fields.slug || null;
  if (slug && slugify(slug) !== slug) {
    throw new Error(`slug "${slug}" should be lowercase-with-dashes, e.g. "${slugify(slug)}"`);
  }

  const content = match[2].trim();
  if (!content) {
    throw new Error("body is empty");
  }

  return {
    file,
    frontmatter: { title, date, published: publishedRaw === "true", coverImage, slug },
    content,
  };
}

/**
 * A title as it should appear after `title:`. parseThought splits on the first
 * colon, so colons inside a title need no quoting; only a title that is
 * itself wrapped in matching quotes, or has edge whitespace, would lose
 * characters on the way back in. Those get the quote character they lack.
 */
function formatTitle(title: string): string {
  if (/^(["'])[\s\S]*\1$/.test(title) || title !== title.trim()) {
    return title.includes('"') ? `'${title}'` : `"${title}"`;
  }
  return title;
}

function serializeThought(frontmatter: Frontmatter, content: string): string {
  return [
    "---",
    `title: ${formatTitle(frontmatter.title)}`,
    `date: ${frontmatter.date}`,
    `published: ${frontmatter.published}`,
    `coverImage:${frontmatter.coverImage ? ` ${frontmatter.coverImage}` : ""}`,
    `slug:${frontmatter.slug ? ` ${frontmatter.slug}` : ""}`,
    "---",
    "",
    content.trim(),
    "",
  ].join("\n");
}

/**
 * The slug a file's frontmatter claims, without validating anything else, so
 * a half-written file still marks its post as present locally.
 */
function readSlug(file: string): string | null {
  const match = readFileSync(file, "utf8").match(FRONTMATTER_RE);
  const line = match?.[1].split(/\r?\n/).find((l) => l.split(":")[0].trim() === "slug");
  const value = line ? unquote(line.slice(line.indexOf(":") + 1).trim()) : "";
  return value || null;
}

/**
 * Sets `key: value` in a file's frontmatter, replacing the line if it exists
 * and inserting it before the closing `---` if not. Edits only that line so
 * the rest of the file is byte-for-byte untouched.
 */
function setFrontmatterField(file: string, key: string, value: string): void {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return;

  const lines = match[1].split(/\r?\n/);
  const index = lines.findIndex((line) => line.split(":")[0].trim() === key);
  if (index === -1) {
    lines.push(`${key}: ${value}`);
  } else {
    lines[index] = `${key}: ${value}`;
  }

  const body = raw.slice(raw.indexOf(match[1]) + match[1].length);
  writeFileSync(file, `---\n${lines.join("\n")}${body}`);
}

/** The UTC calendar day a post is shown under (see formatPostDate). */
function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * `base` moved onto `day`, keeping its time of day — the same rule the admin
 * PATCH uses, so posts that share a date keep their relative order.
 */
function onDay(base: Date, day: string): Date {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  const next = new Date(base);
  next.setUTCFullYear(year, month - 1, dayOfMonth);
  return next;
}

function listThoughtFiles(args: string[]): string[] {
  if (args.length > 0) {
    return args.map((arg) => path.resolve(arg));
  }
  if (!existsSync(THOUGHTS_DIR)) {
    return [];
  }
  return readdirSync(THOUGHTS_DIR)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .sort()
    .map((name) => path.join(THOUGHTS_DIR, name));
}

async function uniqueSlug(prisma: PrismaClient, title: string): Promise<string> {
  const base = slugify(title);
  if (!base) {
    throw new Error("title has no letters or digits to build a slug from");
  }
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}-${i}`;
    if (!(await prisma.post.findUnique({ where: { slug: candidate } }))) {
      return candidate;
    }
  }
  throw new Error(`no free slug for "${base}"`);
}

function isUnchanged(post: Post, thought: Thought): boolean {
  const { title, date, published, coverImage } = thought.frontmatter;
  // Trimmed because parseThought trims the body: a post saved from the admin
  // editor with a trailing newline would otherwise read as edited on every
  // sync after a pull.
  return (
    post.title === title &&
    post.content.trim() === thought.content &&
    post.published === published &&
    (post.coverImage ?? null) === coverImage &&
    utcDay(post.createdAt) === date
  );
}

/** Asks the live site to drop its cached copies of these posts' pages. */
async function revalidate(slugs: string[]): Promise<void> {
  const secret = process.env.CRON_SECRET;
  const origin = process.env.REVALIDATE_ORIGIN ?? SITE_URL;
  const fallback = "Pages will pick up the change within the hour.";

  if (!secret) {
    console.warn(`\nCRON_SECRET is not set, so the site cache was not purged. ${fallback}`);
    return;
  }

  try {
    const response = await fetch(`${origin}/api/revalidate`, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ slugs }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    console.log(`\nPurged the cache on ${origin}.`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`\nCould not purge the cache on ${origin} (${reason}). ${fallback}`);
  }
}

async function sync(args: string[]): Promise<number> {
  const dryRun = args.includes("--dry-run");
  const files = listThoughtFiles(args.filter((arg) => arg !== "--dry-run"));

  if (files.length === 0) {
    console.log('No thoughts to sync. Start one with: pnpm thought:new "Title"');
    return 0;
  }

  // Parse everything before touching the database, so one bad file stops the
  // run instead of leaving it half-applied.
  const thoughts: Thought[] = [];
  const errors: string[] = [];
  for (const file of files) {
    try {
      thoughts.push(parseThought(file));
    } catch (error) {
      errors.push(`  ${path.relative(process.cwd(), file)}: ${(error as Error).message}`);
    }
  }

  const seen: Record<string, string> = {};
  for (const thought of thoughts) {
    const slug = thought.frontmatter.slug;
    if (!slug) continue;
    const name = path.relative(process.cwd(), thought.file);
    if (seen[slug]) {
      errors.push(`  ${name}: slug "${slug}" is also used by ${seen[slug]}`);
    }
    seen[slug] = name;
  }

  if (errors.length > 0) {
    console.error(`Nothing synced; fix these first:\n${errors.join("\n")}`);
    return 1;
  }

  const prisma = new PrismaClient();
  const touched: string[] = [];

  try {
    for (const thought of thoughts) {
      const name = path.relative(process.cwd(), thought.file);
      const { title, date, published, coverImage, slug } = thought.frontmatter;
      const fields = { title, content: thought.content, published, coverImage };
      const existing = slug ? await prisma.post.findUnique({ where: { slug } }) : null;
      const status = published ? "" : " (draft)";

      if (existing) {
        if (isUnchanged(existing, thought)) {
          console.log(`  unchanged  ${name}`);
          continue;
        }
        if (!dryRun) {
          await prisma.post.update({
            where: { id: existing.id },
            data: { ...fields, createdAt: onDay(existing.createdAt, date) },
          });
        }
        console.log(`  updated    ${name} -> /thoughts/${existing.slug}${status}`);
        touched.push(existing.slug);
        continue;
      }

      // No row yet: either a brand-new file, or one whose slug was set by
      // hand before its first sync — honour that slug rather than renaming it.
      const newSlug = slug ?? (await uniqueSlug(prisma, title));
      if (!dryRun) {
        await prisma.post.create({
          data: { ...fields, slug: newSlug, createdAt: onDay(new Date(), date) },
        });
        // Fill in what the sync chose, so the next run finds this row.
        if (!slug) setFrontmatterField(thought.file, "slug", newSlug);
        setFrontmatterField(thought.file, "date", date);
      }
      console.log(`  created    ${name} -> /thoughts/${newSlug}${status}`);
      touched.push(newSlug);
    }
  } finally {
    await prisma.$disconnect();
  }

  if (dryRun) {
    console.log("\nDry run: nothing was written.");
  } else if (touched.length > 0) {
    await revalidate(touched);
  }
  return 0;
}

function scaffold(args: string[]): number {
  const title = args.join(" ").trim();
  if (!title) {
    console.error('Usage: pnpm thought:new "Title of the thought"');
    return 1;
  }

  const base = slugify(title);
  if (!base) {
    console.error("The title needs at least one letter or digit.");
    return 1;
  }

  const file = path.join(THOUGHTS_DIR, `${base}.md`);
  if (existsSync(file)) {
    console.error(`${path.relative(process.cwd(), file)} already exists.`);
    return 1;
  }

  const template = serializeThought(
    { title, date: today(), published: true, coverImage: null, slug: null },
    "Start writing here."
  );

  mkdirSync(THOUGHTS_DIR, { recursive: true });
  writeFileSync(file, template);
  console.log(`Created ${path.relative(process.cwd(), file)}`);
  console.log("Write it, then run: pnpm thought:sync");
  return 0;
}

async function pull(): Promise<number> {
  mkdirSync(THOUGHTS_DIR, { recursive: true });

  // Matched on the slug inside each file, not its name: a new thought's file
  // is named after its title, and the slug it got on first sync can differ.
  const localSlugs: Record<string, true> = {};
  for (const file of listThoughtFiles([])) {
    const slug = readSlug(file);
    if (slug) localSlugs[slug] = true;
  }

  const prisma = new PrismaClient();
  let pulled = 0;

  try {
    const posts = await prisma.post.findMany({ orderBy: { createdAt: "asc" } });

    for (const post of posts) {
      if (localSlugs[post.slug]) {
        console.log(`  present    ${post.slug}`);
        continue;
      }

      const file = path.join(THOUGHTS_DIR, `${post.slug}.md`);
      const name = path.relative(process.cwd(), file);
      if (existsSync(file)) {
        console.warn(`  skipped    ${name} exists but its slug is not "${post.slug}"; rename it and pull again`);
        continue;
      }

      const frontmatter: Frontmatter = {
        title: post.title,
        date: utcDay(post.createdAt),
        published: post.published,
        coverImage: post.coverImage,
        slug: post.slug,
      };
      writeFileSync(file, serializeThought(frontmatter, post.content));
      console.log(`  pulled     ${name}${post.published ? "" : " (draft)"}`);
      pulled++;
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(pulled > 0 ? `\nPulled ${pulled} post(s).` : "\nEvery post already has a local file.");
  return 0;
}

async function main(): Promise<number> {
  const [command, ...args] = process.argv.slice(2);
  if (command === "new") return scaffold(args);
  if (command === "sync") return sync(args);
  if (command === "pull") return pull();
  console.error("Usage: tsx scripts/thoughts.ts <new|sync|pull> [...args]");
  return 1;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
