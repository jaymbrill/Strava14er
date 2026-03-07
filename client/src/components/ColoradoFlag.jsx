// Colorado state flag SVG component
export default function ColoradoFlag({ className = '' }) {
  return (
    <svg viewBox="0 0 330 220" className={className} aria-label="Colorado state flag">
      {/* Three horizontal stripes */}
      <rect x="0" y="0" width="330" height="73.3" fill="#003DA5" />
      <rect x="0" y="73.3" width="330" height="73.4" fill="#FFFFFF" />
      <rect x="0" y="146.7" width="330" height="73.3" fill="#003DA5" />

      {/* Red "C" */}
      <circle cx="110" cy="110" r="66" fill="#BF0A30" />
      <circle cx="110" cy="110" r="44" fill="#FFFFFF" />
      {/* Clip right side of C */}
      <rect x="110" y="44" width="90" height="132" fill="#FFFFFF" />

      {/* Gold circle (sun inside C) */}
      <circle cx="110" cy="110" r="38" fill="#FFC72C" />
      <circle cx="110" cy="110" r="22" fill="#BF0A30" />
      {/* Clip right side of gold, keep as sun/dot behind C opening */}
      <rect x="110" y="72" width="60" height="76" fill="#FFFFFF" />
    </svg>
  );
}
