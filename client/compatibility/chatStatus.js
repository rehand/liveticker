Template.registerHelper("chatEntryTime", function() {
    var chat = Template.parentData(3).chat;
    return getChatTimeStr(chat, this.timestamp, true);
});

Template.registerHelper("chatTime", function() {
    return getChatTimeStr(this, undefined, false);
});

var getChatTimeStr = function (chat, timeObj, showTime) {
    var timeFrom = timeObj;
    if (!timeFrom) {
        timeFrom = new Date();
    }
    timeFrom = timeFrom.getTime();

    var chatTimeStr;
    if (showTime) {
        if (moment(timeFrom).isSame(Date.now(), 'day')) {
            chatTimeStr = moment(timeFrom).format('HH:mm') + ' Uhr';
        } else {
            chatTimeStr = moment(timeFrom).format('DD.MM.YYYY HH:mm') + ' Uhr';
        }
    } else {
        if (chat.timeChatEnd && chat.timeChatEnd.getTime() < timeFrom) {
            chatTimeStr = "Beendet";
        } else if (chat.timeChatStart && chat.timeChatStart.getTime() < timeFrom) {
            chatTimeStr = "Live";
        } else {
            chatTimeStr = "Vorbericht";
        }
    }

    return chatTimeStr;
};