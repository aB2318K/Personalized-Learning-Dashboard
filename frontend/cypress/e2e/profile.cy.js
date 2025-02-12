describe('Edit Profile Page - Full Test', () => {
    beforeEach(() => {
        cy.visit('https://personalized-learning-dashboard-1.onrender.com/login');
        cy.get('input[type="email"]').type('validEmail@example.com');
        cy.get('input[type="password"]').type('validPassword1!');
        cy.get('button[type="submit"]').click();
        cy.contains('You have successfully logged in.');
        cy.url().should('include', '/dashboard');
        cy.get('.user-icon').click();
        cy.contains('Edit Profile').click();
        cy.url().should('include', '/dashboard/profile');
    });

    it('should verify and update first and last names', () => {
        cy.get('input#first_name').should('be.visible').and('have.value', 'First');
        cy.get('input#last_name').should('be.visible').and('have.value', 'Last');
        cy.get('input#first_name').clear().type('UpdatedFirst');
        cy.get('[data-testid="name-save"]').click();
        cy.reload();
        cy.get('input#first_name').should('have.value', 'UpdatedFirst');
    });

    it('should change the password successfully', () => {
        cy.contains('Update Password').click();
        cy.get('.password_modal').should('be.visible');
        cy.get('#current_password').type('validPassword1!');
        cy.get('#new_password').type('NewPassword1!');
        cy.get('#re_new_password').type('NewPassword1!');
        cy.get('[data-testid="save-password"]').click();
        cy.contains('Password successfully updated!').should('be.visible');
        cy.wait(2000);
        cy.get('.password_modal').should('not.exist');
        cy.contains('Update Password').click();
        cy.get('.password_modal').should('be.visible');
        cy.get('#current_password').type('NewPassword1!');
        cy.get('#new_password').type('validPassword1!');
        cy.get('#re_new_password').type('validPassword1!');
        cy.get('[data-testid="save-password"]').click();
        cy.contains('Password successfully updated!').should('be.visible');
        cy.wait(2000);
        cy.get('.password_modal').should('not.exist');
    });

    it('should delete the profile successfully', () => {
        cy.contains('Delete Profile').click();
        cy.get('.delete_modal').should('be.visible');
        cy.contains('Are you sure you want to delete your profile?').should('be.visible');
        cy.get('[data-testid="delete-profile"]').click();
        cy.url().should('include', '/login');
    });
});
