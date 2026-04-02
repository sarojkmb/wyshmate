'use client';

import Image, { StaticImageData } from 'next/image';
import { useEffect, useState } from 'react';

export type WishbookPage =
  | {
      kind: 'cover';
      title: string;
      subtitle?: string;
      image?: string | StaticImageData;
    }
  | {
      kind: 'message';
      author: string;
      wish: string;
      image?: string | StaticImageData | null;
      video?: string | null;
      dateLabel?: string;
    };

interface WishbookProps {
  accent: string;
  accentSoft: string;
  accentStrong: string;
  gradient: string;
  title: string;
  eyebrow?: string;
  pages: WishbookPage[];
  maxWidthClass?: string;
  pageIndex?: number;
  onPageChange?: (pageIndex: number) => void;
  enableSwipe?: boolean;
}

function clampPageIndex(index: number, pageCount: number) {
  if (pageCount <= 1) {
    return 0;
  }

  const maxIndex = Math.max(0, pageCount - 1);
  return Math.min(Math.max(0, index), maxIndex);
}

export default function Wishbook({
  accent,
  accentSoft,
  accentStrong,
  gradient,
  title,
  eyebrow = 'Flip Wishbook',
  pages,
  maxWidthClass = 'max-w-[660px]',
  pageIndex,
  onPageChange,
  enableSwipe = false,
}: WishbookProps) {
  const [internalPageIndex, setInternalPageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activePageIndex =
    pageIndex === undefined ? internalPageIndex : clampPageIndex(pageIndex, pages.length);
  const activePage = pages[activePageIndex] ?? pages[0];

  useEffect(() => {
    if (pageIndex === undefined) {
      setInternalPageIndex((current) => clampPageIndex(current, pages.length));
    }
  }, [pageIndex, pages.length]);

  const setPage = (nextPageIndex: number) => {
    const clamped = clampPageIndex(nextPageIndex, pages.length);

    if (pageIndex === undefined) {
      setInternalPageIndex(clamped);
    }

    onPageChange?.(clamped);
  };

  const goPrev = () => {
    setPage(activePageIndex - 1);
  };

  const goNext = () => {
    setPage(activePageIndex + 1);
  };

  return (
    <div className="relative rounded-[26px] bg-[linear-gradient(180deg,#FFFDFC_0%,#FFF7FA_100%)] p-6 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
      <div
        className="absolute bottom-6 left-6 top-6 w-[18px] rounded-full shadow-[inset_-2px_0_6px_rgba(255,255,255,0.35),0_12px_26px_rgba(156,122,138,0.14)]"
        style={{ backgroundImage: gradient }}
      />

      <div className="ml-10">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accentStrong }}>
            {eyebrow}
          </p>
          <h2 className="mt-2 text-[24px] font-semibold leading-tight text-[#2F3A3D] sm:text-[28px] lg:text-[32px]">{title}</h2>
        </div>

        <div className={`relative mx-auto ${maxWidthClass}`}>
          <button
            type="button"
            onClick={goNext}
            className="group relative block w-full rounded-[28px] border border-[rgba(47,58,61,0.05)] bg-white px-5 py-5 text-left shadow-[0_24px_40px_rgba(97,76,88,0.08)] transition duration-300 hover:-translate-y-1 focus:outline-none"
            aria-label="Flip to next page"
            onTouchStart={
              enableSwipe
                ? (event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)
                : undefined
            }
            onTouchEnd={
              enableSwipe
                ? (event) => {
                    if (touchStartX === null) {
                      return;
                    }

                    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX;
                    if (delta > 55) {
                      goPrev();
                    } else if (delta < -55) {
                      goNext();
                    }
                    setTouchStartX(null);
                  }
                : undefined
            }
          >
            <div className="absolute inset-y-0 left-0 w-8 rounded-l-[28px]" style={{ background: `linear-gradient(90deg, ${accentSoft}, rgba(255,255,255,0))` }} />
            <div className="absolute inset-y-0 right-0 w-12 rounded-r-[28px]" style={{ background: `linear-gradient(270deg, ${accentSoft}, rgba(255,255,255,0))` }} />

            {activePage.kind === 'cover' ? (
              <>
                {activePage.image ? (
                  <div className="overflow-hidden rounded-[20px] border border-[#F2DEE5] bg-[#FFF8FA]">
                    {typeof activePage.image === 'string' ? (
                      <img
                        src={activePage.image}
                        alt="Wishbook cover"
                        className="h-[280px] w-full object-contain bg-[#FFF8FA] sm:h-[360px] lg:h-[430px]"
                      />
                    ) : (
                      <Image
                        src={activePage.image}
                        alt="Wishbook cover"
                        className="h-[280px] w-full object-contain bg-[#FFF8FA] sm:h-[360px] lg:h-[430px]"
                      />
                    )}
                  </div>
                ) : (
                  <div
                    className="flex h-[25rem] flex-col justify-end overflow-hidden rounded-[20px] p-8 text-white"
                    style={{ backgroundImage: gradient }}
                  >
                    <div className="max-w-lg">
                      <h3 className="text-3xl font-semibold leading-tight sm:text-4xl">{activePage.title}</h3>
                      {activePage.subtitle ? (
                        <p className="mt-4 text-base leading-7 text-white/84">{activePage.subtitle}</p>
                      ) : null}
                    </div>
                  </div>
                )}
                {activePage.subtitle ? (
                  <p className="mt-5 text-center text-[15px] leading-7 text-[#6B7280]">
                    {activePage.subtitle}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                {activePage.image ? (
                  <div className="wishbook-photo-frame wishbook-photo-stage">
                    {typeof activePage.image === 'string' ? (
                      <img
                        src={activePage.image}
                        alt={`Wishbook page from ${activePage.author}`}
                        className="wishbook-photo wishbook-photo-contained h-[280px] w-full sm:h-[360px] lg:h-[430px]"
                      />
                    ) : (
                      <Image
                        src={activePage.image}
                        alt={`Wishbook page from ${activePage.author}`}
                        className="wishbook-photo wishbook-photo-contained h-[280px] w-full sm:h-[360px] lg:h-[430px]"
                      />
                    )}
                  </div>
                ) : activePage.video ? (
                  <div className="wishbook-photo-frame wishbook-photo-stage overflow-hidden">
                    <video
                      src={activePage.video}
                      controls
                      playsInline
                      preload="metadata"
                      className="wishbook-photo wishbook-photo-contained h-[280px] w-full bg-[#FFF8FA] sm:h-[360px] lg:h-[430px]"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-[18rem] items-center justify-center rounded-[1.6rem] text-5xl text-white"
                    style={{ backgroundImage: gradient }}
                  >
                    {title.slice(0, 1)}
                  </div>
                )}
                <div className="mt-5">
                  <div className="text-[20px] font-semibold text-[#2F3A3D] sm:text-[22px]">{activePage.author}</div>
                  <p className="mt-3 text-[16px] leading-7 text-[#6B7280] sm:text-[18px] sm:leading-8">{activePage.wish}</p>
                  {activePage.dateLabel ? (
                    <div className="mt-5 text-sm text-[#6B7280]">{activePage.dateLabel}</div>
                  ) : null}
                </div>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={goPrev}
            disabled={activePageIndex === 0}
            className="absolute left-[-0.75rem] top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[1.6rem] font-semibold shadow-[0_18px_42px_rgba(97,76,88,0.2)] transition duration-200 disabled:cursor-not-allowed disabled:opacity-35 hover:scale-105 sm:left-[-1rem] sm:h-14 sm:w-14 sm:text-[1.8rem] lg:left-[-1.5rem] lg:h-16 lg:w-16 lg:text-[2rem]"
            style={{
              borderColor: accent,
              color: accentStrong,
              background: 'rgba(255,255,255,0.98)',
            }}
            aria-label="Previous page"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={activePageIndex >= pages.length - 1}
            className="absolute right-[-0.75rem] top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[1.6rem] font-semibold shadow-[0_18px_42px_rgba(97,76,88,0.2)] transition duration-200 disabled:cursor-not-allowed disabled:opacity-35 hover:scale-105 sm:right-[-1rem] sm:h-14 sm:w-14 sm:text-[1.8rem] lg:right-[-1.5rem] lg:h-16 lg:w-16 lg:text-[2rem]"
            style={{
              borderColor: accent,
              color: accentStrong,
              background: 'rgba(255,255,255,0.98)',
            }}
            aria-label="Next page"
          >
            ›
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              className="h-2.5 rounded-full transition"
              style={{
                width: index === activePageIndex ? '2rem' : '0.625rem',
                backgroundColor: index === activePageIndex ? accent : accentSoft,
              }}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
