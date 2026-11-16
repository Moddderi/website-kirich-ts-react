/**
 * Decorative "living" background: two slow ember glows, a few animated thread
 * stitches (sewing motif) and a touch of film grain. Pure CSS/SVG, transform-only.
 */
export const LivingBg = ({ stitches = true }: { stitches?: boolean }) => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="aurora aurora-a" />
    <div className="aurora aurora-b hidden sm:block" />

    {stitches && (
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <path
          className="stitch"
          d="M-20 640 C 280 520, 440 780, 780 640 S 1200 430, 1460 540"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="stitch"
          d="M-20 210 C 300 330, 560 70, 900 200 S 1260 390, 1460 230"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          style={{ animationDuration: "3.4s" }}
        />
        <path
          className="stitch"
          d="M-20 720 C 360 610, 650 830, 990 690 S 1290 570, 1460 630"
          stroke="rgba(196,65,77,0.45)"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          style={{ animationDuration: "2.2s" }}
        />
      </svg>
    )}

    <div className="grain" />
  </div>
);
