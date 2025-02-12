describe('Saved Page Tests', () => {
    beforeEach(() => {
        cy.visit('https://personalized-learning-dashboard-1.onrender.com/login');
        cy.get('input[type="email"]').type('validEmail@example.com');
        cy.get('input[type="password"]').type('validPassword1!');
        cy.get('button[type="submit"]').click();
        cy.contains('You have successfully logged in.');
        cy.url().should('include', '/dashboard');
        cy.get('.sidebar').contains('Saved').click();
        cy.url().should('include', '/dashboard/saved');
    });
    
    it('should verify a saved video is present', () => {
        cy.get('ul li').first().should('be.visible');
        cy.get('ul li').first().find('img').should('be.visible');
    });

    it('should toggle watched status', () => {
        cy.get('ul li').first().contains('Mark as Watched').click();
        cy.wait(1000);
        cy.get('ul li').first().contains('Watched').should('be.visible');

        cy.get('ul li').first().contains('Watched').click();
        cy.wait(1000);
        cy.get('ul li').first().contains('Mark as Watched').should('be.visible');
    });

    it('should delete a saved video and verify removal', () => {
        cy.get('ul li').first().find('.text-gray-500').contains('Delete').click();
        cy.wait(2000);
        cy.get('ul').should('not.contain', 'JavaScript');
    });
});