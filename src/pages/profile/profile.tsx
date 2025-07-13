import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';

import { useSelector, useDispatch } from '../../services/store';
import {
  selectAuthorizedError,
  selectAuthorizedLoading,
  selectUser,
  updateUser
} from '../../services/slices/userAuthorizedSlice';

export const Profile: FC = () => {
  /** TODO: взять переменную из стора */
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthorizedLoading);
  const error = useSelector(selectAuthorizedError);

  const [formValue, setFormValue] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormValue({
        name: user.name,
        email: user.email,
        password: ''
      });
    }
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (user) {
      dispatch(updateUser(formValue));
    }
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    if (user) {
      setFormValue({
        name: user.name,
        email: user.email,
        password: ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
      isLoading={isLoading}
      errorText={error}
    />
  );
};
