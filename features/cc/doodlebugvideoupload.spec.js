const VIDEO_FILE = 'assets/testvideo.mp4';
const LONG_VIDEO_FILE = 'assets/longfile.mp4';

module.exports = {
  name: 'CC Doodlebug Video Upload',
  features: [
    {
      tcid: '0',
      name: '@cc-doodlebug-aivideoeditor-videoupload-ui',
      path: '/products/firefly/features/ai-video-editor?georouting=off',
      data: { file: VIDEO_FILE },
      type: 'ui',
      tags: '@cc @cc-doodlebug @cc-videobased-doodlebugchecks @cc-doodlebug-aivideoeditor',
    },
    {
      tcid: '1',
      name: '@cc-doodlebug-videoupscaler-videoupload-ui',
      path: '/products/firefly/features/video-upscaler?georouting=off',
      data: { file: VIDEO_FILE },
      type: 'ui',
      tags: '@cc @cc-doodlebug @cc-videobased-doodlebugchecks @cc-doodlebug-videoupscaler',
    },
    {
      tcid: '2',
      name: '@cc-doodlebug-aivideoeditor-videoupload-functional',
      path: '/products/firefly/features/ai-video-editor?georouting=off',
      data: { file: VIDEO_FILE },
      type: 'functional',
      tags: '@cc @cc-doodlebug @cc-videobased-doodlebugchecks @cc-doodlebug-aivideoeditor-upload',
    },
    {
      tcid: '3',
      name: '@cc-doodlebug-videoupscaler-videoupload-functional',
      path: '/products/firefly/features/video-upscaler?georouting=off',
      data: { file: VIDEO_FILE },
      type: 'functional',
      tags: '@cc @cc-doodlebug @cc-videobased-doodlebugchecks @cc-doodlebug-videoupscaler-upload',
    },
    {
      tcid: '4',
      name: '@cc-doodlebug-aivideoeditor-videoupload-error',
      path: '/products/firefly/features/ai-video-editor?georouting=off',
      data: { file: LONG_VIDEO_FILE },
      type: 'error',
      tags: '@cc @cc-doodlebug @cc-videobased-doodlebugchecks @cc-doodlebug-aivideoeditor-error',
    },
    {
      tcid: '5',
      name: '@cc-doodlebug-videoupscaler-videoupload-error',
      path: '/products/firefly/features/video-upscaler?georouting=off',
      data: { file: LONG_VIDEO_FILE },
      type: 'error',
      tags: '@cc @cc-doodlebug @cc-videobased-doodlebugchecks @cc-doodlebug-videoupscaler-error',
    },
  ],
};
