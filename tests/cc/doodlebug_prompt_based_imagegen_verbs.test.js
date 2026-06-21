import { expect, test } from '@playwright/test';
import { features } from '../../features/cc/doodlebug_prompt_based_imagegen_verbs.spec.js';
import DoodlebugPromptImageGen from '../../selectors/cc/doodlebug_prompt_based_imagegen_verbs.page.js';

let doodlebug;

test.describe('CC Doodlebug Prompt Based Image Generation', () => {
  test.beforeEach(async ({ page }) => {
    doodlebug = new DoodlebugPromptImageGen(page);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  // TC-1 to TC-6: UI checks, style selection, and generate navigation — all 7 pages.
  features.forEach((feature) => {
    test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
      console.info(`[Test Page]: ${baseURL}${feature.path}`);

      await test.step('step-1: Navigate to Firefly feature page', async () => {
        await page.goto(`${baseURL}${feature.path}`);
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(`${baseURL}${feature.path}`);
      });

      // TC-1: Unity prompt bar is visible in the page marquee.
      await test.step('step-2: Verify unity prompt bar is visible in page marquee', async () => {
        await doodlebug.waitForWidgetReady();
        await expect(doodlebug.marqueeSection).toBeVisible();
        await expect(doodlebug.widgetRoot).toBeVisible();
        await expect(doodlebug.promptInput).toBeVisible();
        await expect(doodlebug.generateCTA).toBeVisible();
      });

      // TC-2: Prompt textarea has a non-empty default value when the page loads.
      await test.step('step-3: Verify prompt textarea is pre-filled with a default value on page load', async () => {
        const promptValue = await doodlebug.getPromptValue();
        expect(promptValue.length, `Expected non-empty default prompt, got: "${promptValue}"`).toBeGreaterThan(0);
      });

      // TC-3: Model dropdown contains all 4 expected AI models.
      await test.step('step-4: Verify model dropdown contains all expected AI models', async () => {
        await expect(doodlebug.modelContainer).toBeVisible();
        const availableModels = await doodlebug.openModelDropdownAndGetNames();
        for (const model of DoodlebugPromptImageGen.expectedModels) {
          expect(availableModels, `Model "${model}" should be present in the dropdown`).toContain(model);
        }
      });

      // TC-4: Style container has exactly 4 style thumbnails.
      await test.step('step-5: Verify unity style container has exactly 4 style images', async () => {
        await expect(doodlebug.styleContainer).toBeVisible();
        expect(await doodlebug.styleItems.count(), 'Expected exactly 4 style thumbnails').toBe(4);
      });

      // TC-5: Clicking each style thumbnail selects it and updates the preview window.
      await test.step('step-6: Verify clicking each style image highlights it in the preview window', async () => {
        // Dismiss the MEP overlay (always present on stage) before clicking.
        await doodlebug.dismissMepOverlay();
        const count = await doodlebug.styleItems.count();
        for (let i = 0; i < count; i++) {
          await doodlebug.selectStyleItem(i);
          expect(await doodlebug.isStyleItemSelected(i), `Style ${i} should be selected after click`).toBe(true);
          await expect(doodlebug.previewArea, `Preview window should be visible after clicking style ${i}`).toBeVisible();
        }
      });

      // TC-6: Generate CTA navigates to the Firefly stage product page.
      await test.step('step-7: Verify Generate CTA navigates to Firefly stage product page', async () => {
        await expect(doodlebug.generateCTA).toBeVisible();
        await doodlebug.generateCTA.click();
        await page.waitForURL((url) => url.toString().includes('firefly-stage.corp.adobe.com'), { timeout: 15000 });
        expect(page.url()).toContain('firefly-stage.corp.adobe.com');
      });
    });
  });

  // TC-7: Custom prompt + Firefly Image 5 model + Generate — all 7 pages.
  features.forEach((feature) => {
    test(
      `${feature.name}-customprompt-generate, ${feature.tags} @cc-doodlebug-custompromptgenerate`,
      async ({ page, baseURL }) => {
        console.info(`[Test Page]: ${baseURL}${feature.path}`);

        await test.step('step-1: Navigate to Firefly feature page', async () => {
          await page.goto(`${baseURL}${feature.path}`);
          await page.waitForLoadState('domcontentloaded');
          await expect(page).toHaveURL(`${baseURL}${feature.path}`);
        });

        await test.step('step-2: Verify Unity widget is ready', async () => {
          await doodlebug.waitForWidgetReady();
          await expect(doodlebug.widgetRoot).toBeVisible();
          await expect(doodlebug.promptInput).toBeVisible();
        });

        await test.step('step-3: Fill custom prompt in the prompt textarea', async () => {
          await doodlebug.dismissMepOverlay();
          await doodlebug.fillPrompt(feature.data.prompt);
          const value = await doodlebug.getPromptValue();
          expect(value, 'Prompt textarea should contain the custom prompt').toBe(feature.data.prompt);
        });

        await test.step('step-4: Select "Firefly Image 5" from the model dropdown', async () => {
          await expect(doodlebug.modelContainer).toBeVisible();
          await doodlebug.selectModelByName('Firefly Image 5');
          await expect(doodlebug.modelDropdownTrigger).toContainText('Firefly Image 5');
        });

        await test.step('step-5: Click Generate CTA and verify navigation to Firefly stage page', async () => {
          await expect(doodlebug.generateCTA).toBeVisible();
          await doodlebug.generateCTA.click();
          await page.waitForURL((url) => url.toString().includes('firefly-stage.corp.adobe.com'), { timeout: 15000 });
          expect(page.url()).toContain('firefly-stage.corp.adobe.com');
        });
      },
    );
  });
});
