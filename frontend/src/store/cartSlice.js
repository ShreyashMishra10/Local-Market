import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartService } from '../services/cartService'

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const res = await cartService.getCart()
  return res.data
})

export const addToCart = createAsyncThunk('cart/addItem', async (payload) => {
  await cartService.addItem(payload)
  const res = await cartService.getCart()
  return res.data
})

export const removeFromCart = createAsyncThunk('cart/removeItem', async (productId) => {
  await cartService.removeItem(productId)
  const res = await cartService.getCart()
  return res.data
})

export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ productId, quantity }) => {
  await cartService.updateItem(productId, { quantity })
  const res = await cartService.getCart()
  return res.data
})

export const clearCart = createAsyncThunk('cart/clear', async () => {
  await cartService.clearCart()
  return { items: [], subtotal: 0, total: 0, discount: 0 }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items:      [],
    subtotal:   0,
    discount:   0,
    total:      0,
    item_count: 0,
    coupon_code: null,
    loading:    false,
    error:      null,
  },
  reducers: {
    resetCart: (state) => {
      state.items = []
      state.subtotal = 0
      state.discount = 0
      state.total = 0
      state.item_count = 0
      state.coupon_code = null
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => { state.loading = true; state.error = null }
    const setError   = (state, action) => { state.loading = false; state.error = action.error.message }
    const setData    = (state, action) => {
      state.loading    = false
      state.items      = action.payload.items ?? []
      state.subtotal   = action.payload.subtotal ?? 0
      state.discount   = action.payload.discount ?? 0
      state.total      = action.payload.total ?? 0
      state.item_count = action.payload.item_count ?? 0
      state.coupon_code= action.payload.coupon_code ?? null
    }

    builder
      .addCase(fetchCart.pending,       setLoading)
      .addCase(fetchCart.fulfilled,     setData)
      .addCase(fetchCart.rejected,      setError)
      .addCase(addToCart.pending,       setLoading)
      .addCase(addToCart.fulfilled,     setData)
      .addCase(addToCart.rejected,      setError)
      .addCase(removeFromCart.fulfilled, setData)
      .addCase(updateCartItem.fulfilled, setData)
      .addCase(clearCart.fulfilled,     (state) => {
        state.items = []; state.subtotal = 0; state.total = 0; state.discount = 0; state.item_count = 0
      })
  },
})

export const { resetCart } = cartSlice.actions
export default cartSlice.reducer
