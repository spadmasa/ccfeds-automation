import { expect } from '@playwright/test';

export default class YoutubeGallery {
  constructor(page) {
    this.page = page;

    // Gallery block + grid
    this.galleryBlock = page.locator('.prm-yt-gallery');
    this.galleryGrid = this.galleryBlock.locator('.pre-yt-grid');

    // Cards
    this.galleryCards = this.galleryBlock.locator('.pre-yt-card');
    this.cardInner = this.galleryBlock.locator('.pre-yt-card-inner').first();
    this.cardThumbnail = this.galleryBlock.locator('.pre-yt-card .image-wrapper img').first();
    this.cardFreeTag = this.galleryBlock.locator('.pre-yt-free-tag').first();
    this.cardInfoButton = this.galleryBlock.locator('.pre-yt-info-button').first();
    this.cardCloseButton = this.galleryBlock.locator('.pre-yt-close-card-button').first();
    this.cardInfoOverlay = this.galleryBlock.locator('.pre-yt-info-overlay').first();

    // Native <video> that plays on hover
    this.cardVideo = this.galleryBlock.locator('.pre-yt-card .video-wrapper video').first();
  }

  /**
   * Wait for the AEM block to finish initializing.
   * The block sets `data-block-status="loaded"` and renders cards into
   * `.pre-yt-grid` once its async work completes.
   * @param {number} timeout milliseconds (default 15000)
   */
  async waitForGalleryReady(timeout = 15000) {
    await this.galleryBlock.waitFor({ state: 'attached', timeout });
    await expect(this.galleryBlock, 'gallery block should reach data-block-status="loaded"').toHaveAttribute('data-block-status', 'loaded', { timeout });
    await this.galleryCards.first().waitFor({ state: 'attached', timeout });
  }

  /**
   * Verify every card exposes a "Free" tag.
   * Uses attachment + text checks (not visibility) so lazy-rendered cards
   * outside the viewport still pass.
   */
  async verifyAllCardsHaveFreeTag() {
    await this.waitForGalleryReady();
    const cardCount = await this.galleryCards.count();
    expect(cardCount, 'gallery should render at least one card').toBeGreaterThan(0);

    const tagCount = await this.galleryBlock.locator('.pre-yt-card .pre-yt-free-tag').count();
    expect(tagCount, `every card should have a .pre-yt-free-tag (cards: ${cardCount}, tags: ${tagCount})`).toBe(cardCount);

    for (let i = 0; i < cardCount; i += 1) {
      const tag = this.galleryCards.nth(i).locator('.pre-yt-free-tag');
      await expect(tag, `card ${i} "Free" tag should contain text "Free"`).toHaveText(/free/i);
    }
  }

  /**
   * Hover on a card and verify it enlarges.
   * The block applies `.expanded` to the card via JS on hover, which triggers
   * `transform: scale(var(--card-scale))` on `.pre-yt-card-inner`. So we check
   * both: the `.expanded` class is set AND the inner element's bounding box
   * grew.
   * @param {number} index 0-based card index (default 0)
   */
  async verifyCardEnlargesOnHover(index = 0) {
    await this.waitForGalleryReady();
    const card = this.galleryCards.nth(index);
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await card.scrollIntoViewIfNeeded();

    const cardInner = card.locator('.pre-yt-card-inner');
    const before = await cardInner.boundingBox();

    await card.hover();

    await expect(card, `card ${index} should gain the "expanded" class on hover`).toHaveClass(/\bexpanded\b/, { timeout: 5000 });

    // Let the scale transition settle
    await this.page.waitForTimeout(500);

    const after = await cardInner.boundingBox();
    expect(before, 'card-inner bounding box (before hover) should resolve').toBeTruthy();
    expect(after, 'card-inner bounding box (after hover) should resolve').toBeTruthy();
    const scaledUp = after.width > before.width || after.height > before.height;
    expect(scaledUp, `card ${index} inner should enlarge on hover (before: ${before.width}x${before.height}, after: ${after.width}x${after.height})`).toBe(true);
    return { before, after, scaledUp };
  }

  /**
   * Hover on the nth card and verify the embedded <video> starts playing.
   * @param {number} index 0-based card index (default 0)
   */
  async verifyVideoPlaysOnHover(index = 0) {
    await this.waitForGalleryReady();
    const card = this.galleryCards.nth(index);
    await card.waitFor({ state: 'visible', timeout: 10000 });
    await card.scrollIntoViewIfNeeded();

    const video = card.locator('.video-wrapper video');
    await expect(video, `card ${index} should contain a <video> element`).toHaveCount(1);

    const wasPausedBeforeHover = await video.evaluate((el) => el.paused);
    expect(wasPausedBeforeHover, `card ${index} <video> should be paused before hover`).toBe(true);

    await card.hover();

    await expect.poll(
      async () => video.evaluate((el) => !el.paused && el.currentTime > 0 && !el.ended),
      {
        message: `card ${index} <video> should be playing after hover`,
        timeout: 5000,
      },
    ).toBe(true);
  }
}
