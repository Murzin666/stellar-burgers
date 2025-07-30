import { configureStore } from '@reduxjs/toolkit';
import { getIngredientsApi } from '../../utils/burger-api';
import ingredientsSlice, {
  fetchIngredients,
  selectAllIngredients,
  selectIngredientsLoading,
  selectIngredientsError
} from './ingredientsSlice';
import { TIngredient } from '@utils-types';

jest.mock('../../utils/burger-api');

const mockIngredients: TIngredient[] = [
  {
    _id: 'test-1',
    name: 'Булочка Hello-Kity',
    type: 'bun',
    proteins: 10,
    fat: 0,
    carbohydrates: 0,
    calories: 0,
    price: 666,
    image: '',
    image_large: '',
    image_mobile: ''
  }
];

type RootState = {
  ingredients: ReturnType<typeof ingredientsSlice.reducer>;
};

describe('ingredientsSlice', () => {
  let store: ReturnType<typeof configureStore<RootState>>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        ingredients: ingredientsSlice.reducer
      }
    });
  });

  describe('Начальное состояние', () => {
    it('должно возвращать корректное начальное состояние', () => {
      const state = store.getState().ingredients;
      expect(state).toEqual({
        data: [],
        loading: false,
        error: null
      });
    });
  });

  describe('Асинхронные действия', () => {
    describe('fetchIngredients', () => {
      it('должен обрабатывать pending состояние', () => {
        store.dispatch(fetchIngredients.pending('', undefined));
        const state = store.getState().ingredients;
        expect(state).toEqual({
          data: [],
          loading: true,
          error: null
        });
      });

      it('должен обрабатывать fulfilled состояние', async () => {
        (getIngredientsApi as jest.Mock).mockResolvedValue(mockIngredients);

        await store.dispatch(fetchIngredients());

        const state = store.getState().ingredients;
        expect(state).toEqual({
          data: mockIngredients,
          loading: false,
          error: null
        });
      });

      it('должен обрабатывать rejected состояние', async () => {
        const error = { message: 'Неизвестная ошибка' };
        (getIngredientsApi as jest.Mock).mockRejectedValue(error);

        await store.dispatch(fetchIngredients());

        const state = store.getState().ingredients;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(error.message);
      });
    });
  });

  describe('Селекторы', () => {
    it('selectAllIngredients должен возвращать все ингредиенты', () => {
      const state: RootState = {
        ingredients: {
          data: mockIngredients,
          loading: false,
          error: null
        }
      };
      expect(selectAllIngredients(state)).toEqual(mockIngredients);
    });

    it('selectIngredientsLoading должен возвращать статус загрузки', () => {
      const state: RootState = {
        ingredients: {
          data: [],
          loading: true,
          error: null
        }
      };
      expect(selectIngredientsLoading(state)).toBe(true);
    });

    it('selectIngredientsError должен возвращать ошибку', () => {
      const state: RootState = {
        ingredients: {
          data: [],
          loading: false,
          error: 'Test error'
        }
      };
      expect(selectIngredientsError(state)).toBe('Test error');
    });
  });
});
