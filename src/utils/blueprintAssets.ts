// Deterministic SVG Data URI generator for Architectural CAD Blueprints,
// CMYK Production Proofs, and Site Installation Schematics.
// Eliminates external stock photo dependencies and provides authentic engineering visuals.

function toSvgDataUri(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const ARCHITECTURAL_ASSETS = {
  // 1. Acoustic Frosted Glass Film Elevation
  glassElevationV1: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#0f172a"/>
      <!-- Blueprint Grid -->
      <g stroke="#1e293b" stroke-width="1">
        <line x1="0" y1="50" x2="800" y2="50"/><line x1="0" y1="100" x2="800" y2="100"/>
        <line x1="0" y1="150" x2="800" y2="150"/><line x1="0" y1="200" x2="800" y2="200"/>
        <line x1="0" y1="250" x2="800" y2="250"/><line x1="0" y1="300" x2="800" y2="300"/>
        <line x1="0" y1="350" x2="800" y2="350"/><line x1="0" y1="400" x2="800" y2="400"/>
        <line x1="0" y1="450" x2="800" y2="450"/>
        <line x1="100" y1="0" x2="100" y2="500"/><line x1="200" y1="0" x2="200" y2="500"/>
        <line x1="300" y1="0" x2="300" y2="500"/><line x1="400" y1="0" x2="400" y2="500"/>
        <line x1="500" y1="0" x2="500" y2="500"/><line x1="600" y1="0" x2="600" y2="500"/>
        <line x1="700" y1="0" x2="700" y2="500"/>
      </g>
      <!-- Outer Frame -->
      <rect x="24" y="24" width="752" height="452" fill="none" stroke="#334155" stroke-width="2"/>
      <!-- Glass Partition Bays -->
      <g transform="translate(80, 75)">
        <rect x="0" y="0" width="640" height="290" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>
        <line x1="160" y1="0" x2="160" y2="290" stroke="#64748b" stroke-width="2"/>
        <line x1="320" y1="0" x2="320" y2="290" stroke="#64748b" stroke-width="2"/>
        <line x1="480" y1="0" x2="480" y2="290" stroke="#64748b" stroke-width="2"/>
        <!-- Frosted Band (1200mm H) -->
        <rect x="4" y="85" width="632" height="120" fill="#38bdf8" fill-opacity="0.16" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6,4"/>
        <!-- Geometric Acoustic Cutout Pattern -->
        <g fill="#e2e8f0" fill-opacity="0.25">
          <polygon points="30,145 60,105 90,145 60,185"/>
          <polygon points="110,145 140,105 170,145 140,185"/>
          <polygon points="190,145 220,105 250,145 220,185"/>
          <polygon points="270,145 300,105 330,145 300,185"/>
          <polygon points="350,145 380,105 410,145 380,185"/>
          <polygon points="430,145 460,105 490,145 460,185"/>
          <polygon points="510,145 540,105 570,145 540,185"/>
        </g>
        <!-- Dimension Callouts -->
        <line x1="0" y1="-18" x2="640" y2="-18" stroke="#38bdf8" stroke-width="1"/>
        <text x="320" y="-24" fill="#38bdf8" font-family="monospace" font-size="11" text-anchor="middle">OVERALL SPAN: 14,630 mm (48'-0") · 4 EQUAL BAYS</text>
        <line x1="-22" y1="0" x2="-22" y2="290" stroke="#38bdf8" stroke-width="1"/>
        <text x="-30" y="150" fill="#38bdf8" font-family="monospace" font-size="10" text-anchor="end">3048 mm</text>
      </g>
      <!-- Title Block -->
      <rect x="24" y="410" width="752" height="66" fill="#090d16" stroke="#334155" stroke-width="1.5"/>
      <text x="42" y="434" fill="#f8fafc" font-family="sans-serif" font-size="13" font-weight="bold">E9 ARCHITECTURAL GRAPHICS · CAD ELEVATION SHEET A-101</text>
      <text x="42" y="454" fill="#94a3b8" font-family="monospace" font-size="11">SUBSTRATE: 3M DUSTED CRYSTAL 7725-314 · PLOTTER CUT + WEEDING · REV 1.0</text>
      <text x="756" y="436" fill="#38bdf8" font-family="monospace" font-size="11" text-anchor="end">SCALE 1:25</text>
      <text x="756" y="454" fill="#64748b" font-family="monospace" font-size="10" text-anchor="end">TOLERANCE ±1.5mm</text>
    </svg>
  `),

  // 2. Acoustic Frosted Glass Film Elevation Rev 2 (With Pantone 2995C Gradient Band)
  glassElevationV2: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <defs>
        <linearGradient id="p2995c" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#00a3e0" stop-opacity="0.45"/>
          <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#00a3e0" stop-opacity="0.45"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="#0f172a"/>
      <g stroke="#1e293b" stroke-width="1">
        <line x1="0" y1="50" x2="800" y2="50"/><line x1="0" y1="100" x2="800" y2="100"/>
        <line x1="0" y1="150" x2="800" y2="150"/><line x1="0" y1="200" x2="800" y2="200"/>
        <line x1="0" y1="250" x2="800" y2="250"/><line x1="0" y1="300" x2="800" y2="300"/>
        <line x1="0" y1="350" x2="800" y2="350"/><line x1="0" y1="400" x2="800" y2="400"/>
        <line x1="100" y1="0" x2="100" y2="500"/><line x1="200" y1="0" x2="200" y2="500"/>
        <line x1="300" y1="0" x2="300" y2="500"/><line x1="400" y1="0" x2="400" y2="500"/>
        <line x1="500" y1="0" x2="500" y2="500"/><line x1="600" y1="0" x2="600" y2="500"/>
        <line x1="700" y1="0" x2="700" y2="500"/>
      </g>
      <rect x="24" y="24" width="752" height="452" fill="none" stroke="#334155" stroke-width="2"/>
      <!-- CMYK Registration & Color Bar -->
      <g transform="translate(80, 36)">
        <rect x="0" y="0" width="18" height="8" fill="#00aeef"/>
        <rect x="22" y="0" width="18" height="8" fill="#ec008c"/>
        <rect x="44" y="0" width="18" height="8" fill="#fff200"/>
        <rect x="66" y="0" width="18" height="8" fill="#231f20"/>
        <text x="96" y="8" fill="#94a3b8" font-family="monospace" font-size="10">PANTONE 2995 C · ECO-SOLVENT UV WHITE INK LAYER APPROVED</text>
      </g>
      <g transform="translate(80, 75)">
        <rect x="0" y="0" width="640" height="290" fill="#1e293b" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="160" y1="0" x2="160" y2="290" stroke="#94a3b8" stroke-width="2"/>
        <line x1="320" y1="0" x2="320" y2="290" stroke="#94a3b8" stroke-width="2"/>
        <line x1="480" y1="0" x2="480" y2="290" stroke="#94a3b8" stroke-width="2"/>
        <!-- Gradient Privacy Band -->
        <rect x="2" y="75" width="636" height="140" fill="url(#p2995c)" stroke="#00a3e0" stroke-width="1.5"/>
        <!-- Acoustic Micro-Perforation Wave -->
        <path d="M 10 145 Q 90 95, 170 145 T 330 145 T 490 145 T 630 145" fill="none" stroke="#f8fafc" stroke-width="2.5"/>
        <path d="M 10 165 Q 90 115, 170 165 T 330 165 T 490 165 T 630 165" fill="none" stroke="#38bdf8" stroke-width="1.5"/>
        <!-- Approval Stamp -->
        <rect x="465" y="16" width="158" height="32" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
        <text x="544" y="36" fill="#ecfdf5" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">CLIENT SIGNED · REV 2.0</text>
      </g>
      <rect x="24" y="410" width="752" height="66" fill="#090d16" stroke="#334155" stroke-width="1.5"/>
      <text x="42" y="434" fill="#f8fafc" font-family="sans-serif" font-size="13" font-weight="bold">E9 ARCHITECTURAL GRAPHICS · PRODUCTION PROOF A-101-R2</text>
      <text x="42" y="454" fill="#94a3b8" font-family="monospace" font-size="11">3M CLEAR VIEW + PANTONE 2995C GRADIENT FADE · BLEED 15mm · CROP MARKS ON</text>
      <text x="756" y="436" fill="#10b981" font-family="monospace" font-size="11" text-anchor="end">PROD READY</text>
      <text x="756" y="454" fill="#64748b" font-family="monospace" font-size="10" text-anchor="end">480.0 SQ.FT NET</text>
    </svg>
  `),

  // 3. Site Survey Plasterboard / Mullion Photo Schematic
  siteSurveyElevation: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#18181b"/>
      <!-- Architectural Wall Surface Grid -->
      <rect x="40" y="40" width="720" height="360" fill="#27272a" stroke="#52525b" stroke-width="2"/>
      <!-- Laser Level Crosshairs -->
      <line x1="40" y1="210" x2="760" y2="210" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="8,4"/>
      <line x1="400" y1="40" x2="400" y2="400" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="8,4"/>
      <!-- Measured Zone Box -->
      <rect x="110" y="85" width="580" height="250" fill="#3f3f46" fill-opacity="0.5" stroke="#fbbf24" stroke-width="2"/>
      <!-- CornerFiducials -->
      <circle cx="110" cy="85" r="5" fill="#fbbf24"/>
      <circle cx="690" cy="85" r="5" fill="#fbbf24"/>
      <circle cx="110" cy="335" r="5" fill="#fbbf24"/>
      <circle cx="690" cy="335" r="5" fill="#fbbf24"/>
      <text x="400" y="195" fill="#f4f4f5" font-family="monospace" font-size="15" font-weight="bold" text-anchor="middle">SITE SURVEY LASER CAPTURE · ZONE BAY A-D</text>
      <text x="400" y="228" fill="#fbbf24" font-family="monospace" font-size="12" text-anchor="middle">VERIFIED SUBSTRATE: TEMPERED 12mm LOW-IRON GLAZING / GYPSUM</text>
      <text x="400" y="252" fill="#a1a1aa" font-family="monospace" font-size="11" text-anchor="middle">MOISTURE: 4.2% (PASS) · LUX AMBIENT: 420 lx · PLUMB DEVIATION: 0.8mm</text>
      <!-- Footer Bar -->
      <rect x="40" y="415" width="720" height="50" fill="#09090b" stroke="#3f3f46" stroke-width="1"/>
      <text x="58" y="445" fill="#e4e4e7" font-family="monospace" font-size="11">LEICA DISTO D2 LASER TELEMETRY · E9 FIELD SURVEY RECORD</text>
      <text x="742" y="445" fill="#fbbf24" font-family="monospace" font-size="11" text-anchor="end">GEO-VERIFIED</text>
    </svg>
  `),

  // 4. Acrylic 3D LED Channel Letters Blueprint (HDFC / Retail Signage)
  ledSignageBlueprint: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#0c1322"/>
      <rect x="24" y="24" width="752" height="452" fill="none" stroke="#1e293b" stroke-width="2"/>
      <!-- ACP Fascia Backing Board -->
      <rect x="70" y="90" width="660" height="230" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
      <!-- 3D Channel Letter Structural Box -->
      <rect x="120" y="135" width="560" height="140" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
      <text x="400" y="218" fill="#f8fafc" font-family="sans-serif" font-size="36" font-weight="bold" letter-spacing="6" text-anchor="middle">CORPORATE FASCIA</text>
      <!-- LED Module Callouts -->
      <line x1="120" y1="300" x2="680" y2="300" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="400" y="316" fill="#f59e0b" font-family="monospace" font-size="11" text-anchor="middle">OSRAM IP67 6500K LED MATRIX · MEANWELL 24V WATERPROOF SMPS</text>
      <!-- Title Block -->
      <rect x="24" y="410" width="752" height="66" fill="#070b14" stroke="#334155" stroke-width="1.5"/>
      <text x="42" y="434" fill="#f8fafc" font-family="sans-serif" font-size="13" font-weight="bold">E9 STRUCTURAL SIGNAGE · 3D ACRYLIC &amp; ACP ELEVATION</text>
      <text x="42" y="454" fill="#94a3b8" font-family="monospace" font-size="11">4mm EXTERIOR ACP + 3mm CAST ACRYLIC FACE + 50mm ALUMINIUM RETURN</text>
      <text x="756" y="436" fill="#38bdf8" font-family="monospace" font-size="11" text-anchor="end">REV 1.0</text>
      <text x="756" y="454" fill="#64748b" font-family="monospace" font-size="10" text-anchor="end">WIND LOAD: 140 KM/H</text>
    </svg>
  `),

  // 5. Completed Site Installation Verification Record
  installationVerificationPhoto: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
      <rect width="800" height="500" fill="#0f172a"/>
      <rect x="30" y="30" width="740" height="370" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <!-- Installed Graphic Wall Representation -->
      <rect x="90" y="70" width="620" height="290" fill="#0f172a" stroke="#475569" stroke-width="2"/>
      <rect x="94" y="140" width="612" height="140" fill="#0284c7" fill-opacity="0.22" stroke="#38bdf8" stroke-width="1.5"/>
      <path d="M 110 210 L 230 160 L 350 230 L 470 165 L 590 225 L 690 180" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <!-- QA Checkpoints -->
      <g fill="#10b981" font-family="monospace" font-size="11">
        <circle cx="140" cy="110" r="6"/><text x="154" y="114">EDGE SEALING OK</text>
        <circle cx="400" cy="110" r="6"/><text x="414" y="114">ZERO BUBBLE QA</text>
        <circle cx="140" cy="325" r="6"/><text x="154" y="329">SILICONE PERIMETER CURED</text>
        <circle cx="450" cy="325" r="6"/><text x="464" y="329">SITE DEBRIS CLEARED</text>
      </g>
      <rect x="30" y="415" width="740" height="55" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
      <text x="50" y="440" fill="#ecfdf5" font-family="sans-serif" font-size="13" font-weight="bold">E9 SITE HANDOVER CERTIFICATE · QA INSPECTION PASSED</text>
      <text x="50" y="458" fill="#a7f3d0" font-family="monospace" font-size="10">SIGNED BY: CUSTOMER FACILITY HEAD &amp; E9 LEAD MARSHAL · WARRANTY ACTIVE</text>
      <text x="750" y="447" fill="#ecfdf5" font-family="monospace" font-size="12" font-weight="bold" text-anchor="end">100% SNAG-FREE</text>
    </svg>
  `),
};
