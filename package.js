Package.describe({
  name: 'poetic:formaldehyde',
  version: '0.1.3',
  summary: 'Easily manage application state using URL parameters.',
  git: 'https://github.com/poetic/formaldehyde.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('check@1.0.5');
  api.use('grigio:babel@0.1.8');

  api.addFiles('formaldehyde.es6.js', 'client');

  api.export('Formaldehyde', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('poetic:formaldehyde');
  api.addFiles('formaldehyde-tests.js');
});
