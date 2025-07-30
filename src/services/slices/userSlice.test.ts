import authorizedSlice, { loginUser, checkUserAuth } from './userSlice';

const initialState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null
};

describe('проверка userSlice', () => {
  test('Должен обрабатываться pending для loginUser', () => {
    const action = { type: 'auth/login/pending' };
    const state = authorizedSlice.reducer(initialState, action);
    expect(state.isLoading).toBe(true);
  });
});

test('Должен обрабатываться rejected для loginUser', () => {
  const error = 'Неизвестная ошибка';
  const action = {
    type: loginUser.rejected.type,
    error: { message: error }
  };
  const state = authorizedSlice.reducer(initialState, action);
  expect(state.error).toBe(error);
  expect(state.isLoading).toBe(false);
});

test('Должен обрабатываться fulfilled для checkUserAuth', () => {
  const mockUser = { name: 'Ivan', email: 'ivan@mail.ru' };
  const payload = {
    user: mockUser,
    isLoading: false,
    isAuthChecked: true,
    error: null
  };
  const state = authorizedSlice.reducer(
    initialState,
    checkUserAuth.fulfilled(payload, '')
  );
  expect(state.user).toEqual(mockUser);
  expect(state.isLoading).toBe(false);
  expect(state.isAuthChecked).toBe(true);
  expect(state.error).toBe(null);

});
