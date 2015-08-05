/**
 * Created by reini on 28.03.15.
 */
Template.registerHelper("kickoffDate", function(timestamp) {
    var date = new Date(timestamp);
    return moment(date).format('DD.MM.YYYY HH:mm');
});

Template.registerHelper("reverseArray", function(array) {
    return array.reverse();
});