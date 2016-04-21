/**
 * Created by reini on 29.06.15.
 */

// Meteor.startup(function () {
//     var teamLogos = Teams.find({logo: {$ne: null}}, {fields: {logo: true}}).fetch();
//     var imageIds = [];
//
//     teamLogos.forEach(function (teamLogo) {
//         imageIds.push(teamLogo.logo);
//     });
//
//     console.log("Removing Images except IDs: " + JSON.stringify(imageIds));
//
//     Images.remove({_id: {$nin: imageIds}});
// });