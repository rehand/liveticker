Template.teamCoach.helpers({
    showCoach: function (ticker) {
        var showCoachIfTickerAfterDate = new Date('2018-01-01');
        return ticker && ticker.createdAt >= showCoachIfTickerAfterDate;
    }
});