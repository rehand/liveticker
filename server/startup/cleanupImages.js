/**
 * Created by reini on 29.06.15.
 */

Meteor.startup(function () {
    var imageIds = [];

    Teams.find({
        logo: {
            $ne: null
        }
    }).fetch().forEach(teamLogo => imageIds.push(teamLogo.logo));

    var tickers = Tickers.find().fetch();
    tickers.filter(ticker => ticker.getHomeTeam() && ticker.getHomeTeam().logo).forEach(ticker => imageIds.push(ticker.getHomeTeam().logo));
    tickers.filter(ticker => ticker.getAwayTeam() && ticker.getAwayTeam().logo).forEach(ticker => imageIds.push(ticker.getAwayTeam().logo));

    TickerEntries.find({
        image: {
            $ne: null
        }
    }).fetch().forEach(entry => imageIds.push(entry.image));

    ChatEntries.find({
        image: {
            $ne: null
        }
    }).fetch().forEach(entry => imageIds.push(entry.image));

    imageIds = arrayDistinct(imageIds);

    console.log("Removing unused images except " + imageIds.length + " IDs", imageIds);

    Images.remove({
        _id: {
            $nin: imageIds
        }
    }, (err, result) => {
        if (err) {
            console.error("Error during removing images", err);
        } else {
            console.log("Removed images:", result);
        }
    });
});