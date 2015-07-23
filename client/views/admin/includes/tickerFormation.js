Template.tickerFormation.helpers({
    sortFormation: function (formation) {
        var getValue = function(value) {
            var pos = POSITIONS.indexOf(value.gamePosition);
            return pos < 0 ? 9999 : 1 + pos;
        };

        return formation.sort(function (value1, value2) {
            return getValue(value1) - getValue(value2);
        });
    }
});

Template.tickerFormationEntry.helpers({
    isInFormation: function (position) {
        return position && position != POS_NA;
    }
});