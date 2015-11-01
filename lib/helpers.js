sortFormation = function (formation, onlyPosition) {
    var offset = POSITIONS.length;
    var getValue = function (value) {
        var pos;

        if (onlyPosition) {
            pos = POSITIONS.indexOf(value.position);
        } else {
            pos = POSITIONS.indexOf(value.gamePosition);

            if (pos < 0) {
                pos = offset + POSITIONS.indexOf(value.position);
            }
        }

        return pos < 0 ? 9999 : 1 + pos;
    };

    return formation.sort(function (value1, value2) {
        return getValue(value1) - getValue(value2);
    });
};