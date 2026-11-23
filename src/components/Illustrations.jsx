// Hand-drawn style line illustrations, all inline SVG (no external images).
// Slightly irregular strokes and double lines imitate pencil and ink.

export function Skyline({ className = '' }) {
  return (
    <svg viewBox="0 0 900 180" className={className} role="img" aria-label="Hand-drawn sketch of old Ahmedabad rooftops, minarets and a heritage pol house">
      <g className="sketch">
        {/* ground */}
        <path d="M4 168 C120 164 300 171 450 167 S780 170 896 166" />
        <path d="M30 174 C200 172 420 176 640 173" opacity=".5" />
        {/* pol house with jharokha */}
        <path d="M30 168 V86 L70 70 L110 86 V168" />
        <path d="M42 168 V104 h18 V168 M72 168 V104 h18 V168" />
        <path d="M38 100 q13 -16 26 0 M68 100 q13 -16 26 0" />
        <path d="M24 86 H116" />
        <path d="M54 62 q16 -22 32 0" />
        {/* carved balcony */}
        <path d="M40 124 h60 v10 h-60 z M46 134 v10 M70 134 v10 M94 134 v10" />
        {/* minaret pair (mosque) */}
        <path d="M200 168 V50 h14 V168 M200 50 q7 -16 14 0 M197 90 h20 M197 120 h20" />
        <path d="M262 168 V50 h14 V168 M262 50 q7 -16 14 0 M259 90 h20 M259 120 h20" />
        <path d="M214 168 V110 q24 -34 48 0 V168" />
        <path d="M222 168 V122 q16 -22 32 0 V168" />
        {/* dome */}
        <path d="M330 168 V120 h110 V168 M340 120 q45 -60 90 0 M385 70 V58 M380 58 h10" />
        <path d="M350 168 v-26 q8 -12 16 0 v26 M404 168 v-26 q8 -12 16 0 v26" />
        {/* tall pol house */}
        <path d="M480 168 V74 L530 54 L580 74 V168" />
        <path d="M474 74 H586 M492 168 V100 h14 V168 M554 168 V100 h14 V168" />
        <path d="M512 168 V120 q18 -22 36 0 V168" />
        <path d="M500 96 h60 M500 86 h60" />
        {/* stepwell arches */}
        <path d="M630 168 V110 h110 V168 M644 110 q12 -24 24 0 M676 110 q12 -24 24 0 M708 110 q12 -24 24 0" />
        <path d="M630 130 h110 M630 148 h110" opacity=".6" />
        {/* far rooftops */}
        <path d="M770 168 V120 L800 104 L830 120 V168 M838 168 V130 L862 118 L888 130 V168" />
        <path d="M785 168 V136 h30 V168" />
        {/* birds */}
        <path d="M160 36 q6 -8 12 0 q6 -8 12 0 M610 28 q5 -7 10 0 q5 -7 10 0 M740 44 q5 -7 10 0 q5 -7 10 0" />
      </g>
    </svg>
  );
}

export function JaliWindow({ className = '' }) {
  return (
    <svg viewBox="0 0 120 160" className={className} role="img" aria-label="Sketch of a carved heritage jali window">
      <g className="sketch">
        <path d="M14 156 V60 q46 -64 92 0 V156 Z" />
        <path d="M24 148 V66 q36 -50 72 0 V148 Z" opacity=".7" />
        {/* lattice */}
        {[40, 60, 80].map((x) => <path key={x} d={`M${x} 148 V50`} opacity=".55" />)}
        {[80, 100, 120, 140].map((y) => <path key={y} d={`M24 ${y} H96`} opacity=".55" />)}
        <circle cx="60" cy="86" r="14" />
        <circle cx="60" cy="86" r="6" />
        <path d="M60 72 V100 M46 86 H74 M50 76 L70 96 M70 76 L50 96" opacity=".6" />
        <path d="M8 156 H112" />
      </g>
    </svg>
  );
}

export function Tools({ className = '' }) {
  return (
    <svg viewBox="0 0 320 120" className={className} role="img" aria-label="Sketch of a jeweller's hammer, tongs and balance scale">
      <g className="sketch">
        {/* hammer */}
        <path d="M20 96 L96 40" strokeWidth="5" />
        <path d="M84 24 l30 -2 l8 20 l-30 6 z" />
        {/* tongs */}
        <path d="M150 104 L196 24 M176 108 L196 24" />
        <path d="M196 24 q4 -8 8 0 M150 104 h26" />
        {/* scale */}
        <path d="M262 104 V30 M232 104 H292 M262 30 H222 M262 30 H302 M222 30 L210 62 H234 Z M302 30 L290 62 H314 Z" />
        <path d="M262 24 a4 4 0 1 0 0.1 0" />
      </g>
    </svg>
  );
}

export function Arrow({ className = '', flip = false }) {
  return (
    <svg viewBox="0 0 90 40" className={className} style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
      <path className="sketch" style={{ stroke: '#612E32' }} d="M4 30 C24 6 52 4 80 18 M80 18 L66 12 M80 18 L70 30" />
    </svg>
  );
}

export function Ornament({ className = '' }) {
  return (
    <svg viewBox="0 0 200 16" className={className} aria-hidden="true">
      <g className="sketch-brass">
        <path d="M2 8 H78 M122 8 H198" />
        <path d="M100 2 l6 6 -6 6 -6 -6 z" />
        <circle cx="86" cy="8" r="2" />
        <circle cx="114" cy="8" r="2" />
      </g>
    </svg>
  );
}

// Line drawings by category, used for clearly-marked photo placeholders.
const DRAW = {
  chains: (
    <g className="sketch">
      <path d="M40 40 C40 140 160 140 160 40" strokeDasharray="1 7" strokeWidth="4" />
      <path d="M44 40 C44 134 156 134 156 40" opacity=".7" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <ellipse key={i} cx={52 + i * 16} cy={92 + Math.sin(i / 6 * Math.PI) * 28} rx="6" ry="3.5" />)}
    </g>
  ),
  necklaces: (
    <g className="sketch">
      <path d="M36 30 C36 120 164 120 164 30" />
      <path d="M52 36 C54 106 146 106 148 36" opacity=".6" />
      <path d="M100 112 l-12 -18 h24 z" />
      <circle cx="100" cy="124" r="9" />
      {[60, 74, 88, 112, 126, 140].map((x, i) => <circle key={x} cx={x} cy={90 + (i < 3 ? 6 - i * 2 : 0) + Math.abs(100 - x) * -0.0} r="3.5" />)}
    </g>
  ),
  bangles: (
    <g className="sketch">
      <ellipse cx="100" cy="100" rx="62" ry="50" />
      <ellipse cx="100" cy="100" rx="52" ry="41" />
      <ellipse cx="100" cy="100" rx="42" ry="32" opacity=".5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <path key={i} d={`M${100 + Math.cos(a) * 52} ${100 + Math.sin(a) * 41} L${100 + Math.cos(a) * 62} ${100 + Math.sin(a) * 50}`} />;
      })}
    </g>
  ),
  rings: (
    <g className="sketch">
      <circle cx="100" cy="118" r="38" />
      <circle cx="100" cy="118" r="31" />
      <path d="M86 82 L100 60 L114 82 Z" />
      <path d="M92 82 L100 70 L108 82" opacity=".6" />
    </g>
  ),
  earrings: (
    <g className="sketch">
      <path d="M70 40 v14 M130 40 v14" />
      <circle cx="70" cy="36" r="4" /><circle cx="130" cy="36" r="4" />
      <path d="M52 100 q18 -44 36 0 z M112 100 q18 -44 36 0 z" transform="translate(-0 0)" />
      <path d="M52 100 h36 M112 100 h36" />
      <path d="M58 100 v16 M70 100 v20 M82 100 v16 M118 100 v16 M130 100 v20 M142 100 v16" />
      <circle cx="58" cy="120" r="3" /><circle cx="70" cy="124" r="3" /><circle cx="82" cy="120" r="3" />
      <circle cx="118" cy="120" r="3" /><circle cx="130" cy="124" r="3" /><circle cx="142" cy="120" r="3" />
    </g>
  ),
  bridal: (
    <g className="sketch">
      <path d="M30 28 C30 120 170 120 170 28" />
      <path d="M44 34 C46 100 154 100 156 34" opacity=".6" />
      <path d="M100 100 l-14 -20 h28 z" /><circle cx="100" cy="114" r="8" />
      <path d="M100 8 v12 M94 14 h12" />
      <path d="M40 146 q10 -26 20 0 z M140 146 q10 -26 20 0 z" />
      <circle cx="100" cy="156" r="6" /><path d="M92 156 h16" />
    </g>
  ),
};

export function CategorySketch({ category, className = '' }) {
  return (
    <svg viewBox="0 0 200 180" className={className} aria-hidden="true">
      {DRAW[category] || DRAW.necklaces}
    </svg>
  );
}
