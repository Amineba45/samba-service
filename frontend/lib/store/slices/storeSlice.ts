import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Store {
  _id: string
  name: string
  address: string
  latitude: number
  longitude: number
  status: string
  deliveryFee: number
  deliveryRadius: number
}

interface StoreState {
  stores: Store[]
  selectedStore: Store | null
  isLoading: boolean
  error: string | null
}

const initialState: StoreState = {
  stores: [],
  selectedStore: null,
  isLoading: false,
  error: null
}

const storeSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    setStores: (state, action: PayloadAction<Store[]>) => {
      state.stores = action.payload
    },
    setSelectedStore: (state, action: PayloadAction<Store>) => {
      state.selectedStore = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const { setStores, setSelectedStore, setLoading, setError } = storeSlice.actions
export default storeSlice.reducer
