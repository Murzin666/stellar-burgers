import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import { TOrder } from '@utils-types';

type TApiError = {
  message: string;
  status?: number;
};

type TOrderState = {
  data: TOrder | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: TOrderState = {
  data: null,
  isLoading: false,
  error: null
};

export const createOrder = createAsyncThunk<
  TOrder,
  string[],
  { rejectValue: TApiError }
>('order/create', async (ingredients, { rejectWithValue }) => {
  try {
    if (!ingredients || ingredients.length === 0) {
      throw new Error('Не переданы ингредиенты для заказа');
    }

    const response = await orderBurgerApi(ingredients);
    if (!response.success || !response.order) {
      throw new Error('Не удалось создать заказ');
    }

    return response.order;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    const status = (error as any).response?.status || 500;
    return rejectWithValue({ message, status });
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderData: (state, action: PayloadAction<TOrder | null>) => {
      state.data = action.payload;
      state.error = null;
    },
    clearOrderError: (state) => {
      state.error = null;
      state.data = null;
      state.isLoading = false;
    },
    resetOrder: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createOrder.fulfilled,
        (state, action: PayloadAction<TOrder>) => {
          state.isLoading = false;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Ошибка создания заказа';
      });
  },
  selectors: {
    selectOrderData: (state) => state.data,
    selectOrderLoading: (state) => state.isLoading
  }
});

export const { setOrderData, clearOrderError, resetOrder } = orderSlice.actions;
export const { selectOrderData, selectOrderLoading } = orderSlice.selectors;

export default orderSlice;
