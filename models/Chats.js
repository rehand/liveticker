Chats = new Mongo.Collection('Chats');
ChatEntries = new Mongo.Collection('ChatEntries');

ChatEntriesSchema = new SimpleSchema({
    id: {
        type: String,
        autoform: {
            type: "hidden",
            label: false,
            readonly: true
        },
        optional: true,
        autoValue: function () {
            if (!this.isSet && this.isInsert) {
                return new Mongo.Collection.ObjectID()._str;
            }
        }
    },
    timestamp: {
        type: Date,
        label: 'Minute',
        optional: true,
        autoValue: function () {
            if (!this.isSet && this.operator !== "$pull" && this.isInsert) {
                return new Date();
            }
        }
    },
    text: {
        type: String,
        label: 'Text'
    },
    eventType: {
        type: String,
        allowedValues: ALL_EVENT_TYPES,
        defaultValue: EVENT_TYPE_TEXT
    },
    chatId: {
        type: String
    }
});

ChatEntries.attachSchema(ChatEntriesSchema);

ChatComments = new SimpleSchema({
    id: {
        type: String,
        autoform: {
            type: "hidden",
            label: false,
            readonly: true
        },
        optional: true,
        autoValue: function () {
            if (!this.isSet) {
                return new Mongo.Collection.ObjectID()._str;
            }
        }
    },
    timestamp: {
        type: Date,
        optional: true,
        autoValue: function () {
            if (!this.isSet && this.operator !== "$pull") {
                return new Date();
            }
        }
    },
    name: {
        type: String,
        label: 'Name'
    },
    text: {
        type: String,
        label: 'Text'
    },
    approved: {
        type: Boolean,
        defaultValue: false
    },
    chatId: {
        type: String,
        optional: true
    }
});

Chats.attachSchema(
    new SimpleSchema({
        beginDate: {
            type: Date,
            optional: false,
            label: 'Beginn'
        },
        title: {
            type: String,
            optional: true,
            label: 'Titel'
        },
        published: {
            type: Boolean,
            defaultValue: false,
            label: 'Veröffentlicht'
        },
        comments: {
            type: [ChatComments],
            defaultValue: [],
            optional: true
        },
        timeChatStart: {
            type: Date,
            label: 'Beginn',
            optional: true
        },
        timeChatEnd: {
            type: Date,
            label: 'Ende',
            optional: true
        },
        createdAt: {
            type: Date,
            autoValue: function () {
                if (this.isInsert) {
                    return new Date();
                }
            },
            denyUpdate: true,
            optional: true
        },
        updatedAt: {
            type: Date,
            autoValue: function() {
                if (this.isUpdate) {
                    return new Date();
                }
            },
            optional: true
        }
    })
);

if (Meteor.isServer) {
    Chats.allow({
        insert: function () {
            return true;
        },
        update: function () {
            return true;
        },
        remove: function () {
            return true;
        }
    });

    ChatEntries.allow({
        insert: function () {
            return true;
        },
        update: function () {
            return true;
        },
        remove: function () {
            return true;
        }
    });

    Meteor.methods({
        addChat: function (chat) {
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            check(chat, Chats.simpleSchema());

            Chats.insert(chat);

            var redirect = {
                template: 'adminChats'
            };

            return redirect;
        },
        addChatEntry: function (data) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(data, Object);

            var chatId = data.chatId;
            check(chatId, String);

            var chat = Chats.findOne(chatId);
            if (chat === null) {
                throw new Meteor.Error("chat-not-found", "Chat nicht gefunden!");
            }

            var chatEntry = {text: data.chatEntryText, eventType: EVENT_TYPE_TEXT, chatId: chatId};
            check(chatEntry, ChatEntriesSchema);

            ChatEntries.insert(chatEntry);
        },
        editChatEntry: function (chatId, entryId, chatEntryText, entryTimestamp) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(chatId, String);
            check(entryId, String);
            check(chatEntryText, String);
            check(entryTimestamp, Date);

            var chat = Chats.findOne(chatId);
            if (chat === null) {
                throw new Meteor.Error("chat-not-found", "Chat nicht gefunden!");
            }

            var chatEntry = ChatEntries.findOne({id: entryId});
            if (chatEntry === null) {
                throw new Meteor.Error("entry-not-found", "Eintrag nicht gefunden!");
            }

            var value = {
                $set: {
                    'timestamp': entryTimestamp
                }
            };

            // update Text only in case of TEXT event
            if (chatEntry.eventType === EVENT_TYPE_TEXT) {
                value.$set['text'] = chatEntryText;
            }

            ChatEntries.update({id: entryId}, value);
        },
        moveChatEntry: function (chatId, entryId, entryIdTarget) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(chatId, String);
            check(entryId, String);
            check(entryIdTarget, String);

            var chat = Chats.findOne(chatId);
            if (chat === null) {
                throw new Meteor.Error("chat-not-found", "Chat nicht gefunden!");
            }

            var chatEntry = ChatEntries.findOne({id: entryId});
            if (chatEntry === null || chatEntry.chatId !== chatId) {
                throw new Meteor.Error("entry-not-found", "Eintrag nicht gefunden!");
            }

            var chatEntryTarget = ChatEntries.findOne({id: entryIdTarget});
            if (chatEntryTarget === null || chatEntryTarget.chatId !== chatId) {
                throw new Meteor.Error("entry-not-found", "Ziel-Eintrag nicht gefunden!");
            }

            // move all entries which would collide (which are within a range of 10ms) one ms down
            ChatEntries.find({
                chatId: chatId, 
                timestamp: {
                    $gt: new Date(chatEntryTarget.timestamp - 11),
                    $lt: chatEntryTarget.timestamp
                }
            }).fetch().forEach(function (entryToMove) {
                if (entryToMove.id !== entryId) {
                    ChatEntries.update({
                        chatId: chatId,
                        id: entryToMove.id
                    }, {
                        $set: {
                            'timestamp': new Date(entryToMove.timestamp - 1)
                        }
                    });
                }
            });
            
            ChatEntries.update({
                chatId: chatId, 
                id: entryId
            }, {
                $set: {
                    'timestamp': new Date(chatEntryTarget.timestamp - 1)
                }
            });
        },
        deleteChatEntry: function (chatId, entryId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(chatId, String);
            check(entryId, String);

            var chat = Chats.findOne(chatId);
            if (chat === null) {
                throw new Meteor.Error("chat-not-found", "Chat nicht gefunden!");
            }

            ChatEntries.remove({id: entryId});
        },
        updateChat: function (chat, chatId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(chat, Object);
            check(chatId, String);

            var thisChat = Chats.findOne(chatId);
            if (thisChat === null) {
                throw new Meteor.Error("chat-not-found", "Chat nicht gefunden!");
            }

            Chats.update(chatId, chat);

            var redirect = {
                template: 'adminChatDetail',
                param: {'_id': chatId}
            };

            return redirect;
        },
        deleteChat: function (chatId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(chatId, String);

            Chats.remove(chatId, function (error) {
                if (error) {
                    throw new Meteor.Error("chat-remove", "Während dem Löschen ist ein Fehler aufgetreten!");
                }
            });

            var redirect = {
                template: 'adminChats'
            };

            return redirect;
        },
        setChatTime: function (chatId, timeField) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(chatId, String);
            check(timeField, String);

            var chat = Chats.findOne(chatId);
            if (chat === null) {
                throw new Meteor.Error("chat-not-found", "Chat nicht gefunden!");
            }

            var data = {};
            data[timeField] = new Date();

            Chats.update(chatId, {$set: data});
        },
        resetChatTime: function (chatId, timeField) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(chatId, String);
            check(timeField, String);

            var chat = Chats.findOne(chatId);
            if (chat === null) {
                throw new Meteor.Error("chat-not-found", "Chat nicht gefunden!");
            }

            var data = {};
            data[timeField] = null;

            if (timeField === 'timeSecondHalfEnd') {
                data['votingEnabled'] = false;
            }

            Chats.update(chatId, {$set: data});
        },
        addChatComment: function (data) {
            check(data, Object);

            var chatId = data.chatId;
            check(chatId, String);

            var chat = Chats.findOne(chatId);
            if (chat === null) {
                throw new Meteor.Error("chat-not-found", "Chat nicht gefunden!");
            } else if (chat.timeChatEnd && chat.timeChatEnd !== null) {
                throw new Meteor.Error("chat-finished", "Kommentar kann nicht hinzugefügt werden!");
            }

            var chatComment = {
                name: data.name,
                text: data.text,
                approved: false
            };

            check(chatComment, ChatComments);

            Chats.update(chatId, {$push: {comments: chatComment}});

            return chatComment.name;
        },
        approveChatComment: function (chatId, commentId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(chatId, String);
            check(commentId, String);

            var chat = Chats.findOne(chatId);
            if (chat === null) {
                throw new Meteor.Error("chat-not-found", "Chat nicht gefunden!");
            }

            var comments_filtered = chat.comments.filter(function (comment) {
                return comment.id === commentId;
            });

            if (comments_filtered.length !== 1) {
                throw new Meteor.Error("comment-not-found", "Kommentar nicht gefunden!");
            }

            var comment = comments_filtered[0];

            var text = comment.name + ": " + comment.text;

            var chatEntry = {text: text, eventType: EVENT_TYPE_COMMENT, chatId: chatId};
            check(chatEntry, ChatEntriesSchema);

            Chats.update(chatId, {
                $pull: { // remove comment from comments
                    comments: {
                        id: commentId
                    }
                }
            });

            ChatEntries.insert(chatEntry);
        },
        deleteChatComment: function (chatId, commentId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(chatId, String);
            check(commentId, String);

            Chats.update(chatId, {
                $pull: { // remove comment from comments
                    comments: {
                        id: commentId
                    }
                }
            });
        },
        deleteAllChatComments: function (chatId, timestampLimit) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(chatId, String);
            check(timestampLimit, Date);

            var chat = Chats.findOne(chatId);
            if (chat === null) {
                throw new Meteor.Error("chat-not-found", "Chat nicht gefunden!");
            }

            var commentIds = chat.comments.filter(function (comment) {
                return comment.timestamp <= timestampLimit;
            }).map(function (comment) {
                return comment.id;
            });

            if (commentIds.length > 0) {
                const params = {
                    $pull: { // remove matched comments from comments
                        comments: {
                            id: { 
                                $in: commentIds, 
                            }
                        }
                    }
                };
                Chats.update(chatId, params);
            }
        }
    });
}