import { rootReducer } from './store';
import { UnknownAction } from 'redux';

describe('rootReducer', () => {
  test('Проверяем правильную инициализацию rootReducer', () => {
    const state = rootReducer(undefined, {} as UnknownAction);
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('construct');
  });
});
