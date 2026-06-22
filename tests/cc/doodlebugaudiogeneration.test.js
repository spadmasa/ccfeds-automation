import { expect, test } from '@playwright/test';
import { features } from '../../features/cc/doodlebugaudiogeneration.spec.js';
import DoodlebugAudioGeneration from '../../selectors/cc/doodlebugaudiogeneration.page.js';

const uiFeatures = features.filter((f) => f.type === 'ui');
const functionalFeatures = features.filter((f) => f.type === 'functional');
const customPromptFeatures = features.filter((f) => f.type === 'customprompt');

let doodlebugAudio;

test.describe('CC Doodlebug AI Voice Generator Widget', () => {
  test.beforeEach(async ({ page }) => {
    doodlebugAudio = new DoodlebugAudioGeneration(page);
  });

  test.describe('UI checks — voice generator widget visibility', () => {
    uiFeatures.forEach((feature) => {
      test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
        console.info(`[Test Page]: ${baseURL}${feature.path}`);

        await test.step('step-1: Navigate to AI Voice Generator page', async () => {
          await page.goto(`${baseURL}${feature.path}`);
          await page.waitForLoadState('domcontentloaded');
          await expect(page).toHaveURL(`${baseURL}${feature.path}`);
        });

        await test.step('step-2: Verify Unity widget is visible in page marquee', async () => {
          await doodlebugAudio.waitForWidgetReady();
          await expect(doodlebugAudio.marqueeSection).toBeVisible();
          await expect(doodlebugAudio.promptInput).toBeVisible();
        });

        await test.step('step-3: Verify prompt textarea is displayed', async () => {
          await expect(doodlebugAudio.promptInput).toBeVisible();
        });

        await test.step('step-4: Verify default inline prompt text is pre-filled', async () => {
          const promptValue = await doodlebugAudio.getPromptValue();
          expect(promptValue).toContain(DoodlebugAudioGeneration.defaultPrompt);
        });

        await test.step('step-5: Verify model dropdown contains Firefly speech and ElevenLabs multilingual v2', async () => {
          await expect(doodlebugAudio.modelContainer).toBeVisible();
          const availableModels = await doodlebugAudio.openModelDropdownAndGetNames();
          for (const model of DoodlebugAudioGeneration.expectedModels) {
            expect(availableModels, `Model "${model}" should be present in the dropdown`).toContain(model);
          }
        });

        await test.step('step-6: Verify Generate CTA is visible', async () => {
          await expect(doodlebugAudio.generateCTA).toBeVisible();
        });

        await test.step('step-7: Verify legal disclaimer text and link are visible', async () => {
          const allParas = await page.locator('p').allTextContents();
          console.info('[Debug legal] paragraphs on page:', allParas.map((t) => t.trim()).filter(Boolean));
          await expect(doodlebugAudio.legalDisclaimer).toBeVisible();
          await expect(doodlebugAudio.legalLink).toBeVisible();
        });
      });
    });
  });

  test.describe('Custom prompt — enter user prompt and Generate to Firefly text-to-speech', () => {
    customPromptFeatures.forEach((feature) => {
      test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
        console.info(`[Test Page]: ${baseURL}${feature.path}`);

        await test.step('step-1: Navigate to AI Voice Generator page', async () => {
          await page.goto(`${baseURL}${feature.path}`);
          await page.waitForLoadState('domcontentloaded');
          await expect(page).toHaveURL(`${baseURL}${feature.path}`);
        });

        await test.step('step-2: Verify Unity widget is ready', async () => {
          await doodlebugAudio.waitForWidgetReady();
          await expect(doodlebugAudio.marqueeSection).toBeVisible();
          await expect(doodlebugAudio.promptInput).toBeVisible();
          await expect(doodlebugAudio.generateCTA).toBeVisible();
        });

        await test.step('step-3: Clear default prompt and enter custom prompt', async () => {
          await doodlebugAudio.dismissMepOverlay();
          await doodlebugAudio.fillPrompt(feature.data.prompt);
          const value = await doodlebugAudio.getPromptValue();
          expect(value, 'Textarea should contain the custom prompt').toBe(feature.data.prompt);
        });

        await test.step('step-4: Click Generate CTA', async () => {
          await doodlebugAudio.generateCTA.click();
        });

        await test.step('step-5: Verify Generate navigates to Firefly text-to-speech page with custom prompt', async () => {
          await page.waitForURL(
            (url) => url.toString().includes('firefly-stage.corp.adobe.com'),
            { timeout: 15000, waitUntil: 'domcontentloaded' },
          );
          expect(page.url()).toContain('textToSpeech');
        });
      });
    });
  });

  test.describe('Functional checks — Generate CTA redirects to Firefly text-to-speech', () => {
    functionalFeatures.forEach((feature) => {
      test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
        console.info(`[Test Page]: ${baseURL}${feature.path}`);

        await test.step('step-1: Navigate to AI Voice Generator page', async () => {
          await page.goto(`${baseURL}${feature.path}`);
          await page.waitForLoadState('domcontentloaded');
          await expect(page).toHaveURL(`${baseURL}${feature.path}`);
        });

        await test.step('step-2: Verify Unity widget is ready before interacting', async () => {
          await doodlebugAudio.waitForWidgetReady();
          await expect(doodlebugAudio.marqueeSection).toBeVisible();
          await expect(doodlebugAudio.promptInput).toBeVisible();
          await expect(doodlebugAudio.generateCTA).toBeVisible();
        });

        await test.step('step-3: Click Generate CTA', async () => {
          await doodlebugAudio.dismissMepOverlay();
          await doodlebugAudio.generateCTA.click();
        });

        await test.step('step-4: Verify Generate navigates to Firefly text-to-speech page', async () => {
          // Firefly SPA fires domcontentloaded quickly but delays the load event — use domcontentloaded to avoid timeout.
          await page.waitForURL(
            (url) => url.toString().includes('firefly-stage.corp.adobe.com'),
            { timeout: 15000, waitUntil: 'domcontentloaded' },
          );
          expect(page.url()).toContain('textToSpeech');
        });
      });
    });
  });
});
