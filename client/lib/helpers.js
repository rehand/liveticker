/**
 * Created by reini on 28.03.15.
 */
Template.registerHelper("kickoffDate", function(timestamp) {
    var date = new Date(timestamp);
    return moment(date).format('DD.MM.YYYY HH:mm');
});

Template.registerHelper("chatDate", function(timestamp) {
    var date = new Date(timestamp);
    return moment(date).format('DD.MM.YYYY HH:mm');
});

Template.registerHelper("commentDate", function(timestamp) {
    var date = new Date(timestamp);
    return moment(date).format('DD.MM.YYYY HH:mm');
});