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

        this.route('adminTeamCreate', {
            path: '/admin/teams/create',
            waitOn: function() {
                return [Meteor.subscribe('Teams')];
            }
        });

        this.route('adminTeamDetail', {
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

        this.route('adminTeamEdit', {
            path: '/admin/teams/:code/edit',
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

        this.route('adminTeamDelete', {
            path: '/admin/teams/:code/delete',
            waitOn: function() {
                return [
                    Meteor.subscribe('Team', this.params.code),
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
            waitOn: function() {
                return [
                    Meteor.subscribe('Tickers'),
                    Meteor.subscribe('Teams')
                ];
            },
            data: function() {
                return {
                    tickers: Tickers.find({}, {sort: {kickoff: -1}})
                };
            }
        });

        this.route('adminTickerCreate', {
            path: '/admin/tickers/create',
            waitOn: function() {
                return [
                    Meteor.subscribe('Tickers'),
                    Meteor.subscribe('Teams')
                ];
            }
        });

        this.route('adminTickerDetail', {
            path: '/admin/tickers/:_id',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                var tickerId = this.params._id;
                return [
                    Meteor.subscribe('Ticker', tickerId),
                    Meteor.subscribe('TickerTeams', tickerId),
                    Meteor.subscribe('TickerImages', tickerId),
                    Meteor.subscribe('UserPresence', tickerId)
                ];
            },
            data: function() {
                var presences = Presences.find().fetch();

                var presencesOnline = presences.filter( function (entry) {
                    return !entry.session_expired;
                });

                var filterFrontend = function (entry) {
                    return entry.state.route.indexOf('frontend') === 0;
                };

                var filterBackend = function (entry) {
                    return entry.state.route.indexOf('admin') === 0;
                };

                var userPresence = {
                    connections: presencesOnline.length,
                    frontend: presencesOnline.filter(filterFrontend).length,
                    backend: presencesOnline.filter(filterBackend).length,
                    visitsFrontend: presences.filter(filterFrontend).length
                };

                return {
                    ticker: Tickers.findOne(this.params._id),
                    userPresence: userPresence
                };
            }
        });

        this.route('adminTickerEdit', {
            path: '/admin/tickers/:_id/edit',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                return [
                    Meteor.subscribe('Ticker', this.params._id),
                    Meteor.subscribe('Teams'),
                    Meteor.subscribe('Images')
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id)
                };
            }
        });

        this.route('adminTickerDelete', {
            path: '/admin/tickers/:_id/delete',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                return [
                    Meteor.subscribe('Ticker', this.params._id),
                    Meteor.subscribe('Teams'),
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id)
                };
            }
        });

        this.route('adminTickerEditFormation', {
            path: '/admin/tickers/:_id/formation',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                return [
                    Meteor.subscribe('Ticker', this.params._id),
                    Meteor.subscribe('Teams')
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id)
                };
            }
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
            'frontendTickers',
            'frontendTickerDetail'
        ]
    });
}
