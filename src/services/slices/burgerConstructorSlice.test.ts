import { configureStore } from '@reduxjs/toolkit';
import type { Store } from '@reduxjs/toolkit';
import constructorSlice, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  selectConstructor,
  selectConstructorBun,
  selectConstructorIngredients
} from './burgerConstructorSlice';
import { TIngredient } from '../../utils/types';

const mockCrypto = {
  randomUUID: jest.fn(() => 'test-qwe')
};

beforeAll(() => {
  Object.defineProperty(global, 'crypto', {
    value: mockCrypto,
    writable: true
  });
});

type RootState = {
  construct: ReturnType<typeof constructorSlice.reducer>;
};

describe('constructorSlice', () => {
  let store: Store<RootState>;

  const mockBun: TIngredient = {
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
  };

  const mockMain: TIngredient = {
    _id: 'test-2',
    name: 'Котлета',
    type: 'main',
    proteins: 10,
    fat: 0,
    carbohydrates: 0,
    calories: 0,
    price: 666,
    image: '',
    image_large: '',
    image_mobile: ''
  };

  const mockSauce: TIngredient = {
    _id: 'test-3',
    name: 'Соус чили',
    type: 'sauce',
    proteins: 10,
    fat: 0,
    carbohydrates: 0,
    calories: 0,
    price: 666,
    image: '',
    image_large: '',
    image_mobile: ''
  };

  beforeEach(() => {
    mockCrypto.randomUUID.mockClear();
    mockCrypto.randomUUID.mockReturnValue('test-qwe');

    store = configureStore({
      reducer: {
        construct: constructorSlice.reducer
      }
    }) as Store<RootState>;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Начальное состояние', () => {
    it('должно возвращать корректное начальное состояние', () => {
      const state = store.getState().construct;
      expect(state).toEqual({
        bun: null,
        ingredients: [],
        status: 'idle'
      });
    });
  });

  describe('Действия', () => {
    describe('addIngredient', () => {
      it('добавляет булочку', () => {
        store.dispatch(addIngredient(mockBun));

        const state = store.getState().construct;
        expect(state.bun).toEqual({
          ...mockBun,
          uuid: 'test-qwe'
        });
        expect(state.ingredients).toEqual([]);
        expect(mockCrypto.randomUUID).toHaveBeenCalledTimes(1);
      });

      it('добавляет основной ингредиент', () => {
        store.dispatch(addIngredient(mockMain));

        const state = store.getState().construct;
        expect(state.bun).toBeNull();
        expect(state.ingredients).toEqual([
          {
            ...mockMain,
            uuid: 'test-qwe'
          }
        ]);
      });

      it('заменяет существующую булочку', () => {
        store.dispatch(addIngredient(mockBun));
        const newBun = { ...mockBun, _id: 'bun-2', name: 'Новая булка' };
        store.dispatch(addIngredient(newBun));

        const state = store.getState().construct;
        expect(state.bun).toEqual({
          ...newBun,
          uuid: 'test-qwe'
        });
      });
    });

    describe('removeIngredient', () => {
      it('удаляет ингредиент по UUID', () => {
        mockCrypto.randomUUID
          .mockReturnValueOnce('test-4') 
          .mockReturnValueOnce('test-5'); 

        store.dispatch(addIngredient(mockMain));
        store.dispatch(addIngredient(mockSauce));

        store.dispatch(removeIngredient('test-5'));

        const state = store.getState().construct;
        expect(state.ingredients).toEqual([
          {
            ...mockMain,
            uuid: 'test-4'
          }
        ]);
      });

      it('не удаляет при неверном UUID', () => {
        mockCrypto.randomUUID.mockReturnValue('test-4');
        store.dispatch(addIngredient(mockMain));
        const initialState = store.getState().construct;

        store.dispatch(removeIngredient('test-666'));

        const state = store.getState().construct;
        expect(state).toEqual(initialState);
      });
    });

    describe('moveIngredient', () => {
      it('перемещает ингредиент', () => {
        store.dispatch(addIngredient(mockMain));
        store.dispatch(addIngredient(mockSauce));

        store.dispatch(moveIngredient({ fromIndex: 0, toIndex: 1 }));

        const state = store.getState().construct;
        expect(state.ingredients).toEqual([
          { ...mockSauce, uuid: 'test-qwe' },
          { ...mockMain, uuid: 'test-qwe' }
        ]);
      });

      it('не перемещает при неверных индексах', () => {
        store.dispatch(addIngredient(mockMain));
        const initialState = store.getState().construct;

        store.dispatch(moveIngredient({ fromIndex: -1, toIndex: 0 }));
        store.dispatch(moveIngredient({ fromIndex: 0, toIndex: 10 }));

        const state = store.getState().construct;
        expect(state).toEqual(initialState);
      });
    });

    describe('clearConstructor', () => {
      it('очищает конструктор', () => {
        store.dispatch(addIngredient(mockBun));
        store.dispatch(addIngredient(mockMain));
        store.dispatch(clearConstructor());

        const state = store.getState().construct;
        expect(state).toEqual({
          bun: null,
          ingredients: [],
          status: 'idle'
        });
      });
    });
  });

  describe('Селекторы', () => {
    beforeEach(() => {
      store.dispatch(addIngredient(mockBun));
      store.dispatch(addIngredient(mockMain));
    });

    it('selectConstructor возвращает полное состояние', () => {
      const result = selectConstructor(store.getState());
      expect(result).toEqual(store.getState().construct);
    });

    it('selectConstructorBun возвращает булочку', () => {
      const result = selectConstructorBun(store.getState());
      expect(result).toEqual({
        ...mockBun,
        uuid: 'test-qwe'
      });
    });

    it('selectConstructorIngredients возвращает ингредиенты', () => {
      const result = selectConstructorIngredients(store.getState());
      expect(result).toEqual([
        {
          ...mockMain,
          uuid: 'test-qwe'
        }
      ]);
    });
  });
});
