describe('Forum - Create New Post Test', () => {
    beforeEach(() => {
      cy.visit('https://personalized-learning-dashboard-1.onrender.com/login');
      cy.get('input[type="email"]').type('validEmail@example.com');
      cy.get('input[type="password"]').type('validPassword1!');
      cy.get('button[type="submit"]').click();
      cy.contains('You have successfully logged in.');
      cy.url().should('include', '/dashboard');
      cy.get('.user-icon').click();
      cy.contains('Forum').click();
      cy.url().should('include', '/forum');
      cy.contains('My Posts').click();
      cy.url().should('include', '/forum/my-posts');
    });
  
    
    it('should create a new post successfully', () => {
      cy.get('button').contains('Create New').click();
      cy.get('input#questionTitle').type('This is a test question title');
      cy.get('textarea#questionDescription').type('This is a test description for the question.');
      cy.get('.createBtn').click();
      cy.contains('Post created successfully!').should('be.visible');
      cy.wait(2000);
      cy.contains('This is a test question title').should('be.visible');
      cy.contains('This is a test description for the question.').should('be.visible');
    });

    it('should edit a post successfully', () => {
        cy.get('.w-full.mb-4.border-b').first().within(() => {
          cy.get('.editMdl').click(); 
        });
        cy.get('.fixed').should('be.visible'); 
        cy.get('input#editTitle').clear().type('Updated test question title');
        cy.get('textarea#editDescription').clear().type('Updated description for the test question.');
        cy.get('button').contains('Save').click();
        cy.contains('Post updated successfully!').should('be.visible');
        cy.wait(2000);
        cy.contains('Updated test question title').should('be.visible');
        cy.contains('Updated description for the test question.').should('be.visible');
    });

    it('should navigate to the new post page and verify the post is rendered correctly', () => {
        cy.contains('New Posts').click(); 
        cy.contains('Updated test question title').click(); 
        cy.url().should('include', '/forum/post/');
        cy.contains('Updated test question title').should('be.visible');
        cy.contains('Updated description for the test question.').should('be.visible'); 
    });
    
    it('should add an answer to a post', () => {
        cy.contains('New Posts').click();
        cy.contains('Updated test question title').click();
        cy.get('input[placeholder="Post your answer here"]').type('This is a test answer to the question.');
        cy.get('button[data-testid="send-answer"]').click(); 
        cy.contains('This is a test answer to the question.').should('be.visible'); 
    });
    
    it('should upvote and downvote an answer', () => {
        cy.contains('New Posts').click();
        cy.contains('Updated test question title').click();
        cy.get('input[placeholder="Post your answer here"]').type('This is a test answer to upvote and downvote.');
        cy.get('button[data-testid="send-answer"]').click(); 
        cy.contains('This is a test answer to upvote and downvote.').should('be.visible'); 
    
        cy.get('.w-5.h-5').first().click();
        cy.get('span').contains('1').should('be.visible'); 
    
        cy.get('.w-5.h-5').last().click(); 
        cy.get('span').contains('1').should('be.visible');
    });
    
    it('should delete an answer', () => {
        cy.contains('New Posts').click();
        cy.contains('Updated test question title').click();
        cy.get('input[placeholder="Post your answer here"]').type('This is a test answer to delete.');
        cy.get('button[data-testid="send-answer"]').click(); 
        cy.contains('This is a test answer to delete.').should('be.visible'); 
    
        cy.get('.del-ans').last().click(); 
        cy.contains('This is a test answer to delete.').should('not.exist'); 
    });

    it('should allow searching a post from search bar and navigate back to forum page when the navigation text is clicked', () => {
        cy.get('input[placeholder="Search in forum"]').type('Updated');
        cy.get('.searchBtn').click();  
        cy.wait(2000);
        cy.contains('Updated test question title').should('be.visible');
        cy.contains('Back to Forum').click();
        cy.url().should('eq', 'https://personalized-learning-dashboard-1.onrender.com/forum');
    })

    it('should delete a post', () => {
        cy.contains('Updated test question title').click();
        cy.get('[data-testid="delete"]').click();
        cy.get('[data-testid="delete-confirm"]').click();
        cy.contains('Post deleted successfully!').should('be.visible');
        cy.url().should('eq', 'https://personalized-learning-dashboard-1.onrender.com/forum'); 
    })
});
  