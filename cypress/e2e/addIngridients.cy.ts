describe('Конструктор бургера', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');

    cy.intercept('GET', '/api/auth/user', {
      fixture: 'user.json'
    }).as('getUser');

    window.localStorage.setItem('accessToken', 'test');
    window.localStorage.setItem('refreshToken', 'test');

    cy.visit('/');
    cy.wait(['@getIngredients', '@getUser']);
  });

  it('Должен добавлять булку в конструктор', () => {
    cy.get('[data-testid^="ingredient-"]').should('have.length.at.least', 2);

    cy.get('[data-testid="ingredient-bun"]')
      .first()
      .find('[data-testid="ingredient-add-container"]')
      .click();

    cy.get('[data-testid="constructor-bun-top"]').should('exist');
    cy.get('[data-testid="constructor-bun-bottom"]').should('exist');
  });
});
