export default class DoodlebugPromptImageGen {
  constructor(page) {
    this.page = page;

    // .hero-marquee is the visible marquee section where Unity injects the widget.
    // Unity reads the hidden .unity config block, then renders into this sibling.
    this.marqueeSection = page.locator('.hero-marquee');

    // Widget root created by Unity JS after async init — the reliable ready signal.
    // Appears as: <div class="unity-prompt-bar-style unity-enabled">
    this.widgetRoot = page.locator('.unity-prompt-bar-style.unity-enabled');

    // Prompt textarea: <textarea id="promptInput">
    // Unity pre-fills it with styles[0].prompt immediately after creation.
    this.promptInput = page.locator('textarea#promptInput');

    // Model selector — trigger opens/closes the list, items live in the DOM always.
    // Structure: div.models-container > button.selected-model + ul.verb-list > li > a.verb-link > span.model-name
    this.modelContainer = page.locator('.models-container');
    this.modelDropdownTrigger = page.locator('.models-container .selected-model');
    this.modelList = page.locator('.models-container .verb-list');
    this.modelNameItems = page.locator('.models-container .model-name');

    // Style thumbnails — 4 <li> items inside .unity-slf-style-container ul.
    // Unity adds .selected to the clicked <li>.
    this.styleContainer = page.locator('.unity-slf-style-container');
    this.styleItems = page.locator('.unity-slf-style-container ul li');

    // Preview area — updated when a style thumbnail is clicked.
    this.previewArea = page.locator('.unity-slf-preview');

    // Generate CTA: <a class="unity-act-btn gen-btn unity-slf-gen-btn">
    this.generateCTA = page.locator('a.unity-slf-gen-btn');
  }

  // AI models expected in the model dropdown.
  static get expectedModels() {
    return [
      'Gemini 3.1 (w/ Nano Banana 2)',
      'GPT Image 1.5',
      'Firefly Image 5',
      'FLUX.2 [pro]',
    ];
  }

  // Waits for the Unity widget to finish its async boot sequence.
  // Unity does NOT set data-block-status — widget root + textarea visibility is the signal.
  async waitForWidgetReady(timeout = 20000) {
    await this.widgetRoot.waitFor({ state: 'visible', timeout });
    await this.promptInput.waitFor({ state: 'visible', timeout });
  }

  // Returns the current trimmed value of the prompt textarea.
  async getPromptValue() {
    return (await this.promptInput.inputValue()).trim();
  }

  // Hides the MEP preview overlay (always present on stage) that blocks pointer events.
  // Uses the Popover API; falls back to display:none if hidePopover() is unavailable.
  async dismissMepOverlay() {
    await this.page.evaluate(() => {
      const el = document.querySelector('div.mep-preview-overlay');
      if (!el) return;
      try { el.hidePopover(); } catch { el.style.display = 'none'; }
    });
  }

  // Opens the model dropdown, reads all model name labels, then closes it with Escape
  // so the open dropdown does not intercept pointer events in subsequent steps.
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

  // Scrolls the style thumbnail to vertical center (avoids sticky nav header) then clicks it.
  async selectStyleItem(index) {
    const item = this.styleItems.nth(index);
    await item.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await item.click();
    return item;
  }

  // Returns true when the style <li> at index carries the .selected class.
  async isStyleItemSelected(index) {
    const className = await this.styleItems.nth(index).getAttribute('class') ?? '';
    return /\bselected\b/.test(className);
  }

  // Focuses and fills the prompt textarea. Call dismissMepOverlay() first on stage.
  async fillPrompt(promptText) {
    await this.promptInput.click();
    await this.promptInput.fill(promptText);
  }

  // Opens the model dropdown, clicks the entry matching modelName, then waits for
  // the list to close (falls back to Escape if Unity does not auto-close it).
  async selectModelByName(modelName) {
    await this.modelDropdownTrigger.click();
    await this.modelList.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.locator('.models-container a.verb-link', { hasText: modelName }).click();
    await this.modelList.waitFor({ state: 'hidden', timeout: 5000 }).catch(async () => {
      await this.page.keyboard.press('Escape');
    });
  }
}
