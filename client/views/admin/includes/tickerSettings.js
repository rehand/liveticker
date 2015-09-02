Template.tickerSettings.events({
    'change #tickerPlayAudio': function(event) {
        event.preventDefault();
        Session.set(SESSION_PLAY_AUDIO, event.target.checked);
    }
});

Template.tickerSettings.helpers({
    'settingPlayAudio': function () {
        return Session.get(SESSION_PLAY_AUDIO);
    }
});