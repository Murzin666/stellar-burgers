import { FC, useEffect, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { selectAllIngredients } from '../../services/slices/ingredientsSlice';
import { useSelector, useDispatch } from '../../services/store';
import { useParams } from 'react-router-dom';
import { getOrderByNumberApi } from '../../utils/burger-api';
import { setOrderData } from '../../services/slices/orderSlice';

type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

export const OrderInfo: FC = () => {
  const { number } = useParams();
  const dispatch = useDispatch();
  const ingredients = useSelector(selectAllIngredients);
  const { data } = useSelector((state) => state.order);
  const { orders: feedOrders } = useSelector((state) => state.feed);
  const { data: profileOrders } = useSelector((state) => state.profileOrders);

  useEffect(() => {
    if (!number) return;

    const existingOrder = [...feedOrders, ...profileOrders].find(
      (order) => order.number === Number(number)
    );

    if (existingOrder) {
      dispatch(setOrderData(existingOrder));
    } else {
      getOrderByNumberApi(Number(number))
        .then((response) => {
          if (response.success && response.orders.length > 0) {
            dispatch(setOrderData(response.orders[0]));
          } else {
            dispatch(setOrderData(null));
          }
        })
        .catch((error) => {
          console.error('Failed to load order:', error);
          dispatch(setOrderData(null));
        });
    }
  }, [number, dispatch, feedOrders, profileOrders]);

  const orderInfo = useMemo(() => {
    const order = data;
    if (!order || !ingredients.length) return null;

    const ingredientsInfo = order.ingredients.reduce((acc, item) => {
      const ingredient = ingredients.find((ing) => ing._id === item);
      return ingredient
        ? {
            ...acc,
            [item]: {
              ...ingredient,
              count: (acc[item]?.count || 0) + 1
            }
          }
        : acc;
    }, {} as TIngredientsWithCount);

    return {
      ...order,
      ingredientsInfo,
      date: new Date(order.createdAt),
      total: Object.values(ingredientsInfo).reduce(
        (sum, { price, count }) => sum + price * count,
        0
      )
    };
  }, [data, ingredients]);

  if (!orderInfo) return <Preloader />;

  return <OrderInfoUI orderInfo={orderInfo} />;
};
