describe('History Page Tests', () => {
    beforeEach(() => {
        cy.visit('https://personalized-learning-dashboard-1.onrender.com/login');
        cy.get('input[type="email"]').type('validEmail@example.com');
        cy.get('input[type="password"]').type('validPassword1!');
        cy.get('button[type="submit"]').click();
        cy.contains('You have successfully logged in.');
        cy.url().should('include', '/dashboard');
    });
    
    it('should search for JavaScript, navigate to results, click video, and check if it appears in history', () => {
        cy.get('input[type="text"]').type('JavaScript');
        cy.get('.searchBtn').click();
        cy.url().should('include', '/dashboard/search?searchTerm=JavaScript');
        cy.contains('JavaScript').should('be.visible');
        cy.get('img').first().click(); 
        cy.get('.watch-modal').should('be.visible');
        cy.get('.video-close').click();
        cy.get('.sidebar').contains('History').click();
        cy.get('ul').contains('JavaScript').should('be.visible');
        cy.get('ul li').first().contains('JavaScript').should('be.visible');
        cy.get('ul li').first().find('img').should('be.visible');
    });

    it('should save a video and check if it appears in the saved videos page', () => {
        cy.get('.sidebar').contains('History').click();
        cy.get('ul li').first().find('.text-gray-500').contains('Save').click();
        cy.get('.sidebar').contains('Saved').click();
        cy.url().should('include', '/dashboard/saved');
        cy.get('ul').contains('JavaScript').should('be.visible');
        cy.get('ul li').first().find('img').should('be.visible');
    });
    
    it('should delete the video from history and verify it is removed', () => {
        cy.get('.sidebar').contains('History').click();
        cy.get('ul li').first().find('.text-gray-500').contains('Delete').click();
        cy.wait(2000); 
        cy.get('ul').should('not.contain', 'JavaScript');
    });
});
