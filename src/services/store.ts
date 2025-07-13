import { configureStore, combineSlices } from '@reduxjs/toolkit';

import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';
import userSlice from './slices/userAuthorizedSlice';
import constructorSlice from './slices/burgerConstructorSlice';
import orderSlice from './slices/orderSlice';
import feedSlice from './slices/feedSlice';
import profileOrdersSlice from './slices/profileOrdersSlice';
import ingredientsSlice from './slices/ingredientsSlice';

export const rootReducer = combineSlices(
  userSlice,
  constructorSlice,
  orderSlice,
  feedSlice,
  profileOrdersSlice,
  ingredientsSlice
);

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;
