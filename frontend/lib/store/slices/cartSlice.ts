import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  storeId: string
}

interface CartState {
  items: CartItem[]
  storeId: string | null
}

const initialState: CartState = {
  items: [],
  storeId: null
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      if (state.storeId && state.storeId !== action.payload.storeId) {
        state.items = []
      }
      state.storeId = action.payload.storeId

      const existingItem = state.items.find(item => item.productId === action.payload.productId)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.productId !== action.payload)
      if (state.items.length === 0) state.storeId = null
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(item => item.productId === action.payload.productId)
      if (item) {
        item.quantity = action.payload.quantity
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.productId !== action.payload.productId)
        }
      }
    },
    clearCart: (state) => {
      state.items = []
      state.storeId = null
    }
  }
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
