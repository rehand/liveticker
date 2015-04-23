Meteor.publish('Tickers', function () {
  return Tickers.find();
});

Meteor.publish('Ticker', function (_id) {
  check(_id, String);
  return Tickers.find(_id);
});