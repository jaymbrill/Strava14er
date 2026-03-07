// SVG mountain skyline component — Colorado Rockies silhouette
export default function MountainSkyline({ className = '' }) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="snowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#e0e8ff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#4A90D9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d4a6b" />
          <stop offset="100%" stopColor="#1B4332" />
        </linearGradient>
        <linearGradient id="snowcap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f4ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f0f4ff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Back range — dark, furthest away */}
      <path
        d="M0,200 L60,160 L120,175 L200,110 L280,140 L360,90 L440,130 L520,70 L600,110 L680,60 L760,100 L840,55 L920,85 L1000,50 L1080,80 L1160,45 L1240,75 L1320,55 L1380,70 L1440,60 L1440,320 L0,320 Z"
        fill="rgba(30,41,59,0.7)"
      />

      {/* Mid range — main peaks */}
      <path
        d="M0,240 L80,190 L140,210 L220,145 L300,175 L380,120 L460,160 L540,85 L610,130 L670,75 L740,110 L800,60 L870,90 L950,40 L1020,75 L1090,35 L1160,65 L1220,30 L1300,70 L1360,45 L1440,80 L1440,320 L0,320 Z"
        fill="url(#mtGrad)"
      />

      {/* Snow caps on mid-range peaks */}
      <path
        d="M540,85 L560,100 L580,88 L610,130 L590,115 L570,118 L540,85 Z
           M800,60 L820,75 L840,62 L870,90 L848,82 L828,80 L800,60 Z
           M950,40 L970,58 L990,44 L1020,75 L998,65 L972,63 L950,40 Z
           M1090,35 L1110,52 L1130,38 L1160,65 L1138,55 L1114,54 L1090,35 Z
           M1220,30 L1240,48 L1258,34 L1300,70 L1274,58 L1244,55 L1220,30 Z"
        fill="url(#snowcap)"
      />

      {/* Foreground ridge */}
      <path
        d="M0,280 L100,250 L200,265 L300,230 L400,255 L500,220 L600,245 L700,210 L800,235 L900,200 L1000,225 L1100,195 L1200,215 L1300,185 L1440,210 L1440,320 L0,320 Z"
        fill="rgba(27,67,50,0.9)"
      />

      {/* Foreground trees (simplified) */}
      <path
        d="M0,320 L20,290 L40,320 L60,285 L80,320 L100,288 L120,320 L140,290 L160,320 L180,285 L200,320
           M400,320 L420,292 L440,320 L460,288 L480,320 L500,291 L520,320
           M800,320 L820,290 L840,320 L860,286 L880,320 L900,292 L920,320
           M1200,320 L1220,288 L1240,320 L1260,285 L1280,320 L1300,290 L1320,320 L1340,287 L1360,320 L1380,291 L1400,320 L1440,320"
        fill="#1B4332"
        opacity="0.8"
      />
    </svg>
  );
}
