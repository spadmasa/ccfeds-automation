import { expect, test } from '@playwright/test';
import { features } from '../../features/cc/youtubeGallery.spec.js';
import YoutubeGallery from '../../selectors/cc/youtubeGallery.page.js';

let youtubeGallery;

test.describe('youtube gallery', () => {
  test.beforeEach(async ({ page }) => {
    youtubeGallery = new YoutubeGallery(page);
  });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('open youtube gallery page', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('gallery block + grid + cards render', async () => {
      await youtubeGallery.waitForGalleryReady();
      await expect(youtubeGallery.galleryBlock).toBeVisible();
      await expect(youtubeGallery.galleryGrid).toBeVisible();
      await expect(youtubeGallery.galleryCards.first()).toBeVisible();
      expect(await youtubeGallery.galleryCards.count()).toBeGreaterThan(0);
    });
  });

  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('open youtube gallery page', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('every card displays the "Free" tag', async () => {
      await youtubeGallery.verifyAllCardsHaveFreeTag();
    });
  });

  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('open youtube gallery page', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('card enlarges on hover', async () => {
      await youtubeGallery.verifyCardEnlargesOnHover(0);
    });
  });

  test(`${features[3].name},${features[3].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[3].path}`);
    await test.step('open youtube gallery page', async () => {
      await page.goto(`${baseURL}${features[3].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[3].path}`);
    });
    await test.step('video plays inside card on hover', async () => {
      await youtubeGallery.verifyVideoPlaysOnHover(0);
    });
  });
});
