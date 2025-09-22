describe('DuckDuckGo Search with Screenshot Comparison', () => {
  it('Searches, clicks first result, and compares screenshot', () => {
    const query = 'Rocket Raccoon - Marvel';
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    // Step 1: Request DuckDuckGo HTML
    cy.request(searchUrl).then((response) => {
      expect(response.status).to.eq(200);

      // Inject HTML into Cypress document
      cy.document().then((doc) => {
        doc.open();
        doc.write(response.body);
        doc.close();
      });
    });

    // Step 2: Grab first external result
    cy.get('a.result__a', { timeout: 15000 })
      .should('have.length.greaterThan', 0)
      .then(($links) => {
        const firstExternal = [...$links].find((link) => {
          const href = link.getAttribute('href');
          return href && href.includes('uddg='); 
        });

        expect(firstExternal, 'Found at least one external result').to.exist;

        // Decode DuckDuckGo redirect to get real URL
        const rawHref = firstExternal.getAttribute('href');
        const decodedHref = decodeURIComponent(rawHref.split('uddg=')[1]);

        cy.log(`🌐 Visiting: ${decodedHref}`);

        // Step 3: Visit the target page and take screenshot
        cy.visit(decodedHref, { timeout: 60000, failOnStatusCode: false });

        cy.get('body', { timeout: 20000 }).should('be.visible');

        const actual = 'cypress/screenshots/actual.png';
        const expected = 'cypress/screenshots/expected.png';
        const diff = 'cypress/screenshots/diff.png';

        // Take screenshot and compare
        cy.screenshot('actual', { capture: 'viewport' }).then(() => {
          cy.task('compareScreenshots', {
            actualImage: actual,
            expectedImage: expected,
            diffImage: diff,
          }).then((result) => {
            expect(result.match, 'Screenshots should match').to.be.true;
          });
        });
      });
  });
});
// /// <reference types="cypress" />

// describe('Google Search Test', () => {
//   it('Searches for Rocket Raccoon on Google', () => {
//     // Visit Google directly
//     cy.visit('https://www.google.com');

//    
//     cy.origin('https://www.google.com', () => {
//      
//       cy.get('textarea[name="q"]', { timeout: 10000 })
//         .should('be.visible')
//         .type('Rocket Raccoon - Marvel{enter}');
//     });

//    
//     cy.origin('https://www.google.com', () => {
//       // Wait for search results to appear and grab the first link
//       cy.get('#search a', { timeout: 10000 })
//         .should('exist')
//         .first()
//         .then((link) => {
//           const href = link.prop('href');
//           cy.log(` First result URL: ${href}`);
//         });
//     });
//   });
// });
