export type Book = {
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

export type CartItem = {
  bookId: number
  title: string
  author: string
  category: string
  price: number
  quantity: number
}

export type CatalogLocation = {
  searchTitle: string
  selectedCategory: string
  rowsPerPage: number
  currentPage: number
}
