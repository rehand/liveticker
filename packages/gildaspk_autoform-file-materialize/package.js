Package.describe({
  name: "gildaspk:autoform-file-materialize",
  summary: "File upload for AutoForm with Materialize",
  description: "File upload for AutoForm with Materialize",
  version: "0.0.6_1",
  git: "http://github.com/djhi/meteor-autoform-file-materialize.git"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.2');

  api.use(
    [
    'coffeescript',
    'reactive-var',
    'underscore',
    'templating',
    'less',
    'aldeed:autoform',
    'cfs:dropped-event@0.0.10'
    ],
    'client');

  api.addFiles('lib/client/autoform-file.html', 'client');
  api.addFiles('lib/client/autoform-file.less', 'client');
  api.addFiles('lib/client/autoform-file.coffee', 'client');
});
