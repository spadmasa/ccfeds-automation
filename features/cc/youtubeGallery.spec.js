module.exports = {
  name: 'youtube gallery',
  features: [
    {
      tcid: '0',
      name: '@youtube-gallery-ui-grid',
      path: '/drafts/automation-pw/youtube-gallery?georouting=off',
      tags: '@cc @cc-youtubegallery @cc-youtubegallery-ui',
    },
    {
      tcid: '1',
      name: '@youtube-gallery-card-free-tag',
      path: '/drafts/automation-pw/youtube-gallery?georouting=off',
      tags: '@cc @cc-youtubegallery @cc-youtubegallery-freetag',
      elements: {
        freeTagLabel: 'Free',
      },
    },
    {
      tcid: '2',
      name: '@youtube-gallery-card-hover-enlarge',
      path: '/drafts/automation-pw/youtube-gallery?georouting=off',
      tags: '@cc @cc-youtubegallery @cc-youtubegallery-cardenlarge',
    },
    {
      tcid: '3',
      name: '@youtube-gallery-card-hover-videoplay',
      path: '/drafts/automation-pw/youtube-gallery?georouting=off',
      tags: '@cc @cc-youtubegallery @cc-youtubegallery-videoplay',
    },
  ],
};
