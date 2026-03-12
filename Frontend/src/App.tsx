import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Book = {
  bookId: number
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: number
  price: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5142'
const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50]

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTitle, setSearchTitle] = useState('')

  useEffect(() => {
    const abortController = new AbortController()

    const loadBooks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/books`, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data: Book[] = await response.json()
        setBooks(data)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }

        setError('Unable to load books from the backend API.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadBooks()

    return () => {
      abortController.abort()
    }
  }, [])

  const filteredBooks = useMemo(() => {
    const normalizedSearch = searchTitle.trim().toLowerCase()
    if (!normalizedSearch) {
      return books
    }

    return books.filter((book) => book.title.toLowerCase().includes(normalizedSearch))
  }, [books, searchTitle])

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / rowsPerPage))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTitle, rowsPerPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const visibleBooks = filteredBooks.slice(startIndex, endIndex)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const showingFrom = filteredBooks.length === 0 ? 0 : startIndex + 1
  const showingTo = Math.min(endIndex, filteredBooks.length)

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Bookstore</h1>
        <p>Discover books from the catalog.</p>
      </header>
      <main className="app-main">
        {isLoading && <p className="status-message">Loading books...</p>}

        {!isLoading && error && <p className="status-message error">{error}</p>}

        {!isLoading && !error && (
          <section className="catalog-panel">
            <div className="catalog-toolbar">
              <div className="filters">
                <div className="field">
                  <label htmlFor="search-title">Search by title</label>
                  <input
                    id="search-title"
                    type="text"
                    placeholder="Start typing a book title..."
                    value={searchTitle}
                    onChange={(event) => setSearchTitle(event.target.value)}
                  />
                </div>

                <div className="field field-compact">
                  <label htmlFor="rows-per-page">Entries per page</label>
                  <select
                    id="rows-per-page"
                    value={rowsPerPage}
                    onChange={(event) => {
                      setRowsPerPage(Number(event.target.value))
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="catalog-meta">
                Showing {showingFrom}-{showingTo} of {filteredBooks.length}
              </p>
            </div>

            <div className="cards-grid">
              {visibleBooks.map((book) => (
                <article className="book-card" key={book.bookId}>
                  <h2>{book.title}</h2>
                  <p className="book-author">{book.author}</p>

                  <div className="book-details">
                    <p>
                      <span>Publisher</span>
                      {book.publisher}
                    </p>
                    <p>
                      <span>Genre</span>
                      {book.classification} / {book.category}
                    </p>
                    <p>
                      <span>ISBN</span>
                      {book.isbn}
                    </p>
                    <p>
                      <span>Pages</span>
                      {book.pageCount}
                    </p>
                  </div>

                  <p className="book-price">${book.price.toFixed(2)}</p>
                </article>
              ))}

              {visibleBooks.length === 0 && (
                <p className="empty-state">No books matched that title.</p>
              )}
            </div>

            {filteredBooks.length > 0 && (
              <div className="pagination" aria-label="Page navigation">
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={pageNumber === currentPage ? 'active' : ''}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
