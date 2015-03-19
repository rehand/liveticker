/**
 * Created by reini on 19.03.15.
 */
// Local (client-only) collection
Errors = new Mongo.Collection(null);

throwError = function(message) {
    Errors.insert({message: message});
};

clearErrors = function() {
    Errors.remove({});
}