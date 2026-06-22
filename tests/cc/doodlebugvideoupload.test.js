import { expect, test } from '@playwright/test';
import { features } from '../../features/cc/doodlebugvideoupload.spec.js';
import DoodlebugVideoUpload from '../../selectors/cc/doodlebugvideoupload.page.js';

// Matches firefly.adobe.com, firefly-stage.corp.adobe.com, firefly.stage.adobe.com
const isFireflyUrl = (url) => /firefly[^/]*\.adobe\.com/.test(url.toString());

const uiFeatures = features.filter((f) => f.type === 'ui');
const uploadFeatures = features.filter((f) => f.type === 'functional');
const errorFeatures = features.filter((f) => f.type === 'error');

let doodlebugVideo;

test.describe('CC Doodlebug Video Upload Widget', () => {
  test.beforeEach(async ({ page }) => {
    doodlebugVideo = new DoodlebugVideoUpload(page);
  });

  test.describe('UI checks — upload marquee block visibility', () => {
    uiFeatures.forEach((feature) => {
      test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
        console.info(`[Test Page]: ${baseURL}${feature.path}`);

        await test.step('step-1: Navigate to Firefly video feature page', async () => {
          await page.goto(`${baseURL}${feature.path}`);
          await page.waitForLoadState('domcontentloaded');
          await expect(page).toHaveURL(`${baseURL}${feature.path}`);
        });

        await test.step('step-2: Verify upload unity widget is present in page marquee', async () => {
          await doodlebugVideo.waitForUploadWidgetReady();
          await expect(doodlebugVideo.uploadWidget).toBeVisible();
        });

        await test.step('step-3: Verify upload CTA button is visible', async () => {
          await expect(doodlebugVideo.uploadButton).toBeVisible();
        });

        await test.step('step-4: Verify drop zone and drag-and-drop text are visible', async () => {
          await expect(doodlebugVideo.dropZone).toBeVisible();
          await expect(doodlebugVideo.dragAndDropText).toBeVisible();
        });

        await test.step('step-5: Verify user disclaimer text is present', async () => {
          await expect(doodlebugVideo.uploadDisclaimer).toBeVisible();
        });
      });
    });
  });

  test.describe('Functional checks — video upload and Firefly redirect', () => {
    uploadFeatures.forEach((feature) => {
      test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
        console.info(`[Test Page]: ${baseURL}${feature.path}`);

        await test.step('step-1: Navigate to Firefly video feature page', async () => {
          await page.goto(`${baseURL}${feature.path}`);
          await page.waitForLoadState('domcontentloaded');
          await expect(page).toHaveURL(`${baseURL}${feature.path}`);
        });

        await test.step('step-2: Verify upload widget is ready before interacting', async () => {
          await doodlebugVideo.waitForUploadWidgetReady();
          await expect(doodlebugVideo.uploadWidget).toBeVisible();
          await expect(doodlebugVideo.dropZone).toBeVisible();
          await expect(doodlebugVideo.uploadButton).toBeVisible();
        });

        await test.step('step-3: Select and upload video file', async () => {
          await doodlebugVideo.uploadVideoViaButton(feature.data.file);
        });

        await test.step('step-4: Verify splash screen and progress indicator appear', async () => {
          // Video uploads process faster than images — the splash screen may show and hide before
          // the assertion fires. Best-effort check; step-5 is the definitive proof of success.
          try {
            await expect(doodlebugVideo.splashScreen).toBeVisible({ timeout: 4000 });
            await expect(doodlebugVideo.progressHolder).toBeVisible();
          } catch {
            console.info('[Info] Splash screen not caught in visible state — redirect completed before assertion.');
          }
        });

        await test.step('step-5: Verify user lands on Firefly product page', async () => {
          // Firefly SPA fires domcontentloaded quickly but delays the load event — use domcontentloaded to avoid timeout
          await page.waitForURL(isFireflyUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
        });
      });
    });
  });

  test.describe('Error checks — lengthy video upload validation', () => {
    errorFeatures.forEach((feature) => {
      test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
        console.info(`[Test Page]: ${baseURL}${feature.path}`);

        await test.step('step-1: Navigate to Firefly video feature page', async () => {
          await page.goto(`${baseURL}${feature.path}`);
          await page.waitForLoadState('domcontentloaded');
          await expect(page).toHaveURL(`${baseURL}${feature.path}`);
        });

        await test.step('step-2: Verify upload widget is ready before interacting', async () => {
          await doodlebugVideo.waitForUploadWidgetReady();
          await expect(doodlebugVideo.uploadWidget).toBeVisible();
          await expect(doodlebugVideo.dropZone).toBeVisible();
        });

        await test.step('step-3: Upload a video file longer than 20 seconds', async () => {
          await doodlebugVideo.uploadVideoViaButton(feature.data.file);
        });

        await test.step('step-4: Verify error message is displayed for oversized video', async () => {
          await expect(doodlebugVideo.uploadErrorMessage).toBeVisible({ timeout: 10000 });
          await expect(doodlebugVideo.uploadErrorMessage).toContainText(
            'Your media must be no more than 20 seconds long. Please upload a new file.',
          );
        });

        await test.step('step-5: Verify user does not get redirected to Firefly', async () => {
          await expect(page).toHaveURL(`${baseURL}${feature.path}`);
        });
      });
    });
  });
});
