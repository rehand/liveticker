var connections = {};

var expire = function(id) {
  //Presences.remove(id);

  Presences.update(id, {
    $set: {
      session_expired: Date.now()
    }
  });

  delete connections[id];
};

var tick = function(id) {
  connections[id].lastSeen = Date.now();
};

Meteor.startup(function() {
  Presences.remove({
    session_expired: {
      $exists: false
    }
  });

  Presences.remove({
    'state.tickerId': {
      $exists: false
    }
  });
});

Meteor.onConnection(function(connection) {
  // console.log('connectionId: ' + connection.id);
  Presences.insert({
    _id: connection.id,
    session_created: Date.now()
  });

  connections[connection.id] = {};
  tick(connection.id);

  connection.onClose(function() {
    // console.log('connection closed: ' + connection.id);
    expire(connection.id);
  });
});

Meteor.methods({
  presenceTick: function() {
    check(arguments, [Match.Any]);
    if (this.connection && connections[this.connection.id])
      tick(this.connection.id);
  }
});

Meteor.setInterval(function() {
  _.each(connections, function(connection, id) {
    if (connection.lastSeen < (Date.now() - 10000))
      expire(id);
  });
}, 5000);
