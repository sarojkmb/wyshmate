'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBoardTheme, getDisplayTitle } from '../../../lib/board-theme';
import wordmark from '../../../../logo/wyshmate-horizontal.png';

interface Board {
  id: string;
  title: string;
  occasion: string;
  recipientName: string;
}

interface Message {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function AnimatedECardPage() {
  const { id } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [boardResponse, messagesResponse] = await Promise.all([
          fetch(`http://localhost:8080/boards/${id}`),
          fetch(`http://localhost:8080/boards/${id}/messages`),
        ]);

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
        setBoard(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="wyshmate-shell flex min-h-screen items-center justify-center px-6">
        <div className="wyshmate-card rounded-[2rem] px-8 py-10 text-center">
          <Image src={wordmark} alt="Wyshmate" className="mx-auto mb-5 h-auto w-[180px]" />
          <p className="text-lg font-semibold text-[var(--foreground)]">Preparing animated e-card...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="wyshmate-shell flex min-h-screen items-center justify-center px-6">
        <div className="wyshmate-card max-w-lg rounded-[2rem] px-8 py-10 text-center">
          <Image src={wordmark} alt="Wyshmate" className="mx-auto mb-5 h-auto w-[180px]" />
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">E-card not available</h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            This animated card could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  const theme = getBoardTheme(board.occasion);
  const displayTitle = getDisplayTitle(board.title, board.occasion, board.recipientName);
  const spotlightMessages = messages.length
    ? messages.slice(0, 6)
    : [{
        id: 'placeholder',
        authorName: 'Your guests',
        content: 'Share this animated e-card link so everyone can enjoy the celebration as messages arrive.',
        createdAt: new Date().toISOString(),
      }];

  return (
    <div className="wyshmate-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8" style={theme.shellStyle}>
      <div className="mx-auto max-w-5xl">
        <section
          className="relative overflow-hidden rounded-[2.2rem] border border-white/35 px-6 py-8 text-white shadow-[0_28px_80px_rgba(0,0,0,0.12)] sm:px-8 lg:px-10"
          style={{ backgroundImage: theme.heroGradient, boxShadow: theme.heroShadow }}
        >
          <div className="ecard-glow ecard-glow-left" />
          <div className="ecard-glow ecard-glow-right" />

          <Image
            src={wordmark}
            alt="Wyshmate"
            priority
            className="relative z-10 mb-6 h-auto w-[180px] brightness-[1.12] contrast-[1.02]"
          />

          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/72">
              Animated {theme.heroLabel.toLowerCase()}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">
              {displayTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/84 sm:text-lg">
              A shareable animated keepsake for {board.recipientName}. Open it, pass it around, and let the wishes set the mood.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium">
              <span>{theme.emoji}</span>
              <span>{messages.length} {messages.length === 1 ? 'wish' : 'wishes'} collected</span>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {spotlightMessages.map((message, index) => (
            <article
              key={message.id}
              className="wyshmate-card ecard-message relative rounded-[1.9rem] p-6"
              style={{ animationDelay: `${index * 0.18}s` }}
            >
              <div
                className="mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ backgroundColor: theme.accentSoft, color: theme.accentStrong }}
              >
                {theme.name}
              </div>
              <p className="text-lg leading-8 text-[var(--foreground)]">{message.content}</p>
              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-[var(--foreground)]">{message.authorName}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="ecard-pulse" style={{ backgroundColor: theme.accent }} />
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
