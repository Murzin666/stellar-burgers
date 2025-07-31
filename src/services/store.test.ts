import { rootReducer } from './store';
import { UnknownAction } from 'redux';

describe('rootReducer', () => {
  describe('initial state', () => {
    const initialState = rootReducer(undefined, {} as UnknownAction);

    test('должна иметь правильную структуру авторизации', () => {
      expect(initialState.auth).toEqual({
        user: null,
        isAuthChecked: false,
        isLoading: false,
        error: null
      });
    });

    test('должна иметь правильную структуру конструкции', () => {
      expect(initialState.construct).toEqual({
        bun: null,
        ingredients: [],
        status: 'idle'
      });
    });
  });

  test('должен возвращать то же состояние для неизвестного действия', () => {
    const initialState = rootReducer(undefined, {} as UnknownAction);
    const nextState = rootReducer(initialState, { type: 'UNKNOWN_ACTION' } as UnknownAction);

    expect(nextState).toEqual(initialState);
    
    expect(nextState.construct).toBe(initialState.construct);
    expect(nextState.auth).toBe(initialState.auth);
  });
});
