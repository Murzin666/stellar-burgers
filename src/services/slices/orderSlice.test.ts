import { configureStore } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import orderSlice, {
  createOrder,
  setOrderData,
  clearOrderError,
  resetOrder,
  selectOrderData,
  selectOrderLoading
} from './orderSlice';
import { TOrder } from '@utils-types';

jest.mock('../../utils/burger-api');

const mockOrder: TOrder = {
  _id: 'test-1',
  status: 'done',
  name: 'Devil бургер',
  createdAt: '2025-07-29T00:00:00.000Z',
  updatedAt: '2025-07-29T00:00:00.000Z',
  number: 666,
  ingredients: ['ingredient-1', 'ingredient-2']
};

// Тип для состояния хранилища
type RootState = {
  order: ReturnType<typeof orderSlice.reducer>;
};

describe('orderSlice', () => {
  let store: ReturnType<typeof configureStore<RootState>>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        order: orderSlice.reducer
      }
    });
  });

  describe('Начальное состояние', () => {
    it('должно возвращать корректное начальное состояние', () => {
      const state = store.getState().order;
      expect(state).toEqual({
        data: null,
        isLoading: false,
        error: null
      });
    });
  });

  describe('Синхронные действия', () => {
    it('setOrderData должен обновлять данные заказа', () => {
      store.dispatch(setOrderData(mockOrder));
      const state = store.getState().order;
      expect(state.data).toEqual(mockOrder);
      expect(state.error).toBeNull();
    });

    it('clearOrderError должен очищать ошибку', () => {
      // Сначала создаем ошибку
      store.dispatch(
        createOrder.rejected(
          {
            message: 'Test error',
            name: ''
          },
          '',
          [],
          { message: 'Test error' }
        )
      );
      
      // Затем очищаем
      store.dispatch(clearOrderError());
      
      const state = store.getState().order;
      expect(state.error).toBeNull();
      expect(state.data).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('resetOrder должен сбрасывать состояние', () => {
      // Сначала добавляем данные
      store.dispatch(setOrderData(mockOrder));
      
      // Затем сбрасываем
      store.dispatch(resetOrder());
      
      const state = store.getState().order;
      expect(state).toEqual({
        data: null,
        isLoading: false,
        error: null
      });
    });
  });

  describe('Асинхронные действия', () => {
    describe('createOrder', () => {
      it('должен обрабатывать pending состояние', () => {
        store.dispatch(createOrder.pending('', []));
        const state = store.getState().order;
        expect(state).toEqual({
          data: null,
          isLoading: true,
          error: null
        });
      });

      it('должен обрабатывать fulfilled состояние', async () => {
        (orderBurgerApi as jest.Mock).mockResolvedValue({
          success: true,
          order: mockOrder
        });
        
        await store.dispatch(createOrder(['ingredient-1', 'ingredient-2']));
        
        const state = store.getState().order;
        expect(state).toEqual({
          data: mockOrder,
          isLoading: false,
          error: null
        });
      });

      it('должен обрабатывать rejected состояние при ошибке API', async () => {
        const error = { message: 'Неизвестная ошибка', status: 500 };
        (orderBurgerApi as jest.Mock).mockRejectedValue(error);
        
        await store.dispatch(createOrder(['ingredient-1', 'ingredient-2']));
        
        const state = store.getState().order;
        expect(state).toEqual({
          data: null,
          isLoading: false,
          error: 'Неизвестная ошибка'
        });
      });

      it('должен обрабатывать ошибку при пустых ингредиентах', async () => {
        await store.dispatch(createOrder([]));
        
        const state = store.getState().order;
        expect(state.error).toBe('Не переданы ингредиенты для заказа');
        expect(state.isLoading).toBe(false);
      });
    });
  });

  describe('Селекторы', () => {
    const testState: RootState = {
      order: {
        data: mockOrder,
        isLoading: true,
        error: null
      }
    };

    it('selectOrderData должен возвращать данные заказа', () => {
      expect(selectOrderData(testState)).toEqual(mockOrder);
    });

    it('selectOrderLoading должен возвращать статус загрузки', () => {
      expect(selectOrderLoading(testState)).toBe(true);
    });
  });
});
