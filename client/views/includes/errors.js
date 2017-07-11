Template.errors.helpers({
    errors: function() {
        return Errors.find();
    }
});

Template.errors.events({
    "click .closeError": function () {
        clearErrors();
        console.log('clear errors');
    }
});