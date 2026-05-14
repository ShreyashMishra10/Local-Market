import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { productService } from '../services/productService'

export const fetchProducts = createAsyncThunk('product/fetchAll', async (params) => {
  const res = await productService.getProducts(params)
  return res.data
})

export const fetchFeatured = createAsyncThunk('product/fetchFeatured', async () => {
  const res = await productService.getFeatured()
  return res.data
})

export const fetchTrending = createAsyncThunk('product/fetchTrending', async () => {
  const res = await productService.getTrending()
  return res.data
})

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    featured: [],
    trending: [],
    pagination: null,
    loading: false,
    error: null,
    filters: {
      search: '', category: '', min_price: '', max_price: '',
      sort: 'newest', city: '', vendor: '', min_rating: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = {
        search: '', category: '', min_price: '', max_price: '',
        sort: 'newest', city: '', vendor: '', min_rating: '',
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,   (state) => { state.loading = true })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading    = false
        state.products   = action.payload.data ?? []
        state.pagination = action.payload.meta ?? null
      })
      .addCase(fetchProducts.rejected,  (state, action) => {
        state.loading = false
        state.error   = action.error.message
      })
      .addCase(fetchFeatured.fulfilled, (state, action) => { state.featured = action.payload })
      .addCase(fetchTrending.fulfilled, (state, action) => { state.trending = action.payload })
  },
})

export const { setFilters, resetFilters } = productSlice.actions
export default productSlice.reducer
