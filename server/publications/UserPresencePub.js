Meteor.publish('UserPresence', function (tickerId) {
    check(tickerId, String);

    var filter = {'state.tickerId': tickerId};

    return Presences.find(filter, {fields: {userId: true, state: true, session_created: true, session_expired: true}});
});