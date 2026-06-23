import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
  features: string[];
}

const AuthBrandPanel: React.FC<Props> = ({ title, subtitle, features }) => (
  <div className="auth-brand-panel">
    <div className="auth-glow-a" />
    <div className="auth-glow-b" />

    {/* Logo */}
    <div className="auth-brand-top">
      <img src="https://res.cloudinary.com/dw9kvnkkz/image/upload/v1782212001/full_logo_gtiszq.png"
        alt="SprintFlow" style={{ height: 40, objectFit: 'contain' }} />
    </div>

    {/* Hero copy */}
    <div className="auth-brand-content">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <ul className="auth-feature-list">
        {features.map((f) => (
          <li key={f}><CheckCircle2 size={17} />{f}</li>
        ))}
      </ul>
    </div>

    <span className="auth-brand-foot">© {new Date().getFullYear()} SprintFlow — Enterprise Scrum &amp; Workforce</span>

    {/* Decorative SVG: abstract sprint board with glassmorphic task cards */}
    <svg className="auth-illustration" viewBox="0 0 440 460" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Sprint track curve */}
      <path
        d="M24 420 C 100 380, 110 280, 180 248 C 240 220, 256 140, 326 108 C 372 88, 398 62, 422 36"
        stroke="rgba(255,255,255,.28)" strokeWidth="1.5" strokeDasharray="3 8" strokeLinecap="round"
      />

      {/* Milestone dots */}
      <circle cx="24"  cy="420" r="5" fill="#fff" opacity=".9" />
      <circle cx="180" cy="248" r="5" fill="#fff" opacity=".9" />
      <circle cx="326" cy="108" r="6" fill="none" stroke="#fff" strokeWidth="2" opacity=".9" />
      <circle cx="422" cy="36"  r="4" fill="rgba(255,255,255,.5)" />

      {/* Board columns (faint) */}
      <rect x="52"  y="50" width="78" height="200" rx="10" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)" />
      <rect x="144" y="50" width="78" height="200" rx="10" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)" />
      <rect x="236" y="50" width="78" height="200" rx="10" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)" />

      {/* Column labels */}
      <rect x="64"  y="62" width="54" height="8" rx="4" fill="rgba(255,255,255,.28)" />
      <rect x="156" y="62" width="54" height="8" rx="4" fill="rgba(255,255,255,.28)" />
      <rect x="248" y="62" width="54" height="8" rx="4" fill="rgba(255,255,255,.28)" />

      {/* Floating glass task card — large */}
      <g transform="rotate(-4 260 310)">
        <rect x="215" y="285" width="108" height="54" rx="12" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.28)" />
        <rect x="229" y="298" width="56" height="7" rx="3.5" fill="rgba(255,255,255,.55)" />
        <rect x="229" y="312" width="38" height="7" rx="3.5" fill="rgba(255,255,255,.35)" />
        <circle cx="305" cy="302" r="5" fill="rgba(255,255,255,.4)" />
      </g>

      {/* Floating glass task card — small */}
      <g transform="rotate(5 96 160)">
        <rect x="56"  y="138" width="90" height="46" rx="10" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.2)" />
        <rect x="68"  y="150" width="46" height="6" rx="3" fill="rgba(255,255,255,.48)" />
        <rect x="68"  y="163" width="30" height="6" rx="3" fill="rgba(255,255,255,.3)" />
      </g>

      {/* Sprint progress bar pill */}
      <g transform="rotate(-2 300 380)">
        <rect x="250" y="368" width="116" height="26" rx="13" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.24)" />
        <rect x="256" y="374" width="70" height="14" rx="7" fill="rgba(255,255,255,.45)" />
        <rect x="330" y="377" width="28" height="8" rx="4" fill="rgba(255,255,255,.22)" />
      </g>
    </svg>
  </div>
);

export default AuthBrandPanel;
