export type MarkdownLinkPart = string | { text: string; url: string };

// Parse markdown-style link: [Link Title](url)
export function parseMarkdownLink(text: string): MarkdownLinkPart[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: MarkdownLinkPart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the link
    parts.push({ text: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no links found, return the original text
  if (parts.length === 0) {
    return [text];
  }

  return parts;
}
