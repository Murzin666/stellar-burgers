import styles from './ingredients-category.module.css';
import { forwardRef } from 'react';
import { TIngredientsCategoryUIProps } from './type';
import { BurgerIngredient } from '@components';

export const IngredientsCategoryUI = forwardRef<
  HTMLUListElement,
  TIngredientsCategoryUIProps
>(({ title, titleRef, ingredients, ingredientsCounters }, ref) => (
  <>
    <div data-testid={`ingredients-${title.toLowerCase()}`}>
      <h3 className='text text_type_main-medium mt-10 mb-6' ref={titleRef}>
        {title}
      </h3>
      <ul className={styles.items} ref={ref} data-testid='ingredients-list'>
        {ingredients.map((ingredient) => (
          <BurgerIngredient
            ingredient={ingredient}
            key={ingredient._id}
            count={ingredientsCounters[ingredient._id]}
            data-testid={`ingredient-${ingredient.type}`}
          />
        ))}
      </ul>
    </div>
  </>
));
