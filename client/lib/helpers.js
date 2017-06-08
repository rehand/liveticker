/**
 * Created by reini on 28.03.15.
 */
Template.registerHelper("kickoffDate", function(timestamp) {
    var date = new Date(timestamp);
    return moment(date).format('DD.MM.YYYY HH:mm');
});

AutoForm.debug();