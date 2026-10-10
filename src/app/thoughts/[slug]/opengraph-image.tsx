import { readFile } from "fs/promises";
import { join } from "path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPublishedPost } from "@/lib/posts";
import { formatPostDate } from "@/lib/date";
import { formatReadingTime, readingTimeMinutes } from "@/lib/reading-time";

export const alt = "A post from Jordan Hilado's Thoughts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Light-theme values from globals.css and the Tailwind classes the post page
// uses, resolved to hex because Satori understands neither oklch nor classes.
const COLOR = {
  background: "#f9f9f9", // --background, oklch(0.9821 0 0)
  accent: "#0284c7", // sky-600: post titles
  body: "#737373", // neutral-500: the date and reading time
};

const PADDING_X = 64;
const PHOTO_HEIGHT = 270;

/**
 * Satori reads TTF, OTF and WOFF but not WOFF2, so these are TTF conversions
 * of the files in public/fonts rather than the files themselves: Song Myung
 * as-is, and SF Pro pinned to a static Regular instance because Satori draws
 * only a variable font's default outlines. The photo is the hero, shrunk to
 * the card's width so each render is not decoding a 3000px original.
 *
 * Read with process.cwd() so Next's file tracing ships them with the route.
 */
const ASSET_DIR = join(process.cwd(), "src/assets/og");

const assets = Promise.all([
  readFile(join(ASSET_DIR, "SongMyung-Regular.ttf")),
  readFile(join(ASSET_DIR, "SF-Pro-Regular.ttf")),
  readFile(join(ASSET_DIR, "zion.jpg")),
]);

// Past this many characters a title at the smallest step can run beyond three
// lines, so it is clamped with an ellipsis instead of balanced: Satori balances
// the whole unclamped text, which squeezes a clamped title into a narrow column.
const BALANCE_MAX_LENGTH = 90;

/**
 * Steps the title down as it lengthens so a long one still fits in the space
 * under the photo, and a short one does not sit small in a mostly empty card.
 */
function titleSize(title: string): number {
  if (title.length <= 28) return 72;
  if (title.length <= 56) return 60;
  return 50;
}

/**
 * The link-preview card for a post: the page's own header in miniature — the
 * hero photo, then the title in the accent colour and display face, then the
 * date and reading time — so a shared link looks like the page it opens.
 */
export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPublishedPost(params.slug);

  if (!post) {
    notFound();
  }

  const [songMyung, sfPro, photo] = await assets;
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const meta = `${formatPostDate(post.createdAt)} · ${formatReadingTime(
    readingTimeMinutes(post.content)
  )}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          // No bottom padding: the text below takes the rest of the card and
          // centres itself in it, so the gap under the date matches the gap
          // over the title instead of stacking on top of a margin.
          padding: `56px ${PADDING_X}px 0`,
          backgroundColor: COLOR.background,
          fontFamily: "SF Pro",
          // tracking-tight, which the site's <main> sets on everything.
          letterSpacing: "-0.025em",
        }}
      >
        {/* The hero, as it sits above every post, cropped to a band. */}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={photoSrc}
          width={size.width - PADDING_X * 2}
          height={PHOTO_HEIGHT}
          style={{ objectFit: "cover", objectPosition: "50% 42%" }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          <div
            style={{
              // Satori only honours lineClamp on a block, not a flex item.
              display: "block",
              fontFamily: "Song Myung",
              fontSize: titleSize(post.title),
              lineHeight: 1.12,
              color: COLOR.accent,
              lineClamp: 3,
              textWrap:
                post.title.length <= BALANCE_MAX_LENGTH ? "balance" : "wrap",
            }}
          >
            {post.title}
          </div>
          <div style={{ marginTop: 18, fontSize: 28, color: COLOR.body }}>
            {meta}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Song Myung", data: songMyung, weight: 400, style: "normal" },
        { name: "SF Pro", data: sfPro, weight: 400, style: "normal" },
      ],
      // ImageResponse defaults to a year of `immutable`, and the ?hash Next
      // appends to the og:image URL tracks this file's source, not the post —
      // so a renamed post would keep its old card wherever that was cached.
      // Previews are fetched rarely enough that rendering each one is cheaper
      // than reasoning about staleness. Lowercase so it replaces the default
      // key in the spread rather than being sent alongside it.
      headers: { "cache-control": "public, max-age=0, must-revalidate" },
    }
  );
}
