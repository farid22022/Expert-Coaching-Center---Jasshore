export default function AnimatedBookIllustration({ className = "" }) {
  return (
    <svg className={`animated-book-illustration ${className}`} viewBox="0 0 280 190" role="img" aria-label="An open book with gently turning pages" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="book-cover" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f4d35e"/><stop offset="1" stopColor="#d5a92c"/></linearGradient>
        <linearGradient id="book-pages" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#edf5ee"/></linearGradient>
        <linearGradient id="book-spine" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#125b40"/><stop offset="1" stopColor="#27825b"/></linearGradient>
        <filter id="book-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#154b35" floodOpacity=".2"/></filter>
      </defs>
      <ellipse cx="140" cy="160" rx="91" ry="13" fill="#0f7a55" opacity=".1" className="animated-book-shadow"/>
      <g className="animated-book-float" filter="url(#book-shadow)">
        <path d="M48 60Q91 39 137 61V145Q91 124 48 145Z" fill="url(#book-cover)" stroke="#b88e22" strokeWidth="2"/>
        <path d="M137 61Q184 39 232 60V145Q184 124 137 145Z" fill="url(#book-cover)" stroke="#b88e22" strokeWidth="2"/>
        <path d="M55 57Q94 39 133 59V137Q94 119 55 138Z" fill="url(#book-pages)" stroke="#d6e6d9" strokeWidth="2"/>
        <path d="M141 59Q180 39 225 57V138Q181 120 141 137Z" fill="url(#book-pages)" stroke="#d6e6d9" strokeWidth="2"/>
        <path d="M137 59V145" stroke="url(#book-spine)" strokeWidth="7" strokeLinecap="round"/>
        <path d="M72 78Q101 70 120 78M72 91Q101 83 120 91M72 104Q101 96 120 104" fill="none" stroke="#75ad87" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
        <path d="M155 78Q184 70 207 77M155 91Q184 83 207 90M155 104Q184 96 207 103" fill="none" stroke="#75ad87" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
        <path className="animated-book-page" d="M141 59Q181 39 222 57V136Q181 118 141 137Z" fill="#fffdf2" stroke="#d6e6d9" strokeWidth="1.5"/>
        <path d="M156 78Q183 70 204 77M156 91Q183 83 204 90M156 104Q183 96 204 103" fill="none" stroke="#94bd9c" strokeWidth="2" strokeLinecap="round" opacity=".75"/>
      </g>
      <path d="M211 36l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#f4d35e" className="animated-book-spark"/>
      <circle cx="56" cy="48" r="4" fill="#5fa979" className="animated-book-dot"/>
    </svg>
  );
}
