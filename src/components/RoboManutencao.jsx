// src/components/RoboManutencao.jsx
export default function RoboManutencao() {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto text-brand-500" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="70" y="30" width="60" height="50" rx="10" />
      <circle cx="90" cy="55" r="4" fill="currentColor" />
      <circle cx="110" cy="55" r="4" fill="currentColor" />
      <path d="M85 68 Q100 75 115 68" />
      <line x1="100" y1="30" x2="100" y2="15" />
      <circle cx="100" cy="12" r="4" />
      <rect x="60" y="90" width="80" height="70" rx="10" />
      <circle cx="100" cy="125" r="12" strokeDasharray="4 4" />
      <path d="M60 110 Q40 120 35 145" />
      <path d="M30 140 L40 150 M35 140 L40 145 M30 145 L35 150" />
      <circle cx="150" cy="140" r="6" />
      <rect x="45" y="170" width="20" height="8" rx="3" transform="rotate(-15 45 170)" />
      <rect x="140" y="175" width="18" height="8" rx="3" transform="rotate(10 140 175)" />
    </svg>
  );
}