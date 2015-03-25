/**
 * Created by reini on 25.03.15.
 */

var hooksObject = {
    before: {
        'method-update': function(doc) {
            clearErrors();
            return doc;
        },
        'method': function(doc) {
            clearErrors();
            return doc;
        }
    },

    // The same as the callbacks you would normally provide when calling
    // collection.insert, collection.update, or Meteor.call
    //after: {
    //    // Replace `formType` with the form `type` attribute to which this hook applies
    //},

    // Called when form does not have a `type` attribute
    //onSubmit: function(insertDoc, updateDoc, currentDoc) {
        // You must call this.done()!
        //this.done(); // submitted successfully, call onSuccess
        //this.done(new Error('foo')); // failed to submit, call onError with the provided error
        //this.done(null, "foo"); // submitted successfully, call onSuccess with `result` arg set to "foo"
    //},

    // Called when any submit operation succeeds
    onSuccess: function(formType, result) {
        clearErrors();
        if (result && result.template) {
            if (result.param) {
                Router.go(result.template, result.param);
            } else {
                Router.go(result.template);
            }
        }
    },

    // Called when any submit operation fails
    onError: function(formType, error) {
        if (error) {
            throwError(error.reason);
        }
    }
};

AutoForm.addHooks(null, hooksObject);