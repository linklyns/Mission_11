import type { Book } from '../books.types'

type CatalogViewProps = {
  visibleBooks: Book[]
  filteredCount: number
  showingFrom: number
  showingTo: number
  searchTitle: string
  selectedCategory: string
  isAlphabeticalSort: boolean
  categoryOptions: string[]
  rowsPerPage: number
  pageSizeOptions: number[]
  currentPage: number
  pageNumbers: number[]
  cartItemCount: number
  cartTotal: number
  quantityByBookId: Map<number, number>
  onSearchTitleChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSetAlphabeticalSort: (isSorted: boolean) => void
  onRowsPerPageChange: (value: number) => void
  onPageChange: (pageNumber: number) => void
  onAddToCart: (book: Book) => void
  onViewCart: () => void
  formatCurrency: (value: number) => string
}

function CatalogView({
  visibleBooks,
  filteredCount,
  showingFrom,
  showingTo,
  searchTitle,
  selectedCategory,
  isAlphabeticalSort,
  categoryOptions,
  rowsPerPage,
  pageSizeOptions,
  currentPage,
  pageNumbers,
  cartItemCount,
  cartTotal,
  quantityByBookId,
  onSearchTitleChange,
  onCategoryChange,
  onSetAlphabeticalSort,
  onRowsPerPageChange,
  onPageChange,
  onAddToCart,
  onViewCart,
  formatCurrency,
}: CatalogViewProps) {
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

          <div className="col-12 col-sm-6 col-lg-2">
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

          <div className="col-12 col-sm-6 col-lg-2">
            <div className="form-floating">
              <select
                id="sort-order"
                className="form-control"
                value={isAlphabeticalSort ? 'az' : 'default'}
                onChange={(event) => onSetAlphabeticalSort(event.target.value === 'az')}
              >
                <option value="default">Default order</option>
                <option value="az">Title A-Z</option>
              </select>
              <label htmlFor="sort-order">Sort</label>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-2">
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
                  <span>Cart summary</span>
                  {cartItemCount} items · {formatCurrency(cartTotal)}
                </p>
                <button type="button" className="secondary-button" onClick={onViewCart}>
                  View Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 book-grid">
        {visibleBooks.map((book) => {
          const quantityInCart = quantityByBookId.get(book.bookId) ?? 0

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

                {quantityInCart > 0 && (
                  <p className="in-cart-note">{quantityInCart} currently in cart</p>
                )}

                <div className="book-card-footer">
                  <p className="book-price">{formatCurrency(book.price)}</p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => onAddToCart(book)}
                  >
                    Add to Cart
                  </button>
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

export default CatalogView
