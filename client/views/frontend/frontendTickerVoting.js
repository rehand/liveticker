Template.votingForm.helpers({
    mapVotableKickers: mapVotableKickers,
    getVotingOptions: function () {
        return VOTING_OPTIONS;
    }
});

Template.referreeVotingForm.helpers({
    getVotingOptions: function () {
        return VOTING_OPTIONS;
    }
});

Template.frontendTickerVoting.events({
    "submit .votingForm": function (event) {
        event.preventDefault();

        var formValues = $('#votingForm').serializeArray();

        var inputToValue = function (input) {
            return input['value'];
        };

        var tickerId = formValues.filter(function (data) {
            return data.name == 'tickerId';
        }).map(inputToValue)[0];

        var dataComplete = formValues.filter(function (data) {
            return data.name.indexOf('[]') !== -1;
        });

        var dataKeys = dataComplete.filter(function (data) {
            return data.name.indexOf('kickerId') !== -1;
        }).map(inputToValue);

        var dataValues = dataComplete.filter(function (data) {
            return data.name.indexOf('voting') !== -1;
        }).map(inputToValue);

        var votings = {};

        for (var i=0; i < dataValues.length; i++) {
            votings[dataKeys[i]] = parseFloat(dataValues[i]);
        }

        // Coach Voting
        var coachIds = formValues.filter(function (data) {
            return data.name == 'coachId';
        }).map(inputToValue);

        var coachVotingValues = formValues.filter(function (data) {
            return data.name == 'coachVoting';
        }).map(inputToValue);

        var coachVotings = {};
        if (Array.isArray(coachIds) && coachIds.length > 0 && Array.isArray(coachVotingValues) && coachVotingValues.length > 0) {
            for (var i=0; i < coachVotingValues.length; i++) {
                coachVotings[coachIds[i]] = parseFloat(coachVotingValues[i]);
            }
        }

        // Referee Voting
        var refereeId = formValues.filter(function (data) {
            return data.name == 'refereeId';
        }).map(inputToValue);

        var refereeVotingValue = formValues.filter(function (data) {
            return data.name == 'refereeVoting';
        }).map(inputToValue);

        var refereeVoting = {};
        if (Array.isArray(refereeId) && refereeId.length > 0 && Array.isArray(refereeVotingValue) && refereeVotingValue.length > 0) {
            refereeVoting = {
                refereeId: refereeId[0],
                voting: parseFloat(refereeVotingValue[0])
            }
        }

        Meteor.call("tickerVoting", tickerId, votings, coachVotings, refereeVoting, function(error, data) {
            if (error) {
                console.error('error ' + error.reason);
                throwError(error.reason);
            } else if (data) {
                alert('Danke für deine Bewertung!');
                Router.go('frontendTickerDetail', {
                    '_id': tickerId
                });
            }
        });

        // Prevent default form submit
        return false;
    }
});