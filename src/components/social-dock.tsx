type SocialDockProps = {
  className?: string;
};

function WhatsAppGlyph() {
  return (
    <svg className="dock-glyph dock-glyph-stroke" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.5 11.7a8.45 8.45 0 0 1-12.5 7.4L4 20l.9-3.8a8.45 8.45 0 1 1 15.6-4.5Z" />
      <path d="M9 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2.1.4 0 .5l-.5.7c-.2.2-.2.4 0 .6a7 7 0 0 0 1.3 1.4c.5.4 1 .7 1.6.9.2.1.4.1.5-.1l.8-.9c.2-.2.4-.2.7-.1l1.5.7c.3.1.4.3.4.5 0 .5-.3 1.3-.8 1.7-.5.5-1.2.7-2 .6-.9-.1-2.1-.6-3.4-1.5a12.7 12.7 0 0 1-3.5-3.8c-.6-1-.9-1.8-.9-2.5 0-.8.4-1.4.8-1.8Z" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg className="dock-glyph dock-glyph-stroke" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.7" className="dock-glyph-dot" />
    </svg>
  );
}

function TikTokGlyph() {
  return (
    <svg className="dock-glyph dock-glyph-solid dock-glyph-tiktok" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg className="dock-glyph dock-glyph-solid" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2C16.7 2.1 15.7 2 14.6 2 12.2 2 10.5 3.5 10.5 6.2v2.3H8v3.6h2.5V22H14v-9.9h2.6l.4-3.6H14Z" />
    </svg>
  );
}

export default function SocialDock({ className = "" }: SocialDockProps) {
  const items = [
    { key: "whatsapp", label: "WhatsApp", aria: "Chat with SYS Solutions on WhatsApp", href: "/connect/whatsapp", glyph: <WhatsAppGlyph /> },
    { key: "instagram", label: "Instagram", aria: "Follow SYS Solutions on Instagram", href: "/connect/instagram", glyph: <InstagramGlyph /> },
    { key: "tiktok", label: "TikTok", aria: "Watch SYS Solutions on TikTok", href: "/connect/tiktok", glyph: <TikTokGlyph /> },
    { key: "facebook", label: "Facebook", aria: "Follow SYS Solutions on Facebook", href: "/connect/facebook", glyph: <FacebookGlyph /> },
  ];

  return (
    <nav className={`social-dock ${className}`.trim()} aria-label="Chat and follow SYS Solutions">
      {items.map((item) => (
        <a
          key={item.key}
          className={`dock-item dock-item-${item.key}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.aria}
        >
          {item.glyph}
          <span className="dock-label" aria-hidden="true">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
