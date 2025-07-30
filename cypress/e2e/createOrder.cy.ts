describe('Создание заказа', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/ingredients', { fixture: 'ingredients.json' }).as(
      'getIngredients'
    );
    cy.intercept('GET', '/api/auth/user', { fixture: 'user.json' }).as(
      'getUser'
    );

    cy.setCookie('accessToken', 'test-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');

    cy.visit('/');
    cy.wait(['@getIngredients', '@getUser']);
  });

  afterEach(() => {
    cy.clearCookie('accessToken');
    localStorage.removeItem('refreshToken');
  });

  it('Должен открывать модальное окно с деталями ингредиента', () => {
    cy.get('[data-testid^="ingredient-"]').first().click();
    cy.get('[data-testid="ingredient-details"]').should('exist');
    cy.get('[data-testid="modal-close-button"]').click();
    cy.get('[data-testid="ingredient-details"]').should('not.exist');
  });

  it('Должен создавать заказ с булкой и начинкой', () => {
    cy.intercept('POST', 'https://norma.nomoreparties.space/api/orders', {
      statusCode: 200,
      body: {
        success: true,
        name: 'Тестовый бургер',
        order: { number: 85340 }
      }
    }).as('createOrder');

    cy.get('[data-testid="ingredient-bun"]')
      .first()
      .within(() => {
        cy.get('button').contains('Добавить').click();
        cy.get('button').contains('Добавить').click();
      });

    cy.get('[data-testid="ingredient-main"]')
      .first()
      .within(() => {
        cy.get('button').contains('Добавить').click();
      });

    cy.get('[data-testid="constructor-bun-top"]').should('exist');
    cy.get('[data-testid="constructor-bun-bottom"]').should('exist');

    cy.get('[data-testid="constructor-ingredients"]').should('exist');

    cy.get('[data-testid="order-button"]')
      .should('be.visible')
      .and('not.be.disabled')
      .and('contain', 'Оформить заказ');

    cy.get('[data-testid="order-button"]').click();

    cy.get('[data-testid="order-modal"]').should('exist').and('be.visible');

    cy.get('[data-testid="order-number"]').should('contain', '85340');
  });

  it('Должен перенаправлять на логин при попытке создать заказ без авторизации', () => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.window().then((win) => win.sessionStorage.clear());

    cy.intercept('GET', '**/api/auth/user', {
      statusCode: 401,
      body: { success: false, message: 'Not authorized' }
    }).as('authCheck');

    cy.visit('/');

    cy.wait('@authCheck');

    cy.get('[data-testid="ingredient-bun"]')
      .first()
      .within(() => {
        cy.get('button').contains('Добавить').click();
        cy.get('button').contains('Добавить').click();
      });

    cy.get('[data-testid="ingredient-main"]')
      .first()
      .within(() => {
        cy.get('button').contains('Добавить').click();
      });

    cy.get('[data-testid="order-button"]').should('not.be.disabled').click();

    cy.location('pathname', { timeout: 10000 }).should('eq', '/login');
  });
});
