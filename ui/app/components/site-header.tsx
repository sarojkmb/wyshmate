import Image from 'next/image';
import Link from 'next/link';
import logo from '../../logo/wishmate-logo.png';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(31,51,64,0.08)] bg-[#E7F3F8]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link href="/" className="inline-flex min-w-0 items-center gap-3">
          <Image
            src={logo}
            alt="Wyshmate"
            priority
            className="h-12 w-12 rounded-[18px] object-cover shadow-[0_14px_30px_rgba(0,0,0,0.08)] sm:h-14 sm:w-14 lg:h-16 lg:w-16"
          />
          <span className="truncate text-[24px] font-semibold tracking-[-0.03em] text-[#1F3340] sm:text-[28px] lg:text-[34px]">Wyshmate</span>
        </Link>
        <nav className="ml-auto flex items-center gap-3 text-sm font-medium text-[#1F3340] sm:gap-5">
          <Link href="/#how-it-works" className="transition hover:opacity-70 whitespace-nowrap">
            How it works
          </Link>
          <Link
            href="/create"
            className="inline-flex items-center justify-center rounded-xl bg-[#2D7FA3] px-3 py-2 text-white transition hover:bg-[#246785] sm:px-4"
          >
            Create
          </Link>
        </nav>
      </div>
    </header>
  );
}
