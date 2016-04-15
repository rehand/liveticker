/**
 * Created by reini on 14.04.16.
 */

var imgYellowCard = new Image();
imgYellowCard.src = '/images/yellow.png';

var imgYellowRedCard = new Image();
imgYellowRedCard.src = '/images/yellowred.png';

var imgRedCard = new Image();
imgRedCard.src = '/images/red.png';

var imgIn = new Image();
imgIn.src = '/images/in.png';

var imgOut = new Image();
imgOut.src = '/images/out.png';

var fontSize = 24;

var abbreviatePositions = function (position) {
    if (position in POSITIONS_ABBR) {
        return POSITIONS_ABBR[position];
    }
    return position;
};

var abbreviateKickerName = function (kickerName) {
    var kickerNameSplit = kickerName.split(' ');

    if (kickerNameSplit.length > 1) {
        return kickerNameSplit[0].charAt(0) + '. ' + kickerNameSplit[kickerNameSplit.length - 1];
    }

    return kickerName;
};

var drawEventTime = function (context, ticker, timestamp, x, y) {
    var minuteStr = getGameTimeMinStr(ticker, timestamp);

    if (minuteStr) {
        context.font = fontSize + "px FuturaEFME-Book";
        context.fillText('(' + minuteStr + '.)', x, y);
    }
};

var filterFormation = function (formation) {
    return formation.filter(function (kicker) {
        return POSITIONS.indexOf(kicker.gamePosition) !== -1 || kicker.exchanged;
    });
};

Template.adminTickerExportFormation.created = function () {
    serverOffset = TimeSync.serverOffset();
};

function drawLogos(context, ticker) {
    var maxLogoWidth = 100;
    var maxLogoHeight = 100;
    var yPosLogo = 312;
    var xPosLogoHome = 74;
    var xPosLogoAway = 648;

    var drawLogo = function (context, logo, xPosLogo) {
        var ratio = 1;
        if (logo.width > maxLogoWidth)
            ratio = maxLogoWidth / logo.width;
        else if (logo.height > maxLogoHeight)
            ratio = maxLogoHeight / logo.height;

        var width = logo.width * ratio;
        var height = logo.height * ratio;

        context.drawImage(logo, xPosLogo + (maxLogoWidth - width) / 2, yPosLogo - height, width, height);
    };

    var logoHome = new Image();
    logoHome.onload = function () {
        drawLogo(context, logoHome, xPosLogoHome);
    };
    logoHome.src = ticker.getHomeTeam().getLogo().url();

    var logoAway = new Image();
    logoAway.onload = function () {
        drawLogo(context, logoAway, xPosLogoAway);
    };
    logoAway.src = ticker.getAwayTeam().getLogo().url();
}

var drawFormationString = function (context, formation, xPos, yPos) {
    var formationCnt = {
        defenders: 0,
        dmidfielders: 0,
        midfielders: 0,
        forwards: 0
    };

    for (var i = 0; i < formation.length; i++) {
        var position = formation[i].gamePosition;
        if (POSITIONS_DEFENSE.indexOf(position) !== -1) {
            formationCnt.defenders++;
        } else if (POSITIONS_DEF_MIDFIELD.indexOf(position) !== -1) {
            formationCnt.dmidfielders++;
        }
        else if (POSITIONS_MIDFIELD.indexOf(position) !== -1) {
            formationCnt.midfielders++;
        }
        else if (POSITIONS_FORWARD.indexOf(position) !== -1) {
            formationCnt.forwards++;
        }
    }

    var SEPERATOR = "-";
    var formationString = formationCnt.defenders + SEPERATOR;
    if (formationCnt.dmidfielders > 0) {
        formationString += formationCnt.dmidfielders + SEPERATOR;
    }
    formationString += formationCnt.midfielders + SEPERATOR;
    formationString += formationCnt.forwards;

    context.textAlign = "center";
    context.font = "bold " + fontSize + "px FuturaEFME-Bold";
    context.fillText(formationString, xPos, yPos);
};

function generateImage(ticker) {
    var context = $('#formationExport').get(0).getContext('2d');
    var tickerEntries = TickerEntries.find().fetch();

    var background = new Image();
    background.onload = function () {
        context.drawImage(background, 0, 0);

        drawLogos(context, ticker);

        function drawKicker(index, kickerFormationEntry, textAlign, xText, xCard) {
            // don't draw more than 14 kickers (11+3)
            if (index > 13) {
                return;
            }

            var direction = textAlign === "left" ? 1 : -1;

            context.textAlign = textAlign;
            context.font = "bold " + fontSize + "px FuturaEFME-Bold";
            var yText = 380 + index * 42 + 9 + fontSize;
            var position = kickerFormationEntry.exchanged ? kickerFormationEntry.position : kickerFormationEntry.gamePosition;
            context.fillText(abbreviatePositions(position), xText, yText);

            // Trainer header
            // context.fillText("Trainer", xText, 1011);

            var xTextOffset = 45 * direction;
            context.font = fontSize + "px FuturaEFME-Book";
            context.fillText(abbreviateKickerName(kickerFormationEntry.name), xText + xTextOffset, yText);

            // trainer
            // context.fillText("Trainer x", xText, 1039);

            var xCardOffset = 20;
            var yCard = yText - 16;

            context.textAlign = "left";
            var imgCount = 0;
            if (kickerFormationEntry.redCard) {
                context.drawImage(imgRedCard, xCard, yCard);
                drawEventTime(context, ticker, kickerFormationEntry.redCard[0], xCard + xCardOffset, yText);
                imgCount++;
            } else if (kickerFormationEntry.yellowRedCard) {
                context.drawImage(imgYellowRedCard, xCard, yCard);
                drawEventTime(context, ticker, kickerFormationEntry.yellowRedCard[0], xCard + xCardOffset, yText);
                imgCount++;
            } else if (kickerFormationEntry.yellowCard) {
                context.drawImage(imgYellowCard, xCard, yCard);
                drawEventTime(context, ticker, kickerFormationEntry.yellowCard[0], xCard + xCardOffset, yText);
                imgCount++;
            }

            var xImageOffset = 70 * direction;
            if (kickerFormationEntry.exchanged) {
                context.drawImage(imgIn, xCard + imgCount * xImageOffset, yCard);
                drawEventTime(context, ticker, kickerFormationEntry.exchanged[0], xCard + xCardOffset + imgCount * xImageOffset, yText);
                imgCount++;
            }

            if (kickerFormationEntry.substituted) {
                context.drawImage(imgOut, xCard + imgCount * xImageOffset, yCard);
                drawEventTime(context, ticker, kickerFormationEntry.substituted[0], xCard + xCardOffset + imgCount * xImageOffset, yText);
            }
        }

        var formationHome = sortFormation(filterFormation(populateFormation(ticker.teamHomeFormation, tickerEntries)), false);
        formationHome.forEach(function (kickerFormationEntry, index) {
            drawKicker(index, kickerFormationEntry, "left", 39, 236);
        });

        var formationAway = sortFormation(filterFormation(populateFormation(ticker.teamAwayFormation, tickerEntries)), false);
        formationAway.forEach(function (kickerFormationEntry, index) {
            drawKicker(index, kickerFormationEntry, "right", 762, 486);
        });

        var yPosFormationString = 350;
        drawFormationString(context, formationHome, 74 + 100 / 2, yPosFormationString);
        drawFormationString(context, formationAway, 648 + 100 / 2, yPosFormationString);
    };
    background.src = FORMATION_EXPORT_BACKGROUND;
}
Template.adminTickerExportFormation.onRendered(function () {
    generateImage(this.data.ticker);
});

Template.adminTickerExportFormation.events({
    "click .back-button": function (event) {
        event.preventDefault();

        Router.go('adminTickerDetail', {_id: Router.current().params._id});

        // Prevent default form submit
        return false;
    },
    "click .download-button": function (event) {
        console.log('Download!');

        var dt = $('#formationExport').get(0).toDataURL('image/png');

        /* Change MIME type to trick the browser to download the file instead of displaying it */
        // dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');

        event.target.setAttribute("download", this.ticker.kickoff.toISOString().substring(0, 10) + "_" + this.ticker.getHomeTeam().name + " - " + this.ticker.getAwayTeam().name + ".png");

        event.target.href = dt;
    },
    "click .refresh": function (event) {
        event.preventDefault();

        generateImage(this.ticker);

        return false;
    }
});