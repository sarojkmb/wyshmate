'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getBoardTheme, getDisplayTitle } from '../../../lib/board-theme';
import wordmark from '../../../../logo/wishmate-horizontal.png';

interface Board {
  id: string;
  title: string;
  occasion: string;
  theme: string;
  recipientName: string;
  adminToken: string;
}

interface Message {
  id: string;
  authorName: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
}

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const wrapText = (value: string, maxCharsPerLine: number) => {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      return;
    }
    currentLine = nextLine;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [''];
};

export default function AdminBoardPage() {
  const { id } = useParams();
  const boardId = Array.isArray(id) ? id[0] : id;
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [board, setBoard] = useState<Board | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!token || !boardId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadBoard = async () => {
      setLoading(true);

      try {
        const [boardResponse, messagesResponse] = await Promise.all([
          fetch(`http://localhost:8080/boards/${boardId}/admin?token=${token}`),
          fetch(`http://localhost:8080/boards/${boardId}/messages`),
        ]);

        if (cancelled) {
          return;
        }

        if (boardResponse.ok) {
          const data = await boardResponse.json();
          setBoard(data);
        } else {
          setBoard(null);
        }

        if (messagesResponse.ok) {
          setMessages(await messagesResponse.json());
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error('Error loading admin board:', error);
        if (!cancelled) {
          setBoard(null);
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBoard();

    return () => {
      cancelled = true;
    };
  }, [boardId, token]);

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    mediaRecorderRef.current = null;
    setIsCameraOpen(false);
    setIsRecordingVideo(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  useEffect(() => {
    if (videoPreviewRef.current && cameraStreamRef.current && isCameraOpen) {
      videoPreviewRef.current.srcObject = cameraStreamRef.current;
    }
  }, [isCameraOpen]);

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardId) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append('author_name', authorName);
      formData.append('content', content);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      if (selectedVideo) {
        formData.append('video', selectedVideo);
      }

      const response = await fetch(`http://localhost:8080/boards/${boardId}/messages`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setAuthorName('');
        setContent('');
        setSelectedImage(null);
        setSelectedVideo(null);
        if (videoPreviewUrl) {
          URL.revokeObjectURL(videoPreviewUrl);
        }
        setVideoPreviewUrl(null);
        const messagesResponse = await fetch(`http://localhost:8080/boards/${boardId}/messages`);
        if (messagesResponse.ok) {
          setMessages(await messagesResponse.json());
        }
      } else {
        const error = await response.json().catch(() => null);
        alert(error?.detail || 'Failed to add message');
      }
    } catch (error) {
      alert('Error adding message');
    }
  };

  const beginVideoRecording = async () => {
    setMediaError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cameraStreamRef.current = stream;
      setIsCameraOpen(true);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'video/webm' });
        const file = new File([blob], `wyshmate-admin-memory-${Date.now()}.webm`, {
          type: blob.type || 'video/webm',
        });

        if (videoPreviewUrl) {
          URL.revokeObjectURL(videoPreviewUrl);
        }

        setSelectedImage(null);
        setSelectedVideo(file);
        setVideoPreviewUrl(URL.createObjectURL(file));
        stopCamera();
      };

      recorder.start();
      setIsRecordingVideo(true);
    } catch {
      setMediaError('Camera access was not available. You can still upload a video instead.');
      stopCamera();
    }
  };

  const stopVideoRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      stopCamera();
    }
  };

  const publicLink =
    typeof window === 'undefined' ? '' : `${window.location.origin}/board/${boardId}`;
  const animatedCardLink =
    typeof window === 'undefined' ? '' : `${window.location.origin}/board/${boardId}/ecard`;
  const adminLink =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}/board/${boardId}/admin?token=${token}`;

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    alert(`${label} copied to clipboard!`);
  };

  const openLink = (value: string) => {
    window.open(value, '_blank', 'noopener,noreferrer');
  };

  const downloadECard = async () => {
    if (!board) {
      return;
    }

    setDownloadingCard(true);

    try {
      const theme = getBoardTheme(board.theme, board.occasion);
      const logoResponse = await fetch(wordmark.src);
      const logoBlob = await logoResponse.blob();
      const logoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Unable to load logo'));
        reader.readAsDataURL(logoBlob);
      });

      const wishes = messages.length
        ? messages
        : [{
            id: 'placeholder',
            authorName: 'Your guests',
            content: 'Add wishes to this board and download a keepsake e-card when you are ready.',
            createdAt: new Date().toISOString(),
          }];

      const cardWidth = 1200;
      const topSectionHeight = 320;
      const cardPadding = 68;
      const messageGap = 24;
      const lineHeight = 28;

      const messageBlocks = wishes.map((message) => {
        const contentLines = wrapText(message.content, 44);
        const authorLines = wrapText(`From ${message.authorName}`, 34);
        const bodyHeight = contentLines.length * lineHeight;
        const authorHeight = authorLines.length * 22;
        const cardHeight = 144 + bodyHeight + authorHeight;
        return { ...message, contentLines, authorLines, cardHeight };
      });

      const totalMessagesHeight =
        messageBlocks.reduce((sum, message) => sum + message.cardHeight, 0) +
        Math.max(0, messageBlocks.length - 1) * messageGap;
      const svgHeight = topSectionHeight + cardPadding + totalMessagesHeight + 84;

      let currentY = topSectionHeight;
      const messageMarkup = messageBlocks
        .map((message) => {
          const cardY = currentY;
          currentY += message.cardHeight + messageGap;
          const contentMarkup = message.contentLines
            .map(
              (line, index) =>
                `<text x="100" y="${cardY + 106 + index * lineHeight}" font-size="24" fill="#2e2440">${escapeXml(line)}</text>`,
            )
            .join('');
          const authorMarkup = message.authorLines
            .map(
              (line, index) =>
                `<text x="100" y="${cardY + message.cardHeight - 34 + index * 20}" font-size="18" font-weight="700" fill="${theme.accentStrong}">${escapeXml(line)}</text>`,
            )
            .join('');

          return `
            <g>
              <rect x="72" y="${cardY}" width="1056" height="${message.cardHeight}" rx="32" fill="rgba(255,255,255,0.95)" stroke="${theme.accentSoft}" />
              <text x="100" y="${cardY + 58}" font-size="18" font-weight="700" letter-spacing="4" fill="${theme.accent}">${escapeXml(theme.name)}</text>
              ${contentMarkup}
              ${authorMarkup}
            </g>
          `;
        })
        .join('');

      const subtitle = board.title
        ? `${theme.emoji} ${board.title}`
        : `${theme.emoji} ${board.occasion} for ${board.recipientName}`;

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${svgHeight}" viewBox="0 0 ${cardWidth} ${svgHeight}">
          <defs></defs>
          <rect width="${cardWidth}" height="${svgHeight}" fill="#fcf8ff" />
          <circle cx="150" cy="120" r="140" fill="rgba(243,191,214,0.18)" />
          <circle cx="1070" cy="160" r="170" fill="rgba(141,119,185,0.1)" />
          <rect x="40" y="40" width="1120" height="${svgHeight - 80}" rx="42" fill="rgba(255,255,255,0.72)" stroke="rgba(141,119,185,0.14)" />
          <rect x="72" y="72" width="1056" height="216" rx="34" fill="${theme.accentStrong}" />
          <image href="${logoDataUrl}" x="100" y="106" width="260" height="64" preserveAspectRatio="xMinYMid meet" />
          <text x="100" y="214" font-size="40" font-weight="700" fill="#ffffff">${escapeXml(subtitle)}</text>
          <text x="100" y="252" font-size="22" fill="rgba(255,255,255,0.86)">Celebrating ${escapeXml(board.recipientName)} • ${escapeXml(board.occasion)}</text>
          <text x="880" y="214" font-size="18" font-weight="700" text-anchor="end" fill="rgba(255,255,255,0.82)">${escapeXml(theme.name.toUpperCase())} E-CARD</text>
          <text x="1080" y="252" font-size="22" font-weight="700" text-anchor="end" fill="#ffffff">${wishes.length} ${wishes.length === 1 ? 'wish' : 'wishes'}</text>
          ${messageMarkup}
        </svg>
      `.trim();

      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeRecipient = board.recipientName.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');
      link.href = url;
      link.download = `wyshmate-${safeRecipient || 'ecard'}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating e-card:', error);
      alert('Unable to generate the e-card right now.');
    } finally {
      setDownloadingCard(false);
    }
  };

  if (loading) {
    return (
      <div className="wyshmate-shell flex min-h-screen items-center justify-center px-6">
        <div className="wyshmate-card rounded-[2rem] px-8 py-10 text-center">
          <Image src={wordmark} alt="Wyshmate" className="mx-auto mb-5 h-auto w-[180px]" />
          <p className="text-lg font-semibold text-[var(--foreground)]">Loading your admin board...</p>
        </div>
      </div>
    );
  }

  if (!token || !board) {
    return (
      <div className="wyshmate-shell flex min-h-screen items-center justify-center px-6">
        <div className="wyshmate-card max-w-lg rounded-[2rem] px-8 py-10 text-center">
          <Image src={wordmark} alt="Wyshmate" className="mx-auto mb-5 h-auto w-[180px]" />
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Admin link not available</h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            This private link is missing a valid admin token.
          </p>
        </div>
      </div>
    );
  }

  const theme = getBoardTheme(board.theme, board.occasion);
  const displayTitle = getDisplayTitle(board.title, board.theme, board.occasion, board.recipientName);

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
              Keep this private admin link safe. Use the public link when sharing the board.
            </p>
            <div
              className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.22)' }}
            >
              <span>{theme.emoji}</span>
              <span>{theme.description}</span>
            </div>
            <div
              className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.18)' }}
            >
              <span>{messages.length}</span>
              <span>{messages.length === 1 ? 'message shared' : 'messages shared'}</span>
            </div>
          </div>
        </header>

        <div className="mb-8 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="wyshmate-card rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accentStrong }}>
              Contribute
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Add a wish
            </h2>
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
                    {selectedImage ? selectedImage.name : 'Choose a photo to include with this admin message'}
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
                    onChange={(e) => {
                      setSelectedImage(e.target.files?.[0] ?? null);
                      setSelectedVideo(null);
                      if (videoPreviewUrl) {
                        URL.revokeObjectURL(videoPreviewUrl);
                        setVideoPreviewUrl(null);
                      }
                      stopCamera();
                    }}
                  />
                </label>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/72 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)]">
                      Video (Optional)
                    </label>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Record a greeting live or upload a short clip. Images and videos are stored in separate board folders for cleaner cloud migration later.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label
                      className="inline-flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition"
                      style={{ borderColor: theme.accentSoft, color: theme.accentStrong, backgroundColor: 'white' }}
                    >
                      Upload Video
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={(e) => {
                          const nextVideo = e.target.files?.[0] ?? null;
                          setSelectedVideo(nextVideo);
                          setSelectedImage(null);
                          stopCamera();
                          if (videoPreviewUrl) {
                            URL.revokeObjectURL(videoPreviewUrl);
                          }
                          setVideoPreviewUrl(nextVideo ? URL.createObjectURL(nextVideo) : null);
                        }}
                      />
                    </label>
                    {!isRecordingVideo ? (
                      <button
                        type="button"
                        onClick={beginVideoRecording}
                        className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white transition"
                        style={{ backgroundColor: theme.accent, boxShadow: `0 14px 30px ${theme.accentSoft}` }}
                      >
                        Record Video
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopVideoRecording}
                        className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white transition"
                        style={{ backgroundColor: theme.accentStrong, boxShadow: `0 14px 30px ${theme.accentSoft}` }}
                      >
                        Stop Recording
                      </button>
                    )}
                  </div>
                </div>

                {mediaError ? (
                  <p className="mt-3 text-sm font-medium" style={{ color: theme.accentStrong }}>
                    {mediaError}
                  </p>
                ) : null}

                {isCameraOpen ? (
                  <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-[var(--border-soft)] bg-[#120f16]">
                    <video ref={videoPreviewRef} autoPlay muted playsInline className="h-64 w-full object-cover" />
                  </div>
                ) : null}

                {videoPreviewUrl ? (
                  <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-[var(--border-soft)] bg-white/90">
                    <video src={videoPreviewUrl} controls playsInline className="h-64 w-full object-cover" />
                  </div>
                ) : null}
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

          <section className="space-y-4">
            <div
              className="wyshmate-card rounded-[2rem] p-5 sm:p-6"
              title="Wyshmate now uses one consistent visual style across the public page, admin page, animated card, and downloaded e-card."
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accentStrong }}>
                    Style
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                    Wyshmate look
                  </h2>
                </div>
                <div
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ backgroundColor: theme.accentSoft, color: theme.accentStrong }}
                >
                  {theme.name}
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-[var(--border-soft)] bg-white px-4 py-4 text-sm leading-6 text-[var(--muted)]">
                Every board now keeps the same signature Wyshmate colors, so the experience feels consistent everywhere while the occasion still shapes the wording and mood.
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className="wyshmate-card rounded-[1.75rem] p-5"
                title="Copy the public board URL to share with guests."
              >
                <div className="text-sm font-semibold text-[var(--foreground)]">Public Link</div>
                <button
                  onClick={() => copyText(publicLink, 'Public link')}
                  title="Copy the public board link."
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white transition"
                  style={{ backgroundColor: theme.accent, boxShadow: `0 14px 30px ${theme.accentSoft}` }}
                >
                  Copy Public Link
                </button>
              </div>

              <div
                className="wyshmate-card rounded-[1.75rem] p-5"
                title="Copy the private admin URL for future editing access."
              >
                <div className="text-sm font-semibold text-[var(--foreground)]">Admin Link</div>
                <button
                  onClick={() => copyText(adminLink, 'Admin link')}
                  title="Copy the private admin link."
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white transition"
                  style={{ backgroundColor: theme.accentStrong, boxShadow: `0 14px 30px ${theme.accentSoft}` }}
                >
                  Copy Admin Link
                </button>
              </div>

              <div
                className="wyshmate-card rounded-[1.75rem] p-5"
                title="Download a branded e-card snapshot of this board."
              >
                <div className="text-sm font-semibold text-[var(--foreground)]">Download Card</div>
                <button
                  onClick={downloadECard}
                  disabled={downloadingCard}
                  title="Download the branded e-card."
                  className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ backgroundColor: theme.accentStrong, boxShadow: `0 14px 30px ${theme.accentSoft}` }}
                >
                  {downloadingCard ? 'Preparing...' : 'Download E-card'}
                </button>
              </div>

              <div
                className="wyshmate-card rounded-[1.75rem] p-5"
                title="Open the animated card or copy its shareable link."
              >
                <div className="text-sm font-semibold text-[var(--foreground)]">Animated Card</div>
                <div className="mt-4 flex flex-col gap-3">
                  <button
                    onClick={() => openLink(animatedCardLink)}
                    title="Open the animated e-card in a new tab."
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition"
                    style={{ borderColor: theme.accentSoft, color: theme.accentStrong, backgroundColor: 'white' }}
                  >
                    Open Animated Card
                  </button>
                  <button
                    onClick={() => copyText(animatedCardLink, 'Animated e-card link')}
                    title="Copy the animated e-card link."
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white transition"
                    style={{ backgroundColor: theme.accent, boxShadow: `0 14px 30px ${theme.accentSoft}` }}
                  >
                    Copy Animated Link
                  </button>
                </div>
              </div>
            </div>
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
                    <div className="rounded-full bg-[rgba(243,191,214,0.28)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                      Wish
                    </div>
                  </div>
                  <p className="mt-4 text-base leading-7 text-[var(--foreground)]">
                    {message.content}
                  </p>
                  {message.imageUrl ? (
                    <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-[var(--border-soft)] bg-white/85">
                      <img
                        src={message.imageUrl}
                        alt={`Memory shared by ${message.authorName}`}
                        className="h-52 w-full object-cover"
                      />
                    </div>
                  ) : null}
                  {message.videoUrl ? (
                    <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-[var(--border-soft)] bg-white/85">
                      <video
                        src={message.videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="h-52 w-full object-cover"
                      />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
