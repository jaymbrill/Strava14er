// Colorado flag with mountain silhouette logo
// Flag stripes (blue / white / red) + the Colorado C ring + mountain peaks
export default function ColoradoFlagLogo({ className = 'w-12 h-10' }) {
  // Colorado C ring math (viewBox 48 × 40):
  //   centre (13, 20), outer r=11, inner r=7, opening ±50° facing right
  //   cos50°=0.6428  sin50°=0.7660
  //   outer top : (13 + 11×0.6428, 20 − 11×0.766) = (20.07, 11.57)
  //   outer bot : (20.07, 28.43)
  //   inner top : (13 +  7×0.6428, 20 −  7×0.766) = (17.50, 14.64)
  //   inner bot : (17.50, 25.36)
  //
  //   Arc direction: go via the LEFT (long way, 260°+)
  //     outer: CCW on screen → sweep=0, large-arc=1
  //     inner: CW  on screen → sweep=1, large-arc=1

  return (
    <svg viewBox="0 0 48 40" className={className} fill="none" aria-label="Colorado Summit Log logo">
      {/* ── Colorado flag stripes ── */}
      <rect x="0" y="0"    width="48" height="13.3" fill="#003DA5" />
      <rect x="0" y="13.3" width="48" height="13.4" fill="#FFFFFF" />
      <rect x="0" y="26.7" width="48" height="13.3" fill="#BF0A30" />

      {/* ── Colorado C ── */}
      {/* Gold disc */}
      <circle cx="13" cy="20" r="11" fill="#FFC72C" />
      {/* Blue C ring — opens to the right */}
      <path
        d="M 20.07 11.57
           A 11 11 0 1 0 20.07 28.43
           L 17.50 25.36
           A  7  7 0 1 1 17.50 14.64
           Z"
        fill="#003DA5"
      />

      {/* ── Mountain silhouette (right two-thirds) ── */}
      {/* Back range — mid blue-grey */}
      <path
        d="M 23 40 L 27 28 L 30 33 L 35 17 L 39 27 L 43 20 L 47 26 L 48 26 L 48 40 Z"
        fill="#1E3A5F"
      />
      {/* Snow caps */}
      <path d="M 35 17 L 38.5 24.5 L 35 23 L 31.5 26 Z" fill="white" opacity="0.95" />
      <path d="M 43 20 L 46 25.5 L 43 24.5 L 40 26.5 Z" fill="white" opacity="0.85" />
      {/* Foreground ridge — darker */}
      <path
        d="M 23 40 L 26 33 L 30 38 L 33 28 L 37 35 L 41 30 L 45 36 L 48 32 L 48 40 Z"
        fill="#0F1F35"
      />
    </svg>
  );
}
