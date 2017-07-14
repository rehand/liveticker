/**
 * Created by reini on 19.03.15.
 */
// Local (client-only) collection
Errors = new Mongo.Collection(null);

clearErrors = function() {
    Errors.remove({});
};

throwError = function(message) {
    Errors.insert({message: message});
    setTimeout(clearErrors, 5000);
};
