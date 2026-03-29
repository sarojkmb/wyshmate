import Image from 'next/image';
import Link from 'next/link';
import logo from '../../logo/wyshmate-logo.png';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-[rgba(255,255,255,0.72)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/create" className="inline-flex items-center gap-3">
          <Image
            src={logo}
            alt="Wyshmate"
            priority
            className="h-12 w-12 rounded-2xl object-cover shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
          />
          <div>
            <div className="text-lg font-semibold text-[var(--foreground)]">Wyshmate</div>
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">Wishbook Studio</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
