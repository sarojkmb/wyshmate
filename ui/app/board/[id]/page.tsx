'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBoardTheme, getDisplayTitle } from '../../lib/board-theme';
import wordmark from '../../../logo/wyshmate-horizontal.png';

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

export default function BoardPage() {
  const { id } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoard();
    fetchMessages();
  }, [id]);

  const fetchBoard = async () => {
    try {
      const response = await fetch(`http://localhost:8080/boards/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBoard(data);
      }
    } catch (error) {
      console.error('Error fetching board:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:8080/boards/${id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setLoading(false);
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/boards/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, content }),
      });
      if (response.ok) {
        setAuthorName('');
        setContent('');
        fetchMessages();
      } else {
        alert('Failed to add message');
      }
    } catch (error) {
      alert('Error adding message');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="wyshmate-shell flex min-h-screen items-center justify-center px-6">
        <div className="wyshmate-card rounded-[2rem] px-8 py-10 text-center">
          <Image src={wordmark} alt="Wyshmate" className="mx-auto mb-5 h-auto w-[180px]" />
          <p className="text-lg font-semibold text-[var(--foreground)]">Loading your board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="wyshmate-shell flex min-h-screen items-center justify-center px-6">
        <div className="wyshmate-card max-w-lg rounded-[2rem] px-8 py-10 text-center">
          <Image src={wordmark} alt="Wyshmate" className="mx-auto mb-5 h-auto w-[180px]" />
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Board not found</h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            This board may have been removed or the link may be incomplete.
          </p>
        </div>
      </div>
    );
  }

  const theme = getBoardTheme(board.occasion);
  const displayTitle = getDisplayTitle(board.title, board.occasion, board.recipientName);

  return (
    <div className="wyshmate-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8" style={theme.shellStyle}>
      <div className="mx-auto max-w-6xl">
        <header
          className="mb-8 overflow-hidden rounded-[2rem] border border-white/30 px-6 py-8 text-white sm:px-8 lg:px-10"
          style={{ backgroundImage: theme.heroGradient, boxShadow: theme.heroShadow }}
        >
          <Image
            src={wordmark}
            alt="Wyshmate"
            priority
            className="mb-6 h-auto w-[180px] brightness-[1.12] contrast-[1.02]"
          />
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">
              {theme.heroLabel}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              {displayTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/82">
              Invite friends, family, and teammates to leave thoughtful notes for{' '}
              <span className="font-semibold text-white">{board.recipientName}</span>.
            </p>
            <div
              className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.22)' }}
            >
              <span>{theme.emoji}</span>
              <span>{theme.description}</span>
            </div>
          </div>
        </header>

        <div className="mb-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="wyshmate-card rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accentStrong }}>
              Share
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Share this board
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              Send the public link below so everyone can contribute a message.
            </p>
            <div className="mt-5 rounded-3xl border border-[var(--border-soft)] bg-white/95 p-4 shadow-sm">
              <div className="text-sm font-semibold text-[var(--foreground)]">Public link</div>
              <p className="mt-2 break-all font-mono text-sm leading-7 text-[var(--primary-deep)]">
                {window.location.href}
              </p>
            </div>
            <button
              onClick={copyLink}
              className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition"
              style={{ backgroundColor: theme.accent, boxShadow: `0 14px 30px ${theme.accentSoft}` }}
            >
              Copy Link
            </button>
          </section>

          <section className="wyshmate-card rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accentStrong }}>
              Contribute
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Add a wish
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              Leave something warm, funny, or memorable for the person being celebrated.
            </p>
            <form onSubmit={handleAddMessage} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                  Your Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[var(--border-soft)] bg-white/95 px-4 text-base text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(141,119,185,0.16)]"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                  Message
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-36 w-full rounded-2xl border border-[var(--border-soft)] bg-white/95 px-4 py-3 text-base text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(141,119,185,0.16)]"
                  rows={5}
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold text-white transition"
                style={{ backgroundColor: theme.accent, boxShadow: `0 18px 35px ${theme.accentSoft}` }}
              >
                Submit Wish
              </button>
            </form>
          </section>
        </div>

        <section className="wyshmate-card rounded-[2rem] p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accentStrong }}>
                Messages
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Wishes</h2>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {messages.length} {messages.length === 1 ? 'wish' : 'wishes'} collected
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-[var(--border-soft)] bg-white/70 px-6 py-10 text-center">
              <p className="text-lg font-semibold text-[var(--foreground)]">
                No wishes yet.
              </p>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                Be the first to add a kind note and start the celebration.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className="rounded-[1.75rem] border border-[var(--border-soft)] bg-white/92 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-[var(--foreground)]">
                        {message.authorName}
                      </div>
                      <div className="mt-1 text-sm text-[var(--muted)]">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div
                      className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{ backgroundColor: theme.accentSoft, color: theme.accentStrong }}
                    >
                      {theme.name}
                    </div>
                  </div>
                  <p className="mt-4 text-base leading-7 text-[var(--foreground)]">
                    {message.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
