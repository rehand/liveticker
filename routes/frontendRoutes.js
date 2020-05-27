/**
 * Created by reini on 23.06.15.
 */
if (Meteor.isClient) {
    Router.map(function () {
        this.route('frontendOverview', {
            path: '/',
            waitOn: function() {
                return [
                    Meteor.subscribe('PublicTickers'),
                    Meteor.subscribe('PublicChats'),
                    Meteor.subscribe('Teams')
                ];
            },
            data: function() {
                return {
                    tickers: Tickers.find({}, {sort: {kickoff: -1}}),
                    chats: Chats.find({}, {sort: {beginDate: -1}})
                }
            }
        });

        this.route('frontendLink', {
            path: '/link/:target',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                return [
                    Meteor.subscribe('CurrentPublicTicker')
                ];
            },
            action: function () {
                var currentTicker;
                var targetRoute = 'frontendTickerDetail';

                if (this.params.target === 'currentTicker' || this.params.target === 'currentVoting') {
                    currentTicker = Tickers.findOne();

                    if (this.params.target === 'currentVoting') {
                        targetRoute = 'frontendTickerVoting';
                    }
                }

                if (currentTicker && currentTicker._id && targetRoute) {
                    Router.go(targetRoute, {_id: currentTicker._id});
                } else {
                    this.render('tickerNotFound');
                }
            }
        });

        this.route('frontendTickers', {
            path: '/tickers',
            waitOn: function() {
                return [
                    Meteor.subscribe('PublicTickers'),
                    Meteor.subscribe('Teams')
                ];
            },
            data: function() {
                return {
                    tickers: Tickers.find({}, {sort: {kickoff: -1}})
                }
            }
        });

        this.route('frontendTickerDetail', {
            name: 'frontendTickerDetail',
            path: '/tickers/:_id',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                var tickerId = this.params._id;
                return [
                    Meteor.subscribe('TickerWithData', tickerId, true, true)
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

        this.route('frontendTickerVoting', {
            name: 'frontendTickerVoting',
            path: '/tickers/:_id/voting',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                var tickerId = this.params._id;
                return [
                    Meteor.subscribe('TickerWithData', tickerId, true, true)
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

        this.route('frontendChats', {
            path: '/chats',
            waitOn: function() {
                return [
                    Meteor.subscribe('PublicChats')
                ];
            },
            data: function() {
                return {
                    chats: Chats.find({}, {sort: {beginDate: -1}})
                }
            }
        });

        this.route('frontendChatDetail', {
            name: 'frontendChatDetail',
            path: '/chats/:_id',
            notFoundTemplate: 'chatNotFound',
            waitOn: function() {
                var chatId = this.params._id;
                return [
                    Meteor.subscribe('ChatWithData', chatId, true, true)
                ];
            },
            data: function() {
                var chat = Chats.findOne(this.params._id);

                var chatEntries = [];
                if (chat) {
                    chatEntries = ChatEntries.find({}, {
                        sort: {
                            timestamp: -1
                        }
                    });
                }

                return {
                    chat: chat,
                    chatEntries: chatEntries
                };
            }
        });

    });

    // set page title
    Router.onAfterAction(function() {
        if (this.ready()) {
            var title = Meteor.App.NAME;

            if (typeof this.data === 'function') {
                var ticker = this.data().ticker;
                if (ticker) {
                    var homeTeamName = ticker.getHomeTeam().name;
                    var awayTeamName = ticker.getAwayTeam().name;

                    title += ': ' + homeTeamName + ' vs. ' + awayTeamName;
                } else {
                    var chat = this.data().chat;
                    if (chat) {
                        title += ': ' + chat.title;
                    }
                }
            }

            document.title = title;
        }
    });
}
