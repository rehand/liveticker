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
var maxTextLength = 150;

var abbreviatePositions = function (position) {
    if (position in POSITIONS_ABBR) {
        return POSITIONS_ABBR[position];
    }
    return position;
};

var drawEventTime = function (context, ticker, timestamp, x, y) {
    var minuteStr = getGameTimeMinStr(ticker, timestamp);

    if (minuteStr) {
        context.font = fontSize + "px FuturaEFME-Book";
        context.fillText('(' + minuteStr + '.)', x, y);
    }
};

var filterFormation = function (formation) {
    return ensureArray(formation).filter(function (kicker) {
        return POSITIONS.indexOf(kicker.gamePosition) !== -1 || kicker.exchanged;
    });
};

Template.adminTickerExportFormation.created = function () {
    serverOffset = TimeSync.serverOffset();
};

var drawCoachString = function (context, team, textAlign, xText, yText) {
    if (team.coach) {
        context.textAlign = textAlign;

        // coach header
        context.font = "bold " + fontSize + "px FuturaEFME-Bold";
        context.fillText("Trainer", xText, 1011);

        // coach name
        context.font = fontSize + "px FuturaEFME-Book";
        context.fillText(team.coach, xText, yText);
    }
};

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

        var maxLogoWidth = 100;
        var maxLogoHeight = 100;
        var yPosLogo = 312;
        var xPosLogoHome = 74;
        var xPosLogoAway = 648;
        drawLogos(context, ticker, maxLogoWidth, maxLogoHeight, yPosLogo, xPosLogoHome, xPosLogoAway);

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

            var xTextOffset = 45 * direction;

            var kickerName = abbreviateKickerName(kickerFormationEntry.name);
            var tmpFontSize = fontSize;
            do {
                context.font = tmpFontSize + "px FuturaEFME-Book";
                tmpFontSize --;
            } while (context.measureText(kickerName).width > maxTextLength && tmpFontSize > 1);
            context.fillText(kickerName, xText + xTextOffset, yText);

            var xCardOffset = 20;
            var yCard = yText - 16;

            context.font = fontSize + "px FuturaEFME-Book";
            context.textAlign = "left";

            var xImageOffset = 70 * direction;
            var imgCount = 0;

            if (kickerFormationEntry.exchanged) {
                context.drawImage(imgIn, xCard + imgCount * xImageOffset, yCard);
                drawEventTime(context, ticker, kickerFormationEntry.exchanged[0], xCard + xCardOffset + imgCount * xImageOffset, yText);
                imgCount++;
            }

            if (kickerFormationEntry.yellowCard) {
                context.drawImage(imgYellowCard, xCard + imgCount * xImageOffset, yCard);
                drawEventTime(context, ticker, kickerFormationEntry.yellowCard[0], xCard + xCardOffset + imgCount * xImageOffset, yText);
                imgCount++;
            }

            if (kickerFormationEntry.yellowRedCard) {
                context.drawImage(imgYellowRedCard, xCard + imgCount * xImageOffset, yCard);
                drawEventTime(context, ticker, kickerFormationEntry.yellowRedCard[0], xCard + xCardOffset + imgCount * xImageOffset, yText);
                imgCount++;
            }

            if (kickerFormationEntry.redCard) {
                context.drawImage(imgRedCard, xCard + imgCount * xImageOffset, yCard);
                drawEventTime(context, ticker, kickerFormationEntry.redCard[0], xCard + xCardOffset + imgCount * xImageOffset, yText);
                imgCount++;
            }

            if (kickerFormationEntry.substituted) {
                context.drawImage(imgOut, xCard + imgCount * xImageOffset, yCard);
                drawEventTime(context, ticker, kickerFormationEntry.substituted[0], xCard + xCardOffset + imgCount * xImageOffset, yText);
                imgCount++;
            }
        }

        var leftPos = 39;
        var rightPos = 762;

        var formationHome = sortFormation(filterFormation(populateFormation(ticker.teamHomeFormation, tickerEntries)), false);
        formationHome.forEach(function (kickerFormationEntry, index) {
            drawKicker(index, kickerFormationEntry, "left", leftPos, 236);
        });

        var formationAway = sortFormation(filterFormation(populateFormation(ticker.teamAwayFormation, tickerEntries)), false);
        formationAway.forEach(function (kickerFormationEntry, index) {
            drawKicker(index, kickerFormationEntry, "right", rightPos, 489);
        });

        // coaches
        drawCoachString(context, ticker.getHomeTeam(), "left", leftPos, 1039);
        drawCoachString(context, ticker.getAwayTeam(), "right", rightPos, 1039);

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
        var dt = $('#formationExport').get(0).toDataURL('image/png');

        event.target.setAttribute("download", this.ticker.kickoff.toISOString().substring(0, 10) + "_" + this.ticker.getHomeTeam().name + " - " + this.ticker.getAwayTeam().name + " - Aufstellungen.png");

        event.target.href = dt;
    },
    "click .refresh": function (event) {
        event.preventDefault();

        generateImage(this.ticker);

        return false;
    }
});