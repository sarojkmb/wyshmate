import { notFound } from 'next/navigation';
import BoardClient, { Board, Message } from './board-client';

async function fetchJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<T>;
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [board, messages] = await Promise.all([
    fetchJson<Board>(`http://localhost:8080/boards/${id}`),
    fetchJson<Message[]>(`http://localhost:8080/boards/${id}/messages`),
  ]);

  if (!board) {
    notFound();
  }

  return <BoardClient board={board} initialMessages={messages ?? []} />;
}
