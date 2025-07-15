import { TOrder } from '@utils-types';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getOrdersApi } from '../../utils/burger-api';

type ApiError = {
  message: string;
  status?: number;
};

type TProfileOrdersState = {
  data: TOrder[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TProfileOrdersState = {
  data: [],
  isLoading: false,
  error: null
};

export const fetchProfileOrders = createAsyncThunk<
  TOrder[],
  void,
  { rejectValue: ApiError }
>('profileOrders/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const orders = await getOrdersApi();
    if (!Array.isArray(orders)) {
      throw new Error('Получены некорректные данные заказов');
    }
    return orders;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    const status = (error as any).response?.status || 500;
    return rejectWithValue({ message, status });
  }
});

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchProfileOrders.fulfilled,
        (state, action: PayloadAction<TOrder[]>) => {
          state.isLoading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchProfileOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Ошибка загрузки заказов';
      });
  },
  selectors: {
    selectAllProfileOrders: (state) => state.data,
    selectProfileOrdersStatus: (state) => ({
      isLoading: state.isLoading,
      error: state.error
    })
  }
});

export const { selectAllProfileOrders, selectProfileOrdersStatus } =
  profileOrdersSlice.selectors;

export default profileOrdersSlice;
