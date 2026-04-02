import Link from 'next/link';

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.2-1.5 1.5-1.5H16V5.1c-.4-.1-1.3-.1-2.3-.1-2.2 0-3.7 1.3-3.7 3.9V11H7.5v3H10v7h3.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9Zm9.3 1.35a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 7.35A4.65 4.65 0 1 1 7.35 12 4.66 4.66 0 0 1 12 7.35Zm0 1.8A2.85 2.85 0 1 0 14.85 12 2.85 2.85 0 0 0 12 9.15Z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M18.9 4.5h2.7l-5.9 6.7L22.6 20h-5.4l-4.2-5.5L8.2 20H5.5l6.3-7.2L5.2 4.5h5.5l3.8 5 4.4-5Zm-.9 13.9h1.5L9.8 6h-1.6l9.8 12.4Z" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(31,51,64,0.08)] bg-[#E7F3F8]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_0.7fr_0.7fr] lg:px-8">
        <div>
          <p className="text-[24px] font-semibold tracking-[-0.03em] text-[#1F3340]">Wyshmate</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-[#5F7380]">
            Create a group card, collect heartfelt wishes, and turn messages, photos, and videos into a keepsake people will want to revisit.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2D7FA3]">Explore</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#1F3340]">
            <Link href="/" className="transition hover:opacity-70">Home</Link>
            <Link href="/create" className="transition hover:opacity-70">Create</Link>
            <Link href="/#how-it-works" className="transition hover:opacity-70">How it works</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2D7FA3]">Contact</p>
          <div className="mt-4 flex flex-col gap-4 text-sm text-[#1F3340]">
            <a href="mailto:wyshmate@gmail.com" className="transition hover:opacity-70">
              wyshmate@gmail.com
            </a>
            <div className="flex items-center gap-3 text-[#2D7FA3]">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(45,127,163,0.18)] bg-white/90 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(45,127,163,0.14)]"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(45,127,163,0.18)] bg-white/90 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(45,127,163,0.14)]"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(45,127,163,0.18)] bg-white/90 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(45,127,163,0.14)]"
              >
                <TwitterIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
