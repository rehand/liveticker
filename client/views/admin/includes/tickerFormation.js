Template.tickerFormation.helpers({
    sortAndPopulateFormation: function (formation) {
        var entries = [];
        if (this.tickerEntries) {
            entries = this.tickerEntries.fetch();
        }
        return sortFormation(populateFormation(formation, entries), false);
    }
});

Template.tickerFormationEntry.helpers({
    isInFormation: function (position) {
        return position && position != POS_NA;
    }
});