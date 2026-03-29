'use client';

import { useMemo, useState } from 'react';
import { getPromptsForOccasion } from '../../prompts';
import { getBoardTheme, getDisplayTitle } from '../../lib/board-theme';

export interface Board {
  id: string;
  title: string;
  occasion: string;
  theme: string;
  recipientName: string;
}

export interface Message {
  id: string;
  authorName: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
}

interface BoardClientProps {
  board: Board;
  initialMessages: Message[];
}

function clampPageIndex(index: number, messageCount: number) {
  if (messageCount <= 1) {
    return 0;
  }

  const maxIndex = Math.max(0, messageCount - 1);
  return Math.min(Math.max(0, index), maxIndex);
}

export default function BoardClient({ board, initialMessages }: BoardClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPrompts, setShowPrompts] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const theme = getBoardTheme(board.theme, board.occasion);
  const displayTitle = getDisplayTitle(board.title, board.theme, board.occasion, board.recipientName);
  const prompts = useMemo(() => getPromptsForOccasion(board.occasion), [board.occasion]);
  const leftPage = messages[currentPage] ?? null;
  const rightPage = messages[currentPage + 1] ?? null;
  const publicPath = `/board/${board.id}`;

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback('');

    try {
      const formData = new FormData();
      formData.append('author_name', authorName);
      formData.append('content', content);

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`http://localhost:8080/boards/${board.id}/messages`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add message');
      }

      const createdMessage = (await response.json()) as Message;
      const nextMessages = [...messages, createdMessage];

      setMessages(nextMessages);
      setAuthorName('');
      setContent('');
      setSelectedImage(null);
      setFeedback(selectedImage ? 'Wish and photo added to the book.' : 'Wish added to the book.');
      setCurrentPage(clampPageIndex(nextMessages.length - 1, nextMessages.length));
    } catch {
      setFeedback('We could not add this wish right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setFeedback('Public link copied to clipboard.');
  };

  const goPrev = () => {
    setCurrentPage((page) => clampPageIndex(page - 1, messages.length));
  };

  const goNext = () => {
    setCurrentPage((page) => clampPageIndex(page + 1, messages.length));
  };

  const handlePromptClick = (prompt: string) => {
    setContent(prompt);
    setShowPrompts(false);
  };

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX === null) {
      return;
    }

    const delta = clientX - touchStartX;
    if (delta > 55) {
      goPrev();
    } else if (delta < -55) {
      goNext();
    }
    setTouchStartX(null);
  };

  return (
    <div className="wyshmate-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8" style={theme.shellStyle}>
      <div className="mx-auto max-w-6xl">
        <header
          className="mb-8 overflow-hidden rounded-[2rem] border border-white/30 px-6 py-8 text-white sm:px-8 lg:px-10"
          style={{ backgroundImage: theme.heroGradient, boxShadow: theme.heroShadow }}
        >
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
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.22)' }}
              >
                <span>{theme.emoji}</span>
                <span>{theme.description}</span>
              </div>
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.22)' }}
              >
                <span>{messages.length}</span>
                <span>{messages.length === 1 ? 'wish in the book' : 'wishes in the book'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="wyshmate-card rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accentStrong }}>
              Contribute
            </p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">Add a wish</h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-[var(--muted)]">
                  Add a heartfelt note and, if you want, include a photo that belongs in the memory book.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrompts((value) => !value)}
                className="inline-flex shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition"
                style={{
                  borderColor: theme.accentSoft,
                  backgroundColor: showPrompts ? theme.accentSoft : 'rgba(255,255,255,0.72)',
                  color: theme.accentStrong,
                }}
              >
                Need help writing?
              </button>
            </div>

            {showPrompts ? (
              <div className="mt-5 rounded-[1.5rem] border border-[var(--border-soft)] bg-white/78 p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">Try one of these starters</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePromptClick(prompt)}
                      className="rounded-full border px-4 py-2 text-left text-sm leading-6 transition"
                      style={{
                        borderColor: theme.accentSoft,
                        backgroundColor: 'white',
                        color: 'var(--foreground)',
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form onSubmit={handleAddMessage} className="mt-6 space-y-5" encType="multipart/form-data">
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
                  placeholder="Write your wish here..."
                  className="min-h-36 w-full rounded-2xl border border-[var(--border-soft)] bg-white/95 px-4 py-3 text-base text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(141,119,185,0.16)]"
                  rows={5}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                  Photo (Optional)
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-[var(--border-soft)] bg-white/80 px-4 py-4 text-sm text-[var(--muted)] transition hover:bg-white">
                  <span className="truncate pr-4">
                    {selectedImage ? selectedImage.name : 'Choose a memory photo to include on the page'}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 font-semibold"
                    style={{ backgroundColor: theme.accentSoft, color: theme.accentStrong }}
                  >
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setSelectedImage(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ backgroundColor: theme.accent, boxShadow: `0 18px 35px ${theme.accentSoft}` }}
                >
                  {isSubmitting ? 'Adding...' : 'Submit Wish'}
                </button>
                {feedback ? (
                  <p className="text-sm font-medium" style={{ color: theme.accentStrong }}>
                    {feedback}
                  </p>
                ) : null}
              </div>
            </form>
          </section>

          <section className="wyshmate-card rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accentStrong }}>
              Share
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Share this board</h2>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              Copy the public link and invite everyone to add their own page to the book.
            </p>
            <div className="mt-5 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/92 p-5 shadow-sm">
              <p className="text-sm font-semibold text-[var(--foreground)]">Public link</p>
              <p className="mt-3 break-all font-mono text-sm leading-7 text-[var(--primary-deep)]">
                {publicPath}
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <button
                onClick={copyLink}
                className="inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-white transition"
                style={{ backgroundColor: theme.accent, boxShadow: `0 14px 30px ${theme.accentSoft}` }}
              >
                Copy Link
              </button>
              <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/78 p-4 text-sm leading-6 text-[var(--muted)]">
                Pages turn best with photos, inside jokes, and little memories people would love to revisit later.
              </div>
            </div>
          </section>
        </div>

        <section className="wyshmate-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accentStrong }}>
                Wishbook
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Flip through the pages</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                Each wish becomes its own page, making the board feel more like a keepsake than a message list.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentPage === 0 || messages.length === 0}
                className="inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
                style={{ borderColor: theme.accentSoft, color: theme.accentStrong }}
              >
                Previous
              </button>
              <div className="text-sm font-medium text-[var(--muted)]">
                {messages.length === 0
                  ? 'No pages yet'
                  : `Page ${currentPage + 1}${rightPage ? `-${currentPage + 2}` : ''} of ${messages.length}`}
              </div>
              <button
                type="button"
                onClick={goNext}
                disabled={messages.length === 0 || currentPage >= messages.length - 1}
                className="inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
                style={{ borderColor: theme.accentSoft, color: theme.accentStrong }}
              >
                Next
              </button>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-[var(--border-soft)] bg-white/70 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-[var(--foreground)]">No pages yet.</p>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                The first wish will open the book and set the tone for everyone else.
              </p>
            </div>
          ) : (
            <div
              className="wishbook mt-6"
              onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
              onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
            >
              <div className="wishbook-spread">
                {[leftPage, rightPage].map((message, index) =>
                  message ? (
                    <article
                      key={message.id}
                      className={`wishbook-page ${index === 0 ? 'wishbook-page-left' : 'wishbook-page-right'}`}
                    >
                      <div className="wishbook-page-inner">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accentStrong }}>
                              {board.occasion}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                              {message.authorName}
                            </h3>
                          </div>
                          <div
                            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                            style={{ backgroundColor: theme.accentSoft, color: theme.accentStrong }}
                          >
                            Page {currentPage + index + 1}
                          </div>
                        </div>

                        {message.imageUrl ? (
                          <div className="wishbook-photo-frame mt-5">
                            <img
                              src={message.imageUrl}
                              alt={`Memory shared by ${message.authorName}`}
                              className="wishbook-photo"
                            />
                          </div>
                        ) : null}

                        <blockquote className="mt-5 text-lg leading-8 text-[var(--foreground)]">
                          “{message.content}”
                        </blockquote>

                        <div className="mt-6 flex items-center justify-between gap-4 text-sm text-[var(--muted)]">
                          <span>— {message.authorName}</span>
                          <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <div key={`blank-${index}`} className="wishbook-page wishbook-page-blank" />
                  ),
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
