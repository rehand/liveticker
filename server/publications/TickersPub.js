Meteor.publish('Tickers', function () {
  return Tickers.find();
});
