type LogoProps = {
  /** inline: mark tile + wordmark for light backgrounds. chip: compact glass badge for dark photography. */
  variant?: "inline" | "chip";
  className?: string;
};

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true" focusable="false">
      <path d="M90 64V33L50 9 10 33v12" stroke="#38e8de" strokeWidth="7" strokeLinejoin="miter" />
      <path d="M76 37 50 22 28 35v15h44v15L50 78 24 63" stroke="#ffffff" strokeWidth="7" strokeLinejoin="miter" />
    </svg>
  );
}

export function Logo({ variant = "inline", className = "" }: LogoProps) {
  if (variant === "chip") {
    return (
      <span className={`logo-chip ${className}`.trim()}>
        <LogoMark className="logo-chip-mark" />
        <span className="logo-word logo-word-dark"><b>SYS</b> <i>Solutions.</i></span>
      </span>
    );
  }

  return (
    <span className={`logo-inline ${className}`.trim()}>
      <span className="logo-tile"><LogoMark /></span>
      <span className="logo-word"><b>SYS</b> <i>Solutions.</i></span>
    </span>
  );
}
