POS_ERSATZBANK = "Ersatz";
POS_NA = "Nicht im Kader";
POSITIONS_DEFENSE = ['RV', 'IV', 'LV'];
POSITIONS_DEF_MIDFIELD = ['ZDM'];
POSITIONS_MIDFIELD = ['RM', 'ZM', 'LM', 'ZOM'];
POSITIONS_FORWARD = ['RA', 'ST', 'LA'];
POSITIONS = ['TW'].concat(POSITIONS_DEFENSE, POSITIONS_DEF_MIDFIELD, POSITIONS_MIDFIELD, POSITIONS_FORWARD);
POSITIONS_ABBR = {
    'ZDM': 'DM',
    'ZOM': 'OM'
};

VOTING_VALUE_SKIP = 0;
VOTING_OPTIONS = [
    {value: VOTING_VALUE_SKIP, label: '0 Zu kurz eingesetzt'},
    {value: 1, label: '1 Hervorragend'},
    {value: 2, label: '2 Gut'},
    {value: 3, label: '3 Durchschnittlich'},
    {value: 4, label: '4 Schwach'},
    {value: 5, label: '5 Sehr schwach'}
];
VOTING_VALUES = VOTING_OPTIONS.map(function (votingOption) {
    return votingOption.value;
});

EVENT_TYPE_TEXT = 'TEXT';
EVENT_TYPE_COMMENT = "KOMMENTAR";

EVENT_TYPE_GOAL = 'TOR';
EVENT_TYPE_OWN_GOAL = 'EIGENTOR';
EVENT_TYPE_PENALTY_GOAL = 'ELFMETERTOR';
EVENT_TYPE_PENALTY = 'ELFMETER';
EVENT_TYPE_YELLOW_CARD = 'GELB';
EVENT_TYPE_YELLOW_RED_CARD = 'GELBROT';
EVENT_TYPE_RED_CARD = 'ROT';
EVENT_TYPE_SUBSTITUTION = 'WECHSEL';
EVENT_TYPES = [EVENT_TYPE_GOAL, EVENT_TYPE_OWN_GOAL, EVENT_TYPE_YELLOW_CARD, EVENT_TYPE_YELLOW_RED_CARD, EVENT_TYPE_RED_CARD];
ALL_EVENT_TYPES = EVENT_TYPES.concat(EVENT_TYPE_SUBSTITUTION, EVENT_TYPE_PENALTY_GOAL, EVENT_TYPE_PENALTY, EVENT_TYPE_TEXT, EVENT_TYPE_COMMENT);

KICKER_ID_DUMMY = "NULL";

TEAM_ANTHEMS = [
    {label: 'SK Sturm Graz', value: 'sturm', path: '/audio/hymne_sturm.mp3'},
    {label: 'Steiermen san very good', value: 'steirermen', path: '/audio/steiermen_san_very_good.mp3'}
];

SESSION_PLAY_AUDIO = "playAudio";
SESSION_COMMENT_NAME = "commentName";
SESSION_ANTHEMS_PLAYED = "anthemsPlayed";

FORMATION_EXPORT_BACKGROUND = "/images/background/BL_Aufstellungen.png";
STATISTICS_EXPORT_BACKGROUND = "/images/background/BL_Statistiken.png";