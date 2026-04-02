'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Wishbook, { WishbookPage } from '../../components/wishbook';
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
  videoUrl?: string | null;
  createdAt: string;
}

interface BoardClientProps {
  board: Board;
  initialMessages: Message[];
}

function clampPageIndex(index: number, pageCount: number) {
  if (pageCount <= 1) {
    return 0;
  }

  const maxIndex = Math.max(0, pageCount - 1);
  return Math.min(Math.max(0, index), maxIndex);
}

export default function BoardClient({ board, initialMessages }: BoardClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPrompts, setShowPrompts] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const theme = getBoardTheme(board.theme, board.occasion);
  const displayTitle = getDisplayTitle(board.title, board.theme, board.occasion, board.recipientName);
  const prompts = useMemo(() => getPromptsForOccasion(board.occasion), [board.occasion]);
  const bookPages = useMemo<WishbookPage[]>(
    () => [
      {
        kind: 'cover',
        title: displayTitle,
        subtitle: `A keepsake wishbook for ${board.recipientName}. Open the cover and flip through every memory one page at a time.`,
      },
      ...messages.map((message) => ({
        kind: 'message' as const,
        author: message.authorName,
        wish: message.content,
        image: message.imageUrl ?? null,
        video: message.videoUrl ?? null,
        dateLabel: new Date(message.createdAt).toLocaleDateString(),
      })),
    ],
    [board.recipientName, displayTitle, messages],
  );
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
      if (selectedVideo) {
        formData.append('video', selectedVideo);
      }

      const response = await fetch(`http://localhost:8080/boards/${board.id}/messages`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Failed to add message');
      }

      const createdMessage = (await response.json()) as Message;
      const nextMessages = [...messages, createdMessage];
      const nextPageCount = nextMessages.length + 1;

      setMessages(nextMessages);
      setAuthorName('');
      setContent('');
      setSelectedImage(null);
      setSelectedVideo(null);
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      setVideoPreviewUrl(null);
      setFeedback(selectedVideo ? 'Wish and video added to the book.' : selectedImage ? 'Wish and photo added to the book.' : 'Wish added to the book.');
      setCurrentPage(clampPageIndex(nextPageCount - 1, nextPageCount));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'We could not add this wish right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setFeedback('Public link copied to clipboard.');
  };

  const handlePromptClick = (prompt: string) => {
    setContent(prompt);
    setShowPrompts(false);
  };

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
        const file = new File([blob], `wyshmate-memory-${Date.now()}.webm`, {
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
                      Upload a clip or record one live. Videos are stored separately from images so the media layer can switch cleanly to cloud storage later.
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
            <div className="text-sm font-medium text-[var(--muted)]">
              Page {currentPage + 1} of {bookPages.length}
            </div>
          </div>

          <div className="wishbook mt-6">
            <Wishbook
              accent={theme.accent}
              accentSoft={theme.accentSoft}
              accentStrong={theme.accentStrong}
              gradient={theme.heroGradient}
              title={displayTitle}
              maxWidthClass="max-w-3xl"
              pages={bookPages}
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
