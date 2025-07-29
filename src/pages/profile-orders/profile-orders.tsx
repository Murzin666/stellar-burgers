import { ProfileOrdersUI } from '@ui-pages';
import { FC } from 'react';

import { useSelector } from '../../services/store';
import { selectAllProfileOrders } from '../../services/slices/profileOrdersSlice';

export const ProfileOrders: FC = () => {
  /** TODO: взять переменную из стора */
  const orders = useSelector(selectAllProfileOrders);

  return <ProfileOrdersUI orders={orders} />;
};
