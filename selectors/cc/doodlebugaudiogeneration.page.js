import { expect } from '@playwright/test';

export default class DoodlebugAudioGeneration {
  constructor(page) {
    this.page = page;

    // .hero-marquee is the visible marquee section where Unity injects the widget.
    this.marqueeSection = page.locator('.hero-marquee');

    // Widget root — matches any Unity-initialized element containing the prompt textarea.
    // Using a filter instead of a hardcoded class because the audio widget may use a
    // different class than the image-gen widget (.unity-prompt-bar-style.unity-enabled).
    this.widgetRoot = page.locator('[class*="unity-"]').filter({ has: page.locator('textarea#promptInput') });

    // Prompt textarea pre-filled with the default voice-gen welcome message.
    this.promptInput = page.locator('textarea#promptInput');

    // Model selector — same structure as image-gen Unity widget.
    this.modelContainer = page.locator('.models-container');
    this.modelDropdownTrigger = page.locator('.models-container .selected-model');
    this.modelList = page.locator('.models-container .verb-list');
    this.modelNameItems = page.locator('.models-container .verb-list .model-name');

    // Generate CTA button.
    this.generateCTA = page.locator('a.gen-btn');

    // Legal disclaimer — any paragraph anywhere on the page that contains a link and
    // mentions Adobe/terms/content. Scoped broadly because the audio widget places this
    // outside .hero-marquee unlike the image/video upload pages.
    this.legalDisclaimer = page.locator('p:has(a)').filter({ hasText: /adobe|terms|content|privacy|voice|firefly/i }).first();
    this.legalLink = this.legalDisclaimer.locator('a').first();
  }

  static get defaultPrompt() {
    // Curly apostrophes (U+2019) match the actual characters rendered by the Unity widget.
    return "Welcome! We’re excited for you to learn more about voice generation with Adobe Firefly. Let’s get started.";
  }

  static get expectedModels() {
    return ['Firefly Speech', 'ElevenLabs Multilingual v2'];
  }

  // Waits for the Unity audio widget to finish its async boot sequence.
  // Uses networkidle (not domcontentloaded) because Unity injects the widget via JS
  // after the initial HTML parse, so the textarea isn't in the DOM at DOMContentLoaded.
  async waitForWidgetReady(timeout = 30000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.promptInput.waitFor({ state: 'visible', timeout: 15000 });
  }

  async getPromptValue() {
    return (await this.promptInput.inputValue()).trim();
  }

  async fillPrompt(promptText) {
    await this.promptInput.click();
    await this.promptInput.fill(promptText);
  }

  // Hides the MEP preview overlay (always present on stage) that blocks pointer events.
  async dismissMepOverlay() {
    await this.page.evaluate(() => {
      const el = document.querySelector('div.mep-preview-overlay');
      if (!el) return;
      try { el.hidePopover(); } catch { el.style.display = 'none'; }
    });
  }

  // Opens the model dropdown, reads all model name labels, then closes it.
  async openModelDropdownAndGetNames() {
    await this.modelDropdownTrigger.click();
    await this.modelList.waitFor({ state: 'visible', timeout: 5000 });

    const names = [];
    const count = await this.modelNameItems.count();
    for (let i = 0; i < count; i++) {
      const text = await this.modelNameItems.nth(i).textContent();
      if (text) names.push(text.trim());
    }

    await this.page.keyboard.press('Escape');
    await this.modelList.waitFor({ state: 'hidden', timeout: 5000 });
    return names;
  }

}
