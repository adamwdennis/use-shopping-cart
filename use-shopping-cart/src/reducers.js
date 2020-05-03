import { formatCurrencyString } from './util'

export function cartReducer(cart, action) {
  switch (action.type) {
    case 'storeLastClicked':
      return {
        ...cart,
        lastClicked: action.skuID
      }

    case 'cartClick':
      return {
        ...cart,
        shouldDisplayCart: !cart.shouldDisplayCart
      }

    case 'cartHover':
      return {
        ...cart,
        shouldDisplayCart: true
      }

    case 'closeCart':
      return {
        ...cart,
        shouldDisplayCart: false
      }

    case 'stripe changed':
      return {
        ...cart,
        stripe: action.stripe
      }

    default:
      return cart
  }
}

export function cartValuesReducer(state, action) {
  function createEntry(product, count) {
    const entry = {
      ...product,
      quantity: count,
      get value() {
        return this.price * this.quantity
      },
      get formattedValue() {
        return formatCurrencyString({
          value: this.value,
          currency: action.currency,
          language: action.language
        })
      }
    }

    return {
      cartDetails: {
        ...state.cartDetails,
        [product.sku]: entry
      },
      totalPrice: state.totalPrice + product.price * count,
      cartCount: state.cartCount + count
    }
  }
  function updateEntry(sku, count) {
    const cartDetails = { ...state.cartDetails }
    const entry = cartDetails[sku]
    if (entry.quantity + count <= 0) {
      return removeEntry(sku)
    }

    entry.quantity += count

    return {
      cartDetails,
      totalPrice: state.totalPrice + entry.price * count,
      cartCount: state.cartCount + count
    }
  }
  function removeEntry(sku) {
    const cartDetails = { ...state.cartDetails }
    const totalPrice = state.totalPrice - cartDetails[sku].value
    const cartCount = state.cartCount - cartDetails[sku].quantity
    delete cartDetails[sku]

    return { cartDetails, totalPrice, cartCount }
  }

  switch (action.type) {
    case 'add-item-to-cart':
      if (action.count <= 0) break
      if (action.product.sku in state.cartDetails) {
        return updateEntry(action.product.sku, action.count)
      }
      return createEntry(action.product, action.count)

    case 'increment-item':
      if (action.count <= 0) break
      if (action.sku in state.cartDetails) {
        return updateEntry(action.sku, action.count)
      }
      break

    case 'decrement-item':
      if (action.count <= 0) break
      if (action.sku in state.cartDetails) {
        return updateEntry(action.sku, -action.count)
      }
      break

    case 'remove-item-from-cart':
      if (action.sku in state.cartDetails) {
        return removeEntry(action.sku)
      }
      break

    default:
      return state
  }

  console.warn('Invalid action arguments', action)
  return state
}
