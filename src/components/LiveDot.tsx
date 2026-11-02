/**
 * A small blinking dot that marks a figure as live, i.e. pulled fresh from
 * Strava rather than typed in. Set in the link accent so it reads as part of
 * the number it sits beside.
 *
 * Decorative: hidden from assistive tech, and still (not blinking) for anyone
 * who has asked for reduced motion.
 *
 * It opens the link, so the word space before the link sits to its left
 * (about 4px). The 1px left and 5px right margins make the two gaps match at
 * about 5px.
 *
 * align-middle lands it about 1px below the digits' optical center, so it is
 * nudged up by that pixel.
 */
export default function LiveDot() {
  return (
    <span
      aria-hidden
      className="ml-px mr-[5px] inline-block size-1.5 -translate-y-px rounded-full bg-sky-600 align-middle motion-safe:animate-blink dark:bg-sky-400"
    />
  );
}
