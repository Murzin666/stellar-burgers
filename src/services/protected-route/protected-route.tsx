import { useSelector } from '../../services/store';
import { Navigate, useLocation } from 'react-router-dom';

import {
  selectAuthorizedLoading,
  selectIsAuthorizedChecked,
  selectUser
} from '../slices/userAuthorizedSlice';
import { Preloader } from '@ui';
import { FC } from 'react';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: React.ReactNode;
};

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const location = useLocation();
  const { isLoading, isAuth } = useSelector((state) => ({
    isLoading: selectAuthorizedLoading(state),
    isAuth: selectIsAuthorizedChecked(state) && selectUser(state)
  }));

  if (isLoading) {
    return <Preloader />;
  }

  if (!onlyUnAuth && !isAuth) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (onlyUnAuth && isAuth) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};
