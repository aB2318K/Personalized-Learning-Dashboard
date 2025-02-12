describe('reset_page_test', () => {
    beforeEach(() => {
        cy.visit('https://personalized-learning-dashboard-1.onrender.com/reset-password');
    });
    it('Should have an email input field and a button', () => {
        cy.get('input[name="email"]').should('exist');
        cy.get('button[type="submit"]').should('exist');
    })
    it('Should not let users submit invalid email', () => {
        cy.get('input[name="email"]').type('invalidEmail');
        cy.get('button[type="submit"]').click();
        cy.get('.error_message').should('be.visible').and('contain', '*Please provide a valid email address in the format: example@domain.com');
    })

    it('Should not let users submit email not in database', () => {
        cy.get('input[name="email"]').type('invalidEmail@example.com');
        cy.get('button[type="submit"]').click();
        cy.get('.error_message').should('be.visible').and('contain', '*Email not found. Please check for typos or create a new account.');
    })

    it('Should display success message when correct email is provided', () => {
        cy.get('input[name="email"]').type('validEmail@example.com');
        cy.get('button[type="submit"]').click();
        cy.get('.success_message').should('be.visible').and('contain', 'A password reset link has been sent to your email');
    })

    it('Should navigate to log in page when log in link is clicked', () => {
        cy.get('a[href="/login"]').click();
      
        cy.url().should('include', '/login');
    })
    
} )

