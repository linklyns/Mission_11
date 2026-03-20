import type { CartItem } from '../books.types'

type CartViewProps = {
  cartItems: CartItem[]
  cartItemCount: number
  cartTotal: number
  onIncreaseQuantity: (bookId: number) => void
  onDecreaseQuantity: (bookId: number) => void
  onRemoveFromCart: (bookId: number) => void
  onContinueShopping: () => void
  formatCurrency: (value: number) => string
}

function CartView({
  cartItems,
  cartItemCount,
  cartTotal,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveFromCart,
  onContinueShopping,
  formatCurrency,
}: CartViewProps) {
  return (
    <>
      <div className="cart-header">
        <h3>Review your cart</h3>
        <p>Adjust quantities and proceed to checkout.</p>
        <button
          type="button"
          className="secondary-button"
          onClick={onContinueShopping}
          style={{ marginTop: '0.5rem' }}
        >
          Continue Shopping
        </button>
      </div>

      {cartItems.length === 0 && (
        <div className="empty-state cart-empty">
          <p>Your cart is empty. Add books from the catalog to get started.</p>
          <button
            type="button"
            className="secondary-button"
            onClick={onContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      )}

      {cartItems.length > 0 && (
        <>
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.bookId} className="cart-item">
                <div className="cart-item-header">
                  <div className="cart-book-title">{item.title}</div>
                  <p className="cart-item-author">{item.author}</p>
                </div>
                
                <div className="cart-item-details">
                  <div className="cart-item-row">
                    <span className="cart-item-label">Price:</span>
                    <span className="cart-item-value">{formatCurrency(item.price)}</span>
                  </div>
                  
                  <div className="cart-item-row">
                    <span className="cart-item-label">Quantity:</span>
                    <div className="quantity-stepper">
                      <button
                        type="button"
                        onClick={() => onDecreaseQuantity(item.bookId)}
                        aria-label={`Decrease quantity for ${item.title}`}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onIncreaseQuantity(item.bookId)}
                        aria-label={`Increase quantity for ${item.title}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="cart-item-row">
                    <span className="cart-item-label">Subtotal:</span>
                    <span className="cart-item-value">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                  
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => onRemoveFromCart(item.bookId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-total-panel" aria-live="polite">
            <p>
              <span>Items</span>
              <strong>{cartItemCount}</strong>
            </p>
            <p>
              <span>Subtotal</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </p>
            <p className="grand-total">
              <span>Total</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </p>
          </div>
        </>
      )}
    </>
  )
}

export default CartView
