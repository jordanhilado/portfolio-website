// Long enough for the two or three lines Slack, Discord and LinkedIn show
// under a link's title, short enough that Google does not cut it off mid-word.
const DEFAULT_MAX_LENGTH = 160;

/**
 * Turns the opening of a markdown post into a plain-text summary for link
 * previews (`description` / `og:description`).
 *
 * Gentler than the stripping in reading-time.ts, which only has to count words
 * and so can flatten every hyphen: this text is read, so "well-known" has to
 * survive. Headings, code, tables and images are dropped outright since none
 * of them read as a sentence out of context.
 */
export function postExcerpt(
  markdown: string,
  maxLength: number = DEFAULT_MAX_LENGTH
): string {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split("\n")
    .filter((line) => !/^\s*(#|\||!\[)/.test(line))
    // Quote, bullet and numbered-list markers. Stripped per line, before the
    // join, because a spaced " - " mid-sentence is a dash, not a bullet.
    .map((line) => line.replace(/^\s*(>\s*)*([-*+]|\d+\.)?\s+/, ""))
    .join(" ")
    // Images before links, for the same reason as in reading-time.ts.
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__|~~|\*)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (prose.length <= maxLength) {
    return prose;
  }

  const cut = prose.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, "")}…`;
}
