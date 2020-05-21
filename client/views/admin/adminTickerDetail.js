/**
 * Created by reini on 18.03.15.
 */

var timer;

Template.adminTickerDetail.created = function() {
    serverOffset = TimeSync.serverOffset();
    calcGameTime();
    timer = Meteor.setInterval(calcGameTime, 1000);

    Session.setDefault(SESSION_PLAY_AUDIO, false);
};

Template.adminTickerDetail.rendered = function () {
    $('.add-ticker-entry textarea').keypress(function (e) {
        if (e.which == 13) {
            $(e.target).parents('form').submit();
            e.preventDefault();
        }
    });

    $('form.substitutionEventForm').closest('div.modal').on('shown.bs.modal', function (event) {
        $(event.target).find('input[name="eventType"]').first().prop("checked", true);
    });
};

Template.adminTickerDetail.destroyed = function() {
    Meteor.clearInterval(timer);
};

Template.adminTickerDetail.helpers({
    sortReverse: function (entries) {
        return sortReverse(entries);
    }
});

Template.addTickerEntry.events({
    "submit .add-ticker-entry": function (event) {
        event.preventDefault();

        var tickerEntryText = event.target[0].value;
        var tickerId = Router.current().params._id;

        var files = $('#tickerEntryImageUpload')[0].files;
        if (files && files.length > 0) {
            var file = files[0];
            var fr = new FileReader();
            fr.onload = function () {
                img = new Image();
                img.onload = function () {
                    var width = img.width;
                    var height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_IMAGE_UPLOAD_WIDTH) {
                            height *= MAX_IMAGE_UPLOAD_WIDTH / width;
                            width = MAX_IMAGE_UPLOAD_WIDTH;
                        }
                    } else {
                        if (height > MAX_IMAGE_UPLOAD_HEIGHT) {
                            width *= MAX_IMAGE_UPLOAD_HEIGHT / height;
                            height = MAX_IMAGE_UPLOAD_HEIGHT;
                        }
                    }
                    
                    var canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    var ctx = canvas.getContext("2d");
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, width, height);

                    var dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        
                    Images.insert(dataUrl, function (err, fileObj) {
                        if (err) {
                            console.error('error during image upload', err);
                            alert('Bild konnte nicht hochgeladen werden');
                            return;
                        }

                        callAddTickerEntry(tickerId, tickerEntryText, event, fileObj._id);
                    });
                };
                img.src = fr.result;
            };
            fr.readAsDataURL(file);
        } else {
            callAddTickerEntry(tickerId, tickerEntryText, event);
        }

        // Prevent default form submit
        return false;
    }
});

var callAddTickerEntry = function (tickerId, tickerEntryText, event, imageId) {
    try {
        Meteor.call("addTickerEntry", {
            tickerId: tickerId,
            tickerEntryText: tickerEntryText,
            imageId: imageId
        });
    } catch (e) {
        console.error("addTickerEntry failed due to", e);
    }

    // Clear form
    event.target[0].value = "";

    // Clear image upload
    $('#tickerEntryImagePreview').empty();
    $('#tickerEntryImageUpload').val(null);

    // Resize form
    Stretchy.resizeAll('textarea');
}

Template.tickerComment.events({
    "click .delete-comment": function (event) {
        return commentEvent(event, "deleteTickerComment");
    },
    "click .approve-comment": function (event) {
        return commentEvent(event, "approveTickerComment");
    }
});

var commentEvent = function (event, method) {
    event.preventDefault();

    var commentId = event.target.getAttribute('data-comment-id');
    if (!commentId) {
        commentId = event.target.parentNode.getAttribute('data-comment-id');
    }
    var tickerId = Router.current().params._id;

    Meteor.call(method, tickerId, commentId, function (error) {
        if (error) {
            console.error('error ' + error.reason);
        }
    });

    // Prevent default form submit
    return false;
};

Template.adminTickerDetail.events({
    "click .score-button": function (event, template) {
        event.preventDefault();

        var type = event.target.getAttribute('data-type');
        if (!type) {
            type = event.target.parentNode.getAttribute('data-type');
        }

        var isHomeScore = type.indexOf("home") > -1;
        var value = ~type.indexOf("+") ? 1 : -1;

        var currentScore = isHomeScore ? template.data.ticker.scoreHome : template.data.ticker.scoreAway;

        if (value > 0 || currentScore + value >= 0) {
            var tickerId = Router.current().params._id;

            Meteor.call("changeScore", tickerId, isHomeScore, value, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    },
    "click .time-button": function (event, template) {
        event.preventDefault();

        if (confirm("Möchten Sie wirklich zur nächsten Spielphase wechseln?")) {
            var type = event.target.getAttribute('data-type');
            if (!type) {
                type = event.target.parentNode.getAttribute('data-type');
            }
            var type2 = event.target.getAttribute('data-type2');
            if (!type2) {
                type2 = event.target.parentNode.getAttribute('data-type2');
            }
            var tickerId = Router.current().params._id;

            Meteor.call("setTime", tickerId, [type, type2], function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    },
    "click .reset-time-button": function (event, template) {
        event.preventDefault();

        if (confirm("Möchten Sie wirklich in die vorherige Spielphase zurückkehren?")) {
            var type = event.target.getAttribute('data-type');
            if (!type) {
                type = event.target.parentNode.getAttribute('data-type');
            }
            var type2 = event.target.getAttribute('data-type2');
            if (!type2) {
                type2 = event.target.parentNode.getAttribute('data-type2');
            }
            var tickerId = Router.current().params._id;

            Meteor.call("resetTime", tickerId, [type, type2], function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    },
    "click .stop-voting-button": function (event, template) {
        event.preventDefault();

        if (confirm("Möchten Sie die Spielerbewertung wirklich beenden?")) {
            var tickerId = Router.current().params._id;

            Meteor.call("stopVoting", tickerId, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    },
    "click .delete-all-comments": function (event) {
        event.preventDefault();

        var timestampLimit = new Date();

        if (confirm("Möchten Sie wirklich alle Kommentare löschen?")) {
            var tickerId = Router.current().params._id;

            Meteor.call("deleteAllTickerComments", tickerId, timestampLimit, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }
        // Prevent default form submit
        return false;
    }
});

var mapFormation = function (formation) {
    return formation.map(function (entry) {
        var label;
        if (entry.number) {
            label = entry.number + ' ' + entry.name;
        } else {
            label = entry.name;
        }

        return {
            label: label,
            value: entry.id
        };
    });
};

var mapPlayingFormation = function (formation, entries) {
    var substitutionEntries = entries.fetch().filter(substitutionEventFilter);

    var substitutedKickers = substitutionEntries.map(function (entry) {
        return entry.kicker[0].id;
    });

    var exchangedKickers = substitutionEntries.map(function (entry) {
        return entry.kicker[1].id;
    });

    return mapFormation(ensureArray(formation).filter(function (entry) {
        var isKickerStarting = entry.gamePosition !== POS_NA && entry.gamePosition !== POS_ERSATZBANK;
        var wasKickerSubstituted = substitutedKickers.indexOf(entry.id) !== -1;
        var wasKickerExchanged = exchangedKickers.indexOf(entry.id) !== -1;

        return (isKickerStarting || wasKickerExchanged) && !wasKickerSubstituted;
    }));
};

var substitutionEventFilter = function (entry) {
    return entry.eventType == EVENT_TYPE_SUBSTITUTION
};

Template.addEvent.helpers({
    mapPlayingFormation: mapPlayingFormation,
    getEventTypes: function () {
        return EVENT_TYPES.map(mapEventType);
    }
});

Template.addEvent.events({
    "submit .addEventForm": closeModal
});

Template.addOvertimePenaltyEvent.helpers({
    mapPlayingFormation: mapPlayingFormation,
    getEventTypes: function () {
        return EVENT_TYPES_OVERTIME_PENALTY.map(mapEventType);
    }
});

Template.addOvertimePenaltyEvent.events({
    "submit .addOvertimePenaltyEvent": closeModal
});

var mapTeams = function (ticker) {
    return [ticker.getHomeTeam(), ticker.getAwayTeam()].map(function (team) {
        return {
            label: team.name,
            value: team._id
        };
    });
};

Template.addTeamEvent.helpers({
    mapTeams: mapTeams,
    getTeamEventTypes: function () {
        return [EVENT_TYPE_PENALTY].map(mapEventType);
    },
    getTeamDefaultEventType: function () {
        return EVENT_TYPE_PENALTY;
    }
});

Template.addTeamEvent.events({
    "submit .addTeamEventForm": closeModal
});

Template.addSubstitutionEvent.helpers({
    getSubstitutionEventTypes: function () {
        return [EVENT_TYPE_SUBSTITUTION].map(mapEventType);
    },
    getSubstitutionDefaultEventType: function () {
        return EVENT_TYPE_SUBSTITUTION;
    },
    mapPlayingFormation: mapPlayingFormation,
    mapSubstitutionFormation: function (formation, entries) {
        var substitutionEntries = entries.fetch().filter(substitutionEventFilter);

        var exchangedKickers = substitutionEntries.map(function (entry) {
            return entry.kicker[1].id;
        });

        return mapFormation(ensureArray(formation).filter(function (entry) {
            var isKickerOnBench = entry.gamePosition === POS_ERSATZBANK;
            var wasKickerExchanged = exchangedKickers.indexOf(entry.id) !== -1;

            return isKickerOnBench && !wasKickerExchanged;
        }));
    }
});

Template.addSubstitutionEvent.events({
    "submit .substitutionEventForm": closeModal
});

Template.startVoting.helpers({
    getVotingTeams: function (ticker) {
        var mappedTeams = mapTeams(ticker);

        mappedTeams.selectedValues = [];

        if (ticker.teamHomeVoting) {
            mappedTeams.selectedValues.push(ticker.teamHome);
        }

        if (ticker.teamAwayVoting) {
            mappedTeams.selectedValues.push(ticker.teamAway);
        }

        return mappedTeams;
    }
});

Template.startVoting.events({
    "submit .startVotingForm": closeModal
});

Template.addTickerEntry.events({
    "change #tickerEntryImageUpload": function (event) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var files = event.target.files;
     
            var target = $('#tickerEntryImagePreview');
            target.empty();

            var file = files[0];
            if (!file.type.match('image.*')) {
                return;
            }
    
            var reader = new FileReader();
            reader.onload = (function (file) {
                return function (event) {
                    var clearButton = $('<button />', {
                        id: 'clearTickerEntryImageUpload',
                        title: 'Bild entfernen',
                        class: 'btn btn-primary btn-raised no-margin'
                    });
                    clearButton.click(function () {
                        $('#tickerEntryImageUpload').val(null);
                        target.empty();
                    });
                    clearButton.appendTo(target);

                    $('<i class="material-icons">delete_forever</i>').appendTo(clearButton);

                    var img = $('<img />', {
                        id: 'tickerEntryImagePreviewImage',
                        class: 'img-responsive',
                        src: event.target.result
                    });
                    img.appendTo(target);
                };
            }(file));
            reader.readAsDataURL(file);
        } else {
            alert('Dieser Browser wird für den Bild-Upload nicht unterstützt.');
        }
    }
})