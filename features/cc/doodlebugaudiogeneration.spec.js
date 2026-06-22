module.exports = {
  name: 'CC Doodlebug AI Voice Generator',
  features: [
    {
      tcid: '0',
      name: '@cc-doodlebug-aivoicegenerator-ui',
      path: '/products/firefly/features/ai-voice-generator?georouting=off',
      type: 'ui',
      tags: '@cc @cc-doodlebug @cc-audiobased-doodlebugchecks @cc-doodlebug-aivoicegenerator',
    },
    {
      tcid: '1',
      name: '@cc-doodlebug-aivoicegenerator-generate',
      path: '/products/firefly/features/ai-voice-generator?georouting=off',
      type: 'functional',
      tags: '@cc @cc-doodlebug @cc-audiobased-doodlebugchecks @cc-doodlebug-aivoicegenerator-generate',
    },
    {
      tcid: '2',
      name: '@cc-doodlebug-aivoicegenerator-customprompt-generate',
      path: '/products/firefly/features/ai-voice-generator?georouting=off',
      type: 'customprompt',
      data: { prompt: 'birds flying sounds in forest which is good to hear and sweet' },
      tags: '@cc @cc-doodlebug @cc-audiobased-doodlebugchecks @cc-doodlebug-aivoicegenerator-customprompt',
    },
  ],
};
