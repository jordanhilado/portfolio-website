// Average adult reading speed for prose on screen. Nothing here is precise
// enough to justify a per-post number, so the estimate is deliberately coarse:
// the label exists to tell a reader "short" from "long", not to be accurate to
// the minute.
const WORDS_PER_MINUTE = 200;

/**
 * Estimates how long a markdown post takes to read, in whole minutes.
 *
 * Markup is stripped before counting so that link URLs, image syntax and code
 * fences do not inflate the word count of the prose a reader actually reads.
 * Always at least 1 — "0 min read" reads as an error, not as "very short".
 */
export function readingTimeMinutes(markdown: string): number {
  const prose = markdown
    // Fenced and inline code: the words inside are not read at prose speed.
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    // Images first, then links — an image is a link with a leading `!`, so the
    // other order would leave the alt text behind as a bare word run.
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Bare URLs, then the remaining punctuation-only markup (#, *, >, -, |).
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_>~|-]/g, " ");

  const words = prose.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** "1 min read" / "7 min read" — the form shown beside a post's date. */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
