Template.tickerFormation.helpers({
    sortAndPopulateFormation: function (formation) {
        return sortFormation(populateFormation(formation, this.tickerEntries.fetch()), false);
    }
});

Template.tickerFormationEntry.helpers({
    isInFormation: function (position) {
        return position && position != POS_NA;
    }
});