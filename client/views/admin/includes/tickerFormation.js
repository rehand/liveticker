Template.tickerFormation.helpers({
    sortFormation: function (formation) {
        return sortFormation(formation, false);
    }
});

Template.tickerFormationEntry.helpers({
    isInFormation: function (position) {
        return position && position != POS_NA;
    }
});