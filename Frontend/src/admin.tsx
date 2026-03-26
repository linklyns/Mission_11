import { useEffect, useMemo, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import './App.css'
import AdminView from './components/AdminView'
import {
  createBook,
  deleteBook,
  fetchBooks,
  type BookInput,
  updateBook,
} from './api/booksApi'
import type { Book } from './books.types'

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50]

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

type BookFormState = Omit<BookInput, 'price'> & {
  price: number | ''
}

const defaultBookForm: BookFormState = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 1,
  price: '',
}

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTitle, setSearchTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editingBookId, setEditingBookId] = useState<number | null>(null)
  const [bookForm, setBookForm] = useState<BookFormState>(defaultBookForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    const loadBooks = async () => {
      try {
        const data = await fetchBooks(abortController.signal)
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

  const categoryOptions = useMemo(() => {
    const categoriesByKey = new Map<string, string>()

    books.forEach((book) => {
      const trimmedCategory = book.category.trim()
      if (!trimmedCategory) {
        return
      }

      const key = trimmedCategory.toLowerCase()
      if (!categoriesByKey.has(key)) {
        categoriesByKey.set(key, trimmedCategory)
      }
    })

    return Array.from(categoriesByKey.values()).sort((a, b) => a.localeCompare(b))
  }, [books])

  const classificationOptions = useMemo(() => {
    const classificationsByKey = new Map<string, string>()

    books.forEach((book) => {
      const trimmedClassification = book.classification.trim()
      if (!trimmedClassification) {
        return
      }

      const key = trimmedClassification.toLowerCase()
      if (!classificationsByKey.has(key)) {
        classificationsByKey.set(key, trimmedClassification)
      }
    })

    return Array.from(classificationsByKey.values()).sort((a, b) =>
      a.localeCompare(b),
    )
  }, [books])

  const filteredBooks = useMemo(() => {
    const normalizedSearch = searchTitle.trim().toLowerCase()
    const normalizedCategory = selectedCategory.trim().toLowerCase()

    return books.filter((book) => {
      const matchesTitle =
        !normalizedSearch || book.title.toLowerCase().includes(normalizedSearch)
      const matchesCategory =
        normalizedCategory === 'all' ||
        book.category.toLowerCase() === normalizedCategory

      return matchesTitle && matchesCategory
    })
  }, [books, searchTitle, selectedCategory])

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / rowsPerPage))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTitle, selectedCategory, rowsPerPage])

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

  const handleCreateOpen = () => {
    setFormMode('create')
    setEditingBookId(null)
    setBookForm(defaultBookForm)
    setError(null)
  }

  const handleEditOpen = (book: Book) => {
    setFormMode('edit')
    setEditingBookId(book.bookId)
    setBookForm({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    })
    setError(null)
  }

  const handleSaveBook = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSaving(true)
    setError(null)

    try {
      const bookPayload: BookInput = {
        ...bookForm,
        price: Number(bookForm.price),
      }

      if (formMode === 'create') {
        const createdBook = await createBook(bookPayload)
        setBooks((currentBooks) => [...currentBooks, createdBook])
      }

      if (formMode === 'edit' && editingBookId !== null) {
        const updatedBook: Book = {
          bookId: editingBookId,
          ...bookPayload,
        }

        await updateBook(updatedBook)
        setBooks((currentBooks) =>
          currentBooks.map((book) =>
            book.bookId === updatedBook.bookId ? updatedBook : book,
          ),
        )
      }

      setFormMode(null)
      setEditingBookId(null)
      setBookForm(defaultBookForm)
    } catch {
      setError('Unable to save the book right now. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await deleteBook(deleteTarget.bookId)
      setBooks((currentBooks) =>
        currentBooks.filter((book) => book.bookId !== deleteTarget.bookId),
      )
      setDeleteTarget(null)
    } catch {
      setError('Unable to delete the book right now. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="app-container admin-page">
      <header className="app-header">
        <h1>Bookstore</h1>
        <p>Manage books in the catalog.</p>
        <p className="mt-3 mb-0">
          <Link to="/" className="secondary-button text-decoration-none">
            Back to Catalog
          </Link>
        </p>
      </header>

      <main className="app-main">
        <div className="container-xxl">
          <div className="row">
            <div className="col-12">
              {isLoading && <p className="status-message">Loading books...</p>}

              {!isLoading && error && <p className="status-message error">{error}</p>}

              {!isLoading && !error && (
                <AdminView
                  visibleBooks={visibleBooks}
                  filteredCount={filteredBooks.length}
                  showingFrom={showingFrom}
                  showingTo={showingTo}
                  searchTitle={searchTitle}
                  selectedCategory={selectedCategory}
                  categoryOptions={categoryOptions}
                  rowsPerPage={rowsPerPage}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  currentPage={currentPage}
                  pageNumbers={pageNumbers}
                  onSearchTitleChange={setSearchTitle}
                  onCategoryChange={setSelectedCategory}
                  onRowsPerPageChange={setRowsPerPage}
                  onPageChange={setCurrentPage}
                  onCreateBook={handleCreateOpen}
                  onEditBook={handleEditOpen}
                  onDeleteBook={setDeleteTarget}
                  formatCurrency={formatCurrency}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {formMode && (
        <>
          <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {formMode === 'create' ? 'Add Book' : 'Edit Book'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setFormMode(null)}
                    aria-label="Close"
                  ></button>
                </div>

                <form onSubmit={handleSaveBook}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Title</label>
                        <input
                          className="form-control"
                          required
                          value={bookForm.title}
                          onChange={(event) =>
                            setBookForm((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Author</label>
                        <input
                          className="form-control"
                          required
                          value={bookForm.author}
                          onChange={(event) =>
                            setBookForm((current) => ({
                              ...current,
                              author: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Publisher</label>
                        <input
                          className="form-control"
                          required
                          value={bookForm.publisher}
                          onChange={(event) =>
                            setBookForm((current) => ({
                              ...current,
                              publisher: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">ISBN</label>
                        <input
                          className="form-control"
                          required
                          value={bookForm.isbn}
                          onChange={(event) =>
                            setBookForm((current) => ({
                              ...current,
                              isbn: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Classification</label>
                        <input
                          className="form-control"
                          list="classification-options"
                          required
                          value={bookForm.classification}
                          onChange={(event) =>
                            setBookForm((current) => ({
                              ...current,
                              classification: event.target.value,
                            }))
                          }
                        />
                        <datalist id="classification-options">
                          {classificationOptions.map((classification) => (
                            <option key={classification} value={classification} />
                          ))}
                        </datalist>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Category</label>
                        <input
                          className="form-control"
                          list="category-options"
                          required
                          value={bookForm.category}
                          onChange={(event) =>
                            setBookForm((current) => ({
                              ...current,
                              category: event.target.value,
                            }))
                          }
                        />
                        <datalist id="category-options">
                          {categoryOptions.map((category) => (
                            <option key={category} value={category} />
                          ))}
                        </datalist>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Pages</label>
                        <input
                          className="form-control"
                          type="number"
                          min={1}
                          required
                          value={bookForm.pageCount}
                          onChange={(event) =>
                            setBookForm((current) => ({
                              ...current,
                              pageCount: Number(event.target.value),
                            }))
                          }
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Price</label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            className="form-control"
                            type="number"
                            min={0}
                            step="0.01"
                            required
                            value={bookForm.price}
                            onChange={(event) =>
                              setBookForm((current) => ({
                                ...current,
                                price:
                                  event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setFormMode(null)}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="primary-button" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {deleteTarget && (
        <>
          <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Book</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setDeleteTarget(null)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-0">
                    Are you sure you want to delete "{deleteTarget.title}"?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setDeleteTarget(null)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="remove-button"
                    onClick={handleConfirmDelete}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  )
}

export default AdminBooks
