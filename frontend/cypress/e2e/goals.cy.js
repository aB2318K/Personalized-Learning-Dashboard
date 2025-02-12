describe('Goals Page Test', () => {
    beforeEach(() => {
        cy.visit('https://personalized-learning-dashboard-1.onrender.com/login');
        cy.get('input[type="email"]').type('validEmail@example.com');
        cy.get('input[type="password"]').type('validPassword1!');
        cy.get('button[type="submit"]').click();
        cy.contains('You have successfully logged in.');
        cy.url().should('include', '/dashboard');
        cy.visit('https://personalized-learning-dashboard-1.onrender.com/dashboard/goals');
    });
  
    it('should add a goal', () => {
      const goalName = 'Learn React';
      const goalTargetDate = '2025-06-01';

      cy.get('input[placeholder="Goal"]').type(goalName);
      cy.get('[data-testid="date-input"]').type(goalTargetDate);
      cy.get('button').contains('Add Goal').click();
      cy.contains(goalName).should('be.visible');
    });
  
    it('should edit a goal', () => {
      const goalName = 'Learn React';
      const newGoalName = 'Master React';

      cy.get('[data-testid="edit"]').first().click();
      cy.get('[data-testid="edit-goal-input"]').clear().type(newGoalName); 
      cy.get('button').contains('Save').click();
      cy.contains(newGoalName).should('be.visible');
      cy.contains(goalName).should('not.exist');
    });
  
    it('should complete a goal', () => {
      const goalName = 'Master React';
      cy.get('[data-testid="complete"]').first().click();
      cy.get('.completed-goals').within(() => { cy.contains(goalName).should('be.visible'); });
    });
    it('should incomplete a goal', () => {
        const goalName = 'Master React';
        cy.get('[data-testid="incomplete"]').first().click();
        cy.get('.completed-goals').within(() => { cy.contains(goalName).should('not.exist'); });
        cy.wait(2000)
        cy.contains(goalName).should('be.visible');
    });
  
    it('should delete a goal', () => {
      const goalName = 'Master React';
      cy.get('[data-testid="delete"]').first().click();
      cy.contains(goalName).should('not.exist');
    });
  
    it('should show an error when goal is invalid', () => {
      const invalidGoalName = 'Learn Cooking'; // Invalid based on your validation
      const goalTargetDate = '2025-06-01';
  
      cy.get('input[placeholder="Goal"]').type(invalidGoalName);
      cy.get('[data-testid="date-input"]').type(goalTargetDate);
      cy.get('button').contains('Add Goal').click();
      cy.contains('Your goal should be related to web development!').should('be.visible');
    });
  });
  