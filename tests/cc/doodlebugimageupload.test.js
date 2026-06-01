import { expect, test } from '@playwright/test';
import { features } from '../../features/cc/doodlebugimageupload.spec.js';
import DoodlebugImageUpload from '../../selectors/cc/doodlebugimageupload.page.js';

// Matches firefly.adobe.com, firefly-stage.corp.adobe.com, firefly.stage.adobe.com
const isFireflyUrl = (url) => /firefly[^/]*\.adobe\.com/.test(url.toString());

let doodlebugUpload;

test.describe('CC Doodlebug Image Upload Widget', () => {
  test.beforeEach(async ({ page }) => {
    doodlebugUpload = new DoodlebugImageUpload(page);
  });

  features.forEach((feature) => {
    test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
      console.info(`[Test Page]: ${baseURL}${feature.path}`);

      await test.step('step-1: Navigate to Firefly feature page', async () => {
        await page.goto(`${baseURL}${feature.path}`);
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(`${baseURL}${feature.path}`);
      });

      await test.step('step-2: Verify upload unity widget is visible in page marquee', async () => {
        await doodlebugUpload.waitForUploadWidgetReady();
        await expect(doodlebugUpload.uploadWidget).toBeVisible();
        await expect(doodlebugUpload.uploadButton).toBeVisible();
        await expect(doodlebugUpload.dropZone).toBeVisible();
        await expect(doodlebugUpload.dragAndDropText).toBeVisible();
        await expect(doodlebugUpload.uploadDisclaimer).toBeVisible();
      });

      await test.step('step-3: Select and upload image from desktop', async () => {
        await doodlebugUpload.uploadImageViaButton(feature.data.file);
      });

      await test.step('step-4: Verify splash upload screen and progress indicator', async () => {
        await expect(doodlebugUpload.splashScreen).toBeVisible({ timeout: 8000 });
        await expect(doodlebugUpload.progressHolder).toBeVisible();
      });

      await test.step('step-5: Verify user lands on Firefly product page', async () => {
        await page.waitForURL(isFireflyUrl, { timeout: 15000 });
      });
    });
  });
});
