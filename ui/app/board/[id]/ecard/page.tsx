'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Wishbook, { WishbookPage } from '../../../components/wishbook';
import { getBoardTheme, getDisplayTitle } from '../../../lib/board-theme';
import logo from '../../../../logo/wishmate-logo.png';

interface Board {
  id: string;
  title: string;
  occasion: string;
  theme: string;
  recipientName: string;
}

interface Message {
  id: string;
  authorName: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
}

export default function AnimatedECardPage() {
  const { id } = useParams();
  const boardId = Array.isArray(id) ? id[0] : id;
  const [board, setBoard] = useState<Board | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (!boardId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const [boardResponse, messagesResponse] = await Promise.all([
          fetch(`http://localhost:8080/boards/${boardId}`),
          fetch(`http://localhost:8080/boards/${boardId}/messages`),
        ]);

        if (cancelled) {
          return;
        }

        if (boardResponse.ok) {
          setBoard(await boardResponse.json());
        } else {
          setBoard(null);
        }

        if (messagesResponse.ok) {
          setMessages(await messagesResponse.json());
        }
      } catch (error) {
        console.error('Error loading animated e-card:', error);
        if (!cancelled) {
          setBoard(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [boardId]);

  const storyPages = useMemo(
    () =>
      messages.length
        ? messages
        : [{
            id: 'placeholder',
            authorName: 'Your guests',
            content: 'Share this animated e-card link so everyone can enjoy the celebration as messages arrive.',
            videoUrl: null,
            createdAt: new Date().toISOString(),
          }],
    [messages],
  );

  const occasion = board?.occasion ?? 'Celebration';
  const themeKey = board?.theme ?? 'golden-glow';
  const recipientName = board?.recipientName ?? 'someone special';
  const title = board?.title ?? '';
  const theme = getBoardTheme(themeKey, occasion);
  const displayTitle = getDisplayTitle(title, themeKey, occasion, recipientName);
  const wishbookPages = useMemo<WishbookPage[]>(
    () => [
      {
        kind: 'cover',
        title: displayTitle,
        subtitle: `A shareable keepsake for ${recipientName}. Open the cover and flip through every wish one page at a time.`,
      },
      ...storyPages.map((message) => ({
        kind: 'message' as const,
        author: message.authorName,
        wish: message.content,
        image: message.imageUrl ?? null,
        video: message.videoUrl ?? null,
        dateLabel: new Date(message.createdAt).toLocaleDateString(),
      })),
    ],
    [displayTitle, recipientName, storyPages],
  );
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < wishbookPages.length - 1;

  useEffect(() => {
    if (wishbookPages.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setIsFlipping(true);
      window.setTimeout(() => {
        setCurrentPage((page) => (page + 1) % wishbookPages.length);
        setIsFlipping(false);
      }, 260);
    }, 4800);

    return () => {
      window.clearInterval(interval);
    };
  }, [wishbookPages.length]);

  if (loading) {
    return (
      <div className="wyshmate-shell flex min-h-screen items-center justify-center px-6">
        <div className="wyshmate-card rounded-[2rem] px-8 py-10 text-center">
          <Image src={logo} alt="Wyshmate" className="mx-auto mb-5 h-auto w-20 rounded-3xl" />
          <p className="text-lg font-semibold text-[var(--foreground)]">Preparing animated e-card...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="wyshmate-shell flex min-h-screen items-center justify-center px-6">
        <div className="wyshmate-card max-w-lg rounded-[2rem] px-8 py-10 text-center">
          <Image src={logo} alt="Wyshmate" className="mx-auto mb-5 h-auto w-20 rounded-3xl" />
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">E-card not available</h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            This animated card could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const flipTo = (direction: 'prev' | 'next') => {
    setIsFlipping(true);
    window.setTimeout(() => {
      setCurrentPage((page) => {
        if (direction === 'prev') {
          return Math.max(0, page - 1);
        }

        return Math.min(wishbookPages.length - 1, page + 1);
      });
      setIsFlipping(false);
    }, 240);
  };

  return (
    <div className="wyshmate-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8" style={theme.shellStyle}>
      <div className="mx-auto max-w-5xl">
        <section
          className="relative overflow-hidden rounded-[2.2rem] border border-white/35 px-6 py-8 text-white shadow-[0_28px_80px_rgba(0,0,0,0.12)] sm:px-8 lg:px-10"
          style={{ backgroundImage: theme.heroGradient, boxShadow: theme.heroShadow }}
        >
          <div className="ecard-glow ecard-glow-left" />
          <div className="ecard-glow ecard-glow-right" />

          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/72">
              Animated {theme.heroLabel.toLowerCase()}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
              {displayTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/84 sm:text-lg">
              A shareable slam-book style keepsake for {recipientName}. Each page flips through the wishes like a living scrapbook.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium">
              <span>{theme.emoji}</span>
              <span>{messages.length} {messages.length === 1 ? 'wish' : 'wishes'} collected</span>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accentStrong }}>
                Slam Book
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Flip through every page</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => flipTo('prev')}
                className="inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
                style={{ borderColor: theme.accentSoft, color: theme.accentStrong }}
              >
                ←
              </button>
              <div className="text-sm font-medium text-[var(--muted)]">
                Page {currentPage + 1} of {wishbookPages.length}
              </div>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => flipTo('next')}
                className="inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
                style={{ borderColor: theme.accentSoft, color: theme.accentStrong }}
              >
                →
              </button>
            </div>
          </div>

          <div className={`transition duration-300 ${isFlipping ? 'scale-[0.992] opacity-95' : 'scale-100 opacity-100'}`}>
            <Wishbook
              accent={theme.accent}
              accentSoft={theme.accentSoft}
              accentStrong={theme.accentStrong}
              gradient={theme.heroGradient}
              title={displayTitle}
              maxWidthClass="max-w-3xl"
              pages={wishbookPages}
              pageIndex={currentPage}
              onPageChange={setCurrentPage}
              enableSwipe
            />
          </div>
        </section>
      </div>
    </div>
  );
}
