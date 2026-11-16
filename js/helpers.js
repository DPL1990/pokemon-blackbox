function getEnglishMoveName(name) {
    if (!name) return "";
    let clean = name.toLowerCase().trim();
    const match = clean.match(/\(([^)]+)\)/);
    if (match) {
        return match[1].trim();
    }
    if (PORTUGUESE_TO_ENGLISH_MOVES[clean]) {
        return PORTUGUESE_TO_ENGLISH_MOVES[clean];
    }
    return clean;
}

function getEnglishItemName(name) {
    if (!name) return "";
    let clean = name.toLowerCase().trim();
    const match = clean.match(/\(([^)]+)\)/);
    if (match) {
        return match[1].trim();
    }
    if (PORTUGUESE_TO_ENGLISH_ITEMS[clean]) {
        return PORTUGUESE_TO_ENGLISH_ITEMS[clean];
    }
    return clean;
}

function formatMoveNameForDisplay(englishName) {
    if (!englishName) return "";
    const clean = englishName.toLowerCase().replace(/-/g, " ").trim();
    const capEnglish = englishName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    
    const pt = ENGLISH_TO_PORTUGUESE_MOVES[clean];
    if (pt) {
        const capPt = pt.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        return `${capPt} (${capEnglish})`;
    }
    return `${capEnglish} (${capEnglish})`;
}

function formatItemNameForDisplay(englishName) {
    if (!englishName) return "";
    const clean = englishName.toLowerCase().replace(/-/g, " ").trim();
    const capEnglish = englishName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    
    const pt = ENGLISH_TO_PORTUGUESE_ITEMS[clean];
    if (pt) {
        const capPt = pt.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        return `${capPt} (${capEnglish})`;
    }
    return `${capEnglish} (${capEnglish})`;
}

// --- Nível a partir da experiência (curvas de crescimento oficiais) ---
// Cada dígito = curva da espécie (índice = Pokédex nº - 1): 1 slow, 2 medium fast, 3 fast, 4 medium slow, 5 erratic, 6 fluctuating
const GROWTH_RATE_BY_DEX = "44444444422222244422222222224444443322332244422222222222211444444444444114442222222222222114442222222112222222113222222112222211111222222222211111111144444444442222333321123333224444332444434422222423222222423322414222211322311112222132222213111111114444444444222222222444444442211122661115554446632334311122112256466116622233344444555633226622555555243333134222444555131111111111111111444444444444224444444555522244222222236622343332222223421111441111221551114221222322241212322111111111111411444444444224442222222233444224442222344444422444444222224444422222222222222443344444422111222222222322224441112244411122222244222222111122111111111111111114444444442244422244222222222222222222222221122222222211113222222221111114444444442222222222222223222222222222224443112222311412222221111111111111111111111111111444444444224442223322222233444555222114422442211122222322222222211322211112111111111111111222421444444444225522222334444454441112244444422442223344444221112241444444431422222111111111111111111111111111111111125111111";
const GROWTH_EXP_TABLE = {"1":[0,10,33,80,156,270,428,640,911,1250,1663,2160,2746,3430,4218,5120,6141,7290,8573,10000,11576,13310,15208,17280,19531,21970,24603,27440,30486,33750,37238,40960,44921,49130,53593,58320,63316,68590,74148,80000,86151,92610,99383,106480,113906,121670,129778,138240,147061,156250,165813,175760,186096,196830,207968,219520,231491,243890,256723,270000,283726,297910,312558,327680,343281,359370,375953,393040,410636,428750,447388,466560,486271,506530,527343,548720,570666,593190,616298,640000,664301,689210,714733,740880,767656,795070,823128,851840,881211,911250,941963,973360,1005446,1038230,1071718,1105920,1140841,1176490,1212873,1250000],"2":[0,8,27,64,125,216,343,512,729,1000,1331,1728,2197,2744,3375,4096,4913,5832,6859,8000,9261,10648,12167,13824,15625,17576,19683,21952,24389,27000,29791,32768,35937,39304,42875,46656,50653,54872,59319,64000,68921,74088,79507,85184,91125,97336,103823,110592,117649,125000,132651,140608,148877,157464,166375,175616,185193,195112,205379,216000,226981,238328,250047,262144,274625,287496,300763,314432,328509,343000,357911,373248,389017,405224,421875,438976,456533,474552,493039,512000,531441,551368,571787,592704,614125,636056,658503,681472,704969,729000,753571,778688,804357,830584,857375,884736,912673,941192,970299,1000000],"3":[0,6,21,51,100,172,274,409,583,800,1064,1382,1757,2195,2700,3276,3930,4665,5487,6400,7408,8518,9733,11059,12500,14060,15746,17561,19511,21600,23832,26214,28749,31443,34300,37324,40522,43897,47455,51200,55136,59270,63605,68147,72900,77868,83058,88473,94119,100000,106120,112486,119101,125971,133100,140492,148154,156089,164303,172800,181584,190662,200037,209715,219700,229996,240610,251545,262807,274400,286328,298598,311213,324179,337500,351180,365226,379641,394431,409600,425152,441094,457429,474163,491300,508844,526802,545177,563975,583200,602856,622950,643485,664467,685900,707788,730138,752953,776239,800000],"4":[0,9,57,96,135,179,236,314,419,560,742,973,1261,1612,2035,2535,3120,3798,4575,5460,6458,7577,8825,10208,11735,13411,15244,17242,19411,21760,24294,27021,29949,33084,36435,40007,43808,47846,52127,56660,61450,66505,71833,77440,83335,89523,96012,102810,109923,117360,125126,133229,141677,150476,159635,169159,179056,189334,199999,211060,222522,234393,246681,259392,272535,286115,300140,314618,329555,344960,360838,377197,394045,411388,429235,447591,466464,485862,505791,526260,547274,568841,590969,613664,636935,660787,685228,710266,735907,762160,789030,816525,844653,873420,902835,932903,963632,995030,1027103,1059860],"5":[0,15,52,122,237,406,637,942,1326,1800,2369,3041,3822,4719,5737,6881,8155,9564,11111,12800,14632,16610,18737,21012,23437,26012,28737,31610,34632,37800,41111,44564,48155,51881,55737,59719,63822,68041,72369,76800,81326,85942,90637,95406,100237,105122,110052,115015,120001,125000,131324,137795,144410,151165,158056,165079,172229,179503,186894,194400,202013,209728,217540,225443,233431,241496,249633,257834,267406,276458,286328,296358,305767,316074,326531,336255,346965,357812,367807,378880,390077,400293,411686,423190,433572,445239,457001,467489,479378,491346,501878,513934,526049,536557,548720,560922,571333,583539,591882,600000],"6":[0,4,13,32,65,112,178,276,393,540,745,967,1230,1591,1957,2457,3046,3732,4526,5440,6482,7666,9003,10506,12187,14060,16140,18439,20974,23760,26811,30146,33780,37731,42017,46656,50653,55969,60505,66560,71677,78533,84277,91998,98415,107069,114205,123863,131766,142500,151222,163105,172697,185807,196322,210739,222231,238036,250562,267840,281456,300293,315059,335544,351520,373744,390991,415050,433631,459620,479600,507617,529063,559209,582187,614566,639146,673863,700115,737280,765275,804997,834809,877201,908905,954084,987754,1035837,1071552,1122660,1160499,1214753,1254796,1312322,1354652,1415577,1460276,1524731,1571884,1640000]};
function levelFromExp(pokedexId, exp) {
    const rate = parseInt(GROWTH_RATE_BY_DEX.charAt((pokedexId | 0) - 1), 10);
    const table = GROWTH_EXP_TABLE[rate];
    if (!table) {
        // Espécie/forma desconhecida: mantém o comportamento anterior (curva "medium fast")
        return Math.max(1, Math.min(100, Math.round(Math.pow(exp, 1/3))));
    }
    let level = 1;
    for (let l = 100; l >= 1; l--) {
        if (exp >= table[l - 1]) { level = l; break; }
    }
    return level;
}

// Corre uma tarefa quando o browser estiver livre (não bloqueia o primeiro ecrã)
function runWhenIdle(fn) {
    if (typeof requestIdleCallback === "function") requestIdleCallback(fn, { timeout: 1500 });
    else setTimeout(fn, 200);
}

// --- Carregamento sob pedido de js/allocation.js ---
let _allocationLoadPromise = null;
function ensureAllocationLoaded() {
    if (window.__allocationLoaded) return Promise.resolve();
    if (_allocationLoadPromise) return _allocationLoadPromise;
    _allocationLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "js/allocation.js";
        script.onload = () => {
            window.__allocationLoaded = true;
            resolve();
        };
        script.onerror = (err) => {
            _allocationLoadPromise = null;
            console.error("Erro ao carregar js/allocation.js:", err);
            reject(err);
        };
        document.head.appendChild(script);
    });
    return _allocationLoadPromise;
}

const _ALLOCATION_LAZY_FUNCTIONS = [
    "openMatchupModal", "closeMatchupModal", "populateMatchupA", "onMatchupAChange", "onMatchupBChange", "renderMatchupComparison",
    "openOwndexModal", "closeOwndexModal", "renderDexitCompatibility", "openVoyageModal", "closeVoyageModal",
    "openOwndexFromEditor", "renderOwndexSpecimens", "renderMovesetHeatmap",
    "populateOpponentSelect", "changeAllocationOpponent", "saveActiveTeamAsOpponentPreset", "updateOpponentPresetsList", "loadOpponentPreset",
    "getRecommendedAllocation", "applyRecommendedAllocation", "renderAllocationTab", "renderWeaknessAnalysis", "applyRecommendedMove",
    "openPartitionModal", "closePartitionModal", "generateAndShowBoxPartition", "renderPartitionModalResults", "saveGeneratedPartitionPresets",
    "renderPresets", "loadPreset", "deletePreset", "renamePreset", "cleanSlateActiveTrainer",
    "exportModifiedSave", "exportIndividualPkx"
];

_ALLOCATION_LAZY_FUNCTIONS.forEach((fnName) => {
    const stub = function(...args) {
        return ensureAllocationLoaded().then(() => {
            if (typeof window[fnName] === "function" && window[fnName] !== stub) {
                return window[fnName](...args);
            }
        });
    };
    window[fnName] = stub;
});

// --- Inicialização, Definições e Tema Visual ---
let minimalModeEnabled = localStorage.getItem("bb_minimal_mode") === "true";
uploadedSaveBuffer = null;
uploadedSaveName = "";
uploadedSaveGen = 0;
uploadedSaveIsCrystal = false;
uploadedSaveActiveSectorStart = 0;

currentVisualTheme = localStorage.getItem("bb_visual_theme") || "default";

function toggleMinimalMode() {
    minimalModeEnabled = !minimalModeEnabled;
    localStorage.setItem("bb_minimal_mode", minimalModeEnabled);
    applyMinimalMode();
}

function applyMinimalMode() {
    const checkbox = document.getElementById("settings-clean-layout");
    if (checkbox) checkbox.checked = minimalModeEnabled;
    
    if (minimalModeEnabled) {
        document.body.classList.add("minimal-mode");
    } else {
        document.body.classList.remove("minimal-mode");
    }
}

function setVisualTheme(theme) {
    currentVisualTheme = theme;
    localStorage.setItem("bb_visual_theme", theme);
    
    // Remove all existing theme classes from body
    const themesList = ["retro", "advance", "ds", "upgrade", "alola", "legends", "final", "home"];
    themesList.forEach(t => document.body.classList.remove(`theme-${t}`));
    
    // Add the new theme class if it's not the default
    if (theme !== "default") {
        document.body.classList.add(`theme-${theme}`);
    }
    
    // Sync the select dropdowns if they exist
    const themeSelect = document.getElementById("settings-visual-theme");
    if (themeSelect) themeSelect.value = theme;
}

function applyVisualTheme() {
    setVisualTheme(currentVisualTheme);
}

function openSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (modal) {
        const styleSelect = document.getElementById("settings-sprite-style");
        if (styleSelect) styleSelect.value = currentSpriteStyle;

        const ribbonToggle = document.getElementById("settings-auto-ribbon");
        if (ribbonToggle) ribbonToggle.checked = autoRibbonsEnabled;

        const cleanToggle = document.getElementById("settings-clean-layout");
        if (cleanToggle) cleanToggle.checked = minimalModeEnabled;

        const themeSelect = document.getElementById("settings-visual-theme");
        if (themeSelect) themeSelect.value = currentVisualTheme;

        const exportBtn = document.getElementById("btn-export-modified-save");
        if (exportBtn) {
            exportBtn.style.display = (uploadedSaveBuffer && uploadedSaveGen >= 1 && uploadedSaveGen <= 3) ? "block" : "none";
        }

        modal.classList.add("active");
    }
}

function closeSettingsModal() {
    const modal = document.getElementById("settings-modal");
    if (modal) modal.classList.remove("active");
}

function toggleAdvancedFilters() {
    const panel = document.getElementById("advanced-filters-panel");
    if (panel) {
        panel.style.display = panel.style.display === "none" ? "block" : "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    applyMinimalMode();
    applyVisualTheme();
});

window.onload = function() {
    initDB().then(() => {
        cleanupDuplicates();
        setupDatalists(); 
        runWhenIdle(loadSpeciesDatalist);
        renderRibbonChecklist();
        initTouchDragAndDrop();
        initGlobalBoxUI();
        
        const spriteSelect = document.getElementById("settings-sprite-style");
        if (spriteSelect) spriteSelect.value = currentSpriteStyle;
        const autoToggle = document.getElementById("settings-auto-ribbon");
        if (autoToggle) autoToggle.checked = autoRibbonsEnabled;
        const themeSelect = document.getElementById("settings-visual-theme");
        if (themeSelect) themeSelect.value = currentVisualTheme;
        
        switchGame(currentGameId);
        setupEditorMovesListeners();
    }).catch(err => {
        console.error("Falha ao carregar IndexedDB, inicializando com localStorage de fallback:", err);
        cleanupDuplicates();
        setupDatalists(); 
        runWhenIdle(loadSpeciesDatalist);
        renderRibbonChecklist();
        initTouchDragAndDrop();
        initGlobalBoxUI();
        
        const spriteSelect = document.getElementById("settings-sprite-style");
        if (spriteSelect) spriteSelect.value = currentSpriteStyle;
        const autoToggle = document.getElementById("settings-auto-ribbon");
        if (autoToggle) autoToggle.checked = autoRibbonsEnabled;
        const themeSelect = document.getElementById("settings-visual-theme");
        if (themeSelect) themeSelect.value = currentVisualTheme;
        
        switchGame(currentGameId);
        setupEditorMovesListeners();
    });
};

// ==========================================================================
// 💾 Dicionários Binários (Gen 1-3) e Validação/Seleção de Ataques
// ==========================================================================

const BINARY_MOVES_MAP = {
    "pound": 1, "karate chop": 2, "double slap": 3, "comet punch": 4, "mega punch": 5, "pay day": 6, "fire punch": 7, "ice punch": 8, "thunder punch": 9, "scratch": 10,
    "vice grip": 11, "guillotine": 12, "razor wind": 13, "swords dance": 14, "cut": 15, "gust": 16, "wing attack": 17, "whirlwind": 18, "fly": 19, "bind": 20,
    "slam": 21, "vine whip": 22, "stomp": 23, "double kick": 24, "mega kick": 25, "jump kick": 26, "rolling kick": 27, "sand attack": 28, "headbutt": 29, "horn attack": 30,
    "fury attack": 31, "horn drill": 32, "tackle": 33, "body slam": 34, "wrap": 35, "take down": 36, "thrash": 37, "double-edge": 38, "double edge": 38, "tail whip": 39, "poison sting": 40,
    "twineedle": 41, "pin missile": 42, "leer": 43, "bite": 44, "growl": 45, "roar": 46, "sing": 47, "supersonic": 48, "sonicboom": 49, "sonic boom": 49, "disable": 50,
    "acid": 51, "ember": 52, "flamethrower": 53, "mist": 54, "water gun": 55, "hydro pump": 56, "surf": 57, "ice beam": 58, "blizzard": 59, "psybeam": 60,
    "bubblebeam": 61, "bubble beam": 61, "aurora beam": 62, "hyper beam": 63, "peck": 64, "drill peck": 65, "submission": 66, "low kick": 67, "counter": 68, "seismic toss": 69,
    "strength": 70, "absorb": 71, "mega drain": 72, "leech seed": 73, "growth": 74, "razor leaf": 75, "solar beam": 76, "solarbeam": 76, "poisonpowder": 77, "poison powder": 77,
    "stun spore": 78, "sleep powder": 79, "petal dance": 80, "string shot": 81, "dragon rage": 82, "fire spin": 83, "thundershock": 84, "thunder shock": 84, "thunderbolt": 85,
    "thunder wave": 86, "thunder": 87, "rock throw": 88, "earthquake": 89, "fissure": 90, "dig": 91, "toxic": 92, "confusion": 93, "psychic": 94, "hypnosis": 95,
    "meditate": 96, "agility": 97, "quick attack": 98, "rage": 99, "teleport": 100, "night shade": 101, "mimic": 102, "screech": 103, "double team": 104, "recover": 105,
    "harden": 106, "minimize": 107, "smokescreen": 108, "confuse ray": 109, "withdraw": 110, "defense curl": 111, "barrier": 112, "light screen": 113, "haze": 114, "reflect": 115,
    "focus energy": 116, "bide": 117, "metronome": 118, "mirror move": 119, "self-destruct": 120, "self destruct": 120, "egg bomb": 121, "lick": 122, "smog": 123, "sludge": 124,
    "bone club": 125, "fire blast": 126, "waterfall": 127, "clamp": 128, "swift": 129, "skull bash": 130, "spike cannon": 131, "constrict": 132, "amnesia": 133, "kinesis": 134,
    "soft-boiled": 135, "softboiled": 135, "high jump kick": 136, "glare": 137, "dream eater": 138, "poison gas": 139, "barrage": 140, "leech life": 141, "lovely kiss": 142, "sky attack": 143,
    "transform": 144, "bubble": 145, "dizzy punch": 146, "spore": 147, "flash": 148, "psywave": 149, "splash": 150, "acid armor": 151, "crabhammer": 152, "explosion": 153,
    "fury swipes": 154, "bonemerang": 155, "rest": 156, "rock slide": 157, "hyper fang": 158, "sharpen": 159, "conversion": 160, "tri attack": 161, "super fang": 162, "slash": 163,
    "substitute": 164, "struggle": 165,
    
    // Gen 2 additions
    "sketch": 166, "triple kick": 167, "thief": 168, "spider web": 169, "mind reader": 170, "nightmare": 171, "flame wheel": 172, "snore": 173, "curse": 174, "flail": 175,
    "conversion 2": 176, "aeroblast": 177, "cotton spore": 178, "reversal": 179, "spite": 180, "powder snow": 181, "protect": 182, "mach punch": 183, "scary face": 184, "feint attack": 185,
    "sweet kiss": 186, "belly drum": 187, "sludge bomb": 188, "mud-slap": 189, "mud slap": 189, "octazooka": 190, "spikes": 191, "zap cannon": 192, "foresight": 193, "destiny bond": 194,
    "perish song": 195, "icy wind": 196, "detect": 197, "bone rush": 198, "lock-on": 199, "lock on": 199, "outrage": 200, "sandstorm": 201, "giga drain": 202, "endure": 203,
    "charm": 204, "rollout": 205, "false swipe": 206, "swagger": 207, "milk drink": 208, "spark": 209, "fury cutter": 210, "steel wing": 211, "mean look": 212, "attract": 213,
    "sleep talk": 214, "heal bell": 215, "return": 216, "present": 217, "frustration": 218, "safeguard": 219, "pain split": 220, "sacred fire": 221, "magnitude": 222, "dynamicpunch": 223,
    "dynamic punch": 223, "megahorn": 224, "dragonbreath": 225, "dragon breath": 225, "baton pass": 226, "encore": 227, "pursuit": 228, "rapid spin": 229, "sweet scent": 230, "iron tail": 231,
    "metal claw": 232, "vital throw": 233, "morning sun": 234, "synthesis": 235, "moonlight": 236, "hidden power": 237, "cross chop": 238, "twister": 239, "rain dance": 240,
    "sunny day": 241, "crunch": 242, "mirror coat": 243, "psych up": 244, "extreme speed": 245, "ancientpower": 246, "ancient power": 246, "shadow ball": 247, "future sight": 248, "rock smash": 249,
    "whirlpool": 250, "beat up": 251,
    
    // Gen 3 additions
    "fake out": 252, "uproar": 253, "stockpile": 254, "spit up": 255, "swallow": 256, "heat wave": 257, "hail": 258, "torment": 259, "flatter": 260,
    "will-o-wisp": 261, "will o wisp": 261, "memento": 262, "facade": 263, "focus punch": 264, "smellingsalts": 265, "smelling salts": 265, "follow me": 266, "nature power": 267, "charge": 268,
    "taunt": 269, "helping hand": 270, "trick": 271, "role play": 272, "wish": 273, "assist": 274, "ingrain": 275, "superpower": 276, "magic coat": 277, "recycle": 278,
    "brick break": 279, "yawn": 280, "knock off": 281, "endeavor": 282, "eruption": 283, "skill swap": 284, "imprison": 285, "refresh": 286, "grudge": 287, "snatch": 288,
    "secret power": 289, "dive": 290, "arm thrust": 291, "camouflage": 292, "tail glow": 293, "luster purge": 294, "mist ball": 295, "featherdance": 296, "feather dance": 296, "teeter dance": 297,
    "blaze kick": 298, "mud sport": 299, "ice ball": 300, "needle arm": 301, "slack off": 302, "hyper voice": 303, "poison fang": 304, "crush claw": 305, "blast burn": 306,
    "hydro cannon": 307, "meteor mash": 308, "astonish": 309, "weather ball": 310, "aromatherapy": 311, "fake tears": 312, "air cutter": 313, "overheat": 314, "odor sleuth": 315,
    "rock tomb": 316, "silver wind": 317, "metal sound": 318, "grasswhistle": 319, "grass whistle": 319, "tickle": 320, "cosmic power": 321, "water spout": 322, "signal beam": 323,
    "shadow punch": 324, "extrasensory": 325, "sky uppercut": 326, "sand tomb": 327, "sheer cold": 328, "muddy water": 329, "bullet seed": 330, "aerial ace": 331, "icicle spear": 332,
    "iron defense": 333, "block": 334, "howl": 335, "dragon claw": 336, "frenzy plant": 337, "bulk up": 338, "bounce": 339, "mud shot": 340, "poison tail": 341, "covet": 342,
    "volt tackle": 343, "magical leaf": 344, "water sport": 345, "calm mind": 346, "leaf blade": 347, "dragon dance": 348, "rock blast": 349, "shock wave": 350, "water pulse": 351,
    "doom desire": 352, "psycho boost": 353, "bounce": 354
};

const BINARY_ITEMS_MAP_GEN2 = {
    "master ball": 1, "ultra ball": 2, "brightpowder": 3, "great ball": 4, "poke ball": 5,
    "quick claw": 30, "metal powder": 34, "amulet coin": 35, "cleanse tag": 37, "mystic water": 38,
    "twistedspoon": 39, "blackbelt": 40, "black belt": 40, "blackglasses": 41, "black glasses": 41,
    "pink bow": 42, "silk scarf": 42, "charcoal": 43, "berry juice": 44, "dragon scale": 45,
    "soft sand": 48, "sharp beak": 49, "poison barb": 50, "kings rock": 51, "king's rock": 51,
    "bitter berry": 52, "mint berry": 53, "red apricorn": 54, "tiny mushroom": 55, "big mushroom": 56,
    "silverpowder": 57, "silver powder": 57, "blu apricorn": 58, "lucky punch": 68,
    "leftovers": 76, "mystery berry": 90, "miracle seed": 91,
    "thick club": 92, "focus band": 93, "polkadot bow": 115, "lucky egg": 118, "sacred ash": 124,
    "heavy ball": 125, "flower mail": 126, "level ball": 127, "lure ball": 128, "fast ball": 129,
    "light ball": 131, "friend ball": 132, "moon ball": 133, "love ball": 134, "normal box": 135,
    "gorgeous box": 136, "sun stone": 137, "everstone": 138, "exp share": 156
};

const BINARY_ITEMS_MAP_GEN3 = {
    "master ball": 1, "ultra ball": 2, "great ball": 3, "poke ball": 4, "safari ball": 5, "net ball": 6, "dive ball": 7, "nest ball": 8, "repeat ball": 9, "timer ball": 10, "luxury ball": 11, "premier ball": 12,
    "brightpowder": 17, "white herb": 18, "macho brace": 19, "exp share": 20, "quick claw": 21, "soothe bell": 22, "mental herb": 23, "choice band": 24, "kings rock": 25, "king's rock": 25, "silverpowder": 26, "silver powder": 26, "amulet coin": 27, "cleanse tag": 28, "soul dew": 29, "deepseatooth": 30, "deep sea tooth": 30, "deepseascale": 31, "deep sea scale": 31, "smoke ball": 32, "everstone": 33, "focus band": 34, "lucky egg": 35, "scope lens": 36, "metal coat": 37, "leftovers": 38, "dragon scale": 39, "light ball": 40, "soft sand": 41, "hard stone": 42, "miracle seed": 43, "blackglasses": 44, "black glasses": 44, "blackbelt": 45, "black belt": 45, "magnet": 46, "mystic water": 47, "sharp beak": 48, "poison barb": 49, "nevermeltice": 50, "never-melt-ice": 50, "spell tag": 51, "twistedspoon": 52, "twisted spoon": 52, "charcoal": 53, "dragon fang": 54, "silk scarf": 55, "up-grade": 56, "shell bell": 57,
    "sea incense": 58, "lax incense": 59, "lucky punch": 60, "metal powder": 61, "thick club": 62, "stick": 63,
    "red scarf": 254, "blue scarf": 255, "pink scarf": 256, "green scarf": 257, "yellow scarf": 258
};

const REVERSE_ITEMS_MAP_GEN2 = {};
Object.keys(BINARY_ITEMS_MAP_GEN2).forEach(k => {
    REVERSE_ITEMS_MAP_GEN2[BINARY_ITEMS_MAP_GEN2[k]] = k;
});

const REVERSE_ITEMS_MAP_GEN3 = {};
Object.keys(BINARY_ITEMS_MAP_GEN3).forEach(k => {
    REVERSE_ITEMS_MAP_GEN3[BINARY_ITEMS_MAP_GEN3[k]] = k;
});

const REVERSE_MOVES_MAP = {};
Object.keys(BINARY_MOVES_MAP).forEach(k => {
    REVERSE_MOVES_MAP[BINARY_MOVES_MAP[k]] = k;
});

function getMoveGeneration(moveId) {
    if (moveId >= 10001) return 3; // Shadow moves are Gen 3
    if (moveId <= 165) return 1;
    if (moveId <= 251) return 2;
    if (moveId <= 354) return 3;
    if (moveId <= 467) return 4;
    if (moveId <= 559) return 5;
    if (moveId <= 621) return 6;
    if (moveId <= 742) return 7;
    if (moveId <= 826) return 8;
    return 9;
}

function getMoveIdFromName(moveName) {
    if (!moveName) return 0;
    const englishName = getEnglishMoveName(moveName).toLowerCase().trim().replace(/\s+/g, "-");
    if (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined') {
        const found = Object.entries(POKEAPI_MOVE_ID_TO_NAME).find(([id, name]) => name.toLowerCase() === englishName);
        if (found) return parseInt(found[0], 10);
    }
    if (typeof REVERSE_MOVES_MAP !== 'undefined') {
        const found = Object.entries(REVERSE_MOVES_MAP).find(([id, name]) => name.toLowerCase() === englishName);
        if (found) return parseInt(found[0], 10);
    }
    return 0;
}

function getMoveGenerationFromMoveName(moveName) {
    if (!moveName) return 1;
    const moveId = getMoveIdFromName(moveName);
    if (moveId > 0) {
        return getMoveGeneration(moveId);
    }
    return 1;
}

function validateMovesGeneration(moves, targetGameOrGen) {
    let targetGen = 9;
    if (typeof targetGameOrGen === "number") {
        targetGen = targetGameOrGen;
    } else {
        const game = GAMES_DB.find(g => g.id === targetGameOrGen);
        if (game) targetGen = game.gen;
    }
    
    for (const move of moves) {
        if (!move) continue;
        const moveGen = getMoveGenerationFromMoveName(move);
        if (moveGen > targetGen) {
            return {
                valid: false,
                move: move,
                moveGen: moveGen,
                targetGen: targetGen
            };
        }
    }
    return { valid: true };
}

function populateMoveSelects(p) {
    if (!p) return;
    
    let gen = 9;
    const currentGame = GAMES_DB.find(g => g.id === (p.currentGame || currentGameId));
    if (currentGame) {
        gen = currentGame.gen;
    }
    
    const currentMoves = (p.moves || []).map(m => m ? getEnglishMoveName(m).toLowerCase() : "");
    const recommendedList = getFourRecommendedMoves(p, gen);
    const recommendedEng = recommendedList.map(m => m.english.toLowerCase());
    
    const learnableMoves = [];
    const otherMoves = [];
    
    if (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined') {
        Object.entries(POKEAPI_MOVE_ID_TO_NAME).forEach(([idStr, rawName]) => {
            const moveId = parseInt(idStr, 10);
            const moveGen = getMoveGeneration(moveId);
            const englishName = rawName.toLowerCase();
            
            if (englishName === "struggle") return;
            
            const isCurrentlySelected = currentMoves.includes(englishName);
            const isRec = recommendedEng.includes(englishName);
            
            const formattedName = formatMoveNameForDisplay(englishName);
            const moveObj = { id: moveId, english: englishName, display: formattedName, gen: moveGen };
            
            if (isCurrentlySelected || isRec) {
                return;
            }
            
            if (moveGen <= gen) {
                if (canPokemonLearnMove(p, englishName, gen)) {
                    learnableMoves.push(moveObj);
                } else {
                    otherMoves.push(moveObj);
                }
            } else {
                otherMoves.push(moveObj);
            }
        });
    }
    
    const sortFn = (a, b) => a.display.localeCompare(b.display);
    learnableMoves.sort(sortFn);
    otherMoves.sort(sortFn);
    
    let datalistHtml = "";
    recommendedList.forEach(m => {
        datalistHtml += `<option value="${m.display}">⭐ ${m.display} (Recomendado)</option>`;
    });
    learnableMoves.forEach(m => {
        datalistHtml += `<option value="${m.display}">${m.display}</option>`;
    });
    otherMoves.forEach(m => {
        const genLabel = m.gen > gen ? `Gen ${m.gen}` : "Incompatível";
        datalistHtml += `<option value="${m.display}">${m.display} [${genLabel}]</option>`;
    });
    
    const datalistEl = document.getElementById("moves-datalist");
    if (datalistEl) {
        datalistEl.innerHTML = datalistHtml;
    }
    
    for (let slotNum = 1; slotNum <= 4; slotNum++) {
        const inputId = `form-move${slotNum}`;
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
            inputEl.value = p.moves?.[slotNum - 1] || "";
        }
    }
}

function setupEditorMovesListeners() {
    const speciesInput = document.getElementById("form-species");
    const originGameSelect = document.getElementById("form-origin-game");
    
    const onFormChange = () => {
        const currentId = document.getElementById("form-id").value;
        const currentSpecies = speciesInput ? speciesInput.value.trim() : "";
        const currentOrigin = originGameSelect ? originGameSelect.value : currentGameId;
        
        let p = pokemonDatabase.find(pkmn => pkmn.id === currentId);
        if (p) {
            const tempP = {
                ...p,
                species: currentSpecies,
                currentGame: currentOrigin,
                moves: [
                    document.getElementById("form-move1").value.trim(),
                    document.getElementById("form-move2").value.trim(),
                    document.getElementById("form-move3").value.trim(),
                    document.getElementById("form-move4").value.trim()
                ]
            };
            populateMoveSelects(tempP);
        } else {
            populateMoveSelects({
                species: currentSpecies,
                currentGame: currentOrigin,
                moves: [
                    document.getElementById("form-move1").value.trim(),
                    document.getElementById("form-move2").value.trim(),
                    document.getElementById("form-move3").value.trim(),
                    document.getElementById("form-move4").value.trim()
                ]
            });
        }
    };
    
    if (speciesInput) {
        speciesInput.addEventListener("input", onFormChange);
        speciesInput.addEventListener("change", onFormChange);
    }
    if (originGameSelect) {
        originGameSelect.addEventListener("change", onFormChange);
    }
    
    const moveInputs = ["form-move1", "form-move2", "form-move3", "form-move4"];
    moveInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener("input", (event) => {
                const val = event.target.value.trim();
                if (!val) return;
                
                let duplicate = false;
                moveInputs.forEach(otherId => {
                    if (otherId !== id) {
                        const otherInput = document.getElementById(otherId);
                        if (otherInput && otherInput.value.trim().toLowerCase() === val.toLowerCase()) {
                            duplicate = true;
                        }
                    }
                });
                
                if (duplicate) {
                    alert("Não podes ter ataques iguais! Este ataque já está selecionado noutro slot.");
                    event.target.value = "";
                }
            });
        }
    });
}

// =========================================================================
// SUPORTE A IMPORTAÇÃO DE JSON DA RUNBOX (Fase 2)
// =========================================================================

function normalizeRunBoxGameId(gameId) {
    if (!gameId || typeof gameId !== "string") return "custom";
    const cleaned = gameId.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    if (typeof GAMES_DB !== "undefined" && GAMES_DB) {
        if (Array.isArray(GAMES_DB)) {
            // 1. Procura por correspondência exata de id (ex: "sword", "white2", "brilliantdiamond")
            const exact = GAMES_DB.find(g => (g.id || "").toLowerCase() === cleaned);
            if (exact) return exact.id;
            
            // 2. Procura pelo nome oficial do jogo (ex: "Pokémon Sword" -> "sword")
            for (const g of GAMES_DB) {
                const nameClean = (g.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                if (nameClean && (nameClean === cleaned || cleaned.includes(nameClean) || nameClean.includes(cleaned))) {
                    return g.id;
                }
            }
        } else if (typeof GAMES_DB === "object") {
            if (GAMES_DB[cleaned]) return cleaned;
            const slugHyphen = gameId.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
            if (GAMES_DB[slugHyphen]) return slugHyphen;
            for (const [key, val] of Object.entries(GAMES_DB)) {
                const valClean = (val.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                if (valClean && (valClean === cleaned || cleaned.includes(valClean) || valClean.includes(cleaned))) {
                    return key;
                }
            }
        }
    }
    return gameId.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
}

function findPokedexIdBySpecies(speciesName) {
    if (!speciesName || typeof speciesName !== "string") return 0;
    const clean = speciesName.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    if (typeof POKEMON_NAMES_ALL !== "undefined" && Array.isArray(POKEMON_NAMES_ALL)) {
        for (let i = 1; i < POKEMON_NAMES_ALL.length; i++) {
            const entry = POKEMON_NAMES_ALL[i];
            if (entry) {
                const entryClean = entry.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (entryClean === clean) return i;
            }
        }
        for (let i = 1; i < POKEMON_NAMES_ALL.length; i++) {
            const entry = POKEMON_NAMES_ALL[i];
            if (entry) {
                const entryClean = entry.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (clean.startsWith(entryClean) || entryClean.startsWith(clean)) return i;
            }
        }
    }
    return 0;
}

function isRunBoxBackup(data) {
    if (!data || typeof data !== "object") return false;
    if (Array.isArray(data)) return false;
    if (Array.isArray(data.runs)) return true;
    if (data.runs && typeof data.runs === "object" && !Array.isArray(data.runs)) return true;
    return false;
}

function mapRunBoxPokemon(p, trainerId, gameId, slotType, slotIndex) {
    if (!p || typeof p !== "object") return null;
    const species = p.species || p.name || "Unknown";
    const pokedexId = parseInt(p.pokedexId || p.speciesId || 0, 10) || findPokedexIdBySpecies(species);
    
    // Normalização de moves
    let moves = ["", "", "", ""];
    if (Array.isArray(p.moveset)) {
        moves = [p.moveset[0] || "", p.moveset[1] || "", p.moveset[2] || "", p.moveset[3] || ""];
    } else if (Array.isArray(p.moves)) {
        moves = [p.moves[0] || "", p.moves[1] || "", p.moves[2] || "", p.moves[3] || ""];
    }

    // Normalização de tipos
    let type1 = "";
    let type2 = "";
    if (Array.isArray(p.types) && p.types.length > 0) {
        type1 = (p.types[0] || "").toString().toLowerCase().trim();
        type2 = (p.types[1] || "").toString().toLowerCase().trim();
    } else {
        if (p.type1) type1 = p.type1.toString().toLowerCase().trim();
        if (p.type2) type2 = p.type2.toString().toLowerCase().trim();
    }

    const uniqueId = (typeof p.id === "string" && p.id.startsWith("pkmn_"))
        ? p.id
        : "pkmn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 7);

    return {
        id: uniqueId,
        species: species,
        pokedexId: pokedexId,
        nickname: p.nickname || "",
        level: parseInt(p.level, 10) || 50,
        ability: p.ability || "",
        nature: p.nature || "Hardy",
        item: p.item || "",
        moves: moves,
        type1: type1,
        type2: type2,
        isShiny: Boolean(p.isShiny || p.shiny),
        slotType: slotType, // "team" ou "box"
        slotIndex: slotIndex, // 0..5 para team, 0 para box
        trainerId: trainerId,
        currentGame: gameId,
        originGame: p.originGame ? normalizeRunBoxGameId(p.originGame) : gameId,
        gender: (p.gender || "M").toString().toUpperCase(),
        ivs: p.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        evs: p.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    };
}

function importRunBoxData(data) {
    if (!isRunBoxBackup(data)) return { runsCount: 0, pokemonCount: 0 };
    
    const runsList = Array.isArray(data.runs) ? data.runs : Object.values(data.runs);
    if (!Array.isArray(trainersList)) {
        trainersList = [];
    }
    if (!Array.isArray(pokemonDatabase)) {
        pokemonDatabase = [];
    }

    let importedRuns = 0;
    let importedPkmn = 0;

    runsList.forEach((run, rIdx) => {
        if (!run || typeof run !== "object") return;
        importedRuns++;

        const gameId = normalizeRunBoxGameId(run.gameId || run.game || "custom");
        const trainerName = (run.name || run.trainerName || `Run ${rIdx + 1}`).trim();
        const tid = (run.trainerId || run.tid || "00000").toString().trim();
        const sid = (run.trainerSid || run.sid || "00000").toString().trim();

        // Encontra ou cria perfil de treinador correspondente
        let trainer = trainersList.find(t => t.gameId === gameId && t.name.toLowerCase() === trainerName.toLowerCase());
        if (!trainer) {
            trainer = {
                id: "trainer_" + gameId + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
                gameId: gameId,
                name: trainerName,
                tid: tid,
                sid: sid
            };
            trainersList.push(trainer);
        }

        const teamMembers = [];
        // 1. Team (slotType: "team", slotIndex: 0..5)
        if (Array.isArray(run.team)) {
            run.team.forEach((p, idx) => {
                if (idx < 6) {
                    const mapped = mapRunBoxPokemon(p, trainer.id, gameId, "team", idx);
                    if (mapped) {
                        teamMembers.push(mapped);
                        pokemonDatabase.push(mapped);
                        importedPkmn++;
                    }
                }
            });
        }

        // Função auxiliar para verificar duplicação interna na run
        const isDuplicateOfTeam = (p) => {
            const species = (p.species || p.name || "").toLowerCase().trim();
            const nick = (p.nickname || "").toLowerCase().trim();
            return teamMembers.some(tm => 
                tm.species.toLowerCase().trim() === species &&
                tm.nickname.toLowerCase().trim() === nick &&
                tm.level === (parseInt(p.level, 10) || tm.level)
            );
        };

        // 2. Box / Bench / Graveyard (slotType: "box")
        const boxSources = [run.box, run.bench, run.graveyard, run.dead, run.daycare];
        boxSources.forEach(source => {
            if (Array.isArray(source)) {
                source.forEach(p => {
                    const mapped = mapRunBoxPokemon(p, trainer.id, gameId, "box", 0);
                    if (mapped) {
                        pokemonDatabase.push(mapped);
                        importedPkmn++;
                    }
                });
            }
        });

        // 3. FinalTeam (se houver, e não for cópia exata do team atual)
        if (Array.isArray(run.finalTeam)) {
            run.finalTeam.forEach(p => {
                if (!isDuplicateOfTeam(p)) {
                    const mapped = mapRunBoxPokemon(p, trainer.id, gameId, "box", 0);
                    if (mapped) {
                        pokemonDatabase.push(mapped);
                        importedPkmn++;
                    }
                }
            });
        }
    });

    try {
        localStorage.setItem("bb_trainers", JSON.stringify(trainersList));
    } catch (e) {
        console.warn("Não foi possível persistir bb_trainers:", e);
    }

    return { runsCount: importedRuns, pokemonCount: importedPkmn };
}
