import { expect } from '@playwright/test';

export default class DoodlebugImageUpload {
  constructor(page) {
    this.page = page;

    // upload-marquee.js init() adds 'upload-marquee-block' and 'con-block' after decoration.
    // The static class .upload-marquee is stable and always present in the DOM.
    this.uploadWidget = page.locator('.upload-marquee');
    this.uploadsWrapper = page.locator('.upload-marquee-uploads');

    // On desktop Chromium tests, only the .desktop-up drop zone container is visible.
    // upload-marquee.js applyViewportClasses() adds mobile-up/tablet-up/desktop-up to each column.
    this.desktopDropZoneContainer = page.locator('.drop-zone-container.desktop-up');

    // div.drop-zone has the click→fileInput.click() listener (wireDropZoneAccessibility).
    // Clicking it is the correct way to trigger file selection on this block.
    this.dropZone = this.desktopDropZoneContainer.locator('div.drop-zone');

    // Upload button is an <a> tag (NOT <button>) — buildUploadActionControls() creates:
    // <a class="con-button blue action-button button-xl no-track">
    this.uploadButton = this.desktopDropZoneContainer.locator('a.action-button');

    // File input is hidden (.file-upload.hide); set files directly as fallback.
    this.fileInput = this.desktopDropZoneContainer.locator('input.file-upload');

    // Heading text inside the drop zone (e.g. "Or drag and drop here" on desktop column)
    this.dragAndDropText = this.dropZone.locator('.drop-zone-heading');

    // Disclaimer is appended to .drop-zone-container (outside the inner .drop-zone div)
    this.uploadDisclaimer = this.desktopDropZoneContainer.locator('p', { hasText: 'By uploading' });

    // Transition/splash screen shown by Unity after image is submitted.
    // transition-screen.js creates: createTag('div', { class: 'fragment splash-loader decorate', style: 'display: none' })
    // splashVisibilityController(true) adds the 'show' class to make it visible.
    this.splashScreen = page.locator('.fragment.splash-loader');

    // Progress bar is created inside the splash screen by TransitionScreen.buildProgressBar():
    // createTag('div', { class: 'progress-holder' }, progressBarHtml)
    this.progressHolder = page.locator('div.progress-holder');

    // Firefly product page elements — fill in the TODO with actual selectors after redirect
    // TODO: replace with the real locator visible on the Firefly product page
    this.fireflyProductPageIndicator = page.locator('TODO_FIREFLY_PRODUCT_PAGE_SELECTOR');
  }

  async waitForUploadWidgetReady(timeout = 15000) {
    // Milo sets data-block-status="loaded" after upload-marquee.js init() completes
    await this.page.locator('.upload-marquee[data-block-status="loaded"]').waitFor({ state: 'visible', timeout });
    // Also wait for the desktop drop zone to be present (Unity may render asynchronously)
    await this.dropZone.waitFor({ state: 'visible', timeout });
  }

  async uploadImageViaButton(filePath) {
    await expect(this.dropZone).toBeVisible({ timeout: 5000 });
    // Clicking div.drop-zone triggers wireDropZoneAccessibility → fileInput.click() → filechooser
    try {
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser', { timeout: 5000 }),
        this.dropZone.click(),
      ]);
      await fileChooser.setFiles(filePath);
    } catch {
      // Fallback: set files directly on the hidden file input
      await this.fileInput.setInputFiles(filePath);
    }
  }
}
