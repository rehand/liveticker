Router.configure({
    layoutTemplate: 'basicLayout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading'
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});

accountsUIBootstrap3.setLanguage('de');