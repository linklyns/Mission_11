import type { Book } from '../books.types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://bookstorebackend-dhh6drcpe9c0eeck.francecentral-01.azurewebsites.net'

export type BookInput = Omit<Book, 'bookId'>

export async function fetchBooks(signal?: AbortSignal): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/api/books`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json() as Promise<Book[]>
}

export async function createBook(book: BookInput): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/api/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json() as Promise<Book>
}

export async function updateBook(book: Book): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/books/${book.bookId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
}

export async function deleteBook(bookId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
}
