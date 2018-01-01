var chatFieldsExclude = {fields: {comments: 0, createdAt: 0, updatedAt: 0}};

Meteor.publish('Chats', function () {
    return Chats.find({}, chatFieldsExclude);
});

Meteor.publish('Chat', function (_id, onlyPublic, isFrontend) {
    check(_id, String);
    onlyPublic = !!onlyPublic;
    check(onlyPublic, Boolean);
    isFrontend = !!isFrontend;
    check(isFrontend, Boolean);

    var filter = {
        _id: _id
    };

    if (onlyPublic) {
        filter.published = true;
    }
    
    var excludeFields = {
        fields: {
            updatedAt: 0
        }
    };
    if (isFrontend) {
        excludeFields.fields.comments = 0;
    }

    return Chats.find(filter, excludeFields);
});

Meteor.publish('PublicChats', function () {
    return Chats.find({published: true}, chatFieldsExclude);
});

Meteor.publish('CurrentPublicChat', function () {
    return Chats.find({published: true}, {sort: {beginDate: -1}, limit: 1}, chatFieldsExclude);
});

var chatEntriesFieldsExclude = {fields: {chatId: 0}};

Meteor.publish('ChatEntries', function (chatId) {
    check(chatId, String);

    return ChatEntries.find({
        chatId: chatId
    }, chatEntriesFieldsExclude);
});