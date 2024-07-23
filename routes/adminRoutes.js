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
                return [
                    Meteor.subscribe('Coaches')
                ];
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
                    Meteor.subscribe('TeamLogo', this.params.code),
                    Meteor.subscribe('Coaches')
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
                    Meteor.subscribe('Teams'),
                    Meteor.subscribe('Referees')
                ];
            }
        });

        this.route('adminTickerDetail', {
            path: '/admin/tickers/:_id',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                var tickerId = this.params._id;
                return [
                    Meteor.subscribe('TickerWithData', tickerId)
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id),
                    tickerEntries: TickerEntries.find({}, {
                        sort: {
                            timestamp: -1
                        }
                    })
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
                    Meteor.subscribe('Images'),
                    Meteor.subscribe('Referees')
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
                    Meteor.subscribe('Teams')
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id)
                };
            }
        });

        this.route('adminTickerVotings', {
            path: '/admin/tickers/:_id/votings',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                var tickerId = this.params._id;
                return [
                    Meteor.subscribe('TickerWithData', tickerId)
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id),
                    tickerEntries: TickerEntries.find({}, {
                        sort: {
                            timestamp: -1
                        }
                    })
                };
            }
        });

        this.route('adminTickerEditFormation', {
            path: '/admin/tickers/:_id/formation',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                return [
                    Meteor.subscribe('Ticker', this.params._id, false, true),
                    Meteor.subscribe('TickerTeams', this.params._id)
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id)
                };
            }
        });

        this.route('adminTickerExportFormation', {
            path: '/admin/tickers/:_id/formation/export',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                var tickerId = this.params._id;
                return [
                    Meteor.subscribe('TickerWithData', tickerId)
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id)
                };
            }
        });

        this.route('adminTickerStatistics', {
            path: '/admin/tickers/:_id/statistics',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                var tickerId = this.params._id;
                return [
                    Meteor.subscribe('Ticker', tickerId),
                    Meteor.subscribe('TickerTeams', tickerId)
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id)
                };
            }
        });

        this.route('adminTickerExportStatistics', {
            path: '/admin/tickers/:_id/statistics/export',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                var tickerId = this.params._id;
                return [
                    Meteor.subscribe('TickerWithData', tickerId)
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id)
                };
            }
        });

        this.route('adminChats', {
            path: '/admin/chats',
            waitOn: function() {
                return [
                    Meteor.subscribe('Chats')
                ];
            },
            data: function() {
                return {
                    chats: Chats.find({}, {sort: {beginDate: -1}})
                };
            }
        });

        this.route('adminChatCreate', {
            path: '/admin/chats/create',
            waitOn: function() {
                return [
                    Meteor.subscribe('Chats')
                ];
            }
        });

        this.route('adminChatDetail', {
            path: '/admin/chats/:_id',
            notFoundTemplate: 'chatNotFound',
            waitOn: function() {
                var chatId = this.params._id;
                return [
                    Meteor.subscribe('ChatWithData', chatId)
                ];
            },
            data: function() {
                return {
                    chat: Chats.findOne(this.params._id),
                    chatEntries: ChatEntries.find({}, {
                        sort: {
                            timestamp: -1
                        }
                    })
                };
            }
        });

        this.route('adminChatEdit', {
            path: '/admin/chats/:_id/edit',
            notFoundTemplate: 'chatNotFound',
            waitOn: function() {
                return [
                    Meteor.subscribe('Chat', this.params._id)
                ];
            },
            data: function() {
                return {
                    chat: Chats.findOne(this.params._id)
                };
            }
        });

        this.route('adminChatDelete', {
            path: '/admin/chats/:_id/delete',
            notFoundTemplate: 'chatNotFound',
            waitOn: function() {
                return [
                    Meteor.subscribe('Chat', this.params._id)
                ];
            },
            data: function() {
                return {
                    chat: Chats.findOne(this.params._id)
                };
            }
        });

        this.route('adminChatStatistics', {
            path: '/admin/chats/:_id/statistics',
            notFoundTemplate: 'chatNotFound',
            waitOn: function() {
                var chatId = this.params._id;
                return [
                    Meteor.subscribe('ChatWithData', chatId)
                ];
            },
            data: function() {
                return {
                    chat: Chats.findOne(this.params._id)
                };
            }
        });

        this.route('adminReferees', {
            path: '/admin/referees',
            waitOn: function() {
                return [Meteor.subscribe('Referees')];
            },
            data: function() {
                return {
                    referees: Referees.find({}, {sort: {name: 1}})
                };
            }
        });

        this.route('adminRefereeCreate', {
            path: '/admin/referees/create'
        });

        this.route('adminRefereeDetail', {
            path: '/admin/referees/:_id',
            waitOn: function() {
                return [
                    Meteor.subscribe('Referee', this.params._id)
                ];
            },
            notFoundTemplate: 'refereeNotFound',
            data: function() {
                return {
                    referee: Referees.findOne({_id: this.params._id})
                };
            }
        });

        this.route('adminRefereeEdit', {
            path: '/admin/referees/:_id/edit',
            waitOn: function() {
                return [
                    Meteor.subscribe('Referee', this.params._id)
                ];
            },
            notFoundTemplate: 'refereeNotFound',
            data: function() {
                return {
                    referee: Referees.findOne({_id: this.params._id})
                };
            }
        });

        this.route('adminRefereeDelete', {
            path: '/admin/referees/:_id/delete',
            waitOn: function() {
                return [
                    Meteor.subscribe('Referee', this.params._id)
                ];
            },
            notFoundTemplate: 'refereeNotFound',
            data: function() {
                return {
                    referee: Referees.findOne({_id: this.params._id})
                };
            }
        });

        this.route('adminCoaches', {
            path: '/admin/coaches',
            waitOn: function() {
                return [Meteor.subscribe('Coaches')];
            },
            data: function() {
                return {
                    coaches: Coaches.find({}, {sort: {name: 1}})
                };
            }
        });

        this.route('adminCoachCreate', {
            path: '/admin/coaches/create'
        });

        this.route('adminCoachDetail', {
            path: '/admin/coaches/:_id',
            waitOn: function() {
                return [
                    Meteor.subscribe('Coach', this.params._id)
                ];
            },
            notFoundTemplate: 'coacheNotFound',
            data: function() {
                return {
                    coach: Coaches.findOne({_id: this.params._id})
                };
            }
        });

        this.route('adminCoachEdit', {
            path: '/admin/coaches/:_id/edit',
            waitOn: function() {
                return [
                    Meteor.subscribe('Coach', this.params._id)
                ];
            },
            notFoundTemplate: 'coacheNotFound',
            data: function() {
                return {
                    coach: Coaches.findOne({_id: this.params._id})
                };
            }
        });

        this.route('adminCoachDelete', {
            path: '/admin/coaches/:_id/delete',
            waitOn: function() {
                return [
                    Meteor.subscribe('Coach', this.params._id)
                ];
            },
            notFoundTemplate: 'coacheNotFound',
            data: function() {
                return {
                    coach: Coaches.findOne({_id: this.params._id})
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
/*
    Router.onBeforeAction(requireLogin, {
        except: [
            'frontendOverview',
            'frontendTickers',
            'frontendTickerDetail',
            'frontendLink',
            'frontendTickerVoting',
            'frontendChats',
            'frontendChatDetail'
        ]
    });
    */
}
