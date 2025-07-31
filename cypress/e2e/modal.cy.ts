describe('Тест работы модальных окон', () => {
  beforeEach(() => {
    cy.fixture('ingredients.json').then((ingredients) => {
      cy.intercept('GET', '/api/ingredients', {
        body: ingredients
      }).as('getIngredients');
    });

    cy.intercept('GET', '/api/auth/user', { 
      fixture: 'user.json' 
    }).as('getUser');

    window.localStorage.setItem('accessToken', 'test');
    window.localStorage.setItem('refreshToken', 'test');

    cy.visit('/');
    cy.wait(['@getIngredients', '@getUser']);
  });

  it('Должно открываться и закрываться по клику на крестик', () => {
    cy.get('[data-testid^="ingredient-"]').should('have.length.gt', 0);
    cy.get('[data-testid^="ingredient-"]').first().click();
    
    cy.get('[data-testid="modal"]').should('be.visible');
    cy.get('[data-testid="ingredient-details"]').should('exist');
    cy.get('[data-testid="ingredient-details-name"]').should('not.be.empty');
    
    cy.get('[data-testid="modal-close-button"]').click();
    cy.get('[data-testid="modal"]').should('not.exist');
  });

  it('Должно закрываться по клику на оверлей', () => {
    cy.get('[data-testid^="ingredient-"]').first().click();
    
    cy.get('[data-testid="modal"]').should('be.visible');
    cy.get('[data-testid="ingredient-details"]').should('exist');
    cy.get('[data-testid="ingredient-details-name"]').should('not.be.empty');
    
    cy.get('[data-testid="modal-overlay"]').click('topLeft', { force: true });
    
    cy.get('[data-testid="modal"]').should('not.exist');
    cy.get('[data-testid="modal-overlay"]').should('not.exist');
  });
});
