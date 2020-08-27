if (Meteor.isServer) {
    var presenceFilterFrontend = function (entry) {
        return entry.state.route.indexOf('frontend') === 0;
    };
    
    var presenceFilterBackend = function (entry) {
        return entry.state.route.indexOf('admin') === 0;
    };
    
    var presenceFilterOnline = function (entry) {
        return !entry.session_expired;
    };

    Meteor.methods({
        getUserPresences: function (tickerId) {
            check(tickerId, String);

            var filter = {
                'state.tickerId': tickerId
            };
        
            var presences = Presences.find(filter, {
                fields: {
                    userId: true, 
                    'state.route': true,
                    session_created: true, 
                    session_expired: true
                }
            }).fetch();

            var presencesOnline = presences.filter(presenceFilterOnline);

            var userPresence = {
                connections: presencesOnline.length,
                frontend: presencesOnline.filter(presenceFilterFrontend).length,
                backend: presencesOnline.filter(presenceFilterBackend).length,
                visitsFrontend: presences.filter(presenceFilterFrontend).length
            };

            return {
                presences: presences,
                userPresences: userPresence
            };
        }
    });
}