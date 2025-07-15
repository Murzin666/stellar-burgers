import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  loginUserApi,
  registerUserApi,
  logoutApi,
  getUserApi,
  updateUserApi
} from '../../utils/burger-api';
import { setCookie, deleteCookie } from '../../utils/cookie';

// Константы для путей и сообщений об ошибках
const DEFAULT_AUTH_REDIRECT = '/profile';
const ERROR_MESSAGES = {
  REGISTRATION: 'Ошибка при регистрации',
  LOGIN: 'Ошибка входа',
  UPDATE: 'Ошибка обновления данных',
  UNKNOWN: 'Неизвестная ошибка',
  USER_NOT_FOUND: 'Пользователь не найден'
};

// Типы
type TUser = {
  name: string;
  email: string;
};

type TAuthState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
};

type ApiError = {
  message: string;
  code?: number | null;
};

type LoginResponse = {
  user: TUser;
  from?: string;
};

type RegisterData = {
  email: string;
  password: string;
  name: string;
};

type LoginData = {
  email: string;
  password: string;
  from?: string;
};

type UpdateData = {
  name: string;
  email: string;
  password?: string;
};

// Асинхронные действия
export const registerUser = createAsyncThunk<
  TUser,
  RegisterData,
  { rejectValue: ApiError }
>('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await registerUserApi(data);
    setCookie('accessToken', response.accessToken, { secure: true });
    localStorage.setItem('refreshToken', JSON.stringify(response.refreshToken));
    return response.user;
  } catch (error) {
    return rejectWithValue({
      message:
        error instanceof Error ? error.message : ERROR_MESSAGES.REGISTRATION,
      code: (error as { code?: number })?.code || null
    });
  }
});

export const updateUser = createAsyncThunk<
  TUser,
  UpdateData,
  { rejectValue: ApiError }
>('auth/update', async (data, { rejectWithValue }) => {
  try {
    const response = await updateUserApi(data);
    return response.user;
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : ERROR_MESSAGES.UPDATE,
      code: (error as { code?: number })?.code || null
    });
  }
});

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginData,
  { rejectValue: ApiError }
>('auth/login', async (data, { rejectWithValue }) => {
  try {
    const response = await loginUserApi({
      email: data.email,
      password: data.password
    });
    setCookie('accessToken', response.accessToken, { secure: true });
    localStorage.setItem('refreshToken', JSON.stringify(response.refreshToken));
    return {
      user: response.user,
      from: data.from || DEFAULT_AUTH_REDIRECT
    };
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : ERROR_MESSAGES.LOGIN,
      code: (error as { code?: number })?.code || null
    });
  }
});

export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: ApiError }
>('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutApi();
    deleteCookie('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN,
      code: (error as { code?: number })?.code || null
    });
  }
});

export const checkUserAuth = createAsyncThunk<
  { user: TUser },
  void,
  { rejectValue: ApiError }
>('auth/check', async (_, { rejectWithValue }) => {
  try {
    const response = await getUserApi();
    if (!response.user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return response;
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN,
      code: (error as { code?: number })?.code || null
    });
  }
});

// Начальное состояние
const initialState: TAuthState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null
};

// Создание слайса
const authorizedSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
    resetAuthState: () => initialState
  },
  extraReducers: (builder) => {
    const handlePending = (state: TAuthState) => {
      state.isLoading = true;
      state.error = null;
    };

    const handleRejected = (
      state: TAuthState,
      action: PayloadAction<ApiError | undefined>
    ) => {
      state.isLoading = false;
      state.error = action.payload?.message || ERROR_MESSAGES.UNKNOWN;
    };

    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, handleRejected)

      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, handleRejected)

      .addCase(logoutUser.pending, handlePending)
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, handleRejected)

      .addCase(checkUserAuth.pending, handlePending)
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthChecked = true;
        state.error = null;
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || ERROR_MESSAGES.UNKNOWN;
        state.isAuthChecked = true;
      })

      .addCase(updateUser.pending, handlePending)
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, handleRejected);
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectAuthLoading: (state) => state.isLoading,
    selectAuthError: (state) => state.error,
    selectIsAuthenticated: (state) => !!state.user
  }
});

// Экспорты
export const { setAuthChecked, resetAuthState } = authorizedSlice.actions;
export const {
  selectUser,
  selectIsAuthChecked,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated
} = authorizedSlice.selectors;

export default authorizedSlice;
