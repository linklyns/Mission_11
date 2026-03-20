import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import CartView from './components/CartView'
import CatalogView from './components/CatalogView'
import type { Book, CartItem, CatalogLocation } from './books.types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5142'
const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50]
const CART_STORAGE_KEY = 'mission11-cart'
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

const getSessionCart = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const rawCart = window.sessionStorage.getItem(CART_STORAGE_KEY)
  if (!rawCart) {
    return []
  }

  try {
    const parsedCart = JSON.parse(rawCart) as unknown
    if (!Array.isArray(parsedCart)) {
      return []
    }

    return parsedCart
      .map((entry): CartItem | null => {
        if (!entry || typeof entry !== 'object') {
          return null
        }

        const candidate = entry as Partial<CartItem>
        if (
          typeof candidate.bookId !== 'number' ||
          typeof candidate.title !== 'string' ||
          typeof candidate.author !== 'string' ||
          typeof candidate.category !== 'string' ||
          typeof candidate.price !== 'number' ||
          typeof candidate.quantity !== 'number'
        ) {
          return null
        }

        return {
          bookId: candidate.bookId,
          title: candidate.title,
          author: candidate.author,
          category: candidate.category,
          price: candidate.price,
          quantity: Math.max(1, Math.floor(candidate.quantity)),
        }
      })
      .filter((item): item is CartItem => item !== null)
  } catch {
    return []
  }
}

function Books() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTitle, setSearchTitle] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getSessionCart())
  const [lastAddedLocation, setLastAddedLocation] =
    useState<CatalogLocation | null>(null)
  const [isCartOffcanvasOpen, setIsCartOffcanvasOpen] = useState(false)
  const skipPageResetRef = useRef(false)

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

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

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  )

  const cartQuantityByBookId = useMemo(() => {
    const quantityMap = new Map<number, number>()

    cartItems.forEach((item) => {
      quantityMap.set(item.bookId, item.quantity)
    })

    return quantityMap
  }, [cartItems])

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / rowsPerPage))

  useEffect(() => {
    if (skipPageResetRef.current) {
      skipPageResetRef.current = false
      return
    }

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

  const rememberCatalogLocation = () => {
    setLastAddedLocation({
      searchTitle,
      selectedCategory,
      rowsPerPage,
      currentPage,
    })
  }

  const handleViewCart = () => {
    rememberCatalogLocation()
    setIsCartOffcanvasOpen(true)
  }

  const addToCart = (book: Book) => {
    setCartItems((currentCart) => {
      const existingItem = currentCart.find((item) => item.bookId === book.bookId)

      if (!existingItem) {
        return [
          ...currentCart,
          {
            bookId: book.bookId,
            title: book.title,
            author: book.author,
            category: book.category,
            price: book.price,
            quantity: 1,
          },
        ]
      }

      return currentCart.map((item) =>
        item.bookId === book.bookId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      )
    })

    rememberCatalogLocation()
  }

  const increaseCartQuantity = (bookId: number) => {
    setCartItems((currentCart) =>
      currentCart.map((item) =>
        item.bookId === bookId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    )
  }

  const decreaseCartQuantity = (bookId: number) => {
    setCartItems((currentCart) =>
      currentCart
        .map((item) =>
          item.bookId === bookId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (bookId: number) => {
    setCartItems((currentCart) => currentCart.filter((item) => item.bookId !== bookId))
  }

  const handleContinueShopping = () => {
    if (lastAddedLocation) {
      skipPageResetRef.current = true

      setSearchTitle(lastAddedLocation.searchTitle)
      setSelectedCategory(lastAddedLocation.selectedCategory)
      setRowsPerPage(lastAddedLocation.rowsPerPage)
      setCurrentPage(lastAddedLocation.currentPage)
    }

    setIsCartOffcanvasOpen(false)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Bookstore</h1>
        <p>Discover books from the catalog.</p>
      </header>
      <main className="app-main">
        <div className="container-xxl">
          <div className="row">
            <div className="col-12">
              {isLoading && <p className="status-message">Loading books...</p>}

              {!isLoading && error && <p className="status-message error">{error}</p>}

              {!isLoading && !error && (
                <CatalogView
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
                  cartItemCount={cartItemCount}
                  cartTotal={cartTotal}
                  quantityByBookId={cartQuantityByBookId}
                  onSearchTitleChange={setSearchTitle}
                  onCategoryChange={setSelectedCategory}
                  onRowsPerPageChange={setRowsPerPage}
                  onPageChange={setCurrentPage}
                  onAddToCart={addToCart}
                  onViewCart={handleViewCart}
                  formatCurrency={formatCurrency}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Offcanvas Shopping Cart */}
      <div
        className={`offcanvas offcanvas-end ${isCartOffcanvasOpen ? 'show' : ''}`}
        tabIndex={-1}
        id="cartOffcanvas"
        aria-labelledby="cartOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="cartOffcanvasLabel">
            Shopping Cart
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setIsCartOffcanvasOpen(false)}
            aria-label="Close cart"
          ></button>
        </div>
        <div className="offcanvas-body">
          {!isLoading && !error && (
            <CartView
              cartItems={cartItems}
              cartItemCount={cartItemCount}
              cartTotal={cartTotal}
              onIncreaseQuantity={increaseCartQuantity}
              onDecreaseQuantity={decreaseCartQuantity}
              onRemoveFromCart={removeFromCart}
              onContinueShopping={handleContinueShopping}
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </div>

      {/* Offcanvas Backdrop */}
      {isCartOffcanvasOpen && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={() => setIsCartOffcanvasOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default Books
