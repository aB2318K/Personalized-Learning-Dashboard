describe('Dashboard Page Tests', () => {
    beforeEach(() => {
        cy.visit('https://personalized-learning-dashboard-1.onrender.com/login');
        cy.get('input[type="email"]').type('validEmail@example.com');
        cy.get('input[type="password"]').type('validPassword1!');
        cy.get('button[type="submit"]').click();
        cy.contains('You have successfully logged in.');
        cy.url().should('include', '/dashboard');
    });
    
    it('should display the header with search bar, notifications, and profile icon, and show profile dropdown on click', () => {
        cy.get('.header').should('be.visible'); cy.get('.header').contains('MyDashboard');
        cy.get('input[type="text"]').should('have.attr', 'placeholder', 'Search').should('be.visible');
        cy.get('.bell-icon').should('be.visible'); cy.get('.user-icon').should('be.visible');
        cy.get('.user-icon').click();
        cy.get('.absolute.right-0.mt-2.w-48').should('be.visible').within(() => { 
            cy.contains('Edit Profile').should('be.visible'); 
            cy.contains('Forum').should('be.visible'); 
            cy.contains('Logout').should('be.visible'); 
        });
        cy.get('.bell-icon').click();
        cy.get('.absolute.right-0.mt-2.w-64').should('be.visible');
    });
    
    it('should display the sidebar with navigation items', () => {
        cy.get('.sidebar').should('be.visible');
        cy.get('.sidebar').contains('Home');
        cy.get('.sidebar').contains('Tasks');
        cy.get('.sidebar').contains('Goals');
        cy.get('.sidebar').contains('History');
        cy.get('.sidebar').contains('Saved');
    });

    it('should display the dashboard tabs', () => {
        cy.get('button').contains('My Progress').should('be.visible');
        cy.get('button').contains('Upcoming Tasks').should('be.visible');
        cy.get('button').contains('Recommended For Me').should('be.visible');
        cy.get('button').contains('My Feedback').should('be.visible');
    });

    it('should check if chart class names exist in the Progress component', () => {
        cy.get('.goal-completion-chart').should('exist');
        cy.get('.goals-duration-chart').should('exist');
        cy.get('.task-completion-chart').should('exist');
        cy.get('.videos-watched-chart').should('exist');
    });    

    it('should display upcoming task and allow marking as complete and incomplete', () => {
        cy.get('button').contains('Upcoming Tasks').click();
        cy.get('.upcoming-tasks').should('be.visible');
        cy.contains('my task').should('be.visible');
        cy.get('button[aria-label="complete"]').click();
        cy.get('.completed-tasks').should('be.visible').contains('my task').should('be.visible');
        cy.get('button[aria-label="incomplete"]').click();
        cy.get('.upcoming-tasks').should('be.visible').contains('my task').should('be.visible');
    });

    it('should allow opening the feedback modal, submitting feedback, editing feedback, and deleting feedback all in one test', () => {
        cy.get('button').contains('My Feedback').click();
        cy.get('.grid .flex').first().click();
        cy.get('.fixed.inset-0.bg-black.bg-opacity-50').should('be.visible');
        cy.get('.fixed.inset-0.z-50').should('be.visible');

        const feedbackText = 'Great video, very informative!';
        cy.get('textarea').type(feedbackText);
        cy.get('button').contains('Submit Feedback').should('not.be.disabled').click();
        cy.get('.mt-4.absolute.bottom-20').should('contain', 'Feedback submitted successfully!');

        const updatedFeedbackText = 'Updated feedback: very helpful video!';
        cy.get('textarea').clear().type(updatedFeedbackText);
        cy.get('button').contains('Update Feedback').should('not.be.disabled').click();
        cy.get('.mt-4.absolute.bottom-20').should('contain', 'Feedback updated successfully!');

        cy.get('button').contains('Remove Feedback').click();
        cy.get('.mt-4.absolute.bottom-20').should('contain', 'Feedback deleted successfully!');
        cy.get('textarea').clear().type('This video was very bad, wasted my time.');
        cy.get('button').contains('Submit Feedback').should('not.be.disabled').click();
        cy.get('.w-full.bg-gray-400').should('be.visible');
        cy.get('.absolute.top-0.left-0.w-full.text-center.text-xs').should('contain', 'Very Negative'); 
        cy.get('button').contains('Remove Feedback').click();
    });
    
    it('should let users search in the search bar, navigate to the search results page and handle invalid searches', () => {
        cy.get('input[type="text"]').type('JavaScript');
        cy.get('.searchBtn').click();
        cy.url().should('include', '/dashboard/search?searchTerm=JavaScript');
        cy.get('li').should('exist').and('contain', 'JavaScript');
        cy.get('input[type="text"]').clear().type('music');
        cy.get('.searchBtn').click();
        cy.url().should('include', '/dashboard/search?searchTerm=invalid');
        cy.contains('This search is invalid').should('be.visible');
    })
});
