/**
 * Created by reini on 26.03.15.
 */
Images = new FS.Collection("images", {
    stores: [new FS.Store.GridFS("images", {
        filter: {
            maxSize: 1048576, // in bytes <= 1MB
            allow: {
                contentTypes: ['image/*'],
                extensions: ['png', 'jpg']
            },
            onInvalid: function (message) {
                if (Meteor.isClient) {
                    throwError(message);
                } else {
                    console.log(message);
                }
            }
        }
    })]
});

if (Meteor.isServer) {
    Images.allow({
        insert: function (userId, doc) {
            return true;
        },
        update: function (userId, doc) {
            return true;
        },
        download: function (userId) {
            return true;
        }
    });
}