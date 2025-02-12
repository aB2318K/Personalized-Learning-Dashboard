describe('signup_page_test', () => {
  beforeEach(() => {
      cy.visit('https://personalized-learning-dashboard-1.onrender.com/signup');
  });
  it('Should display sign up form', () => {
      cy.get('form').should('exist');
      cy.get('input[name="firstName"]').should('exist');
      cy.get('input[name="lastName"]').should('exist');
      cy.get('input[name="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
  })

  it('Should not let users register with empty credentials', () => {
      cy.get('button[type="submit"]').click();
      cy.get('.error_message').should('exist').and('have.length', 4);
      cy.url().should('include', '/signup');
  })

  it('Should not let users register with invalid email format', () => {
      cy.get('input[name="firstName"]').type('First');
      cy.get('input[name="lastName"]').type('Last');
      cy.get('input[name="email"]').type('invalidEmail');
      cy.get('input[type="password"]').type('validPassword1!');
      cy.get('button[type="submit"]').click();
      cy.get('.error_message').should('be.visible').and('contain', '*Please provide a valid email address in the format: example@domain.com');
  })

  it('Should not let users register with invalid password', () => {
      cy.get('input[name="firstName"]').type('First');
      cy.get('input[name="lastName"]').type('Last');
      cy.get('input[name="email"]').type('validEmail@example.com');
      cy.get('input[type="password"]').type('invalidPassword');
      cy.get('button[type="submit"]').click();
      cy.get('.error_message').should('be.visible').and('contain', '*Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character');
      cy.url().should('include', '/signup');
  })

  it('Should navigate to log in page upon successful registration', () => {
      cy.get('input[name="firstName"]').type('First');
      cy.get('input[name="lastName"]').type('Last');
      cy.get('input[name="email"]').type('validEmail@example.com');
      cy.get('input[type="password"]').type('validPassword1!');
      cy.get('button[type="submit"]').click();
      cy.get('.success_message').should('exist').and('contain', 'Account created successfully! Redirecting to login...')
      cy.url().should('include', '/login');
  })

  it('Should navigate to log in page when log in link is clicked', () => {
      cy.get('a[href="/login"]').click();
    
      cy.url().should('include', '/login');
  })

  it('Should not let users register with a registered email', () => {
      cy.get('input[name="firstName"]').type('First');
      cy.get('input[name="lastName"]').type('Last');
      cy.get('input[name="email"]').type('validEmail@example.com');
      cy.get('input[type="password"]').type('validPassword1!');
      cy.get('button[type="submit"]').click();
      cy.get('.error_message').should('be.visible').and('contain', '*This email is already registered. Try logging in instead.')
  }) 
})