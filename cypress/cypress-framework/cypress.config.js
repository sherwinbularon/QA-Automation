const { defineConfig } = require('cypress');
const fs = require('fs');
const PNG = require('pngjs').PNG;
// ✅ Fix for pixelmatch import (handles CommonJS/ESM difference)
const pixelmatch = require('pixelmatch').default || require('pixelmatch');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        compareScreenshots({ actualImage, expectedImage, diffImage }) {
          if (!fs.existsSync(expectedImage)) {
            console.warn(`📸 Baseline not found. Creating: ${expectedImage}`);
            fs.copyFileSync(actualImage, expectedImage);
            return { match: true, baselineCreated: true };
          }

          const actual = fs.readFileSync(actualImage);
          const expected = fs.readFileSync(expectedImage);

          const img1 = PNG.sync.read(actual);
          const img2 = PNG.sync.read(expected);

          const { width, height } = img1;
          const diff = new PNG({ width, height });

          const mismatch = pixelmatch(
            img1.data,
            img2.data,
            diff.data,
            width,
            height,
            { threshold: 0.1 }
          );

          if (mismatch > 0) {
            fs.writeFileSync(diffImage, PNG.sync.write(diff));
          }

          return { match: mismatch === 0 };
        }
      });
    },
    specPattern: "cypress/e2e/**/*.cy.js",
  }
});
