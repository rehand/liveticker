/**
 * Created by reini on 23.06.15.
 */
if (Meteor.isClient) {
    Router.map(function () {
        this.route('frontendTickers', {
            path: '/',
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

                if (this.params.target === 'currentTicker') {
                    currentTicker = Tickers.findOne();
                }

                if (currentTicker && currentTicker._id) {
                    Router.go('frontendTickerDetail', {_id: currentTicker._id});
                } else {
                    this.render('tickerNotFound');
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
                    Meteor.subscribe('Ticker', tickerId, true, true),
                    Meteor.subscribe('TickerTeams', tickerId, true),
                    Meteor.subscribe('TickerImages', tickerId, true),
                    Meteor.subscribe('TickerEntries', tickerId)
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
                }
            }

            document.title = title;
        }
    });
}
