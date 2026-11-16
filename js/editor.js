// --- SECTION MOVESET LEARNSET VALIDATION ---
const LEARNSET_CACHE = {};
const SPECIES_CACHE = {};
const FETCHING_LEARNSETS = new Set();

function normalizeSpeciesNameForApi(name) {
    if (!name) return "";
    return name.toLowerCase()
        .replace(/♀/g, "-f")
        .replace(/♂/g, "-m")
        .replace(/\./g, "")
        .replace(/'/g, "")
        .replace(/\s+/g, "-")
        .trim();
}

async function fetchPokemonLearnset(species) {
    const apiName = normalizeSpeciesNameForApi(species);
    if (!apiName) return;
    if (LEARNSET_CACHE[apiName] || FETCHING_LEARNSETS.has(apiName)) return;
    
    FETCHING_LEARNSETS.add(apiName);
    try {
        const url = `https://pokeapi.co/api/v2/pokemon/${apiName}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            const learnedMoves = new Set();
            if (data.moves && Array.isArray(data.moves)) {
                data.moves.forEach(m => {
                    if (m.move && m.move.name) {
                        const normMove = m.move.name.toLowerCase().replace(/-/g, " ");
                        learnedMoves.add(normMove);
                    }
                });
            }
            LEARNSET_CACHE[apiName] = learnedMoves;

            const baseStats = { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 };
            if (data.stats && Array.isArray(data.stats)) {
                data.stats.forEach(s => {
                    if (s.stat.name === "hp") baseStats.hp = s.base_stat;
                    else if (s.stat.name === "attack") baseStats.atk = s.base_stat;
                    else if (s.stat.name === "defense") baseStats.def = s.base_stat;
                    else if (s.stat.name === "special-attack") baseStats.spa = s.base_stat;
                    else if (s.stat.name === "special-defense") baseStats.spd = s.base_stat;
                    else if (s.stat.name === "speed") baseStats.spe = s.base_stat;
                });
            }
            
            const types = [];
            if (data.types && Array.isArray(data.types)) {
                data.types.forEach(t => {
                    if (t.type && t.type.name) types.push(t.type.name.toLowerCase());
                });
            }
            
            SPECIES_CACHE[apiName] = {
                learnset: learnedMoves,
                baseStats: baseStats,
                types: types
            };
            
            // Re-render recommendations since we now have the accurate learnset
            const game = GAMES_DB.find(g => g.id === currentGameId);
            const gen = game ? game.gen : 9;
            const recommendations = getRecommendedAllocation();
            const activeTeam = recommendations.map(rec => rec.pokemon);
            renderWeaknessAnalysis(activeTeam, gen);
            
            // Re-populate moves dropdowns if editor is active and matches species
            const editorModal = document.getElementById("editor-modal");
            if (editorModal && editorModal.classList.contains("active")) {
                const currentId = document.getElementById("form-id").value;
                const currentSpecies = document.getElementById("form-species").value.trim();
                if (normalizeSpeciesNameForApi(currentSpecies) === apiName) {
                    let p = pokemonDatabase.find(pkmn => pkmn.id === currentId);
                    const tempP = p ? {
                        ...p,
                        species: currentSpecies,
                        currentGame: document.getElementById("form-origin-game").value,
                        moves: [
                            document.getElementById("form-move1").value,
                            document.getElementById("form-move2").value,
                            document.getElementById("form-move3").value,
                            document.getElementById("form-move4").value
                        ]
                    } : {
                        species: currentSpecies,
                        currentGame: document.getElementById("form-origin-game").value,
                        moves: [
                            document.getElementById("form-move1").value,
                            document.getElementById("form-move2").value,
                            document.getElementById("form-move3").value,
                            document.getElementById("form-move4").value
                        ]
                    };
                    populateMoveSelects(tempP);
                }
            }
        }
    } catch (e) {
        console.error("Erro ao procurar learnset para " + species, e);
    } finally {
        FETCHING_LEARNSETS.delete(apiName);
    }
}

function checkHardcodedLearnsetRules(species, move, gen) {
    if (move === "close combat") {
        if (gen < 4) return false;
        const canLearn = [
            "staraptor", "infernape", "lucario", "gallade", "heracross", "machamp", "primeape", "sneasler", "ursaring", "ursaluna",
            "blaziken", "hariyama", "hitmonlee", "hitmonchan", "hitmontop", "pangoro", "hawlucha", "bewear", "obstagoon",
            "mew", "zacian", "arceus"
        ];
        return canLearn.includes(species);
    }
    
    if (move === "earthquake") {
        const canLearn = [
            "charizard", "typhlosion", "blaziken", "camerupt", "torkoal", "infernape", "emboar", "skeledirge", "coalossal", "centiskorch",
            "snorlax", "tauros", "kangaskhan", "ursaring", "slaking", "zangoose", "miltank", "exploud", "kecleon", "dunsparce", "bouffalant", "ursaluna",
            "dragonite", "salamence", "flygon", "garchomp", "rayquaza", "hydreigon", "haxorus", "druddigon", "kommo-o", "goodra", "drampa", "baxcalibur", "archaludon",
            "nidoking", "nidoqueen", "golem", "rhydon", "rhyperior", "donphan", "swampert", "steelix", "aggron", "metagross", "mamoswine", "hippowdon", "excadrill", "landorus",
            "mew", "mewtwo", "arceus", "groudon", "tyranitar"
        ];
        if (canLearn.includes(species)) return true;
        
        const cannotLearn = [
            "altaria", "kingdra", "latias", "latios", "appletun", "flapple",
            "ninetales", "arcanine", "rapidash", "magmar", "flareon", "houndoom", "magcargo", "magmortar",
            "togetic", "togekiss", "wigglytuff", "clefable", "chansey", "blissey", "raticate", "furret", "linoone",
            "pidgeot", "fearow", "swellow", "noctowl", "staraptor", "noivern", "dragonair", "dratini"
        ];
        if (cannotLearn.includes(species)) return false;
    }
    
    if (move === "rock slide") {
        const canLearn = [
            "charizard", "typhlosion", "blaziken", "camerupt", "torkoal", "magcargo", "infernape", "emboar", "darmanitan", "coalossal", "centiskorch", "skeledirge",
            "machamp", "hariyama", "breloom", "heracross", "hitmonlee", "hitmonchan", "hitmontop", "primeape", "lucario", "toxicroak", "gallade", "conkeldurr", "scrafty",
            "mew", "mewtwo", "arceus", "groudon", "tyranitar", "golem", "rhydon", "rhyperior", "sudowoodo", "steelix", "aggron", "armaldo", "cradily", "relicanth"
        ];
        if (canLearn.includes(species)) return true;
        
        const cannotLearn = [
            "arcanine", "ninetales", "rapidash", "magmar", "flareon", "houndoom"
        ];
        if (cannotLearn.includes(species)) return false;
    }
    
    if (move === "ice beam" || move === "blizzard") {
        const canLearnPsychic = ["slowbro", "starmie", "mew", "mewtwo", "jynx", "celebi"];
        const cannotLearnPsychic = ["alakazam", "kadabra", "drowzee", "hypno", "exeggutor", "mr-mime", "espeon"];
        if (canLearnPsychic.includes(species)) return true;
        if (cannotLearnPsychic.includes(species)) return false;
        
        const cannotLearnWater = ["magikarp", "feebas"];
        if (cannotLearnWater.includes(species)) return false;
    }

    if (move === "thunderbolt") {
        const canLearnPsychic = ["mew", "mewtwo", "slowbro", "starmie", "mr-mime", "gardevoir", "claydol", "solrock", "lunatone"];
        const cannotLearnPsychic = ["alakazam", "kadabra", "drowzee", "hypno", "exeggutor", "jynx", "espeon"];
        if (canLearnPsychic.includes(species)) return true;
        if (cannotLearnPsychic.includes(species)) return false;
    }
    
    if (move === "submission") {
        if (gen > 3) return false;
        const canLearn = [
            "snorlax", "clefable", "wigglytuff", "chansey", "kangaskhan", "tauros", "poliwrath", "machop", "machoke", "machamp",
            "pikachu", "raichu", "electabuzz", "jolteon", "mew", "mewtwo", "hitmonlee", "hitmonchan", "pinsir"
        ];
        if (canLearn.includes(species)) return true;
        const cannotLearn = ["zapdos", "magneton", "electrode"];
        if (cannotLearn.includes(species)) return false;
    }

    if (move === "dynamic punch") {
        const canLearn = [
            "snorlax", "clefable", "wigglytuff", "blissey", "kangaskhan", "ursaring", "tauros", "miltank", "exploud", "kecleon",
            "electabuzz", "ampharos", "raichu", "machamp", "hitmonlee", "hitmonchan", "hitmontop", "hariyama", "poliwrath", "mew", "mewtwo"
        ];
        if (canLearn.includes(species)) return true;
        const cannotLearn = ["jolteon", "magneton", "lanturn", "electrode", "raikou", "zapdos"];
        if (cannotLearn.includes(species)) return false;
    }

    if (move === "brick break") {
        if (gen < 3) return false;
        const canLearn = [
            "snorlax", "clefable", "wigglytuff", "blissey", "kangaskhan", "ursaring", "slaking", "zangoose", "tauros", "miltank", "raticate", "furret", "linoone", "spinda", "exploud", "kecleon", "ambipom", "stoutland", "lopunny",
            "machamp", "hariyama", "breloom", "heracross", "blaziken", "hitmonlee", "hitmonchan", "hitmontop", "primeape", "lucario", "toxicroak", "gallade", "mew", "mewtwo"
        ];
        if (canLearn.includes(species)) return true;
        const cannotLearn = ["togetic", "pidgeot", "fearow", "swellow", "noctowl", "castform", "ditto"];
        if (cannotLearn.includes(species)) return false;
    }

    if (move === "ice punch") {
        const canLearn = [
            "machamp", "hitmonchan", "medicham", "poliwrath", "lucario", "toxicroak", "gallade", "conkeldurr", "pangoro", "crabominable", "sneasler",
            "mew", "mewtwo"
        ];
        if (canLearn.includes(species)) return true;
        const cannotLearn = ["hitmonlee", "hitmontop", "primeape", "breloom", "heracross", "blaziken", "hawlucha", "bewear", "quaquaval"];
        if (cannotLearn.includes(species)) return false;
    }

    if (move === "body slam") {
        const canLearnElectric = ["pikachu", "raichu", "jolteon", "electabuzz", "mew", "mewtwo"];
        const cannotLearnElectric = ["zapdos", "magneton", "electrode"];
        if (canLearnElectric.includes(species)) return true;
        if (cannotLearnElectric.includes(species)) return false;
    }

    if (move === "swift") {
        const canLearnElectric = ["pikachu", "raichu", "jolteon", "electabuzz", "magneton", "electrode", "lanturn", "ampharos", "raikou", "mew", "mewtwo"];
        if (canLearnElectric.includes(species)) return true;
    }

    if (move === "shadow ball") {
        if (gen < 2) return false;
        const canLearn = [
            "alakazam", "hypno", "mewtwo", "mew", "gardevoir", "grumpig", "claydol", "metagross", "espeon", "xatu", "girafarig", "celebi", "reuniclus", "gothitelle", "beheeyem", "delphox", "oranguru", "jynx"
        ];
        if (canLearn.includes(species)) return true;
        const cannotLearn = ["exeggutor", "slowbro", "slowking", "wobbuffet", "unown"];
        if (cannotLearn.includes(species)) return false;
    }

    if (move === "dark pulse") {
        if (gen < 4) return false;
        const canLearn = [
            "alakazam", "mewtwo", "mew", "gardevoir", "grumpig", "claydol", "metagross", "espeon", "celebi", "reuniclus", "gothitelle", "beheeyem", "delphox", "oranguru", "malamar"
        ];
        if (canLearn.includes(species)) return true;
        const cannotLearn = ["hypno", "exeggutor", "slowbro", "slowking", "wobbuffet", "claydol", "chimecho", "lunatone", "solrock"];
        if (cannotLearn.includes(species)) return false;
    }

    if (move === "bite") {
        const canLearn = ["girafarig", "mew", "solrock", "lunatone", "dunspace", "arcanine", "gyarados"];
        if (canLearn.includes(species)) return true;
        const cannotLearn = ["alakazam", "hypno", "exeggutor", "slowbro", "starmie", "espeon", "gardevoir", "claydol", "metagross", "kadabra", "drowzee"];
        if (cannotLearn.includes(species)) return false;
    }

    if (move === "flamethrower") {
        const canLearn = [
            "dragonite", "charizard", "salamence", "flygon", "rayquaza", "garchomp", "hydreigon", "haxorus", "druddigon", "tyrantrum", "drampa", "turtonator", "kommo-o", "dragapult", "baxcalibur", "archaludon", "altaria",
            "mew", "mewtwo"
        ];
        if (canLearn.includes(species)) return true;
        const cannotLearn = ["kingdra", "latias", "latios", "appletun", "flapple"];
        if (cannotLearn.includes(species)) return false;
    }

    return null;
}

function guessTypeMoveCompatibility(pkmn, moveEnglishName, gen) {
    const isType = (t) => pkmn.type1 === t || pkmn.type2 === t;
    
    if (moveEnglishName === "earthquake") {
        return isType("ground") || isType("rock") || isType("steel") || isType("dragon") || (isType("normal") && !isType("flying"));
    }
    if (moveEnglishName === "rock slide") {
        return isType("rock") || isType("ground") || isType("fighting") || isType("fire");
    }
    if (moveEnglishName === "close combat" || moveEnglishName === "submission" || moveEnglishName === "dynamic punch" || moveEnglishName === "brick break") {
        return isType("fighting") || (isType("normal") && !isType("flying")) || isType("electric");
    }
    if (moveEnglishName === "ice punch") {
        return isType("fighting") || isType("water");
    }
    if (moveEnglishName === "ice beam" || moveEnglishName === "blizzard") {
        return isType("water") || isType("ice") || isType("psychic");
    }
    if (moveEnglishName === "thunderbolt") {
        return isType("electric") || isType("water");
    }
    if (moveEnglishName === "shadow ball" || moveEnglishName === "dark pulse") {
        return isType("ghost") || isType("dark") || isType("psychic");
    }
    if (moveEnglishName === "flamethrower") {
        return isType("fire") || isType("dragon");
    }
    
    return true;
}

function canPokemonLearnMove(pkmn, moveEnglishName, gen) {
    const species = pkmn.species;
    const normSpecies = normalizeSpeciesNameForApi(species);
    const normMove = moveEnglishName.toLowerCase().replace(/-/g, " ");

    if (normMove === "hidden power") {
        if (["ditto", "unown", "caterpie", "weedle", "kakuna", "metapod", "wobbuffet", "wynaut", "beldum", "smeargle"].includes(normSpecies)) {
            return false;
        }
        return gen >= 2;
    }

    const isAllowed = checkHardcodedLearnsetRules(normSpecies, normMove, gen);
    if (isAllowed !== null) {
        return isAllowed;
    }

    if (LEARNSET_CACHE[normSpecies]) {
        return LEARNSET_CACHE[normSpecies].has(normMove);
    } else {
        fetchPokemonLearnset(species);
        return guessTypeMoveCompatibility(pkmn, normMove, gen);
    }
}

const MOVE_TYPES = {
    "pound": "normal", "karate chop": "fighting", "double slap": "normal", "comet punch": "normal", "mega punch": "normal",
    "pay day": "normal", "fire punch": "fire", "ice punch": "ice", "thunder punch": "electric", "scratch": "normal",
    "vice grip": "normal", "guillotine": "normal", "razor wind": "normal", "swords dance": "normal", "cut": "normal",
    "gust": "flying", "wing attack": "flying", "whirlwind": "normal", "fly": "flying", "bind": "normal",
    "slam": "normal", "vine whip": "grass", "stomp": "normal", "double kick": "fighting", "mega kick": "normal",
    "jump kick": "fighting", "rolling kick": "fighting", "sand attack": "ground", "headbutt": "normal", "horn attack": "normal",
    "fury attack": "normal", "horn drill": "normal", "tackle": "normal", "body slam": "normal", "wrap": "normal",
    "take down": "normal", "thrash": "normal", "double edge": "normal", "tail whip": "normal", "poison sting": "poison",
    "twineedle": "bug", "pin missile": "bug", "leer": "normal", "bite": "dark", "growl": "normal",
    "roar": "normal", "sing": "normal", "supersonic": "normal", "sonic boom": "normal", "disable": "normal",
    "acid": "poison", "ember": "fire", "flamethrower": "fire", "mist": "ice", "water gun": "water",
    "hydro pump": "water", "surf": "water", "ice beam": "ice", "blizzard": "ice", "psybeam": "psychic",
    "bubble beam": "water", "aurora beam": "ice", "hyper beam": "normal", "peck": "flying", "drill peck": "flying",
    "submission": "fighting", "low kick": "fighting", "counter": "fighting", "seismic toss": "fighting", "strength": "normal",
    "absorb": "grass", "mega drain": "grass", "leech seed": "grass", "growth": "normal", "razor leaf": "grass",
    "solar beam": "grass", "poison powder": "poison", "stun spore": "grass", "sleep powder": "grass", "petal dance": "grass",
    "string shot": "bug", "dragon rage": "dragon", "fire spin": "fire", "thunder shock": "electric", "thunderbolt": "electric",
    "thunder wave": "electric", "thunder": "electric", "rock throw": "rock", "earthquake": "ground", "fissure": "ground",
    "dig": "ground", "toxic": "poison", "confusion": "psychic", "psychic": "psychic", "hypnosis": "psychic",
    "meditate": "psychic", "agility": "psychic", "quick attack": "normal", "rage": "normal", "teleport": "psychic",
    "night shade": "ghost", "mimic": "normal", "screech": "normal", "double team": "normal", "recover": "normal",
    "harden": "normal", "minimize": "normal", "smokescreen": "normal", "confuse ray": "ghost", "withdraw": "water",
    "defense curl": "normal", "barrier": "psychic", "light screen": "psychic", "haze": "ice", "reflect": "psychic",
    "focus energy": "normal", "bide": "normal", "metronome": "normal", "mirror move": "flying", "self destruct": "normal",
    "egg bomb": "normal", "lick": "ghost", "smog": "poison", "sludge": "poison", "bone club": "ground",
    "fire blast": "fire", "waterfall": "water", "clamp": "water", "swift": "normal", "skull bash": "normal",
    "spike cannon": "normal", "constrict": "normal", "amnesia": "psychic", "kinesis": "psychic", "soft boiled": "normal",
    "high jump kick": "fighting", "glare": "normal", "dream eater": "psychic", "poison gas": "poison", "barrage": "normal",
    "leech life": "bug", "lovely kiss": "normal", "sky attack": "flying", "transform": "normal", "bubble": "water",
    "dizzy punch": "normal", "spore": "grass", "flash": "normal", "psywave": "psychic", "splash": "normal",
    "acid armor": "poison", "crabhammer": "water", "explosion": "normal", "fury swipes": "normal", "bonemerang": "ground",
    "rest": "normal", "rock slide": "rock", "hyper fang": "normal", "sharpen": "normal", "conversion": "normal",
    "tri attack": "normal", "super fang": "normal", "slash": "normal", "substitute": "normal", "struggle": "normal",
    "sketch": "normal", "triple kick": "fighting", "thief": "dark", "spider web": "bug", "mind reader": "normal",
    "nightmare": "ghost", "flame wheel": "fire", "snore": "normal", "curse": "ghost", "flail": "normal",
    "conversion 2": "normal", "aeroblast": "flying", "cotton spore": "grass", "reversal": "fighting", "spite": "ghost",
    "powder snow": "ice", "protect": "normal", "mach punch": "fighting", "scary face": "normal", "feint attack": "dark",
    "sweet kiss": "fairy", "belly drum": "normal", "sludge bomb": "poison", "mud slap": "ground", "octazooka": "water",
    "spikes": "ground", "zap cannon": "electric", "foresight": "normal", "destiny bond": "ghost", "perish song": "normal",
    "icy wind": "ice", "detect": "fighting", "bone rush": "ground", "lock on": "normal", "outrage": "dragon",
    "sandstorm": "rock", "giga drain": "grass", "endure": "normal", "charm": "fairy", "rollout": "rock",
    "false swipe": "normal", "swagger": "normal", "milk drink": "normal", "spark": "electric", "fury cutter": "bug",
    "steel wing": "steel", "mean look": "normal", "attract": "normal", "sleep talk": "normal", "heal bell": "normal",
    "return": "normal", "present": "normal", "frustration": "normal", "safeguard": "normal", "pain split": "normal",
    "sacred fire": "fire", "magnitude": "ground", "dynamic punch": "fighting", "megahorn": "bug", "dragon breath": "dragon",
    "baton pass": "normal", "encore": "normal", "pursuit": "dark", "rapid spin": "normal", "sweet scent": "normal",
    "iron tail": "steel", "metal claw": "steel", "vital throw": "fighting", "morning sun": "normal", "synthesis": "grass",
    "moonlight": "fairy", "hidden power": "normal", "cross chop": "fighting", "twister": "dragon", "rain dance": "water",
    "sunny day": "fire", "crunch": "dark", "mirror coat": "psychic", "psych up": "normal", "extreme speed": "normal",
    "ancient power": "rock", "shadow ball": "ghost", "future sight": "psychic", "rock smash": "fighting", "whirlpool": "water",
    "beat up": "dark",
    "fake out": "normal", "uproar": "normal", "stockpile": "normal", "spit up": "normal", "swallow": "normal",
    "heat wave": "fire", "hail": "ice", "torment": "dark", "flatter": "dark", "will o wisp": "fire",
    "memento": "dark", "facade": "normal", "focus punch": "fighting", "smelling salts": "normal", "follow me": "normal",
    "nature power": "normal", "charge": "electric", "taunt": "dark", "helping hand": "normal", "trick": "psychic",
    "role play": "psychic", "wish": "normal", "assist": "normal", "ingrain": "grass", "superpower": "fighting",
    "magic coat": "psychic", "recycle": "normal", "revenge": "fighting", "brick break": "fighting", "yawn": "normal",
    "knock off": "dark", "endeavor": "normal", "eruption": "fire", "skill swap": "psychic", "imprison": "psychic",
    "refresh": "normal", "grudge": "ghost", "snatch": "dark", "secret power": "normal", "dive": "water",
    "arm thrust": "fighting", "camouflage": "normal", "tail glow": "bug", "luster purge": "psychic", "mist ball": "psychic",
    "feather dance": "flying", "teeter dance": "normal", "blaze kick": "fire", "mud sport": "ground", "ice ball": "ice",
    "needle arm": "grass", "slack off": "normal", "hyper voice": "normal", "poison fang": "poison", "crush claw": "normal",
    "blast burn": "fire", "hydro cannon": "water", "meteor mash": "steel", "astonish": "ghost", "weather ball": "normal",
    "aromatherapy": "grass", "fake tears": "dark", "air cutter": "flying", "overheat": "fire", "odor sleuth": "normal",
    "rock tomb": "rock", "silver wind": "bug", "metal sound": "steel", "grass whistle": "grass", "tickle": "normal",
    "cosmic power": "psychic", "water spout": "water", "signal beam": "bug", "shadow punch": "ghost", "extrasensory": "psychic",
    "sky uppercut": "fighting", "sand tomb": "ground", "sheer cold": "ice", "muddy water": "water", "bullet seed": "grass",
    "aerial ace": "flying", "icicle spear": "ice", "iron defense": "steel", "block": "normal", "howl": "normal",
    "dragon claw": "dragon", "frenzy plant": "grass", "bulk up": "fighting", "bounce": "flying", "mud shot": "ground",
    "poison tail": "poison", "covet": "normal", "volt tackle": "electric", "magical leaf": "grass", "water sport": "water",
    "calm mind": "psychic", "leaf blade": "grass", "dragon dance": "dragon", "rock blast": "rock", "shock wave": "electric",
    "water pulse": "water", "doom desire": "steel", "psycho boost": "psychic",
    "roost": "flying", "gravity": "psychic", "miracle eye": "psychic", "wake up slap": "fighting", "hammer arm": "fighting",
    "gyro ball": "steel", "healing wish": "psychic", "brine": "water", "natural gift": "normal", "feint": "normal",
    "pluck": "flying", "tailwind": "flying", "acupressure": "normal", "metal burst": "steel", "u turn": "bug",
    "close combat": "fighting", "payback": "dark", "assurance": "dark", "embargo": "dark", "fling": "dark",
    "psycho shift": "psychic", "trump card": "normal", "heal block": "psychic", "wring out": "normal", "power trick": "psychic",
    "gastro acid": "poison", "lucky chant": "normal", "me first": "normal", "copycat": "normal", "power swap": "psychic",
    "guard swap": "psychic", "punishment": "dark", "last resort": "normal", "worry seed": "grass", "sucker punch": "dark",
    "toxic spikes": "poison", "heart swap": "psychic", "aqua ring": "water", "magnet rise": "electric", "flare blitz": "fire",
    "force palm": "fighting", "aura sphere": "fighting", "rock polish": "rock", "poison jab": "poison", "dark pulse": "dark",
    "night slash": "dark", "aqua tail": "water", "seed bomb": "grass", "air slash": "flying", "x scissor": "bug",
    "bug buzz": "bug", "dragon pulse": "dragon", "dragon rush": "dragon", "power gem": "rock", "drain punch": "fighting",
    "vacuum wave": "fighting", "focus blast": "fighting", "energy ball": "grass", "brave bird": "flying", "earth power": "ground",
    "switcheroo": "dark", "giga impact": "normal", "nasty plot": "dark", "bullet punch": "steel", "avalanche": "ice",
    "ice shard": "ice", "shadow claw": "ghost", "thunder fang": "electric", "ice fang": "ice", "fire fang": "fire",
    "shadow sneak": "ghost", "mud bomb": "ground", "psycho cut": "psychic", "zen headbutt": "psychic", "mirror shot": "steel",
    "flash cannon": "steel", "rock climb": "normal", "defog": "flying", "trick room": "psychic", "draco meteor": "dragon",
    "discharge": "electric", "lava plume": "fire", "leaf storm": "grass", "power whip": "grass", "rock wrecker": "rock",
    "cross poison": "poison", "gunk shot": "poison", "iron head": "steel", "magnet bomb": "steel", "stone edge": "rock",
    "captivate": "normal", "stealth rock": "rock", "grass knot": "grass", "chatter": "flying", "judgment": "normal",
    "bug bite": "bug", "charge beam": "electric", "wood hammer": "grass", "aqua jet": "water", "attack order": "bug",
    "defend order": "bug", "heal order": "bug", "head smash": "rock", "double hit": "normal", "roar of time": "dragon",
    "spacial rend": "dragon", "lunar dance": "psychic", "crush grip": "normal", "magma storm": "fire", "dark void": "dark",
    "seed flare": "grass", "ominous wind": "ghost", "shadow force": "ghost",
    "play rough": "fairy", "dazzling gleam": "fairy", "moonblast": "fairy", "scald": "water", "volt switch": "electric",
    "flip turn": "water", "parting shot": "dark", "hurricane": "flying", "draco meteor": "dragon"
};

const PHYSICAL_MOVES = new Set([
    "earthquake", "body slam", "rock slide", "brick break", "close combat",
    "ice punch", "submission", "double edge", "return", "dig", "waterfall",
    "dragon claw", "shadow claw", "poison jab", "iron head", "stone edge",
    "play rough", "brave bird", "extreme speed", "quick attack", "tackle",
    "slash", "facade", "fire punch", "thunder punch", "zen headbutt", "liquidation",
    "flare blitz", "wild charge", "seed bomb", "u turn", "knock off", "sucker punch"
]);

const SPECIAL_MOVES = new Set([
    "surf", "ice beam", "blizzard", "flamethrower", "thunderbolt", "giga drain",
    "psychic", "shadow ball", "dark pulse", "swift", "fire blast", "hydro pump",
    "solar beam", "dragon pulse", "dazzling gleam", "focus blast", "energy ball",
    "earth power", "flash cannon", "sludge bomb", "scald", "volt switch", "draco meteor",
    "air slash", "bug buzz", "hurricane", "leaf storm", "overheat", "extrasensory",
    "hyper voice", "weather ball", "tri attack", "psybeam", "bubble beam"
]);

function getMoveCategory(moveEnglishName, gen) {
    const normName = moveEnglishName.toLowerCase().replace(/-/g, " ");
    
    const statusMoves = [
        "swords dance", "dragon dance", "calm mind", "nasty plot", "bulk up",
        "agility", "quiver dance", "shell smash", "roost", "recover", "soft boiled",
        "wish", "will o wisp", "toxic", "thunder wave", "spore", "sleep powder",
        "protect", "substitute", "stealth rock", "spikes", "toxic spikes", "defog",
        "rapid spin", "haze", "taunt", "encore", "baton pass", "yawn"
    ];
    if (statusMoves.includes(normName)) return "status";
    
    if (gen < 4) {
        const moveTypes = {
            "surf": "water", "ice beam": "ice", "blizzard": "ice", "flamethrower": "fire", "thunderbolt": "electric",
            "giga drain": "grass", "psychic": "psychic", "shadow ball": "ghost", "dark pulse": "dark", "swift": "normal",
            "earthquake": "ground", "body slam": "normal", "rock slide": "rock", "brick break": "fighting",
            "close combat": "fighting", "ice punch": "ice", "submission": "fighting", "dragon claw": "dragon",
            "return": "normal", "double edge": "normal", "dig": "ground", "waterfall": "water",
            "sludge bomb": "poison", "bite": "dark", "crunch": "dark", "shadow sneak": "ghost",
            "bullet punch": "steel", "mach punch": "fighting", "fake out": "normal"
        };
        const mType = moveTypes[normName] || "normal";
        const specialTypes = ["water", "grass", "fire", "ice", "electric", "psychic", "dragon", "dark"];
        return specialTypes.includes(mType) ? "special" : "physical";
    } else {
        if (SPECIAL_MOVES.has(normName)) return "special";
        return "physical";
    }
}

function getFourRecommendedMoves(pkmn, gen) {
    const species = pkmn.species;
    const normSpecies = normalizeSpeciesNameForApi(species);
    
    const t1 = (pkmn.type1 || "normal").toLowerCase();
    const t2 = (pkmn.type2 || "").toLowerCase();
    
    let bias = "mixed";
    let bStats = { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 };
    if (typeof SPECIES_CACHE !== 'undefined' && SPECIES_CACHE[normSpecies]) {
        bStats = SPECIES_CACHE[normSpecies].baseStats;
    } else {
        const physicalTypes = ["fighting", "ground", "rock", "steel", "poison", "bug", "flying"];
        const specialTypes = ["psychic", "electric", "fire", "ice", "grass", "ghost", "dark", "fairy"];
        
        let physCount = 0;
        let specCount = 0;
        if (physicalTypes.includes(t1)) physCount++;
        if (physicalTypes.includes(t2)) physCount++;
        if (specialTypes.includes(t1)) specCount++;
        if (specialTypes.includes(t2)) specCount++;
        
        if (physCount > specCount) bias = "physical";
        else if (specCount > physCount) bias = "special";
    }
    
    if (bStats.atk > bStats.spa * 1.1) {
        bias = "physical";
    } else if (bStats.spa > bStats.atk * 1.1) {
        bias = "special";
    }
    
    const learnableCandidates = [];
    if (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined') {
        Object.entries(POKEAPI_MOVE_ID_TO_NAME).forEach(([idStr, rawName]) => {
            const moveId = parseInt(idStr, 10);
            const moveGen = getMoveGeneration(moveId);
            const englishName = rawName.toLowerCase();
            
            if (moveGen > gen) return;
            
            if (canPokemonLearnMove(pkmn, englishName, gen)) {
                learnableCandidates.push({ id: moveId, english: englishName, gen: moveGen });
            }
        });
    }
    
    const ratedCandidates = learnableCandidates.map(c => {
        const normName = c.english.toLowerCase();
        const mType = MOVE_TYPES[normName] || "normal";
        const category = getMoveCategory(normName, gen);
        const isSTAB = (mType === t1 || mType === t2);
        
        let score = 0;
        if (isSTAB) score += 35;
        
        if (bias === "physical" && category === "physical") score += 25;
        else if (bias === "special" && category === "special") score += 25;
        else if (bias === "mixed" && (category === "physical" || category === "special")) score += 10;
        else if (category === "status") score += 10; 
        else score -= 20; 
        
        const powerMoves = [
            "earthquake", "surf", "flamethrower", "thunderbolt", "ice beam", "psychic",
            "close combat", "waterfall", "scald", "play rough", "moonblast", "dazzling gleam",
            "dark pulse", "shadow ball", "giga drain", "sludge bomb", "leaf storm", "draco meteor",
            "brave bird", "stone edge", "rock slide", "brick break", "body slam", "dragon dance",
            "swords dance", "calm mind", "nasty plot", "u turn", "volt switch", "roost", "recover",
            "spore", "knock off", "sucker punch"
        ];
        if (powerMoves.includes(normName)) {
            score += 15;
        }
        
        return { ...c, score, mType, category };
    });
    
    ratedCandidates.sort((a, b) => b.score - a.score);
    
    const selected = [];
    const selectedTypes = new Set();
    
    for (let i = 0; i < ratedCandidates.length && selected.length < 4; i++) {
        const c = ratedCandidates[i];
        const disp = formatMoveNameForDisplay(c.english);
        
        if (selectedTypes.has(c.mType) && selected.filter(x => (MOVE_TYPES[x.english] || "normal") === c.mType).length >= 2) {
            continue;
        }
        if (selected.some(x => x.english === c.english)) continue;
        
        selected.push({ display: disp, english: c.english });
        selectedTypes.add(c.mType);
    }
    
    if (selected.length < 4) {
        const fallbackPool = [
            "earthquake", "surf", "thunderbolt", "ice beam", "flamethrower", "body slam", "psychic", "return"
        ];
        fallbackPool.forEach(fb => {
            if (selected.length >= 4) return;
            if (selected.some(x => x.english === fb)) return;
            if (canPokemonLearnMove(pkmn, fb, gen)) {
                selected.push({ display: formatMoveNameForDisplay(fb), english: fb });
            }
        });
    }
    
    return selected;
}

function getPokemonGen(pokedexId) {
    if (pokedexId <= 151) return 1;
    if (pokedexId <= 251) return 2;
    if (pokedexId <= 386) return 3;
    if (pokedexId <= 493) return 4;
    if (pokedexId <= 649) return 5;
    if (pokedexId <= 721) return 6;
    if (pokedexId <= 809) return 7;
    if (pokedexId <= 905) return 8;
    return 9;
}

const PRE_EVOLUTIONS_MAP = {
    // Gen 1
    2: 1, 3: 2, // Ivysaur -> Bulbasaur, Venusaur -> Ivysaur
    5: 4, 6: 5, // Charmeleon -> Charmander, Charizard -> Charmeleon
    8: 7, 9: 8, // Wartortle -> Squirtle, Blastoise -> Wartortle
    11: 10, 12: 11, // Metapod -> Caterpie, Butterfree -> Metapod
    14: 13, 15: 14, // Kakuna -> Weedle, Beedrill -> Kakuna
    17: 16, 18: 17, // Pidgeotto -> Pidgey, Pidgeot -> Pidgeotto
    20: 19, // Raticate -> Rattata
    22: 21, // Fearow -> Spearow
    24: 23, // Arbok -> Ekans
    26: 25, // Raichu -> Pikachu
    28: 27, // Sandslash -> Sandshrew
    30: 29, 31: 30, // Nidorina -> NidoranF, Nidoqueen -> Nidorina
    33: 32, 34: 33, // Nidorino -> NidoranM, Nidoking -> Nidorino
    36: 35, // Clefable -> Clefairy
    38: 37, // Ninetales -> Vulpix
    40: 39, // Wigglytuff -> Jigglypuff
    42: 41, // Golbat -> Zubat
    44: 43, 45: 44, 46: 44, // Gloom -> Oddish, Vileplume -> Gloom, Bellossom -> Gloom
    47: 46, // Parasect -> Paras
    49: 48, // Venomoth -> Venonat
    51: 50, // Dugtrio -> Diglett
    53: 52, // Persian -> Meowth
    55: 54, // Golduck -> Psyduck
    57: 56, // Primeape -> Mankey
    59: 58, // Arcanine -> Growlithe
    61: 60, 62: 61, 186: 61, // Poliwhirl -> Poliwag, Poliwrath -> Poliwhirl, Politoed -> Poliwhirl
    64: 63, 65: 64, // Kadabra -> Abra, Alakazam -> Kadabra
    67: 66, 68: 67, // Machoke -> Machop, Machamp -> Machoke
    70: 69, 71: 70, // Weepinbell -> Bellsprout, Victreebel -> Weepinbell
    73: 72, // Tentacruel -> Tentacool
    75: 74, 76: 75, // Graveler -> Geodude, Golem -> Graveler
    78: 77, // Rapidash -> Ponyta
    80: 79, 199: 79, // Slowbro -> Slowpoke, Slowking -> Slowpoke
    82: 81, 462: 82, // Magneton -> Magnemite, Magnezone -> Magneton
    85: 84, // Dodrio -> Doduo
    87: 86, // Dewgong -> Seel
    89: 88, // Muk -> Grimer
    91: 90, // Cloyster -> Shellder
    93: 92, 94: 93, // Haunter -> Gastly, Gengar -> Haunter
    95: 95, 208: 95, // Steelix -> Onix
    97: 96, // Hypno -> Drowzee
    99: 98, // Kingler -> Krabby
    101: 100, // Electrode -> Voltorb
    103: 102, // Exeggutor -> Exeggcute
    105: 104, // Marowak -> Cubone
    110: 109, // Weezing -> Koffing
    112: 111, 464: 112, // Rhydon -> Rhyhorn, Rhyperior -> Rhydon
    117: 116, 230: 117, // Seadra -> Horsea, Kingdra -> Seadra
    119: 118, // Seaking -> Goldeen
    121: 120, // Starmie -> Staryu
    130: 129, // Gyarados -> Magikarp
    134: 133, 135: 133, 136: 133, 196: 133, 197: 133, 470: 133, 471: 133, 700: 133, // Eeveelutions -> Eevee
    139: 138, // Omastar -> Omanyte
    141: 140, // Kabutops -> Kabuto
    149: 148, 148: 147, // Dragonite -> Dragonair, Dragonair -> Dratini

    // Baby Pokemons from Gen 2 and Gen 4
    25: 172, 35: 173, 39: 174, 176: 175, // Pikachu -> Pichu, Clefairy -> Cleffa, Jigglypuff -> Igglybuff, Togetic -> Togepi
    183: 298, 202: 360, // Marill -> Azurill, Wobbuffet -> Wynaut
    315: 406, 185: 438, 122: 439, 113: 440, 143: 446, 226: 458, // Roselia -> Budew, Sudowoodo -> Bonsly, Mr. Mime -> Mime Jr., Chansey -> Happiny, Snorlax -> Munchlax, Mantine -> Mantyke
    125: 239, 126: 240, // Electabuzz -> Elekid, Magmar -> Magby
    124: 238, // Jynx -> Smoochum

    // Gen 2
    153: 152, 154: 153, // Bayleef -> Chikorita, Meganium -> Bayleef
    156: 155, 157: 156, // Quilava -> Cyndaquil, Typhlosion -> Quilava
    159: 158, 160: 159, // Croconaw -> Totodile, Feraligatr -> Croconaw
    162: 161, // Furret -> Sentret
    164: 163, // Noctowl -> Hoothoot
    166: 165, // Ledian -> Ledyba
    168: 167, // Ariados -> Spinarak
    169: 42, // Crobat -> Golbat
    171: 170, // Lanturn -> Chinchou
    178: 177, // Xatu -> Natu
    180: 179, 181: 180, // Flaaffy -> Mareep, Ampharos -> Flaaffy
    184: 183, // Azumarill -> Marill
    188: 187, 189: 188, // Skiploom -> Hoppip, Jumpluff -> Skiploom
    192: 191, // Sunflora -> Sunkern
    195: 194, 980: 194, // Quagsire -> Wooper, Clodsire -> Wooper
    205: 204, // Forretress -> Pineco
    210: 209, // Granbull -> Snubbull
    212: 123, 900: 123, // Scizor -> Scyther, Kleavor -> Scyther
    217: 216, 901: 217, // Ursaring -> Teddiursa, Ursaluna -> Ursaring
    219: 218, // Magcargo -> Slugma
    221: 220, 473: 221, // Piloswine -> Swinub, Mamoswine -> Piloswine
    224: 223, // Octillery -> Remoraid
    229: 228, // Houndoom -> Houndour
    232: 231, // Donphan -> Phanpy
    233: 137, 474: 233, // Porygon2 -> Porygon, Porygon-Z -> Porygon2
    242: 113, 242: 440, // Blissey -> Chansey / Happiny
    247: 246, 248: 247, // Pupitar -> Larvitar, Tyranitar -> Pupitar

    // Gen 3
    253: 252, 254: 253, // Grovyle -> Treecko, Sceptile -> Grovyle
    256: 255, 257: 256, // Combusken -> Torchic, Blaziken -> Combusken
    259: 258, 260: 259, // Marshtomp -> Mudkip, Swampert -> Marshtomp
    262: 261, // Mightyena -> Poochyena
    264: 263, // Linoone -> Zigzagoon
    266: 265, 267: 266, 268: 265, 269: 268, // Silcoon -> Wurmple, Beautifly -> Silcoon, Cascoon -> Wurmple, Dustox -> Cascoon
    271: 270, 272: 271, // Lombre -> Lotad, Ludicolo -> Lombre
    274: 273, 275: 274, // Nuzleaf -> Seedot, Shiftry -> Nuzleaf
    277: 276, // Swellow -> Taillow
    279: 278, // Pelipper -> Wingull
    281: 280, 282: 281, 475: 281, // Kirlia -> Ralts, Gardevoir -> Kirlia, Gallade -> Kirlia
    284: 283, // Masquerain -> Surskit
    286: 285, // Breloom -> Shroomish
    288: 287, 289: 288, // Vigoroth -> Slakoth, Slaking -> Vigoroth
    291: 290, 292: 290, // Ninjask -> Nincada, Shedinja -> Nincada
    294: 293, 295: 294, // Loudred -> Whismur, Exploud -> Loudred
    297: 296, // Hariyama -> Makuhita
    301: 300, // Delcatty -> Skitty
    305: 304, 306: 305, // Lairon -> Aron, Aggron -> Lairon
    308: 307, // Medicham -> Meditite
    310: 309, // Manectric -> Electrike
    315: 315, 407: 315, // Roserade -> Roselia
    317: 316, // Swalot -> Gulpin
    319: 318, // Sharpedo -> Carvanha
    321: 320, // Wailord -> Wailmer
    323: 322, // Camerupt -> Numel
    326: 325, // Grumpig -> Spoink
    329: 328, 330: 329, // Vibrava -> Trapinch, Flygon -> Vibrava
    332: 331, // Cacturne -> Cacnea
    334: 333, // Altaria -> Swablu
    340: 339, // Whiscash -> Barboach
    342: 341, // Crawdaunt -> Corphish
    344: 343, // Claydol -> Baltoy
    346: 345, // Cradily -> Lileep
    348: 347, // Armaldo -> Anorith
    350: 349, // Milotic -> Feebas
    354: 353, // Banette -> Shuppet
    356: 355, 477: 356, // Dusclops -> Duskull, Dusknoir -> Dusclops
    362: 361, 478: 361, // Glalie -> Snorunt, Froslass -> Snorunt
    364: 363, 365: 364, // Sealeo -> Spheal, Walrein -> Sealeo
    367: 366, 368: 366, // Huntail -> Clamperl, Gorebyss -> Clamperl
    372: 371, 373: 372, // Shelgon -> Bagon, Salamence -> Shelgon
    375: 374, 376: 375, // Metang -> Beldum, Metagross -> Metang

    // Gen 4
    388: 387, 389: 388, // Grotle -> Turtwig, Torterra -> Grotle
    391: 390, 392: 391, // Monferno -> Chimchar, Infernape -> Monferno
    394: 393, 395: 394, // Prinplup -> Piplup, Empoleon -> Prinplup
    397: 396, 398: 397, // Staravia -> Starly, Staraptor -> Staravia
    400: 399, // Bibarel -> Bidoof
    402: 401, // Kricketune -> Kricketot
    404: 403, 405: 404, // Luxio -> Shinx, Luxray -> Luxio
    409: 408, // Rampardos -> Cranidos
    411: 410, // Bastiodon -> Shieldon
    413: 412, 414: 412, // Wormadam -> Burmy, Mothim -> Burmy
    416: 415, // Vespiquen -> Combee
    419: 418, // Floatzel -> Buizel
    421: 420, // Cherrim -> Cherubi
    423: 422, // Gastrodon -> Shellos
    424: 190, // Ambipom -> Aipom
    426: 425, // Drifblim -> Drifloon
    428: 427, // Lopunny -> Buneary
    429: 200, // Mismagius -> Misdreavus
    430: 198, // Honchkrow -> Murkrow
    432: 431, // Purugly -> Glameow
    435: 434, // Skuntank -> Stunky
    437: 436, // Bronzong -> Bronzor
    444: 443, 445: 444, // Gabite -> Gible, Garchomp -> Gabite
    448: 447, // Lucario -> Riolu
    450: 449, // Hippowdon -> Hippopotas
    452: 451, // Drapion -> Skorupi
    454: 453, // Toxicroak -> Croagunk
    457: 456, // Lumineon -> Finneon
    460: 459, // Abomasnow -> Snover
    461: 215, 903: 215, // Weavile -> Sneasel, Sneasler -> Sneasel (Hisuian)
    463: 108, // Lickilicky -> Lickitung
    465: 114, // Tangrowth -> Tangela
    466: 125, // Electivire -> Electabuzz
    467: 126, // Magmortar -> Magmar
    468: 176, // Togekiss -> Togetic
    469: 193, // Yanmega -> Yanma
    472: 207, // Gliscor -> Gligar
    476: 299, // Probopass -> Nosepass

    // Gen 8/9 extra pre-evos from older ones:
    899: 234, // Wyrdeer -> Stantler
    979: 57,  // Annihilape -> Primeape
    981: 203, // Farigiraf -> Girafarig
    982: 206, // Dudunsparce -> Dunsparce
    983: 625, // Kingambit -> Bisharp
    1018: 884, // Archaludon -> Duraludon
    1019: 1011, // Hydrapple -> Dipplin
    1011: 840  // Dipplin -> Applin
};

function isPokemonAllowedInGame(pokedexId, gameId) {
    const game = GAMES_DB.find(g => g.id === gameId);
    if (!game) return true;
    
    // Auxiliary function to check compatibility directly
    const checkAllowedDirectly = (id) => {
        const pkmnGen = getPokemonGen(id);
        if (pkmnGen > game.gen) return false;
        
        if (gameId === "letsgopikachu" || gameId === "letsgoeevee") {
            return id <= 151 || id === 808 || id === 809;
        }
        
        if (gameId === "legendsarceus") {
            const allowedHisuiIds = [
                722,723,724, 155,156,157, 501,502,503,
                58,59, 74,75,76, 95, 111,112, 122, 113,114,115, 129,130, 133,134,135,136, 137, 92,93,94, 63,64,65, 66,67,68, 46,47, 77,78, 41,42, 25,26, 81,82, 100,101,
                196,197, 200, 201, 206, 211, 214, 215, 220,221, 223,224, 226, 234, 240, 242,
                265,266,267,268,269, 280,281,282, 315, 339,340, 355,356, 358, 361,362,
                387,388,389, 390,391,392, 393,394,395, 396,397,398, 399,400, 401,402, 403,404,405, 406,407, 412,413,414, 415,416, 417, 418,419, 420,421, 422,423, 424, 425,426, 427,428, 429, 431,432, 433, 434,435, 436,437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447,448, 449,450, 451,452, 453,454, 455, 456,457, 458, 459,460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 490, 491, 492, 493,
                540,541,542, 546,547, 548,549, 550, 627,628, 641,642, 645,
                704,705,706, 712,713,
                722,723,724,
                899, 900, 901, 902, 903, 904, 905
            ];
            return allowedHisuiIds.includes(id);
        }
        
        if (game.gen === 1) return id <= 151;
        if (game.gen === 2) return id <= 251;
        if (game.gen === 3) return id <= 386;
        
        return true;
    };

    if (checkAllowedDirectly(pokedexId)) return true;

    // Check pre-evolutions recursively
    let currentId = pokedexId;
    while (PRE_EVOLUTIONS_MAP[currentId]) {
        currentId = PRE_EVOLUTIONS_MAP[currentId];
        if (checkAllowedDirectly(currentId)) {
            return true;
        }
    }

    return false;
}

function validateActiveTeamRules(candidatePkmn) {
    const activeTeam = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.slotType === "team" && p.id !== candidatePkmn.id);
    
    if (candidatePkmn.item && candidatePkmn.item.trim() !== "") {
        const candidateItem = candidatePkmn.item.toLowerCase().trim();
        const duplicateItem = activeTeam.find(p => p.item && p.item.toLowerCase().trim() === candidateItem);
        if (duplicateItem) {
            return {
                valid: false,
                reason: `Item Clause: O item "${candidatePkmn.item}" já está a ser segurado por ${duplicateItem.nickname || duplicateItem.species} na equipa ativa!`
            };
        }
    }
    
    return { valid: true };
}

let isSavingOpponentPreset = false;

function chooseAndSavePreset(isOpponentPreset = false) {
    isSavingOpponentPreset = isOpponentPreset;
    
    // Bind dynamic click events
    document.getElementById("btn-choice-save-active").onclick = () => {
        closeSavePresetChoiceModal();
        if (isSavingOpponentPreset) {
            saveActiveTeamAsOpponentPreset();
        } else {
            saveActiveTeamAsPreset();
        }
    };
    
    document.getElementById("btn-choice-save-recommended").onclick = () => {
        closeSavePresetChoiceModal();
        if (isSavingOpponentPreset) {
            saveRecommendedTeamAsOpponentPreset();
        } else {
            saveRecommendedTeamAsPreset();
        }
    };
    
    document.getElementById("save-preset-choice-modal").classList.add("active");
}

function closeSavePresetChoiceModal() {
    document.getElementById("save-preset-choice-modal").classList.remove("active");
}

function saveActiveTeamAsPreset() {
    const activeTeam = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.slotType === "team");
    if (activeTeam.length === 0) {
        alert("A tua equipa ativa está vazia. Não é possível gravar um preset vazio.");
        return;
    }
    
    const presetName = prompt("Insira o nome para este Preset de Equipa:", `Minha Equipa - ${GAMES_DB.find(g => g.id === currentGameId)?.name}`);
    if (!presetName) return;
    
    const presetId = "preset_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    const newPreset = {
        id: presetId,
        gameId: currentGameId,
        name: presetName,
        pokemonIds: activeTeam.map(p => p.id)
    };
    
    teamPresetsList.push(newPreset);
    localStorage.setItem("bb_team_presets", JSON.stringify(teamPresetsList));
    
    renderPresets();
    alert(`Preset "${presetName}" gravado com sucesso!`);
}

function saveRecommendedTeamAsPreset() {
    if (currentAllocationRecommendation.length === 0) {
        alert("Não há nenhuma equipa recomendada calculada para gravar.");
        return;
    }
    
    const opponentId = currentAllocationOpponentId || currentGameId;
    const league = LEAGUE_OPPONENTS[opponentId] || LEAGUE_OPPONENTS[currentGameId] || LEAGUE_OPPONENTS["red"];
    
    const presetName = prompt("Insira o nome para este Preset de Equipa:", `Equipa Contra: ${league.name.replace(/🏆 |⚡ |⛰️ |💎 |🎼 /, "")}`);
    if (!presetName) return;
    
    const presetId = "preset_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    const newPreset = {
        id: presetId,
        gameId: currentGameId,
        name: presetName,
        pokemonIds: currentAllocationRecommendation.map(p => p.id)
    };
    
    teamPresetsList.push(newPreset);
    localStorage.setItem("bb_team_presets", JSON.stringify(teamPresetsList));
    
    renderPresets();
    alert(`Preset "${presetName}" gravado com sucesso!`);
}

function saveRecommendedTeamAsOpponentPreset() {
    if (currentAllocationRecommendation.length === 0) {
        alert("Não há nenhuma equipa recomendada calculada para gravar.");
        return;
    }
    
    const opponentId = currentAllocationOpponentId || currentGameId;
    const league = LEAGUE_OPPONENTS[opponentId] || LEAGUE_OPPONENTS[currentGameId] || LEAGUE_OPPONENTS["red"];
    
    const presetName = prompt("Insira o nome para este Preset de Equipa:", `Equipa Contra: ${league.name.replace(/🏆 |⚡ |⛰️ |💎 |🎼 /, "")}`);
    if (!presetName) return;
    
    const presetId = "preset_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    const newPreset = {
        id: presetId,
        gameId: currentGameId,
        opponentId: opponentId,
        name: presetName,
        pokemonIds: currentAllocationRecommendation.map(p => p.id)
    };
    
    teamPresetsList.push(newPreset);
    localStorage.setItem("bb_team_presets", JSON.stringify(teamPresetsList));
    
    renderPresets();
    updateOpponentPresetsList();
    
    alert(`Preset "${presetName}" gravado com sucesso!`);
}

const BUILDS_LIBRARY = {
    offensive: {
        name: "Ofensiva (Sweeper)",
        evs: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 },
        evsSpecial: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 }
    },
    defensive: {
        name: "Defensiva (Wall)",
        evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
        evsSpecial: { hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 }
    },
    support: {
        name: "Suporte / Utilitária",
        evs: { hp: 252, atk: 0, def: 128, spa: 0, spd: 128, spe: 0 }
    },
    coverage: {
        name: "Bulky Attacker / Coverage",
        evs: { hp: 252, atk: 252, def: 0, spa: 0, spd: 4, spe: 0 },
        evsSpecial: { hp: 252, atk: 0, def: 0, spa: 252, spd: 4, spe: 0 }
    }
};

function applyBuildPreset(type) {
    const build = BUILDS_LIBRARY[type];
    if (!build) return;
    
    const isSpecial = confirm("Esta build deve focar-se em Ataque Especial (OK) ou Ataque Físico (Cancelar)?");
    const evs = isSpecial && build.evsSpecial ? build.evsSpecial : build.evs;
    
    document.getElementById("ev-hp").value = evs.hp;
    document.getElementById("ev-atk").value = evs.atk;
    document.getElementById("ev-def").value = evs.def;
    document.getElementById("ev-spa").value = evs.spa;
    document.getElementById("ev-spd").value = evs.spd;
    document.getElementById("ev-spe").value = evs.spe;
    
    validateEVs();
    alert(`Build "${build.name}" aplicada! EVs atualizados.`);
}

let finishChallengeImageBase64 = null;

function finishChallengeFlow(challengeId) {
    const ch = challengesList.find(c => c.id === challengeId);
    if (!ch) return;
    
    document.getElementById("finish-challenge-id").value = challengeId;
    document.getElementById("finish-challenge-notes").value = ch.notes || "";
    document.getElementById("finish-challenge-file").value = "";
    document.getElementById("finish-challenge-file-name").innerText = "Nenhuma imagem selecionada";
    finishChallengeImageBase64 = null;
    
    const gameId = ch.gameId || currentGameId;
    const activeTeam = pokemonDatabase.filter(p => p.currentGame === gameId && p.slotType === "team");
    
    const teamListEl = document.getElementById("finish-challenge-team-list");
    if (teamListEl) {
        if (activeTeam.length === 0) {
            teamListEl.innerHTML = `<span style="font-size: 0.7rem; color: #ef4444;">Nenhum Pokémon na equipa ativa para este jogo!</span>`;
        } else {
            teamListEl.innerHTML = activeTeam.map(p => {
                let spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.isShiny ? 'shiny/' : ''}${p.pokedexId}.png`;
                return `
                    <div style="text-align: center; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 4px; display: flex; flex-direction: column; align-items: center; min-width: 60px;">
                        <img src="${spriteUrl}" alt="${p.species}" style="width: 32px; height: 32px;" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">
                        <span style="font-size: 0.6rem; color: #fff; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 55px;">${p.nickname || p.species}</span>
                    </div>
                `;
            }).join("");
        }
    }
    
    document.getElementById("finish-challenge-modal").classList.add("active");
}

function closeFinishChallengeModal() {
    document.getElementById("finish-challenge-modal").classList.remove("active");
}

function handleFinishChallengeFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    document.getElementById("finish-challenge-file-name").innerText = file.name;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            const MAX_WIDTH = 1000;
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            finishChallengeImageBase64 = canvas.toDataURL("image/jpeg", 0.75);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function executeFinishChallenge() {
    const id = document.getElementById("finish-challenge-id").value;
    const notes = document.getElementById("finish-challenge-notes").value;
    
    const ch = challengesList.find(c => c.id === id);
    if (!ch) return;
    
    const gameId = ch.gameId || currentGameId;
    const activeTeam = pokemonDatabase.filter(p => p.currentGame === gameId && p.slotType === "team");
    
    if (activeTeam.length === 0) {
        alert("A equipa ativa está vazia! Tens de alocar Pokémon à tua equipa ativa antes de finalizar o desafio.");
        return;
    }
    
    ch.status = "completed";
    ch.notes = notes;
    
    activeTeam.forEach(p => {
        p.isLocked = true;
    });
    
    if (finishChallengeImageBase64) {
        saveHofImage(gameId, finishChallengeImageBase64)
            .then(() => {
                closeFinishChallengeModal();
                renderAll();
                renderChallengesList();
                alert(`Desafio "${ch.title}" finalizado com sucesso! A tua equipa ativa foi trancada como vencedora 🏆.`);
            })
            .catch(err => {
                console.error("Erro ao gravar HOF no IndexedDB:", err);
                closeFinishChallengeModal();
                renderAll();
                renderChallengesList();
            });
    } else {
        generateAutomaticHofRecord(gameId, activeTeam).then(() => {
            closeFinishChallengeModal();
            renderAll();
            renderChallengesList();
            alert(`Desafio "${ch.title}" finalizado com sucesso! A tua equipa ativa foi trancada como vencedora 🏆.`);
        });
    }
}

function generateAutomaticHofRecord(gameId, activeTeam) {
    const record = {
        id: "hof_gen_" + Date.now(),
        type: "generated",
        date: new Date().toLocaleDateString('pt-PT'),
        team: activeTeam.map(p => ({
            pokedexId: p.pokedexId,
            species: p.species,
            nickname: p.nickname || p.species,
            level: p.level,
            gender: p.gender || "⚲",
            isShiny: p.isShiny || false
        }))
    };
    return saveHofRecord(gameId, record, activeTrainerId);
}

function closeDiffModal() {
    document.getElementById("diff-modal").classList.remove("active");
}

function compileSaveDiffReport(savablePokemon, saveBuffer) {
    const diffs = [];
    const saveU8 = new Uint8Array(saveBuffer);
    
    savablePokemon.forEach(pkmn => {
        const meta = pkmn.saveMeta;
        let origItem = "";
        let origMoves = [];
        
        if (meta.gen === 1) {
            const structOffset = meta.structOffset;
            for (let m = 0; m < 4; m++) {
                const moveId = saveU8[structOffset + 8 + m];
                if (moveId > 0) {
                    const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || REVERSE_MOVES_MAP[moveId] || "";
                    origMoves.push(formatMoveNameForDisplay(rawName));
                }
            }
        } else if (meta.gen === 2) {
            const structOffset = meta.structOffset;
            const itemId = saveU8[structOffset + 1];
            origItem = formatItemNameForDisplay(REVERSE_ITEMS_MAP_GEN2[itemId] || "");
            for (let m = 0; m < 4; m++) {
                const moveId = saveU8[structOffset + 2 + m];
                if (moveId > 0) {
                    const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || REVERSE_MOVES_MAP[moveId] || "";
                    origMoves.push(formatMoveNameForDisplay(rawName));
                }
            }
        } else if (meta.gen === 3) {
            let sectorIndex = -1;
            for (let s = 0; s < 14; s++) {
                const sIdx = uploadedSaveActiveSectorStart + s;
                const offset = sIdx * 4096;
                const sig = saveU8[offset + 0x0FF8] | (saveU8[offset + 0x0FF9] << 8) | (saveU8[offset + 0x0FFA] << 16) | (saveU8[offset + 0x0FFB] << 24);
                if (sig === 0x08012025 && saveU8[offset + 0x0FF4] === 1) {
                    sectorIndex = sIdx;
                    break;
                }
            }
            if (sectorIndex !== -1) {
                const sectorOffset = sectorIndex * 4096;
                const structOffset = sectorOffset + meta.structOffset;
                const pid = meta.pid;
                const otid = meta.otid;
                const key = pid ^ otid;
                const shuffleIndex = meta.shuffleIndex;
                const order = blockOrders[shuffleIndex];
                
                const decryptedWords = new Uint32Array(12);
                for (let j = 0; j < 12; j++) {
                    const wordOffset = structOffset + 0x20 + j * 4;
                    const encryptedWord = saveU8[wordOffset] | (saveU8[wordOffset + 1] << 8) | (saveU8[wordOffset + 2] << 16) | (saveU8[wordOffset + 3] << 24);
                    decryptedWords[j] = encryptedWord ^ key;
                }
                const decryptedBytes = new Uint8Array(decryptedWords.buffer);
                
                let blockGIdx = -1;
                let blockAIdx = -1;
                for (let b = 0; b < 4; b++) {
                    if (order[b] === 0) blockGIdx = b;
                    if (order[b] === 1) blockAIdx = b;
                }
                if (blockGIdx !== -1) {
                    const gOffset = blockGIdx * 12;
                    const itemId = decryptedBytes[gOffset + 2] | (decryptedBytes[gOffset + 3] << 8);
                    origItem = formatItemNameForDisplay(REVERSE_ITEMS_MAP_GEN3[itemId] || "");
                }
                if (blockAIdx !== -1) {
                    const aOffset = blockAIdx * 12;
                    const u16BlockA = new Uint16Array(decryptedBytes.buffer, decryptedBytes.byteOffset + aOffset, 6);
                    for (let m = 0; m < 4; m++) {
                        const moveId = u16BlockA[m];
                        if (moveId > 0) {
                            const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || REVERSE_MOVES_MAP[moveId] || "";
                            origMoves.push(formatMoveNameForDisplay(rawName));
                        }
                    }
                }
            }
        }
        
        const itemChanged = (origItem || "").toLowerCase().trim() !== (pkmn.item || "").toLowerCase().trim();
        const movesChanged = JSON.stringify(origMoves.map(m => m.toLowerCase().trim())) !== JSON.stringify((pkmn.moves || []).map(m => m.toLowerCase().trim()));
        
        if (itemChanged || movesChanged) {
            diffs.push({
                nickname: pkmn.nickname || pkmn.species,
                species: pkmn.species,
                origItem: origItem || "Nenhum",
                newItem: pkmn.item || "Nenhum",
                itemChanged,
                origMoves: origMoves.length > 0 ? origMoves.join(", ") : "Nenhum",
                newMoves: (pkmn.moves || []).length > 0 ? (pkmn.moves || []).join(", ") : "Nenhum",
                movesChanged
            });
        }
    });
    return diffs;
}
    


