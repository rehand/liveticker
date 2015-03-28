/**
 * Created by reini on 28.03.15.
 */

var IR_Filters = {
    // show login if a guest wants to access private areas
    // Use: {only: [privateAreas] }
    isLoggedIn: function (pause) {
        if (!(Meteor.loggingIn() || Meteor.user())) {
            this.render('adminLogin');
            pause();
        }
    }
};