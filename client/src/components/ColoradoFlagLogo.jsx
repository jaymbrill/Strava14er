// Colorado state flag logo
// Three equal horizontal stripes (blue / white / red) + the Colorado C
// ViewBox 48 × 32 matches the flag's 3:2 width-to-height proportion
//
// C ring math — center (16, 16), outer r=10, inner r=7, opening ±45° right:
//   cos45°=0.7071  sin45°=0.7071
//   outer top : (16+10×.7071, 16−10×.7071) = (23.07, 8.93)
//   outer bot : (23.07, 23.07)
//   inner top : (16+ 7×.7071, 16− 7×.7071) = (20.95, 11.05)
//   inner bot : (20.95, 20.95)
//   Arc: go the long way (270°) around the LEFT side
//     outer → CCW on screen: large-arc=1 sweep=0
//     inner → CW  on screen: large-arc=1 sweep=1

export default function ColoradoFlagLogo({ className = 'w-12 h-8' }) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={className}
      fill="none"
      aria-label="Colorado Summit Log"
    >
      {/* ── Three equal flag stripes ── */}
      <rect x="0" y="0"      width="48" height="10.67" fill="#003DA5" />
      <rect x="0" y="10.67"  width="48" height="10.67" fill="#FFFFFF" />
      <rect x="0" y="21.33"  width="48" height="10.67" fill="#BF0A30" />

      {/* ── Colorado C ── */}
      {/* Gold disc */}
      <circle cx="16" cy="16" r="10" fill="#FFC72C" />
      {/* Blue C ring — opens to the right */}
      <path
        d="M 23.07 8.93
           A 10 10 0 1 0 23.07 23.07
           L 20.95 20.95
           A  7  7 0 1 1 20.95 11.05
           Z"
        fill="#003DA5"
      />
    </svg>
  );
}
