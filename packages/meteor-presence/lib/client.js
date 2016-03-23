Presence = {};
Presence.state = function() {
  var currentRoute = Router.current();
  if (currentRoute && currentRoute.params) {
    return {
      tickerId: currentRoute.params._id,
      route: currentRoute.options.route.getName()
    };
  } else {
    return {};
  }
};

// For backwards compatibility
Meteor.Presence = Presence;

Meteor.startup(function() {
  Tracker.autorun(function() {
    // This also runs on sign-in/sign-out
    if (Meteor.status().status === 'connected')
      Meteor.call('updatePresence', Presence.state());
  });

  Meteor.setInterval(function() {
    Meteor.call('presenceTick');
  }, 30000);
});