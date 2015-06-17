Package.describe({
  name: 'poetic:formaldehyde',
  version: '0.0.4',
  summary: 'Easily manage application state using URL parameters.',
  git: 'https://github.com/poetic/formaldehyde.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('formaldehyde.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('poetic:formaldehyde');
  api.addFiles('formaldehyde-tests.js');
});
