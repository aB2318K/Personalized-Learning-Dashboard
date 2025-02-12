describe('Tasks Page Tests', () => {
    beforeEach(() => {
        cy.visit('https://personalized-learning-dashboard-1.onrender.com/login');
        cy.get('input[type="email"]').type('validEmail@example.com');
        cy.get('input[type="password"]').type('validPassword1!');
        cy.get('button[type="submit"]').click();
        cy.contains('You have successfully logged in.');
        cy.url().should('include', '/dashboard');
        cy.visit('https://personalized-learning-dashboard-1.onrender.com/dashboard/tasks');
    });

    it('should add a new task and display it in the correct column', () => {
        cy.get('input[type="text"]').should('be.visible');
        cy.get('input[type="date"]').should('be.visible');
        
        const taskName = 'Test Task';
        const taskDueDate = '2025-02-15';
    
        cy.get('input[placeholder="Task"]').type(taskName);
        cy.get('input[type="date"]').type(taskDueDate);
        cy.get('button').contains('Add Task').click();
        
        cy.get('.flex-1 .space-y-4').should('contain', taskName);
    });

    
    it('should edit an existing task', () => {
        const taskName = 'Test Task to Edit';
        const taskDueDate = '2025-02-15';
        cy.get('input[placeholder="Task"]').type(taskName);
        cy.get('input[type="date"]').type(taskDueDate);
        cy.get('button').contains('Add Task').click();

        cy.get('[data-testid="edit"]').first().click();
        cy.get('[data-testid="edit-task-input"]').clear().type('Updated Task Name');
        cy.get('[data-testid="edit-date-input"]').clear().type('2025-02-20');
        cy.get('button').contains('Save').click();

        cy.get('.flex-1 .space-y-4').should('contain', 'Updated Task Name');
        cy.get('.flex-1 .space-y-4').should('contain', '20/02/2025');
    });

    it('should delete a task', () => {
        const taskName = 'Test Task to Delete';
        const taskDueDate = '2025-02-15';
        cy.get('input[placeholder="Task"]').type(taskName);
        cy.get('input[type="date"]').type(taskDueDate);
        cy.get('button').contains('Add Task').click();

        cy.get('[data-testid="delete"]').first().click();
        cy.get('.flex-1 .space-y-4').should('not.contain', taskName);
    });

    it('should not allow adding a task with a past due date', () => {

        const taskName = 'Past Task';
        const taskDueDate = '2020-01-01';
        cy.get('input[placeholder="Task"]').type(taskName);
        cy.get('input[type="date"]').type(taskDueDate);
        cy.get('button').contains('Add Task').click();
        
        cy.get('.flex-1 .space-y-4').should('not.contain', taskName);
    });

    it('should display the correct task columns', () => {
        cy.get('.w-full').should('contain', 'Do This Week');
        cy.get('.w-full').should('contain', 'Do This Month');
        cy.get('.w-full').should('contain', 'Do Later');
    });
    
});
