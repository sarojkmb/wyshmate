'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBoardTheme, getDisplayTitle } from '../../../lib/board-theme';
import logo from '../../../../logo/wyshmate-logo.png';

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
            createdAt: new Date().toISOString(),
          }],
    [messages],
  );

  useEffect(() => {
    if (storyPages.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setIsFlipping(true);
      window.setTimeout(() => {
        setCurrentPage((page) => (page + 1) % storyPages.length);
        setIsFlipping(false);
      }, 260);
    }, 4800);

    return () => {
      window.clearInterval(interval);
    };
  }, [storyPages.length]);

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

  const theme = getBoardTheme(board.theme, board.occasion);
  const displayTitle = getDisplayTitle(board.title, board.theme, board.occasion, board.recipientName);
  const activeMessage = storyPages[currentPage] ?? storyPages[0];
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < storyPages.length - 1;

  const flipTo = (direction: 'prev' | 'next') => {
    setIsFlipping(true);
    window.setTimeout(() => {
      setCurrentPage((page) => {
        if (direction === 'prev') {
          return Math.max(0, page - 1);
        }

        return Math.min(storyPages.length - 1, page + 1);
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
              A shareable slam-book style keepsake for {board.recipientName}. Each page flips through the wishes like a living scrapbook.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium">
              <span>{theme.emoji}</span>
              <span>{storyPages.length} {storyPages.length === 1 ? 'wish' : 'wishes'} collected</span>
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
                Previous
              </button>
              <div className="text-sm font-medium text-[var(--muted)]">
                Page {currentPage + 1} of {storyPages.length}
              </div>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => flipTo('next')}
                className="inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
                style={{ borderColor: theme.accentSoft, color: theme.accentStrong }}
              >
                Next
              </button>
            </div>
          </div>

          <div className="ecard-book-shell wyshmate-card rounded-[2.2rem] p-4 sm:p-6">
            <div className="ecard-book-spine" style={{ background: theme.heroGradient }} />
            <article className={`ecard-book-page ${isFlipping ? 'ecard-book-page-flipping' : ''}`}>
              <div className="ecard-book-paper">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: theme.accentStrong }}>
                      {board.occasion}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{activeMessage.authorName}</h3>
                  </div>
                  <div
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{ backgroundColor: theme.accentSoft, color: theme.accentStrong }}
                  >
                    {theme.name}
                  </div>
                </div>

                {activeMessage.imageUrl ? (
                  <div className="wishbook-photo-frame mt-6">
                    <img
                      src={activeMessage.imageUrl}
                      alt={`Memory shared by ${activeMessage.authorName}`}
                      className="wishbook-photo ecard-book-photo"
                    />
                  </div>
                ) : (
                  <div className="ecard-book-photo-placeholder mt-6" style={{ backgroundImage: theme.heroGradient }}>
                    <span className="text-4xl">{theme.emoji}</span>
                    <span>Memory page</span>
                  </div>
                )}

                <blockquote className="mt-6 text-lg leading-8 text-[var(--foreground)] sm:text-xl">
                  “{activeMessage.content}”
                </blockquote>

                <div className="mt-8 flex items-center justify-between gap-4 text-sm text-[var(--muted)]">
                  <span>— {activeMessage.authorName}</span>
                  <span>{new Date(activeMessage.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
