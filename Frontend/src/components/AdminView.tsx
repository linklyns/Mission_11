import type { Book } from '../books.types'

type AdminViewProps = {
  visibleBooks: Book[]
  filteredCount: number
  showingFrom: number
  showingTo: number
  searchTitle: string
  selectedCategory: string
  categoryOptions: string[]
  rowsPerPage: number
  pageSizeOptions: number[]
  currentPage: number
  pageNumbers: number[]
  onSearchTitleChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onRowsPerPageChange: (value: number) => void
  onPageChange: (pageNumber: number) => void
  onCreateBook: () => void
  onEditBook: (book: Book) => void
  onDeleteBook: (book: Book) => void
  formatCurrency: (value: number) => string
}

function AdminView({
  visibleBooks,
  filteredCount,
  showingFrom,
  showingTo,
  searchTitle,
  selectedCategory,
  categoryOptions,
  rowsPerPage,
  pageSizeOptions,
  currentPage,
  pageNumbers,
  onSearchTitleChange,
  onCategoryChange,
  onRowsPerPageChange,
  onPageChange,
  onCreateBook,
  onEditBook,
  onDeleteBook,
  formatCurrency,
}: AdminViewProps) {
  return (
    <section className="catalog-panel">
      <div className="catalog-toolbar">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-lg-6">
            <div className="form-floating">
              <input
                id="search-title"
                type="text"
                className="form-control"
                placeholder="Start typing a book title..."
                value={searchTitle}
                onChange={(event) => onSearchTitleChange(event.target.value)}
              />
              <label htmlFor="search-title">Search by title</label>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="form-floating">
              <select
                id="filter-category"
                className="form-control"
                value={selectedCategory}
                onChange={(event) => onCategoryChange(event.target.value)}
              >
                <option value="all">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <label htmlFor="filter-category">Category</label>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="form-floating">
              <select
                id="rows-per-page"
                className="form-control"
                value={rowsPerPage}
                onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <label htmlFor="rows-per-page">Entries per page</label>
            </div>
          </div>
        </div>

        <div className="row g-3 align-items-center mt-1">
          <div className="col-12 col-lg-6">
            <p className="catalog-meta">
              Showing {showingFrom}-{showingTo} of {filteredCount}
            </p>
          </div>

          <div className="col-12 col-lg-6">
            <div className="catalog-overview">
              <div className="cart-summary" aria-live="polite">
                <p>
                  <span>Admin actions</span>
                  Manage bookstore catalog
                </p>
                <button type="button" className="secondary-button" onClick={onCreateBook}>
                  Add Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 book-grid">
        {visibleBooks.map((book) => {
          return (
            <div className="col-12 col-md-6 col-xl-4" key={book.bookId}>
              <article className="book-card h-100">
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

                <div className="book-card-footer">
                  <p className="book-price">{formatCurrency(book.price)}</p>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => onEditBook(book)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => onDeleteBook(book)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            </div>
          )
        })}

        {visibleBooks.length === 0 && (
          <div className="col-12">
            <p className="empty-state">No books matched your filters.</p>
          </div>
        )}
      </div>

      {filteredCount > 0 && (
        <div className="pagination" aria-label="Page navigation">
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={pageNumber === currentPage ? 'active' : ''}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

export default AdminView
