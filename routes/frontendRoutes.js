/**
 * Created by reini on 23.06.15.
 */
if (Meteor.isClient) {
    Router.map(function () {
        this.route('frontendTickers', {
            path: '/',
            waitOn: function () {
                return [
                    Meteor.subscribe('PublicTickers'),
                    Meteor.subscribe('Teams')
                ];
            },
            data: function () {
                return {
                    tickers: Tickers.find({}, {sort: {kickoff: -1}})
                }
            }
        });

        this.route('frontendTickerDetail', {
            path: '/tickers/:_id',
            notFoundTemplate: 'tickerNotFound',
            waitOn: function() {
                var tickerId = this.params._id;
                return [
                    Meteor.subscribe('Ticker', tickerId, true),
                    Meteor.subscribe('TickerTeams', tickerId, true),
                    Meteor.subscribe('TickerImages', tickerId, true)
                ];
            },
            data: function() {
                return {
                    ticker: Tickers.findOne(this.params._id)
                };
            }
        });

    });

    // set page title
    Router.onAfterAction(function() {
        if (this.ready()) {
            var title = Meteor.App.NAME;

            var ticker = this.data().ticker;
            if (ticker) {
                var homeTeamName = ticker.getHomeTeam().name;
                var awayTeamName = ticker.getAwayTeam().name;

                title += ': ' + homeTeamName + ' vs. ' + awayTeamName;
            }

            document.title = title;
        }
    })
}
