if (Meteor.isClient) {
    Router.map( function () {
        this.route('admin', {
            path: '/admin'
        });

        this.route('adminTeams', {
            path: '/admin/teams',
            waitOn: function() {
                return [Meteor.subscribe('Teams')];
            },
            data: function() {
                return {
                    teams: Teams.find({}, {sort: {name: 1}})
                };
            }
        });

        this.route('adminTeamsDetail', {
            path: '/admin/teams/:code',
            waitOn: function() {
                return [
                    Meteor.subscribe('Team', this.params.code),
                    Meteor.subscribe('TeamLogo', this.params.code)
                ];
            },
            notFoundTemplate: 'teamNotFound',
            data: function() {
                return {
                    team: Teams.findOne({code: this.params.code})
                };
            }
        });

        this.route('adminTickers', {
            path: '/admin/tickers',
            data: function() { return Tickers.find(); }
        });

        this.route('adminUsers', {
            path: '/admin/users'
        });

        this.route('adminLogin', {
            path: '/admin/login'
        });
    });

    var requireLogin = function () {
        if (!Meteor.user()) {
            if (Meteor.loggingIn()) {
                return this.render(this.loadingTemplate);
            } else {
                return this.render('adminLogin');
            }
        } else {
            this.next();
        }
    };

    Router.onBeforeAction(requireLogin, {
        except: [
        ]
    });
}
