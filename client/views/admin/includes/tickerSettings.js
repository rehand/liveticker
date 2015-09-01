Template.tickerSettings.events({
    'change #tickerPlayAudio': function(event) {
        event.preventDefault();
        Session.set(SESSION_PLAY_AUDIO, event.target.checked);
    }
});