export default function CaduceusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 76"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="civ2-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b8860b" />
          <stop offset="40%" stopColor="#ffe066" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
        <linearGradient id="civ2-fire1" x1="0" y1="56" x2="0" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff8800" />
          <stop offset="100%" stopColor="#cc1100" />
        </linearGradient>
        <linearGradient id="civ2-fire2" x1="0" y1="60" x2="0" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffe033" />
          <stop offset="100%" stopColor="#ff9900" />
        </linearGradient>
        <filter id="civ2-glow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Flames (base only, y 56-76) ─────────────────────────── */}
      {/* outer flame silhouette */}
      <path
        d="M18,76 C14,69 12,62 17,57 C20,53 22,57 22,61
           C22,55 19,49 24,45 C27,42 29,47 29,52
           C29,47 31,42 34,45 C38,49 36,55 36,61
           C36,57 38,53 41,57 C46,62 44,69 40,76 Z"
        fill="url(#civ2-fire1)"
      />
      {/* inner bright flame */}
      <path
        d="M24,76 C22,70 21,65 24,61 C25,58 27,61 27,64
           C27,60 25,56 28,53 C30,51 32,54 32,58
           C32,54 30,51 33,53 C36,56 34,60 34,64
           C34,61 36,58 37,61 C40,65 39,70 36,76 Z"
        fill="url(#civ2-fire2)"
      />

      {/* ── Staff ────────────────────────────────────────────────── */}
      <rect x="25.5" y="7" width="5" height="54" rx="2.5" fill="url(#civ2-gold)" />

      {/* ── Winged orb at top ─────────────────────────────────────── */}
      <circle cx="28" cy="9" r="7.5" fill="url(#civ2-gold)" />
      {/* orb shine */}
      <ellipse cx="25.5" cy="7" rx="3" ry="2" fill="white" opacity="0.35" />

      {/* Left wing — two layered swept fills */}
      <path
        d="M25,12 C20,9 12,9 3,5 C5,9 13,12 20,15 C15,12 8,13 3,11 C6,14 14,16 22,17 Z"
        fill="white" opacity="0.95"
      />
      {/* Left wing lower feathers */}
      <path
        d="M25,15 C19,13 12,14 5,12 C8,15 16,17 24,18 Z"
        fill="white" opacity="0.6"
      />

      {/* Right wing */}
      <path
        d="M31,12 C36,9 44,9 53,5 C51,9 43,12 36,15 C41,12 48,13 53,11 C50,14 42,16 34,17 Z"
        fill="white" opacity="0.95"
      />
      {/* Right wing lower feathers */}
      <path
        d="M31,15 C37,13 44,14 51,12 C48,15 40,17 32,18 Z"
        fill="white" opacity="0.6"
      />

      {/* ── Left serpent (thick + highlight = 3D snake body) ──────── */}
      {/* body */}
      <path
        d="M28,58 C17,55 14,47 20,40 C26,33 35,35 35,27 C35,20 26,17 28,12"
        fill="none" stroke="#15803d" strokeWidth="6" strokeLinecap="round"
      />
      {/* scale sheen */}
      <path
        d="M28,58 C17,55 14,47 20,40 C26,33 35,35 35,27 C35,20 26,17 28,12"
        fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* center highlight */}
      <path
        d="M28,58 C17,55 14,47 20,40 C26,33 35,35 35,27 C35,20 26,17 28,12"
        fill="none" stroke="#bbf7d0" strokeWidth="0.8" strokeLinecap="round" opacity="0.7"
      />

      {/* ── Right serpent ─────────────────────────────────────────── */}
      <path
        d="M28,58 C39,55 42,47 36,40 C30,33 21,35 21,27 C21,20 30,17 28,12"
        fill="none" stroke="#166534" strokeWidth="6" strokeLinecap="round"
      />
      <path
        d="M28,58 C39,55 42,47 36,40 C30,33 21,35 21,27 C21,20 30,17 28,12"
        fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"
      />
      <path
        d="M28,58 C39,55 42,47 36,40 C30,33 21,35 21,27 C21,20 30,17 28,12"
        fill="none" stroke="#86efac" strokeWidth="0.8" strokeLinecap="round" opacity="0.7"
      />

      {/* ── Snake heads at the upper crossing ─────────────────────── */}
      {/* Left head */}
      <ellipse cx="35" cy="28" rx="3.5" ry="2.5" fill="#14532d" transform="rotate(-25 35 28)" />
      <circle cx="36.2" cy="26.8" r="1.1" fill="#d1fae5" />
      <circle cx="36.5" cy="26.8" r="0.55" fill="#111" />
      {/* Right head */}
      <ellipse cx="21" cy="28" rx="3.5" ry="2.5" fill="#14532d" transform="rotate(25 21 28)" />
      <circle cx="19.8" cy="26.8" r="1.1" fill="#d1fae5" />
      <circle cx="20.1" cy="26.8" r="0.55" fill="#111" />
    </svg>
  );
}
