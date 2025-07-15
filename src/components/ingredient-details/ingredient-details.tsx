import { FC } from 'react';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useParams } from 'react-router-dom';
import { useSelector } from '../../services/store';
import styles from '../../components/ui//ingredient-details/ingredient-details.module.css';

export const IngredientDetails: FC = () => {
  const { id } = useParams();
  const { data, loading } = useSelector((state) => state.ingredients);
  const ingredientData = data.find((item) => item._id === id);

  if (!ingredientData) {
    return (
      <div className={styles.notFound}>
        <p className='text text_type_main-default mt-20'>
          Ингредиент не найден
        </p>
      </div>
    );
  }

  if (loading) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
