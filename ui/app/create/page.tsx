'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deriveThemeFromOccasion, getBoardTheme } from '../lib/board-theme';

interface Board {
  id: string;
  title: string;
  occasion: string;
  theme: string;
  recipientName: string;
  adminToken: string;
}

export default function CreateBoard() {
  const [occasion, setOccasion] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = deriveThemeFromOccasion(occasion);
  const selectedTheme = getBoardTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, occasion, theme, recipientName }),
      });
      if (response.ok) {
        const board: Board = await response.json();
        router.push(`/board/${board.id}/admin?token=${board.adminToken}`);
      } else {
        alert('Failed to create board');
      }
    } catch (error) {
      alert('Error creating board');
    }
    setLoading(false);
  };

  return (
    <div className="wyshmate-shell min-h-full px-4 py-10 sm:px-6 lg:px-8" style={selectedTheme.shellStyle}>
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl items-center sm:min-h-[calc(100vh-8rem)]">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-center px-1 py-2 sm:px-2 sm:py-4">
            <h1 className="max-w-xl text-3xl font-semibold leading-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
              Create a beautiful board for every celebration.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)] sm:mt-5 sm:text-lg sm:leading-8">
              Share one link. Collect every wish in one lovely place.
            </p>
            <div
              className="mt-5 inline-flex w-fit max-w-full flex-wrap items-center gap-2 rounded-full border px-4 py-3 text-sm shadow-sm sm:mt-6 sm:gap-3"
              style={{
                backgroundColor: selectedTheme.accentSoft,
                borderColor: selectedTheme.accentSoft,
                color: selectedTheme.accentStrong,
              }}
            >
              <span className="text-lg">{selectedTheme.emoji}</span>
              <span className="font-semibold">{selectedTheme.name}</span>
              <span className="text-[var(--muted)]">A single signature look across every board.</span>
            </div>
            <div className="mt-6 grid max-w-xl gap-4 sm:mt-8 sm:grid-cols-3">
              <div className="wyshmate-card rounded-3xl p-4">
                <div className="text-sm font-semibold" style={{ color: selectedTheme.accentStrong }}>Fast setup</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Start a board with just an occasion, recipient, and optional title.
                </p>
              </div>
              <div className="wyshmate-card rounded-3xl p-4">
                <div className="text-sm font-semibold" style={{ color: selectedTheme.accentStrong }}>Easy sharing</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Send one link and let everyone add their wishes from any device.
                </p>
              </div>
              <div className="wyshmate-card rounded-3xl p-4">
                <div className="text-sm font-semibold" style={{ color: selectedTheme.accentStrong }}>Readable forever</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Keep every message together in a bright, elegant board layout.
                </p>
              </div>
            </div>
          </section>

          <section className="wyshmate-card rounded-[2rem] p-5 sm:p-8 lg:p-10">
            <div className="mb-6 sm:mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-deep)]">
                New board
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
                Create a celebration space
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                Set it up in a few seconds.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                  Occasion
                </label>
                <div className="rounded-2xl border border-[var(--border-soft)] bg-white/90 px-4 py-1 shadow-sm">
                  <select
                    value={occasion}
                    onChange={(e) => {
                      const nextOccasion = e.target.value;
                      setOccasion(nextOccasion);
                    }}
                    className="h-12 w-full bg-transparent text-base text-[var(--foreground)] outline-none"
                    required
                  >
                    <option value="">Select Occasion</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Farewell">Farewell</option>
                    <option value="Celebration">Celebration</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Occasion changes the words and prompts, but the visual look stays beautifully consistent across every board.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[var(--border-soft)] bg-white/90 px-4 text-base text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(141,119,185,0.16)]"
                  placeholder="Who are we celebrating?"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                  Title
                  <span className="ml-2 text-sm font-normal text-[var(--muted)]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[var(--border-soft)] bg-white/90 px-4 text-base text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(141,119,185,0.16)]"
                  placeholder="A warm title for the board"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-2xl px-6 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 sm:h-13"
                style={{
                  backgroundColor: selectedTheme.accent,
                  boxShadow: `0 18px 35px ${selectedTheme.accentSoft}`,
                }}
              >
                {loading ? 'Creating your board...' : 'Create Board'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
