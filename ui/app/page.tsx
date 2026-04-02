'use client';

import Link from 'next/link';
import coverImage from '../images/cover1.png';
import wishImage1 from '../images/sample-wish1.png';
import wishImage2 from '../images/sample-wish2.png';
import wishImage3 from '../images/sample-wish3.png';
import Wishbook from './components/wishbook';

const samplePages = [
  { kind: 'cover' as const, image: coverImage, title: 'Happy Birthday John 🎉' },
  {
    kind: 'message' as const,
    image: wishImage1,
    author: 'Alice',
    wish: 'Hope this year brings you more laughter, big surprises, and people who love you loudly.',
  },
  {
    kind: 'message' as const,
    image: wishImage2,
    author: 'Mira',
    wish: 'You make birthdays feel brighter just by being in the room. Keep shining exactly like this.',
  },
  {
    kind: 'message' as const,
    image: wishImage3,
    author: 'Dev',
    wish: 'Wishing you memories worth replaying, cake worth sneaking seconds for, and a year full of joy.',
  },
];

export default function Home() {
  return (
    <div className="min-h-full bg-[#E7F3F8] text-[#1F3340]">
      <section className="px-6 pb-14 pt-14 sm:px-8 sm:pt-18">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(45,127,163,0.16)] bg-white/80 px-4 py-2 text-sm font-semibold text-[#2D7FA3] shadow-[0_10px_24px_rgba(45,127,163,0.08)]">
              <span>Group wishes made simple</span>
            </div>
            <h1 className="mt-5 max-w-[620px] text-[40px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#1F3340] sm:text-[52px] lg:text-[60px]">
              Create a group card everyone actually wants to sign.
            </h1>
            <p className="mt-5 max-w-[580px] text-[18px] leading-8 text-[#5F7380] sm:text-[20px]">
              Collect messages, photos, and videos in one cheerful wishbook, then share it as a keepsake that feels thoughtful from the very first page.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-xl bg-[#2D7FA3] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#246785]"
              >
                Start a group card
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-[rgba(45,127,163,0.18)] bg-white/86 px-6 py-3 text-base font-semibold text-[#1F3340] transition hover:bg-white"
              >
                See how it works
              </Link>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[20px] bg-white/86 p-4 shadow-[0_14px_32px_rgba(45,127,163,0.08)]">
                <div className="text-sm font-semibold text-[#1F3340]">Pick an occasion</div>
                <p className="mt-2 text-sm leading-6 text-[#5F7380]">Birthday, farewell, wedding, graduation, and more.</p>
              </div>
              <div className="rounded-[20px] bg-white/86 p-4 shadow-[0_14px_32px_rgba(45,127,163,0.08)]">
                <div className="text-sm font-semibold text-[#1F3340]">Share one link</div>
                <p className="mt-2 text-sm leading-6 text-[#5F7380]">Friends and teammates add their notes from anywhere.</p>
              </div>
              <div className="rounded-[20px] bg-white/86 p-4 shadow-[0_14px_32px_rgba(45,127,163,0.08)]">
                <div className="text-sm font-semibold text-[#1F3340]">Keep every memory</div>
                <p className="mt-2 text-sm leading-6 text-[#5F7380]">Turn wishes, photos, and videos into one digital keepsake.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-3 top-10 rounded-full bg-[#F5C867] px-4 py-2 text-sm font-semibold text-[#1F3340] shadow-[0_12px_24px_rgba(245,200,103,0.28)]">
              Add photos, videos, and wishes
            </div>
            <div className="absolute -right-2 top-28 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2D7FA3] shadow-[0_12px_24px_rgba(45,127,163,0.14)]">
              One link for everyone
            </div>
            <div className="absolute bottom-8 left-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#B9851B] shadow-[0_12px_24px_rgba(45,127,163,0.14)]">
              Beautiful keepsake delivery
            </div>
            <div className="rounded-[32px] border border-[rgba(45,127,163,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,251,253,0.98))] p-5 shadow-[0_30px_70px_rgba(45,127,163,0.12)] sm:p-7">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-[#D9EEF6] px-4 py-2 text-sm font-semibold text-[#2D7FA3]">Birthday</div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#5F7380]">Farewell</div>
                <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#5F7380]">Wedding</div>
              </div>
              <Wishbook
                accent="#2D7FA3"
                accentSoft="rgba(45, 127, 163, 0.16)"
                accentStrong="#B9851B"
                gradient="linear-gradient(180deg,#79C0DD 0%,#F5C867 100%)"
                title="Happy Birthday John 🎉"
                pages={[
                  {
                    kind: 'cover',
                    title: 'Happy Birthday John 🎉',
                    subtitle: 'Open the wishbook to see one memory on each page.',
                    image: coverImage,
                  },
                  ...samplePages.slice(1),
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-6 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-[rgba(45,127,163,0.12)] bg-white/86 px-5 py-5 shadow-[0_18px_40px_rgba(45,127,163,0.08)] sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2D7FA3]">
              Perfect for every occasion
            </p>
            <div className="flex flex-wrap gap-2 text-sm font-medium text-[#5F7380]">
              <span className="rounded-full bg-[#D9EEF6] px-4 py-2">Birthdays</span>
              <span className="rounded-full bg-[#FFF7DE] px-4 py-2">Farewells</span>
              <span className="rounded-full bg-[#D9EEF6] px-4 py-2">Work milestones</span>
              <span className="rounded-full bg-[#FFF7DE] px-4 py-2">Weddings</span>
              <span className="rounded-full bg-[#D9EEF6] px-4 py-2">Graduations</span>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-6 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2D7FA3]">How it works</p>
            <h2 className="mt-3 text-[34px] font-semibold tracking-[-0.03em] text-[#1F3340]">
              Start fast, share widely, and deliver something meaningful
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-[22px] bg-white px-5 py-5 shadow-[0_16px_36px_rgba(45,127,163,0.08)]">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#D9EEF6] text-sm font-semibold text-[#2D7FA3]">1</div>
              <h3 className="mt-4 text-lg font-semibold text-[#1F3340]">Create a board</h3>
              <p className="mt-2 text-sm leading-6 text-[#5F7380]">Pick the occasion, add the recipient, and make the board feel personal in seconds.</p>
            </article>
            <article className="rounded-[22px] bg-white px-5 py-5 shadow-[0_16px_36px_rgba(45,127,163,0.08)]">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF7DE] text-sm font-semibold text-[#B9851B]">2</div>
              <h3 className="mt-4 text-lg font-semibold text-[#1F3340]">Share the link</h3>
              <p className="mt-2 text-sm leading-6 text-[#5F7380]">Invite friends, family, and teammates with one link they can open on any device.</p>
            </article>
            <article className="rounded-[22px] bg-white px-5 py-5 shadow-[0_16px_36px_rgba(45,127,163,0.08)]">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#D9EEF6] text-sm font-semibold text-[#2D7FA3]">3</div>
              <h3 className="mt-4 text-lg font-semibold text-[#1F3340]">Collect memories</h3>
              <p className="mt-2 text-sm leading-6 text-[#5F7380]">Gather wishes, photos, and videos into a flip-style keepsake worth reopening later.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="px-6 pb-18 pt-8 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-[rgba(45,127,163,0.12)] bg-white/88 px-6 py-8 shadow-[0_24px_50px_rgba(45,127,163,0.08)] sm:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2D7FA3]">
                Why teams love it
              </p>
              <h2 className="mt-3 text-[34px] font-semibold tracking-[-0.03em] text-[#1F3340]">
                No messy group chats. No chasing people one by one.
              </h2>
              <p className="mt-4 text-base leading-8 text-[#5F7380]">
                Wyshmate keeps contribution simple, the final result polished, and the experience light enough for birthdays at work or heartfelt moments with family.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:w-[420px]">
              <div className="rounded-[22px] bg-[#D9EEF6] p-5">
                <div className="text-sm font-semibold text-[#2D7FA3]">Unlimited space</div>
                <p className="mt-2 text-sm leading-6 text-[#1F3340]">Everyone gets room to write something real.</p>
              </div>
              <div className="rounded-[22px] bg-[#FFF7DE] p-5">
                <div className="text-sm font-semibold text-[#B9851B]">Media-rich</div>
                <p className="mt-2 text-sm leading-6 text-[#1F3340]">Photos and videos make every page feel personal.</p>
              </div>
              <div className="rounded-[22px] bg-[#FFF7DE] p-5">
                <div className="text-sm font-semibold text-[#B9851B]">Easy delivery</div>
                <p className="mt-2 text-sm leading-6 text-[#1F3340]">Share publicly, admin privately, and keep an animated card too.</p>
              </div>
              <div className="rounded-[22px] bg-[#D9EEF6] p-5">
                <div className="text-sm font-semibold text-[#2D7FA3]">Made to reopen</div>
                <p className="mt-2 text-sm leading-6 text-[#1F3340]">A wishbook feels more memorable than a thread of messages.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center lg:justify-start">
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-xl bg-[#2D7FA3] px-7 py-[14px] text-base font-semibold text-white transition hover:bg-[#246785]"
            >
              Create your board
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
