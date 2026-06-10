const GAMES_DB = [
    { id: "red", name: "Pokémon Red", gen: 1 }, { id: "blue", name: "Pokémon Blue", gen: 1 }, { id: "yellow", name: "Pokémon Yellow", gen: 1 },
    { id: "gold", name: "Pokémon Gold", gen: 2 }, { id: "silver", name: "Pokémon Silver", gen: 2 }, { id: "crystal", name: "Pokémon Crystal", gen: 2 },
    { id: "ruby", name: "Pokémon Ruby", gen: 3 }, { id: "sapphire", name: "Pokémon Sapphire", gen: 3 }, { id: "emerald", name: "Pokémon Emerald", gen: 3 },
    { id: "firered", name: "Pokémon FireRed", gen: 3 }, { id: "leafgreen", name: "Pokémon LeafGreen", gen: 3 },
    { id: "diamond", name: "Pokémon Diamond", gen: 4 }, { id: "pearl", name: "Pokémon Pearl", gen: 4 }, { id: "platinum", name: "Pokémon Platinum", gen: 4 },
    { id: "heartgold", name: "Pokémon HeartGold", gen: 4 }, { id: "soulsilver", name: "Pokémon SoulSilver", gen: 4 },
    { id: "black", name: "Pokémon Black", gen: 5 }, { id: "white", name: "Pokémon White", gen: 5 }, { id: "black2", name: "Pokémon Black 2", gen: 5 }, { id: "white2", name: "Pokémon White 2", gen: 5 },
    { id: "x", name: "Pokémon X", gen: 6 }, { id: "y", name: "Pokémon Y", gen: 6 }, { id: "omegaruby", name: "Pokémon Omega Ruby", gen: 6 }, { id: "alphasapphire", name: "Pokémon Alpha Sapphire", gen: 6 },
    { id: "sun", name: "Pokémon Sun", gen: 7 }, { id: "moon", name: "Pokémon Moon", gen: 7 }, { id: "ultrasun", name: "Pokémon Ultra Sun", gen: 7 }, { id: "ultramoon", name: "Pokémon Ultra Moon", gen: 7 },
    { id: "sword", name: "Pokémon Sword", gen: 8 }, { id: "shield", name: "Pokémon Shield", gen: 8 }, { id: "brilliantdiamond", name: "Pokémon Brilliant Diamond", gen: 8 }, { id: "shiningpearl", name: "Pokémon Shining Pearl", gen: 8 }, { id: "legendsarceus", name: "Pokémon Legends: Arceus", gen: 8 },
    { id: "scarlet", name: "Pokémon Scarlet", gen: 9 }, { id: "violet", name: "Pokémon Violet", gen: 9 }
];

// Core Ribbons DB grouped by generation
const ALL_RIBBONS = [
    { id: "champion_hoenn", name: "Hoenn Champion Ribbon", gen: 3 },
    { id: "artist", name: "Artist Ribbon", gen: 3 },
    { id: "effort", name: "Effort Ribbon", gen: 3 },
    { id: "champion_sinnoh", name: "Sinnoh Champion Ribbon", gen: 4 },
    { id: "legend", name: "Legend Ribbon (Red Defeat)", gen: 4 },
    { id: "footprint", name: "Footprint Ribbon", gen: 4 },
    { id: "gorgeous_royal", name: "Gorgeous Royal Ribbon", gen: 4 },
    { id: "champion_kalos", name: "Kalos Champion Ribbon", gen: 6 },
    { id: "contest_star", name: "Contest Star Ribbon", gen: 6 },
    { id: "champion_alola", name: "Alola Champion Ribbon", gen: 7 },
    { id: "battle_royal", name: "Battle Royal Master Ribbon", gen: 7 },
    { id: "champion_galar", name: "Galar Champion Ribbon", gen: 8 },
    { id: "tower_master", name: "Tower Master Ribbon", gen: 8 },
    { id: "master_rank", name: "Master Rank Ribbon", gen: 8 },
    { id: "pioneer_hisui", name: "Pioneer Ribbon (Hisui)", gen: 8 },
    { id: "champion_paldea", name: "Paldea Champion Ribbon", gen: 9 },
    { id: "partner", name: "Partner Ribbon", gen: 9 },
    { id: "itemfinder", name: "Itemfinder Ribbon", gen: 9 }
];

let currentGameId = localStorage.getItem("bb_current_game") || "red";
let pokemonDatabase = JSON.parse(localStorage.getItem("bb_database")) || [];
let currentSpriteStyle = localStorage.getItem("bb_sprite_style") || "classic";
let activeHofIndex = 0;
let selectionMode = false;
let selectedPokemonIds = new Set();
let autoRibbonsEnabled = localStorage.getItem("bb_auto_ribbons") !== "false";
let teamPresetsList = JSON.parse(localStorage.getItem("bb_team_presets")) || [];

const PORTUGUESE_TO_ENGLISH_MOVES = {
    "combate próximo": "close combat",
    "terramoto": "earthquake",
    "deslize de rocha": "rock slide",
    "submissão": "submission",
    "soco dinâmico": "dynamic punch",
    "quebra tijolo": "brick break",
    "soco gelo": "ice punch",
    "poder oculto": "hidden power",
    "sinal luminoso": "signal beam",
    "golpe de corpo": "body slam",
    "bola sombra": "shadow ball",
    "pulso sombrio": "dark pulse",
    "relâmpago": "thunderbolt",
    "mordida": "bite",
    "lança-chamas": "flamethrower",
    "raio gelo": "ice beam",
    "nevasca": "blizzard"
};

const PORTUGUESE_TO_ENGLISH_ITEMS = {
    "restos": "leftovers",
    "ovo da sorte": "lucky egg",
    "garra rápida": "quick claw",
    "exp. share": "exp share",
    "partilha exp": "exp share",
    "banda de foco": "focus band",
    "óculos pretos": "blackglasses",
    "óculos escuros": "blackglasses",
    "carvão": "charcoal",
    "semente milagrosa": "miracle seed",
    "água mística": "mystic water"
};

const ENGLISH_TO_PORTUGUESE_MOVES = {};
Object.keys(PORTUGUESE_TO_ENGLISH_MOVES).forEach(pt => {
    ENGLISH_TO_PORTUGUESE_MOVES[PORTUGUESE_TO_ENGLISH_MOVES[pt]] = pt;
});

const ENGLISH_TO_PORTUGUESE_ITEMS = {};
Object.keys(PORTUGUESE_TO_ENGLISH_ITEMS).forEach(pt => {
    ENGLISH_TO_PORTUGUESE_ITEMS[PORTUGUESE_TO_ENGLISH_ITEMS[pt]] = pt;
});


// Relocated global state variables to avoid ReferenceErrors
let currentAllocationRecommendation = [];
let currentAllocationOpponentId = null;
let uploadedSaveBuffer = null;
let uploadedSaveName = "";
let uploadedSaveGen = 0;
let uploadedSaveIsCrystal = false;
let uploadedSaveActiveSectorStart = 0;
let currentVisualTheme = localStorage.getItem("bb_visual_theme") || "default";
let activePokemonEditorMoves = { moves: ["", "", "", ""], alternativeMoves: ["", "", "", ""] };
let editorViewingAlternativeMoves = false;

let trainersList = JSON.parse(localStorage.getItem("bb_trainers")) || [];
let activeTrainerId = localStorage.getItem(`bb_active_trainer_${currentGameId}`) || `trainer_${currentGameId}_default`;
let activeTab = "boxes";
let challengesList = JSON.parse(localStorage.getItem("bb_challenges")) || [];
let globalBoxMode = localStorage.getItem("bb_global_box_mode") === "true";

function migrateTrainerIds() {
    let trainersChanged = false;
    GAMES_DB.forEach(g => {
        const hasTrainer = trainersList.some(t => t.gameId === g.id);
        if (!hasTrainer) {
            trainersList.push({
                id: `trainer_${g.id}_default`,
                gameId: g.id,
                name: "Treinador Padrão",
                tid: "00000",
                sid: "00000"
            });
            trainersChanged = true;
        }
    });
    if (trainersChanged) {
        localStorage.setItem("bb_trainers", JSON.stringify(trainersList));
    }
    
    let dbChanged = false;
    pokemonDatabase.forEach(p => {
        if (!p.trainerId) {
            p.trainerId = `trainer_${p.currentGame}_default`;
            dbChanged = true;
        }
    });
    if (dbChanged) {
        localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
    }

    const trainerExists = trainersList.some(t => t.id === activeTrainerId && t.gameId === currentGameId);
    if (!trainerExists) {
        const defaultTrainer = trainersList.find(t => t.gameId === currentGameId);
        if (defaultTrainer) {
            activeTrainerId = defaultTrainer.id;
            localStorage.setItem(`bb_active_trainer_${currentGameId}`, activeTrainerId);
        }
    }
}
migrateTrainerIds();

const SUGGESTIONS = {
    natures: ["Adamant", "Bashful", "Bold", "Brave", "Calm", "Careful", "Docile", "Hardy", "Hasty", "Impish", "Jolly", "Lax", "Lonely", "Mild", "Modest", "Naive", "Naughty", "Quiet", "Quirky", "Rash", "Relaxed", "Sassy", "Serious", "Timid"],
    abilities: ["Adaptability", "Blaze", "Bulletproof", "Chlorophyll", "Clear Body", "Contrary", "Drizzle", "Drought", "Flame Body", "Flash Fire", "Guts", "Huge Power", "Illusion", "Infiltrator", "Inner Focus", "Insomnia", "Intimidate", "Levitate", "Magic Guard", "Moxie", "Natural Cure", "Overgrow", "Prankster", "Pressure", "Regenerator", "Rock Head", "Rough Skin", "Sand Stream", "Serene Grace", "Shadow Tag", "Shed Skin", "Sheer Force", "Sturdy", "Swift Swim", "Synchronize", "Technician", "Thick Fat", "Torrent", "Trace", "Unaware", "Water Absorb", "Wonder Guard"]
};
const SPECIES_TYPE_CACHE = JSON.parse(localStorage.getItem("bb_species_type_cache")) || {};

