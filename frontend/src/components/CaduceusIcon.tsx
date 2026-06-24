export default function CaduceusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 64"
      className={className}
      aria-hidden="true"
    >
      {/* ── Flames ─────────────────────────────────────────────────────── */}
      {/* outer left flame */}
      <path
        d="M18 64 C14 58 10 54 12 48 C13 44 16 46 17 50 C17 44 13 38 16 32 C18 28 21 32 21 36 C22 30 20 24 24 20 C28 24 26 30 27 36 C27 32 30 28 32 32 C35 38 31 44 31 50 C32 46 35 44 36 48 C38 54 34 58 30 64 Z"
        fill="url(#flameGrad)"
        opacity="0.95"
      />
      {/* inner bright flame core */}
      <path
        d="M22 64 C20 60 18 56 20 52 C21 49 23 51 23 54 C23 50 21 46 23 42 C24 40 26 42 26 45 C26 41 24 38 25 35 C27 37 27 42 27 45 C27 42 28 40 29 42 C31 46 29 50 29 54 C29 51 31 49 32 52 C34 56 32 60 30 64 Z"
        fill="url(#innerFlameGrad)"
        opacity="0.9"
      />

      {/* ── Staff ──────────────────────────────────────────────────────── */}
      <rect x="22.5" y="6" width="3" height="46" rx="1.5" fill="white" opacity="0.95" />

      {/* ── Wings ──────────────────────────────────────────────────────── */}
      {/* left wing */}
      <path
        d="M24 10 C18 8 10 10 6 6 C10 4 16 5 20 8 C16 5 12 2 10 1 C14 1 19 4 22 8 Z"
        fill="white"
        opacity="0.9"
      />
      {/* right wing */}
      <path
        d="M24 10 C30 8 38 10 42 6 C38 4 32 5 28 8 C32 5 36 2 38 1 C34 1 29 4 26 8 Z"
        fill="white"
        opacity="0.9"
      />
      {/* wing accent feathers left */}
      <path d="M24 10 C20 9 14 11 8 9 C12 7 18 8 22 10 Z" fill="white" opacity="0.6" />
      {/* wing accent feathers right */}
      <path d="M24 10 C28 9 34 11 40 9 C36 7 30 8 26 10 Z" fill="white" opacity="0.6" />

      {/* ── Left serpent ───────────────────────────────────────────────── */}
      <path
        d="M24 14 C18 16 15 20 17 24 C19 28 24 27 24 31 C24 35 18 36 16 40 C14 44 17 48 24 50"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* ── Right serpent ──────────────────────────────────────────────── */}
      <path
        d="M24 14 C30 16 33 20 31 24 C29 28 24 27 24 31 C24 35 30 36 32 40 C34 44 31 48 24 50"
        fill="none"
        stroke="#93c5fd"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* snake heads */}
      <circle cx="17.5" cy="23" r="1.5" fill="#7dd3fc" />
      <circle cx="30.5" cy="23" r="1.5" fill="#93c5fd" />

      {/* ── Gradient defs ──────────────────────────────────────────────── */}
      <defs>
        <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="innerFlameGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}
