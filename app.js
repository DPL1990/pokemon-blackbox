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
const SPECIES_TYPE_CACHE = {};

// --- SECTION IndexedDB Storage ---
let dbInstance = null;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("bb_assets_db", 1);
        
        request.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("hall_of_fame")) {
                db.createObjectStore("hall_of_fame");
            }
        };
        
        request.onsuccess = function(e) {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };
        
        request.onerror = function(e) {
            console.error("Erro ao inicializar IndexedDB:", e.target.error);
            reject(e.target.error);
        };
    });
}

function getHofRecords(gameId, trainerId = activeTrainerId) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) {
            resolve([]);
            return;
        }
        const tx = dbInstance.transaction("hall_of_fame", "readonly");
        const store = tx.objectStore("hall_of_fame");
        const key = gameId + "_" + trainerId;
        const request = store.get(key);
        
        request.onsuccess = (e) => {
            const data = e.target.result;
            if (data) {
                if (typeof data === "string") {
                    // Migração de dados legados (caso estranho)
                    const legacyRecord = {
                        id: "hof_legacy_" + Date.now(),
                        type: "upload",
                        data: data,
                        title: "Mural de Honra (Legado)",
                        date: new Date().toLocaleDateString('pt-PT')
                    };
                    const migratedList = [legacyRecord];
                    const writeTx = dbInstance.transaction("hall_of_fame", "readwrite");
                    writeTx.objectStore("hall_of_fame").put(migratedList, key);
                    resolve(migratedList);
                } else if (Array.isArray(data)) {
                    resolve(data);
                } else {
                    resolve([]);
                }
            } else {
                // Se não há dados sob a chave combinada, verifica se existem dados legados sem ID de treinador
                // apenas para o Treinador Padrão do respetivo jogo
                if (trainerId === "trainer_" + gameId + "_default") {
                    const legacyReq = store.get(gameId);
                    legacyReq.onsuccess = (le) => {
                        const legacyData = le.target.result;
                        if (legacyData) {
                            const migratedList = Array.isArray(legacyData) ? legacyData : [];
                            const writeTx = dbInstance.transaction("hall_of_fame", "readwrite");
                            writeTx.objectStore("hall_of_fame").put(migratedList, key);
                            writeTx.objectStore("hall_of_fame").delete(gameId); // Limpa chave antiga
                            resolve(migratedList);
                        } else {
                            resolve([]);
                        }
                    };
                    legacyReq.onerror = () => resolve([]);
                } else {
                    resolve([]);
                }
            }
        };
        request.onerror = (e) => reject(e.target.error);
    });
}

function saveHofRecord(gameId, record, trainerId = activeTrainerId) {
    return getHofRecords(gameId, trainerId).then(records => {
        records.push(record);
        return new Promise((resolve, reject) => {
            if (!dbInstance) {
                reject("Banco de dados não inicializado");
                return;
            }
            const tx = dbInstance.transaction("hall_of_fame", "readwrite");
            const store = tx.objectStore("hall_of_fame");
            const key = gameId + "_" + trainerId;
            const request = store.put(records, key);
            
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    });
}

function saveHofImage(gameId, base64Data, trainerId = activeTrainerId) {
    const record = {
        id: "hof_upload_" + Date.now(),
        type: "upload",
        data: base64Data,
        title: "Mural Carregado",
        date: new Date().toLocaleDateString('pt-PT')
    };
    return saveHofRecord(gameId, record, trainerId);
}

function deleteHofRecord(gameId, index, trainerId = activeTrainerId) {
    return getHofRecords(gameId, trainerId).then(records => {
        if (index >= 0 && index < records.length) {
            records.splice(index, 1);
            return new Promise((resolve, reject) => {
                if (!dbInstance) {
                    reject("Banco de dados não inicializado");
                    return;
                }
                const tx = dbInstance.transaction("hall_of_fame", "readwrite");
                const store = tx.objectStore("hall_of_fame");
                const key = gameId + "_" + trainerId;
                const request = store.put(records, key);
                
                request.onsuccess = () => resolve();
                request.onerror = (e) => reject(e.target.error);
            });
        }
    });
}

function generateHofFromActiveTeam() {
    const activeTeam = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.trainerId === activeTrainerId && p.slotType === "team");
    if (activeTeam.length === 0) {
        alert("A tua equipa ativa para este cartucho está vazia! Adiciona Pokémon à equipa primeiro.");
        return;
    }
    activeTeam.sort((a, b) => a.slotIndex - b.slotIndex);
    
    // Alerta de carregamento
    const btn = window.event ? (window.event.target || window.event.srcElement) : null;
    const originalText = btn ? btn.innerText : "";
    if (btn && btn.tagName === "BUTTON") {
        btn.disabled = true;
        btn.innerText = "A Gerar...";
    }
    
    const loadPromises = activeTeam.map(p => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            const pokedexId = p.pokedexId || 1;
            const isShiny = p.isShiny || false;
            
            // Usar o sprite Home por defeito para alta qualidade no canvas estático
            let spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${isShiny ? 'shiny/' : ''}${pokedexId}.png`;
            
            img.onload = () => resolve({ p, img, success: true });
            img.onerror = () => {
                // Se falhar o do home, tenta o clássico 2D
                const fallbackImg = new Image();
                fallbackImg.crossOrigin = "anonymous";
                fallbackImg.onload = () => resolve({ p, img: fallbackImg, success: true });
                fallbackImg.onerror = () => resolve({ p, img: null, success: false });
                fallbackImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? 'shiny/' : ''}${pokedexId}.png`;
            };
            img.crossOrigin = "anonymous";
            img.src = spriteUrl;
        });
    });

    Promise.all(loadPromises).then(loadedMembers => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");
        
        // Cores temáticas para gradiente de fundo
        const gameThemeColors = {
            red: ["#3b0712", "#090b0e"], blue: ["#071e3b", "#090b0e"], yellow: ["#3b3007", "#090b0e"],
            gold: ["#3b2007", "#090b0e"], silver: ["#27272a", "#090b0e"], crystal: ["#07353b", "#090b0e"],
            ruby: ["#3b0707", "#090b0e"], sapphire: ["#07113b", "#090b0e"], emerald: ["#042f1a", "#090b0e"],
            firered: ["#3b1707", "#090b0e"], leafgreen: ["#073b14", "#090b0e"], diamond: ["#0a1f3b", "#090b0e"],
            pearl: ["#3b0a24", "#090b0e"], platinum: ["#1e293b", "#090b0e"], heartgold: ["#3b1707", "#090b0e"],
            soulsilver: ["#071e3b", "#090b0e"], black: ["#111827", "#090b0e"], white: ["#374151", "#090b0e"],
            black2: ["#091330", "#090b0e"], white2: ["#302005", "#090b0e"], x: ["#071e3b", "#090b0e"],
            y: ["#3b0712", "#090b0e"], omegaruby: ["#3b1707", "#090b0e"], alphasapphire: ["#05213a", "#090b0e"],
            sun: ["#302005", "#090b0e"], moon: ["#071e3b", "#090b0e"], ultrasun: ["#3b1707", "#090b0e"],
            ultramoon: ["#07353b", "#090b0e"], sword: ["#07353b", "#090b0e"], shield: ["#3d0510", "#090b0e"],
            brilliantdiamond: ["#0a1f3b", "#090b0e"], shiningpearl: ["#3b0a24", "#090b0e"], legendsarceus: ["#1e293b", "#090b0e"],
            scarlet: ["#3b0712", "#090b0e"], violet: ["#230f3f", "#090b0e"]
        };
        const colors = gameThemeColors[currentGameId] || ["#111827", "#090b0e"];
        
        const grad = ctx.createRadialGradient(400, 240, 50, 400, 240, 400);
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(1, colors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 800, 480);
        
        // Cor de realce (borda)
        const borderColors = {
            red: "#ef4444", blue: "#3b82f6", yellow: "#eab308", gold: "#d97706", silver: "#9ca3af", crystal: "#06b6d4",
            ruby: "#b91c1c", sapphire: "#1d4ed8", emerald: "#10b981", firered: "#f97316", leafgreen: "#22c55e",
            diamond: "#60a5fa", pearl: "#f472b6", platinum: "#94a3b8", heartgold: "#ea580c", soulsilver: "#3b82f6",
            black: "#4b5563", white: "#f9fafb", black2: "#2563eb", white2: "#f59e0b", x: "#3b82f6", y: "#ef4444",
            omegaruby: "#ea580c", alphasapphire: "#0284c7", sun: "#f59e0b", moon: "#3b82f6", ultrasun: "#ea580c",
            ultramoon: "#06b6d4", sword: "#06b6d4", shield: "#e11d48", brilliantdiamond: "#60a5fa", shiningpearl: "#f472b6",
            legendsarceus: "#475569", scarlet: "#dc2626", violet: "#7c3aed"
        };
        const accentColor = borderColors[currentGameId] || "#6366f1";
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, 800, 480);
        
        // Título principal
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px 'Outfit', system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🏆 HALL OF FAME 🏆", 400, 60);
        
        // Nome do jogo campeão
        ctx.fillStyle = accentColor;
        ctx.font = "900 15px 'Outfit', system-ui, -apple-system, sans-serif";
        const gameName = GAMES_DB.find(g => g.id === currentGameId)?.name || "Pokémon";
        ctx.fillText(gameName.toUpperCase(), 400, 92);
        
        // Grelha de Pokémon (3 colunas, 2 linhas)
        const colWidth = 230;
        const rowHeight = 150;
        const startX = 400 - (1.5 * colWidth);
        const startY = 120;
        
        loadedMembers.forEach((member, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const x = startX + col * colWidth;
            const y = startY + row * rowHeight;
            
            // Fundo de cada caixa
            ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            
            ctx.fillRect(x + 10, y + 10, colWidth - 20, rowHeight - 20);
            ctx.strokeRect(x + 10, y + 10, colWidth - 20, rowHeight - 20);
            
            const pInfo = member.p;
            
            // Desenhar Sprite
            if (member.img) {
                ctx.drawImage(member.img, x + (colWidth/2) - 45, y + 18, 90, 90);
            }
            
            // Nome
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 13px 'Outfit', system-ui, -apple-system, sans-serif";
            ctx.textAlign = "center";
            const name = pInfo.nickname ? pInfo.nickname : pInfo.species;
            ctx.fillText(name, x + (colWidth/2), y + 115);
            
            // Nível e Espécie
            ctx.fillStyle = "#9ca3af";
            ctx.font = "600 10px 'Outfit', system-ui, -apple-system, sans-serif";
            const subtitle = pInfo.nickname ? `${pInfo.species} (Lv. ${pInfo.level})` : `Lv. ${pInfo.level}`;
            ctx.fillText(subtitle, x + (colWidth/2), y + 130);
        });
        
        // Rodapé
        ctx.fillStyle = "#9ca3af";
        ctx.font = "bold 11px 'Outfit', system-ui, -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(new Date().toLocaleDateString('pt-PT'), 770, 452);
        
        ctx.textAlign = "left";
        ctx.fillText("MURAL DE HONRA", 30, 452);
        
        // Converter para imagem base64
        const base64Data = canvas.toDataURL("image/jpeg", 0.85);
        
        const record = {
            id: "hof_gen_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
            type: "upload", // Salvo diretamente como upload para renderizar como imagem estática
            data: base64Data,
            title: `Campeão: ${gameName}`,
            date: new Date().toLocaleDateString('pt-PT')
        };
        
        saveHofRecord(currentGameId, record).then(() => {
            getHofRecords(currentGameId).then(records => {
                activeHofIndex = records.length - 1;
                renderAll();
                if (btn && btn.tagName === "BUTTON") {
                    btn.disabled = false;
                    btn.innerText = originalText;
                }
            });
        }).catch(err => {
            console.error("Erro ao guardar Mural no IndexedDB:", err);
            alert("Erro ao gravar o Mural de Honra.");
            if (btn && btn.tagName === "BUTTON") {
                btn.disabled = false;
                btn.innerText = originalText;
            }
        });
    }).catch(err => {
        console.error("Erro ao carregar sprites:", err);
        alert("Erro ao carregar as imagens dos Pokémon.");
        if (btn && btn.tagName === "BUTTON") {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    });
}

function deleteActiveHof() {
    if (!confirm("Tens a certeza absoluta que queres eliminar este Mural de Honra?")) return;
    deleteHofRecord(currentGameId, activeHofIndex).then(() => {
        activeHofIndex = 0;
        renderAll();
    }).catch(err => console.error(err));
}

function navigateHof(dir) {
    getHofRecords(currentGameId).then(records => {
        if (records.length <= 1) return;
        activeHofIndex = (activeHofIndex + dir + records.length) % records.length;
        renderAll();
    });
}
// ---------------------------------

function setupDatalists() {
    document.getElementById("natures-list").innerHTML = SUGGESTIONS.natures.map(n => `<option value="${n}"></option>`).join("");
    document.getElementById("ability-list").innerHTML = SUGGESTIONS.abilities.map(a => `<option value="${a}"></option>`).join("");
    
    const gameOptions = GAMES_DB.map(g => `<option value="${g.id}">${g.name} (Gen ${g.gen})</option>`).join("");
    document.getElementById("form-origin-game").innerHTML = gameOptions;
    document.getElementById("form-transfer-game").innerHTML = gameOptions;
    document.getElementById("game-select").innerHTML = gameOptions;

    const chGameSelect = document.getElementById("challenge-game");
    if (chGameSelect) {
        chGameSelect.innerHTML = gameOptions;
    }
}

function switchGame(gameId) {
    currentGameId = gameId; 
    currentAllocationOpponentId = null; // Reset oponente ao mudar de cartucho
    localStorage.setItem("bb_current_game", gameId);
    document.getElementById("game-select").value = gameId;
    document.body.className = ""; 
    document.body.classList.add(`v-${gameId}`);
    
    // Set dynamic mobile theme color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        const colors = {
            red: "#ef4444", blue: "#3b82f6", yellow: "#eab308", gold: "#d97706", silver: "#9ca3af", crystal: "#06b6d4",
            ruby: "#b91c1c", sapphire: "#1d4ed8", emerald: "#10b981", firered: "#f97316", leafgreen: "#22c55e",
            diamond: "#60a5fa", pearl: "#f472b6", platinum: "#94a3b8", heartgold: "#ea580c", soulsilver: "#3b82f6",
            black: "#4b5563", white: "#f9fafb", black2: "#2563eb", white2: "#f59e0b", x: "#3b82f6", y: "#ef4444",
            omegaruby: "#ea580c", alphasapphire: "#0284c7", sun: "#f59e0b", moon: "#3b82f6", ultrasun: "#ea580c",
            ultramoon: "#06b6d4", sword: "#06b6d4", shield: "#e11d48", brilliantdiamond: "#60a5fa", shiningpearl: "#f472b6",
            legendsarceus: "#475569", scarlet: "#dc2626", violet: "#7c3aed"
        };
        metaTheme.setAttribute("content", colors[gameId] || "#ff4a4a");
    }
    
    // Alterna o Treinador Ativo para o respetivo cartucho
    activeTrainerId = localStorage.getItem("bb_active_trainer_" + gameId) || "trainer_" + gameId + "_default";
    const trainerExists = trainersList.some(t => t.id === activeTrainerId && t.gameId === gameId);
    if (!trainerExists) {
        const defaultTrainer = trainersList.find(t => t.gameId === gameId);
        if (defaultTrainer) {
            activeTrainerId = defaultTrainer.id;
            localStorage.setItem("bb_active_trainer_" + gameId, activeTrainerId);
        }
    }
    
    updateTrainerSelect();
    renderAll();
}

function updateTrainerSelect() {
    const select = document.getElementById("trainer-select");
    if (!select) return;
    
    const gameTrainers = trainersList.filter(t => t.gameId === currentGameId);
    let html = "";
    gameTrainers.forEach(t => {
        const display = t.tid !== "00000" && t.tid ? `${t.name} (${t.tid})` : t.name;
        html += `<option value="${t.id}">${display}</option>`;
    });
    select.innerHTML = html;
    select.value = activeTrainerId;
}

function updateFormTrainerSelect(selectedTrainerId = null) {
    const select = document.getElementById("form-trainer");
    if (!select) return;
    
    const gameTrainers = trainersList.filter(t => t.gameId === currentGameId);
    
    select.innerHTML = gameTrainers.map(t => {
        const display = t.tid !== "00000" && t.tid ? `${t.name} (${t.tid})` : t.name;
        return `<option value="${t.id}">${display}</option>`;
    }).join("");
    
    if (selectedTrainerId && gameTrainers.some(t => t.id === selectedTrainerId)) {
        select.value = selectedTrainerId;
    } else {
        select.value = activeTrainerId;
    }
}

function toggleGlobalBoxMode() {
    globalBoxMode = !globalBoxMode;
    localStorage.setItem("bb_global_box_mode", globalBoxMode);
    
    const btn = document.getElementById("btn-toggle-global-box");
    const headerTitle = document.getElementById("box-header-title");
    
    if (globalBoxMode) {
        if (btn) {
            btn.innerText = "📦 Ver Box Regional";
            btn.style.background = "rgba(16, 185, 129, 0.08)";
            btn.style.borderColor = "rgba(16, 185, 129, 0.25)";
        }
        if (headerTitle) {
            headerTitle.innerHTML = `
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                🌐 Box Global (Todos os Cartuchos)
            `;
        }
    } else {
        if (btn) {
            btn.innerText = "🌐 Ver Box Global";
            btn.style.background = "rgba(99, 102, 241, 0.08)";
            btn.style.borderColor = "rgba(99, 102, 241, 0.25)";
        }
        if (headerTitle) {
            headerTitle.innerHTML = `
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                📦 Box Regional (Sem Limite)
            `;
        }
    }
    renderAll();
}

function initGlobalBoxUI() {
    const btn = document.getElementById("btn-toggle-global-box");
    const headerTitle = document.getElementById("box-header-title");
    if (!btn) return;
    if (globalBoxMode) {
        btn.innerText = "📦 Ver Box Regional";
        btn.style.background = "rgba(16, 185, 129, 0.08)";
        btn.style.borderColor = "rgba(16, 185, 129, 0.25)";
        if (headerTitle) {
            headerTitle.innerHTML = `
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                🌐 Box Global (Todos os Cartuchos)
            `;
        }
    } else {
        btn.innerText = "🌐 Ver Box Global";
        btn.style.background = "rgba(99, 102, 241, 0.08)";
        btn.style.borderColor = "rgba(99, 102, 241, 0.25)";
        if (headerTitle) {
            headerTitle.innerHTML = `
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                📦 Box Regional (Sem Limite)
            `;
        }
    }
}

function updateDexitMonitor() {
    const statsBox = document.getElementById("dexit-stats-box");
    const regionalPokemon = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.trainerId === activeTrainerId);
    const typeCounts = {};
    
    regionalPokemon.forEach(p => {
        if (p.type1) typeCounts[p.type1] = (typeCounts[p.type1] || 0) + 1;
        if (p.type2) typeCounts[p.type2] = (typeCounts[p.type2] || 0) + 1;
    });
    
    if (Object.keys(typeCounts).length === 0) {
        statsBox.innerHTML = `<span class="dexit-badge" style="color:var(--text-muted); border-style:dashed;">Nenhum espécime neste cartucho.</span>`; 
        return;
    }
    
    statsBox.innerHTML = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `<span class="dexit-badge occupied t-${type}"><span style="text-transform:uppercase; font-weight:900; color: var(--color-${type})">${type}</span>: ${count}</span>`)
        .join("");
}

function renderAll() {
    updateStats(); 
    updateDexitMonitor();
    renderTrainerResume();
    
    const teamContainer = document.getElementById("team-container");
    const boxContainer = document.getElementById("box-container");
    
    // Filters based on current game location or Global Mode:
    const boxSlots = globalBoxMode 
        ? pokemonDatabase.filter(p => p.slotType === "box")
        : pokemonDatabase.filter(p => p.currentGame === currentGameId && p.trainerId === activeTrainerId && p.slotType === "box");

    // Render Active Team Slots (Exactly 6 slots)
    teamContainer.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const p = pokemonDatabase.find(pkmn => pkmn.currentGame === currentGameId && pkmn.trainerId === activeTrainerId && pkmn.slotType === "team" && pkmn.slotIndex === i);
        if (p) {
            teamContainer.innerHTML += createSlotHTML(p, i, "team");
        } else {
            teamContainer.innerHTML += `
                <div class="slot empty-team-slot" data-slot-type="team" data-slot-index="${i}" ondragover="allowDrop(event)" ondragleave="dragLeave(event)" ondrop="handleDrop(event)">
                    <div class="empty-slot-plus">➕</div>
                    <div class="empty-slot-text">Slot ${i + 1}</div>
                </div>
            `;
        }
    }

    // Render HOF dynamically from IndexedDB (supporting multiple generated & uploads)
    const hofDisplayArea = document.getElementById("hof-display-area");
    const hofNavigation = document.getElementById("hof-navigation");
    const hofCounter = document.getElementById("hof-counter");
    const btnDeleteHof = document.getElementById("btn-delete-hof");
    
    // Guardar o gameId ativo no momento do pedido assíncrono
    hofDisplayArea.dataset.gameId = currentGameId;

    getHofRecords(currentGameId).then(records => {
        if (hofDisplayArea.dataset.gameId !== currentGameId) return;
        
        if (records.length === 0) {
            // Sem HOFs registados: exibe o placeholder padrão
            hofDisplayArea.innerHTML = `
                <div id="hof-placeholder" onclick="document.getElementById('hof-input').click()" style="cursor: pointer; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.75rem; font-weight: 600; text-align: center; padding: 20px; box-sizing: border-box;">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px; stroke: var(--text-muted); margin-bottom: 8px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Subir screenshot ou Gerar da Equipa</span>
                </div>
            `;
            hofNavigation.style.display = "none";
            btnDeleteHof.style.display = "none";
        } else {
            // Garantir limites de activeHofIndex
            if (activeHofIndex >= records.length) activeHofIndex = records.length - 1;
            if (activeHofIndex < 0) activeHofIndex = 0;
            
            const activeHof = records[activeHofIndex];
            btnDeleteHof.style.display = "block";
            
            // Exibir navegação apenas se houver mais de 1 HOF
            if (records.length > 1) {
                hofNavigation.style.display = "flex";
                hofCounter.innerText = `${activeHofIndex + 1} / ${records.length}`;
            } else {
                hofNavigation.style.display = "none";
            }
            
            if (activeHof.type === "upload") {
                // HOF do tipo screenshot carregado
                hofDisplayArea.innerHTML = `
                    <img id="hof-img" src="${activeHof.data}" alt="Mural de Honra" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="hof-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; color: #fff; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; cursor: pointer;" onclick="document.getElementById('hof-input').click()">Mudar Imagem</div>
                `;
                // Hover effect local para o overlay
                hofDisplayArea.onmouseenter = () => { if (hofDisplayArea.querySelector(".hof-overlay")) hofDisplayArea.querySelector(".hof-overlay").style.opacity = 1; };
                hofDisplayArea.onmouseleave = () => { if (hofDisplayArea.querySelector(".hof-overlay")) hofDisplayArea.querySelector(".hof-overlay").style.opacity = 0; };
            } else if (activeHof.type === "generated") {
                // HOF dinâmico 3D da equipa
                const gameThemeClass = `v-${currentGameId}`;
                const cardTitle = activeHof.title;
                const membersHTML = activeHof.team.map(tm => {
                    let spriteUrl = "";
                    const pokedexId = tm.pokedexId || 1;
                    const isShiny = tm.isShiny;
                    
                    if (currentSpriteStyle === "3d-home") {
                        spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${isShiny ? 'shiny/' : ''}${pokedexId}.png`;
                    } else if (currentSpriteStyle === "3d-animated") {
                        spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${isShiny ? 'shiny/' : ''}${pokedexId}.gif`;
                    } else {
                        spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? 'shiny/' : ''}${pokedexId}.png`;
                    }
                    
                    const name = tm.nickname ? tm.nickname : tm.species;
                    
                    return `
                        <div class="hof-card-member">
                            <img class="hof-member-sprite" src="${spriteUrl}" alt="${tm.species}" onerror="handleSpriteError(this, ${pokedexId}, '${isShiny ? 'shiny' : 'normal'}')">
                            <div class="hof-member-name">${name}</div>
                            <div class="hof-member-meta">
                                <img class="ball-mini" style="width: 8px; height: 8px;" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${tm.ball || 'poke'}-ball.png" alt="${tm.ball}">
                                <span>Lv. ${tm.level}</span>
                            </div>
                        </div>
                    `;
                }).join("");
                
                hofDisplayArea.innerHTML = `
                    <div class="hof-card ${gameThemeClass}">
                        <div class="hof-card-title">🏆 ${cardTitle}</div>
                        <div class="hof-card-grid">
                            ${membersHTML}
                        </div>
                        <div class="hof-card-footer">
                            <span>MURAL DE HONRA</span>
                            <span>${activeHof.date}</span>
                        </div>
                    </div>
                `;
                hofDisplayArea.onmouseenter = null;
                hofDisplayArea.onmouseleave = null;
            }
        }
    }).catch(err => {
        console.error("Erro ao obter HOFs do IndexedDB:", err);
    });

    // Apply filter panel logic in real-time
    const searchVal = document.getElementById("filter-search").value.toLowerCase().trim();
    const typeVal = document.getElementById("filter-type").value;
    const shinyVal = document.getElementById("filter-shiny").value;
    const ribbonVal = document.getElementById("filter-ribbon").value;

    const filteredBox = boxSlots.filter(p => {
        if (searchVal) {
            const nickMatch = p.nickname && p.nickname.toLowerCase().includes(searchVal);
            const specMatch = p.species && p.species.toLowerCase().includes(searchVal);
            if (!nickMatch && !specMatch) return false;
        }
        if (typeVal) {
            if (p.type1 !== typeVal && p.type2 !== typeVal) return false;
        }
        if (shinyVal === "shiny" && !p.isShiny) return false;
        if (shinyVal === "normal" && p.isShiny) return false;
        if (ribbonVal === "ribbon" && (!p.ribbons || p.ribbons.length === 0)) return false;
        
        return true;
    });

    // Render Box Slots
    boxContainer.innerHTML = "";
    filteredBox.forEach((p, idx) => { 
        boxContainer.innerHTML += createSlotHTML(p, idx, "box"); 
    });
    boxContainer.innerHTML += `
        <div class="slot drop-zone-only" data-slot-type="box" data-slot-index="${filteredBox.length}" ondragover="allowDrop(event)" ondragleave="dragLeave(event)" ondrop="handleDrop(event)">
            <div class="empty-slot-plus">➕</div>
            <div class="empty-slot-text">Arrastar</div>
        </div>
    `;
    
    setupDragAndDropEvents();
    if (activeTab === "allocation") {
        renderAllocationTab();
    }
}

function setSpriteStyle(style) {
    currentSpriteStyle = style;
    localStorage.setItem("bb_sprite_style", style);
    renderAll();
}

function handleSpriteError(img, pokedexId, shinyStr) {
    const isShiny = shinyStr === "shiny";
    if (img.src.includes("showdown")) {
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${isShiny ? 'shiny/' : ''}${pokedexId}.png`;
    } else if (img.src.includes("home")) {
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? 'shiny/' : ''}${pokedexId}.png`;
    } else {
        img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
    }
}

function createSlotHTML(p, index, type) {
    let spriteUrl = "";
    const pokedexId = p.pokedexId || 1;
    const isShiny = p.isShiny;

    if (currentSpriteStyle === "3d-home") {
        spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${isShiny ? 'shiny/' : ''}${pokedexId}.png`;
    } else if (currentSpriteStyle === "3d-animated") {
        spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${isShiny ? 'shiny/' : ''}${pokedexId}.gif`;
    } else {
        spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? 'shiny/' : ''}${pokedexId}.png`;
    }

    const typeClass = p.type1 ? `occupied t-${p.type1}` : '';
    const displayName = p.nickname ? `${p.nickname}` : p.species;
    const subText = p.nickname ? p.species : `Lv. ${p.level}`;
    const badgeLabel = p.currentGame ? p.currentGame.toUpperCase() : '??';
    const selectedClass = (typeof selectedPokemonIds !== 'undefined' && selectedPokemonIds.has(p.id)) ? 'selected-specimen' : '';

    const trainerObj = trainersList.find(t => t.id === p.trainerId);
    const trainerName = trainerObj ? trainerObj.name : "Padrão";
    const originBadge = globalBoxMode ? `<span class="global-origin-badge" style="background-color: ${getGameColor(p.currentGame)}">${trainerName}</span>` : '';

    return `
        <div class="slot ${typeClass} ${selectedClass}" draggable="true" data-id="${p.id}" data-slot-type="${type}" data-slot-index="${index}" onclick="openModalForEdit('${p.id}')" ondragover="allowDrop(event)" ondragleave="dragLeave(event)" ondrop="handleDrop(event)">
            <span class="version-badge v-${p.currentGame}">${badgeLabel}</span>
            <div class="slot-sprite-container">
                <img class="slot-sprite" draggable="false" src="${spriteUrl}" alt="${p.species}" onerror="handleSpriteError(this, ${pokedexId}, '${isShiny ? 'shiny' : 'normal'}')">
            </div>
            <div class="slot-name">${displayName}</div>
            <div class="slot-meta">
                <img class="ball-mini" draggable="false" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${p.ball || 'poke'}-ball.png" alt="${p.ball}" onerror="this.style.display='none'">
                <span>${subText}</span>
            </div>
            ${originBadge}
        </div>
    `;
}

function updateStats() {
    const totalEl = document.getElementById("stat-total");
    if (totalEl) totalEl.innerText = pokemonDatabase.length;
    
    const teamEl = document.getElementById("stat-team");
    if (teamEl) {
        teamEl.innerText = `${pokemonDatabase.filter(p => p.currentGame === currentGameId && p.trainerId === activeTrainerId && p.slotType === "team").length}/6`;
    }
}

// --- SECTION UNIFIED DRAG & DROP LOGIC ---
let draggedPokemonId = null;

function executeDropLogic(id, targetSlotType, targetSlotIndex, targetId) {
    const pkmnIndex = pokemonDatabase.findIndex(p => p.id === id); 
    if (pkmnIndex === -1) return;
    
    const draggedPkmn = pokemonDatabase[pkmnIndex]; 

    // Validate drop to active team from other trainers/games
    if (targetSlotType === "team" && (draggedPkmn.currentGame !== currentGameId || draggedPkmn.trainerId !== activeTrainerId)) {
        alert("Este Pokémon pertence a outro Treinador/Versão e não pode ser colocado na equipa ativa deste cartucho.");
        return;
    }

    if (targetId && targetId !== id) {
        // Swapping occupied slots
        const targetPkmnIndex = pokemonDatabase.findIndex(p => p.id === targetId);
        if (targetPkmnIndex !== -1) {
            const targetPkmn = pokemonDatabase[targetPkmnIndex];
            
            // Validate drops to team for swap operations
            if (targetPkmn.slotType === "team" && (draggedPkmn.currentGame !== currentGameId || draggedPkmn.trainerId !== activeTrainerId)) {
                alert("Este Pokémon pertence a outro Treinador/Versão e não pode ser colocado na equipa ativa deste cartucho.");
                return;
            }
            if (draggedPkmn.slotType === "team" && (targetPkmn.currentGame !== currentGameId || targetPkmn.trainerId !== activeTrainerId)) {
                alert("Este Pokémon pertence a outro Treinador/Versão e não pode ser colocado na equipa ativa deste cartucho.");
                return;
            }
            
            // Synchronize game context when swapping between team and box
            if (draggedPkmn.slotType !== targetPkmn.slotType) {
                if (targetPkmn.slotType === "team") {
                    draggedPkmn.currentGame = currentGameId;
                    draggedPkmn.trainerId = activeTrainerId;
                }
                if (draggedPkmn.slotType === "team") {
                    targetPkmn.currentGame = currentGameId;
                    targetPkmn.trainerId = activeTrainerId;
                }
            }
            
            const tempType = draggedPkmn.slotType; 
            const tempIndex = draggedPkmn.slotIndex;
            draggedPkmn.slotType = targetPkmn.slotType; 
            draggedPkmn.slotIndex = targetPkmn.slotIndex;
            targetPkmn.slotType = tempType; 
            targetPkmn.slotIndex = tempIndex;
        }
    } else {
        // Placing in empty slot
        if (targetSlotType === "team") {
            draggedPkmn.currentGame = currentGameId; 
            draggedPkmn.trainerId = activeTrainerId;
            const blocking = pokemonDatabase.find(p => p.currentGame === currentGameId && p.trainerId === activeTrainerId && p.slotType === "team" && p.slotIndex === targetSlotIndex);
            if (blocking) { 
                blocking.slotType = "box"; 
                blocking.slotIndex = 0; 
            }
        } else if (targetSlotType === "box") {
            draggedPkmn.trainerId = activeTrainerId;
        }
        draggedPkmn.slotType = targetSlotType; 
        draggedPkmn.slotIndex = targetSlotIndex;
    }
    localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase)); 
    renderAll();
}

function setupDragAndDropEvents() {
    document.querySelectorAll(".slot[draggable='true']").forEach(slot => {
        slot.addEventListener("dragstart", (e) => { 
            draggedPokemonId = slot.getAttribute("data-id"); 
            slot.style.opacity = "0.4"; 
        });
        slot.addEventListener("dragend", () => { 
            slot.style.opacity = "1"; 
            document.querySelectorAll(".slot").forEach(s => s.classList.remove("drag-over")); 
        });
    });
}

function allowDrop(e) { 
    e.preventDefault(); 
    if (e.currentTarget) e.currentTarget.classList.add("drag-over"); 
}

function dragLeave(e) { 
    if (e.currentTarget) e.currentTarget.classList.remove("drag-over"); 
}

function handleDrop(e) {
    e.preventDefault(); 
    e.currentTarget.classList.remove("drag-over");
    
    const id = draggedPokemonId; 
    if (!id) return;
    
    const targetSlotType = e.currentTarget.getAttribute("data-slot-type");
    const targetSlotIndex = parseInt(e.currentTarget.getAttribute("data-slot-index"), 10);
    const targetId = e.currentTarget.getAttribute("data-id");

    executeDropLogic(id, targetSlotType, targetSlotIndex, targetId);
}

// --- SECTION MOBILE TOUCH DRAG & DROP POLYFILL ---
let touchDragActive = false;
let touchDraggedId = null;
let touchClone = null;
let touchStartX = 0;
let touchStartY = 0;
let touchOffset = { x: 0, y: 0 };
let touchDraggedFromSlot = null;

function initTouchDragAndDrop() {
    // Touch Start
    document.addEventListener("touchstart", function(e) {
        const slot = e.target.closest(".slot[draggable='true']");
        if (!slot) return;
        
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchDragActive = false;
        touchDraggedId = slot.getAttribute("data-id");
        
        const rect = slot.getBoundingClientRect();
        touchOffset.x = touchStartX - rect.left;
        touchOffset.y = touchStartY - rect.top;
        
        touchDraggedFromSlot = slot;
    }, { passive: true });

    // Touch Move
    document.addEventListener("touchmove", function(e) {
        if (!touchDraggedId) return;
        
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        
        if (!touchDragActive && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
            touchDragActive = true;
            
            if (touchDraggedFromSlot) {
                touchClone = touchDraggedFromSlot.cloneNode(true);
                touchClone.style.position = "fixed";
                touchClone.style.width = touchDraggedFromSlot.offsetWidth + "px";
                touchClone.style.height = touchDraggedFromSlot.offsetHeight + "px";
                touchClone.style.left = (touch.clientX - touchOffset.x) + "px";
                touchClone.style.top = (touch.clientY - touchOffset.y) + "px";
                touchClone.style.pointerEvents = "none";
                touchClone.style.zIndex = "10000";
                touchClone.style.opacity = "0.75";
                touchClone.style.transform = "scale(1.05)";
                touchClone.style.boxShadow = "0 10px 25px rgba(0,0,0,0.5)";
                touchClone.style.transition = "none";
                document.body.appendChild(touchClone);
                
                touchDraggedFromSlot.style.opacity = "0.3";
            }
        }
        
        if (touchDragActive && touchClone) {
            if (e.cancelable) e.preventDefault(); 
            
            touchClone.style.left = (touch.clientX - touchOffset.x) + "px";
            touchClone.style.top = (touch.clientY - touchOffset.y) + "px";
            
            const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
            document.querySelectorAll(".slot").forEach(s => s.classList.remove("drag-over"));
            
            if (elementUnder) {
                const targetSlot = elementUnder.closest(".slot");
                if (targetSlot) {
                    targetSlot.classList.add("drag-over");
                }
            }
        }
    }, { passive: false });

    // Touch End
    document.addEventListener("touchend", function(e) {
        if (!touchDraggedId) return;
        
        const id = touchDraggedId;
        touchDraggedId = null;
        
        if (touchClone) {
            touchClone.remove();
            touchClone = null;
        }
        
        if (touchDraggedFromSlot) {
            touchDraggedFromSlot.style.opacity = "1";
        }
        
        document.querySelectorAll(".slot").forEach(s => s.classList.remove("drag-over"));
        
        if (touchDragActive) {
            e.preventDefault(); 
            
            const changedTouch = e.changedTouches[0];
            const elementUnder = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
            
            if (elementUnder) {
                const targetSlot = elementUnder.closest(".slot");
                if (targetSlot) {
                    const targetSlotType = targetSlot.getAttribute("data-slot-type");
                    const targetSlotIndex = parseInt(targetSlot.getAttribute("data-slot-index"), 10);
                    const targetId = targetSlot.getAttribute("data-id");
                    
                    executeDropLogic(id, targetSlotType, targetSlotIndex, targetId);
                }
            }
        }
        
        touchDraggedFromSlot = null;
    }, { passive: false });
}
// -----------------------------------------------------

// --- SECTION COMPETITIVE STATS VALIDATION ---
function validateEVs() {
    const hp = Math.min(252, Math.max(0, parseInt(document.getElementById("ev-hp").value) || 0));
    const atk = Math.min(252, Math.max(0, parseInt(document.getElementById("ev-atk").value) || 0));
    const def = Math.min(252, Math.max(0, parseInt(document.getElementById("ev-def").value) || 0));
    const spa = Math.min(252, Math.max(0, parseInt(document.getElementById("ev-spa").value) || 0));
    const spd = Math.min(252, Math.max(0, parseInt(document.getElementById("ev-spd").value) || 0));
    const spe = Math.min(252, Math.max(0, parseInt(document.getElementById("ev-spe").value) || 0));
    
    document.getElementById("ev-hp").value = hp;
    document.getElementById("ev-atk").value = atk;
    document.getElementById("ev-def").value = def;
    document.getElementById("ev-spa").value = spa;
    document.getElementById("ev-spd").value = spd;
    document.getElementById("ev-spe").value = spe;

    const total = hp + atk + def + spa + spd + spe;
    const warningEl = document.getElementById("ev-warning");
    const totalSpanEl = document.getElementById("ev-total-span");
    
    totalSpanEl.innerText = total;
    if (total > 510) {
        warningEl.style.display = "block";
        return false;
    } else {
        warningEl.style.display = "none";
        return true;
    }
}
// --------------------------------------------

// --- SECTION DYNAMIC RIBBON CHECKLIST ---
let activeCustomRibbons = [];

function renderRibbonChecklist() {
    const container = document.getElementById("ribbon-checklist-container");
    container.innerHTML = ALL_RIBBONS.map(r => `
        <div style="display: flex; align-items: center; gap: 6px;">
            <input type="checkbox" id="ribbon-chk-${r.id}" value="${r.name}" style="width: auto; cursor: pointer;">
            <label for="ribbon-chk-${r.id}" style="font-size: 0.65rem; font-weight: 600; cursor: pointer; text-transform: none; color: var(--text-main); line-height:1;">
                ${r.name} <span style="font-size:0.55rem; color:var(--text-muted);">[G${r.gen}]</span>
            </label>
        </div>
    `).join("");
}

function renderCustomRibbonsTags() {
    const container = document.getElementById("custom-ribbons-list");
    container.innerHTML = activeCustomRibbons.map(r => `
        <span class="dexit-badge occupied" style="background: rgba(255, 255, 255, 0.05); padding: 4px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; border-color:var(--game-color);">
            ${r}
            <span style="cursor: pointer; color: var(--accent-danger); font-weight: 900; margin-left: 6px;" onclick="removeCustomRibbon('${r}')">✕</span>
        </span>
    `).join("");
}

function addCustomRibbon() {
    const input = document.getElementById("form-custom-ribbon");
    const val = input.value.trim();
    if (val) {
        const predefined = ALL_RIBBONS.find(r => r.name.toLowerCase() === val.toLowerCase());
        if (predefined) {
            document.getElementById(`ribbon-chk-${predefined.id}`).checked = true;
        } else {
            if (!activeCustomRibbons.includes(val)) {
                activeCustomRibbons.push(val);
                renderCustomRibbonsTags();
            }
        }
        input.value = "";
    }
}

function removeCustomRibbon(name) {
    activeCustomRibbons = activeCustomRibbons.filter(r => r !== name);
    renderCustomRibbonsTags();
}
// ----------------------------------------

function openModalForNew() {
    document.getElementById("form-id").value = ""; 
    document.getElementById("form-species").value = ""; 
    document.getElementById("form-nickname").value = "";
    document.getElementById("form-level").value = "50"; 
    document.getElementById("form-gender").value = "⚲"; 
    document.getElementById("form-nature").value = "";
    document.getElementById("form-ability").value = ""; 
    document.getElementById("form-type1").value = "normal"; 
    document.getElementById("form-type2").value = "";
    document.getElementById("form-ball").value = "poke"; 
    document.getElementById("form-item").value = ""; 
    
    // Stats resetting
    document.getElementById("iv-hp").value = "31";
    document.getElementById("iv-atk").value = "31";
    document.getElementById("iv-def").value = "31";
    document.getElementById("iv-spa").value = "31";
    document.getElementById("iv-spd").value = "31";
    document.getElementById("iv-spe").value = "31";
    
    document.getElementById("ev-hp").value = "0";
    document.getElementById("ev-atk").value = "0";
    document.getElementById("ev-def").value = "0";
    document.getElementById("ev-spa").value = "0";
    document.getElementById("ev-spd").value = "0";
    document.getElementById("ev-spe").value = "0";
    
    document.getElementById("form-move1").value = ""; 
    document.getElementById("form-move2").value = "";
    document.getElementById("form-move3").value = ""; 
    document.getElementById("form-move4").value = ""; 
    
    // Clear checked state
    ALL_RIBBONS.forEach(r => {
        document.getElementById(`ribbon-chk-${r.id}`).checked = false;
    });
    activeCustomRibbons = [];
    
    document.getElementById("form-notes").value = ""; 
    document.getElementById("form-evolution-notes").value = ""; 
    document.getElementById("pkhex-text").value = ""; 
    document.getElementById("form-origin-game").value = currentGameId;
    document.getElementById("btn-delete-pkmn").style.display = "none"; 
    document.getElementById("btn-owndex-link").style.display = "none";
    document.getElementById("modal-title").innerText = "➕ Registar Novo Espécime";
    document.getElementById("passport-display").innerHTML = `<span>O passaporte será gerado ao gravar.</span>`;
    
    renderCustomRibbonsTags();
    validateEVs();
    updateFormTrainerSelect(activeTrainerId);
    document.getElementById("editor-modal").classList.add("active");
}

function openModalForEdit(id) {
    if (selectionMode) {
        toggleSpecimenSelection(id);
        return;
    }
    const p = pokemonDatabase.find(pkmn => pkmn.id === id); 
    if (!p) return;
    
    document.getElementById("form-id").value = p.id; 
    document.getElementById("form-species").value = p.species; 
    document.getElementById("form-nickname").value = p.nickname || "";
    document.getElementById("form-level").value = p.level || 50; 
    document.getElementById("form-gender").value = p.gender || "⚲"; 
    document.getElementById("form-nature").value = p.nature || "";
    document.getElementById("form-ability").value = p.ability || ""; 
    document.getElementById("form-type1").value = p.type1 || "normal"; 
    document.getElementById("form-type2").value = p.type2 || "";
    document.getElementById("form-ball").value = p.ball || "poke"; 
    document.getElementById("form-item").value = p.item || ""; 
    
    // Populate IVs & EVs
    document.getElementById("iv-hp").value = p.ivs?.hp !== undefined ? p.ivs.hp : 31;
    document.getElementById("iv-atk").value = p.ivs?.atk !== undefined ? p.ivs.atk : 31;
    document.getElementById("iv-def").value = p.ivs?.def !== undefined ? p.ivs.def : 31;
    document.getElementById("iv-spa").value = p.ivs?.spa !== undefined ? p.ivs.spa : 31;
    document.getElementById("iv-spd").value = p.ivs?.spd !== undefined ? p.ivs.spd : 31;
    document.getElementById("iv-spe").value = p.ivs?.spe !== undefined ? p.ivs.spe : 31;
    
    document.getElementById("ev-hp").value = p.evs?.hp !== undefined ? p.evs.hp : 0;
    document.getElementById("ev-atk").value = p.evs?.atk !== undefined ? p.evs.atk : 0;
    document.getElementById("ev-def").value = p.evs?.def !== undefined ? p.evs.def : 0;
    document.getElementById("ev-spa").value = p.evs?.spa !== undefined ? p.evs.spa : 0;
    document.getElementById("ev-spd").value = p.evs?.spd !== undefined ? p.evs.spd : 0;
    document.getElementById("ev-spe").value = p.evs?.spe !== undefined ? p.evs.spe : 0;
    
    document.getElementById("form-move1").value = p.moves?.[0] || ""; 
    document.getElementById("form-move2").value = p.moves?.[1] || "";
    document.getElementById("form-move3").value = p.moves?.[2] || ""; 
    document.getElementById("form-move4").value = p.moves?.[3] || ""; 
    
    document.getElementById("form-notes").value = p.notes || ""; 
    document.getElementById("form-evolution-notes").value = p.evolutionNotes || ""; 
    document.getElementById("form-origin-game").value = p.originGame || currentGameId;
    
    document.getElementById("btn-delete-pkmn").style.display = "block"; 
    document.getElementById("btn-owndex-link").style.display = "block";
    document.getElementById("modal-title").innerText = `Ficha Técnica: ${p.nickname || p.species}`;
    
    // Populate Ribbons checkboxes and tags
    ALL_RIBBONS.forEach(r => {
        document.getElementById(`ribbon-chk-${r.id}`).checked = false;
    });
    activeCustomRibbons = [];
    
    if (p.ribbons) {
        p.ribbons.forEach(ribbonName => {
            const predefined = ALL_RIBBONS.find(r => r.name === ribbonName);
            if (predefined) {
                document.getElementById(`ribbon-chk-${predefined.id}`).checked = true;
            } else {
                activeCustomRibbons.push(ribbonName);
            }
        });
    }
    
    renderCustomRibbonsTags();
    validateEVs();
    renderPassportTimeline(p); 
    updateFormTrainerSelect(p.trainerId);
    document.getElementById("editor-modal").classList.add("active");
}

function closeModal() { 
    document.getElementById("editor-modal").classList.remove("active"); 
}

function executeTransfer() {
    const id = document.getElementById("form-id").value;
    if (!id) { 
        alert("Tens de gravar o Pokémon primeiro antes de o transferir!"); 
        return; 
    }
    
    const targetPokemon = pokemonDatabase.find(p => p.id === id);
    if (!targetPokemon) return;
    
    const nextGameId = document.getElementById("form-transfer-game").value;
    
    if (targetPokemon.currentGame !== nextGameId) {
        if (!targetPokemon.history) targetPokemon.history = [];
        
        // Track multiversal timeline stamp
        targetPokemon.history.push(targetPokemon.currentGame);
        targetPokemon.currentGame = nextGameId;
        
        // Update trainerId to target game's active trainer
        const targetActiveTrainer = localStorage.getItem("bb_active_trainer_" + nextGameId) || `trainer_${nextGameId}_default`;
        targetPokemon.trainerId = targetActiveTrainer;
        
        // When transferred, send back to the destination game Box slots
        targetPokemon.slotType = "box";
        targetPokemon.slotIndex = 0;
        
        renderPassportTimeline(targetPokemon);
        localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
        renderAll();
    } else {
        alert("O Pokémon já se encontra nessa versão!");
    }
}

function renderPassportTimeline(p) {
    const display = document.getElementById("passport-display");
    if (!p.history || p.history.length === 0) { 
        display.innerHTML = `<span class="timeline-node active">${p.currentGame.toUpperCase()} (Origem)</span>`; 
        return; 
    }
    let nodes = p.history.map(gId => `<span class="timeline-node">${gId.toUpperCase()}</span>`);
    nodes.push(`<span class="timeline-node active">${p.currentGame.toUpperCase()} (Atual)</span>`);
    display.innerHTML = nodes.join(`<span class="timeline-arrow">➔</span>`);
}

async function savePokemon() {
    const id = document.getElementById("form-id").value;
    const species = document.getElementById("form-species").value.trim(); 
    if (!species) { 
        alert("A espécie é obrigatória!"); 
        return; 
    }
    
    // Validate EVs before saving
    if (!validateEVs()) {
        alert("A soma total de EVs excede o limite competitivo de 510!");
        return;
    }

    const nickname = document.getElementById("form-nickname").value.trim();
    const level = parseInt(document.getElementById("form-level").value, 10) || 50;
    const gender = document.getElementById("form-gender").value;
    const nature = document.getElementById("form-nature").value.trim();
    const ability = document.getElementById("form-ability").value.trim();
    const type1 = document.getElementById("form-type1").value;
    const type2 = document.getElementById("form-type2").value;
    const ball = document.getElementById("form-ball").value;
    const item = document.getElementById("form-item").value.trim();
    
    // Collect IVs
    const ivs = {
        hp: parseInt(document.getElementById("iv-hp").value) || 31,
        atk: parseInt(document.getElementById("iv-atk").value) || 31,
        def: parseInt(document.getElementById("iv-def").value) || 31,
        spa: parseInt(document.getElementById("iv-spa").value) || 31,
        spd: parseInt(document.getElementById("iv-spd").value) || 31,
        spe: parseInt(document.getElementById("iv-spe").value) || 31
    };
    
    // Collect EVs
    const evs = {
        hp: parseInt(document.getElementById("ev-hp").value) || 0,
        atk: parseInt(document.getElementById("ev-atk").value) || 0,
        def: parseInt(document.getElementById("ev-def").value) || 0,
        spa: parseInt(document.getElementById("ev-spa").value) || 0,
        spd: parseInt(document.getElementById("ev-spd").value) || 0,
        spe: parseInt(document.getElementById("ev-spe").value) || 0
    };

    const moves = [
        document.getElementById("form-move1").value.trim(), 
        document.getElementById("form-move2").value.trim(), 
        document.getElementById("form-move3").value.trim(), 
        document.getElementById("form-move4").value.trim()
    ].filter(m => m !== "");
    
    // Collect selected ribbons from checklist + custom ones
    const checkedRibbons = ALL_RIBBONS
        .filter(r => document.getElementById(`ribbon-chk-${r.id}`).checked)
        .map(r => r.name);
    const ribbons = [...checkedRibbons, ...activeCustomRibbons];

    const notes = document.getElementById("form-notes").value;
    const evolutionNotes = document.getElementById("form-evolution-notes").value;
    const originGame = document.getElementById("form-origin-game").value;

    const selectedTrainerId = document.getElementById("form-trainer").value || activeTrainerId;

    let targetPokemon = null;
    if (id) {
        targetPokemon = pokemonDatabase.find(p => p.id === id);
        if (targetPokemon) {
            targetPokemon.trainerId = selectedTrainerId;
            if (targetPokemon.currentGame !== currentGameId) {
                if (!targetPokemon.history) targetPokemon.history = [];
                targetPokemon.history.push(targetPokemon.currentGame);
                targetPokemon.currentGame = currentGameId;
                targetPokemon.slotType = "box"; 
                targetPokemon.slotIndex = 0;
            }
        }
    }
    
    if (!targetPokemon) {
        targetPokemon = { 
            id: id || "pkmn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5), 
            history: [], 
            currentGame: currentGameId, 
            trainerId: selectedTrainerId,
            slotType: "box", 
            slotIndex: 0 
        };
        pokemonDatabase.push(targetPokemon);
    }

    targetPokemon.species = species; 
    targetPokemon.nickname = nickname; 
    targetPokemon.level = level; 
    targetPokemon.gender = gender;
    targetPokemon.nature = nature; 
    targetPokemon.ability = ability; 
    targetPokemon.type1 = type1; 
    targetPokemon.type2 = type2;
    targetPokemon.ball = ball; 
    targetPokemon.item = item;
    targetPokemon.ivs = ivs;
    targetPokemon.evs = evs;
    targetPokemon.moves = moves; 
    targetPokemon.ribbons = ribbons; 
    targetPokemon.notes = notes; 
    targetPokemon.evolutionNotes = evolutionNotes;
    targetPokemon.originGame = originGame;

    try {
        // Correct name cleaning matching standard PokeAPI schemas
        const cleanName = species.toLowerCase().trim()
            .replace(/[\s']/g, "-")
            .replace(/\./g, "")
            .replace(/-+$/, "");
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`);
        if (res.ok) { 
            const data = await res.json(); 
            targetPokemon.pokedexId = data.id; 
        }
    } catch (err) { 
        console.log(err); 
    }

    localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
    closeModal();
    renderAll();
}

function deletePokemon() {
    const id = document.getElementById("form-id").value; 
    if (!id) return;
    if (confirm("Tens a certeza absoluta que queres eliminar este espécime?")) {
        pokemonDatabase = pokemonDatabase.filter(p => p.id !== id);
        localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase)); 
        closeModal(); 
        renderAll();
    }
}

async function parseShowdownText() {
    const rawText = document.getElementById("pkhex-text").value.trim(); 
    if (!rawText) return;
    const blocks = rawText.split(/\n\s*\n/); 
    let count = 0;
    
    for (const block of blocks) {
        const lines = block.split("\n").map(l => l.trim()).filter(l => l.length > 0); 
        if (lines.length === 0) continue;
        
        let pkmn = { 
            id: "pkmn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5), 
            history: [], 
            species: "", 
            nickname: "", 
            level: 50, 
            gender: "⚲", 
            nature: "", 
            ability: "", 
            type1: "normal", 
            type2: "", 
            ball: "poke", 
            item: "",
            ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
            evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            moves: [], 
            ribbons: [], 
            notes: "Importado via Showdown.", 
            originGame: currentGameId, 
            currentGame: currentGameId, 
            trainerId: document.getElementById("form-trainer").value || activeTrainerId,
            slotType: "box", 
            slotIndex: 0, 
            pokedexId: 1 
        };
        
        let firstLine = lines[0]; 
        let itemSplit = firstLine.split("@"); 
        let idPart = itemSplit[0].trim();
        
        // Item extraction
        if (itemSplit[1]) {
            pkmn.item = itemSplit[1].trim();
        }
        
        if (idPart.includes("(M)")) { 
            pkmn.gender = "♂️"; 
            idPart = idPart.replace("(M)", "").trim(); 
        }
        if (idPart.includes("(F)")) { 
            pkmn.gender = "♀️"; 
            idPart = idPart.replace("(F)", "").trim(); 
        }
        
        let nameMatch = idPart.match(/(.+)\s+\((.+)\)/);
        if (nameMatch) { 
            pkmn.nickname = nameMatch[1].trim(); 
            pkmn.species = nameMatch[2].trim(); 
        } else { 
            pkmn.species = idPart; 
        }
        
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            if (line.toLowerCase().startsWith("ability:")) {
                pkmn.ability = line.split(":")[1].trim();
            } else if (line.toLowerCase().startsWith("level:")) {
                pkmn.level = parseInt(line.split(":")[1].trim(), 10) || 50;
            } else if (line.toLowerCase().endsWith("nature")) {
                pkmn.nature = line.split(/\s+/)[0].trim();
            } else if (line.startsWith("-")) { 
                let m = line.replace("-", "").trim(); 
                if (m && pkmn.moves.length < 4) pkmn.moves.push(m); 
            } else if (line.toLowerCase().startsWith("shiny: yes")) {
                pkmn.isShiny = true;
            } else if (line.toLowerCase().startsWith("evs:")) {
                const evParts = line.split(":")[1].split("/");
                evParts.forEach(part => {
                    const trimmed = part.trim();
                    const val = parseInt(trimmed.split(" ")[0]);
                    const stat = trimmed.split(" ")[1].toLowerCase();
                    if (stat === "hp") pkmn.evs.hp = val;
                    else if (stat === "atk") pkmn.evs.atk = val;
                    else if (stat === "def") pkmn.evs.def = val;
                    else if (stat === "spa") pkmn.evs.spa = val;
                    else if (stat === "spd") pkmn.evs.spd = val;
                    else if (stat === "spe") pkmn.evs.spe = val;
                });
            } else if (line.toLowerCase().startsWith("ivs:")) {
                const ivParts = line.split(":")[1].split("/");
                ivParts.forEach(part => {
                    const trimmed = part.trim();
                    const val = parseInt(trimmed.split(" ")[0]);
                    const stat = trimmed.split(" ")[1].toLowerCase();
                    if (stat === "hp") pkmn.ivs.hp = val;
                    else if (stat === "atk") pkmn.ivs.atk = val;
                    else if (stat === "def") pkmn.ivs.def = val;
                    else if (stat === "spa") pkmn.ivs.spa = val;
                    else if (stat === "spd") pkmn.ivs.spd = val;
                    else if (stat === "spe") pkmn.ivs.spe = val;
                });
            }
        }
        
        if (!pkmn.species) continue;
        
        try {
            const cleanName = pkmn.species.toLowerCase().trim()
                .replace(/[\s']/g, "-")
                .replace(/\./g, "")
                .replace(/-+$/, "");
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`);
            if (res.ok) { 
                const d = await res.json(); 
                pkmn.pokedexId = d.id; 
                pkmn.type1 = d.types[0].type.name; 
                if (d.types[1]) pkmn.type2 = d.types[1].type.name; 
            }
        } catch (err) {}
        
        pokemonDatabase.push(pkmn); 
        count++;
    }
    if (count > 0) { 
        localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase)); 
        closeModal(); 
        renderAll(); 
    }
}

function exportData() {
    if (pokemonDatabase.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pokemonDatabase, null, 2));
    const dl = document.createElement("a"); 
    dl.setAttribute("href", dataStr); 
    dl.setAttribute("download", `blackbox_backup.json`); 
    dl.click();
}

function importData(e) {
    const file = e.target.files[0]; 
    if (!file) return;
    const r = new FileReader(); 
    r.onload = function(evt) {
        try {
            const d = JSON.parse(evt.target.result);
            if (Array.isArray(d)) { 
                pokemonDatabase = d; 
                migrateTrainerIds(); // Run migration immediately so imported data gets trainerId fields assigned!
                cleanupDuplicates();
                localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase)); 
                renderAll(); 
                alert("Importação de cópia de segurança JSON concluída com sucesso!");
            } else {
                alert("Ficheiro inválido. O backup do BlackBox deve ser um ficheiro JSON.");
            }
        } catch (err) {
            alert("Erro ao ler o ficheiro JSON de backup: " + err.message);
        }
    }; 
    r.readAsText(file);
}

// --- SECTION Save File Importer Logic ---

let tempImportList = [];

const POKEMON_NAMES_ALL = ["","Bulbasaur","Ivysaur","Venusaur","Charmander","Charmeleon","Charizard","Squirtle","Wartortle","Blastoise","Caterpie","Metapod","Butterfree","Weedle","Kakuna","Beedrill","Pidgey","Pidgeotto","Pidgeot","Rattata","Raticate","Spearow","Fearow","Ekans","Arbok","Pikachu","Raichu","Sandshrew","Sandslash","NidoranF","Nidorina","Nidoqueen","NidoranM","Nidorino","Nidoking","Clefairy","Clefable","Vulpix","Ninetales","Jigglypuff","Wigglytuff","Zubat","Golbat","Oddish","Gloom","Vileplume","Paras","Parasect","Venonat","Venomoth","Diglett","Dugtrio","Meowth","Persian","Psyduck","Golduck","Mankey","Primeape","Growlithe","Arcanine","Poliwag","Poliwhirl","Poliwrath","Abra","Kadabra","Alakazam","Machop","Machoke","Machamp","Bellsprout","Weepinbell","Victreebel","Tentacool","Tentacruel","Geodude","Graveler","Golem","Ponyta","Rapidash","Slowpoke","Slowbro","Magnemite","Magneton","Farfetch\u0027d","Doduo","Dodrio","Seel","Dewgong","Grimer","Muk","Shellder","Cloyster","Gastly","Haunter","Gengar","Onix","Drowzee","Hypno","Krabby","Kingler","Voltorb","Electrode","Exeggcute","Exeggutor","Cubone","Marowak","Hitmonlee","Hitmonchan","Lickitung","Koffing","Weezing","Rhyhorn","Rhydon","Chansey","Tangela","Kangaskhan","Horsea","Seadra","Goldeen","Seaking","Staryu","Starmie","Mr. Mime","Scyther","Jynx","Electabuzz","Magmar","Pinsir","Tauros","Magikarp","Gyarados","Lapras","Ditto","Eevee","Vaporeon","Jolteon","Flareon","Porygon","Omanyte","Omastar","Kabuto","Kabutops","Aerodactyl","Snorlax","Articuno","Zapdos","Moltres","Dratini","Dragonair","Dragonite","Mewtwo","Mew","Chikorita","Bayleef","Meganium","Cyndaquil","Quilava","Typhlosion","Totodile","Croconaw","Feraligatr","Sentret","Furret","Hoothoot","Noctowl","Ledyba","Ledian","Spinarak","Ariados","Crobat","Chinchou","Lanturn","Pichu","Cleffa","Igglybuff","Togepi","Togetic","Natu","Xatu","Mareep","Flaaffy","Ampharos","Bellossom","Marill","Azumarill","Sudowoodo","Politoed","Hoppip","Skiploom","Jumpluff","Aipom","Sunkern","Sunflora","Yanma","Wooper","Quagsire","Espeon","Umbreon","Murkrow","Slowking","Misdreavus","Unown","Wobbuffet","Girafarig","Pineco","Forretress","Dunsparce","Gligar","Steelix","Snubbull","Granbull","Qwilfish","Scizor","Shuckle","Heracross","Sneasel","Teddiursa","Ursaring","Slugma","Magcargo","Swinub","Piloswine","Corsola","Remoraid","Octillery","Delibird","Mantine","Skarmory","Houndour","Houndoom","Kingdra","Phanpy","Donphan","Porygon2","Stantler","Smeargle","Tyrogue","Hitmontop","Smoochum","Elekid","Magby","Miltank","Blissey","Raikou","Entei","Suicune","Larvitar","Pupitar","Tyranitar","Lugia","Ho-Oh","Celebi","Treecko","Grovyle","Sceptile","Torchic","Combusken","Blaziken","Mudkip","Marshtomp","Swampert","Poochyena","Mightyena","Zigzagoon","Linoone","Wurmple","Silcoon","Beautifly","Cascoon","Dustox","Lotad","Lombre","Ludicolo","Seedot","Nuzleaf","Shiftry","Taillow","Swellow","Wingull","Pelipper","Ralts","Kirlia","Gardevoir","Surskit","Masquerain","Shroomish","Breloom","Slakoth","Vigoroth","Slaking","Nincada","Ninjask","Shedinja","Whismur","Loudred","Exploud","Makuhita","Hariyama","Azurill","Nosepass","Skitty","Delcatty","Sableye","Mawile","Aron","Lairon","Aggron","Meditite","Medicham","Electrike","Manectric","Plusle","Minun","Volbeat","Illumise","Roselia","Gulpin","Swalot","Carvanha","Sharpedo","Wailmer","Wailord","Numel","Camerupt","Torkoal","Spoink","Grumpig","Spinda","Trapinch","Vibrava","Flygon","Cacnea","Cacturne","Swablu","Altaria","Zangoose","Seviper","Lunatone","Solrock","Barboach","Whiscash","Corphish","Crawdaunt","Baltoy","Claydol","Lileep","Cradily","Anorith","Armaldo","Feebas","Milotic","Castform","Kecleon","Shuppet","Banette","Duskull","Dusclops","Tropius","Chimecho","Absol","Wynaut","Snorunt","Glalie","Spheal","Sealeo","Walrein","Clamperl","Huntail","Gorebyss","Relicanth","Luvdisc","Bagon","Shelgon","Salamence","Beldum","Metang","Metagross","Regirock","Regice","Registeel","Latias","Latios","Kyogre","Groudon","Rayquaza","Jirachi","Deoxys Normal","Turtwig","Grotle","Torterra","Chimchar","Monferno","Infernape","Piplup","Prinplup","Empoleon","Starly","Staravia","Staraptor","Bidoof","Bibarel","Kricketot","Kricketune","Shinx","Luxio","Luxray","Budew","Roserade","Cranidos","Rampardos","Shieldon","Bastiodon","Burmy","Wormadam Plant","Mothim","Combee","Vespiquen","Pachirisu","Buizel","Floatzel","Cherubi","Cherrim","Shellos","Gastrodon","Ambipom","Drifloon","Drifblim","Buneary","Lopunny","Mismagius","Honchkrow","Glameow","Purugly","Chingling","Stunky","Skuntank","Bronzor","Bronzong","Bonsly","Mime Jr.","Happiny","Chatot","Spiritomb","Gible","Gabite","Garchomp","Munchlax","Riolu","Lucario","Hippopotas","Hippowdon","Skorupi","Drapion","Croagunk","Toxicroak","Carnivine","Finneon","Lumineon","Mantyke","Snover","Abomasnow","Weavile","Magnezone","Lickilicky","Rhyperior","Tangrowth","Electivire","Magmortar","Togekiss","Yanmega","Leafeon","Glaceon","Gliscor","Mamoswine","Porygon-Z","Gallade","Probopass","Dusknoir","Froslass","Rotom","Uxie","Mesprit","Azelf","Dialga","Palkia","Heatran","Regigigas","Giratina Altered","Cresselia","Phione","Manaphy","Darkrai","Shaymin Land","Arceus","Victini","Snivy","Servine","Serperior","Tepig","Pignite","Emboar","Oshawott","Dewott","Samurott","Patrat","Watchog","Lillipup","Herdier","Stoutland","Purrloin","Liepard","Pansage","Simisage","Pansear","Simisear","Panpour","Simipour","Munna","Musharna","Pidove","Tranquill","Unfezant","Blitzle","Zebstrika","Roggenrola","Boldore","Gigalith","Woobat","Swoobat","Drilbur","Excadrill","Audino","Timburr","Gurdurr","Conkeldurr","Tympole","Palpitoad","Seismitoad","Throh","Sawk","Sewaddle","Swadloon","Leavanny","Venipede","Whirlipede","Scolipede","Cottonee","Whimsicott","Petilil","Lilligant","Basculin Red Striped","Sandile","Krokorok","Krookodile","Darumaka","Darmanitan Standard","Maractus","Dwebble","Crustle","Scraggy","Scrafty","Sigilyph","Yamask","Cofagrigus","Tirtouga","Carracosta","Archen","Archeops","Trubbish","Garbodor","Zorua","Zoroark","Minccino","Cinccino","Gothita","Gothorita","Gothitelle","Solosis","Duosion","Reuniclus","Ducklett","Swanna","Vanillite","Vanillish","Vanilluxe","Deerling","Sawsbuck","Emolga","Karrablast","Escavalier","Foongus","Amoonguss","Frillish Male","Jellicent Male","Alomomola","Joltik","Galvantula","Ferroseed","Ferrothorn","Klink","Klang","Klinklang","Tynamo","Eelektrik","Eelektross","Elgyem","Beheeyem","Litwick","Lampent","Chandelure","Axew","Fraxure","Haxorus","Cubchoo","Beartic","Cryogonal","Shelmet","Accelgor","Stunfisk","Mienfoo","Mienshao","Druddigon","Golett","Golurk","Pawniard","Bisharp","Bouffalant","Rufflet","Braviary","Vullaby","Mandibuzz","Heatmor","Durant","Deino","Zweilous","Hydreigon","Larvesta","Volcarona","Cobalion","Terrakion","Virizion","Tornadus Incarnate","Thundurus Incarnate","Reshiram","Zekrom","Landorus Incarnate","Kyurem","Keldeo Ordinary","Meloetta Aria","Genesect","Chespin","Quilladin","Chesnaught","Fennekin","Braixen","Delphox","Froakie","Frogadier","Greninja","Bunnelby","Diggersby","Fletchling","Fletchinder","Talonflame","Scatterbug","Spewpa","Vivillon","Litleo","Pyroar Male","Flabebe","Floette","Florges","Skiddo","Gogoat","Pancham","Pangoro","Furfrou","Espurr","Meowstic Male","Honedge","Doublade","Aegislash Shield","Spritzee","Aromatisse","Swirlix","Slurpuff","Inkay","Malamar","Binacle","Barbaracle","Skrelp","Dragalge","Clauncher","Clawitzer","Helioptile","Heliolisk","Tyrunt","Tyrantrum","Amaura","Aurorus","Sylveon","Hawlucha","Dedenne","Carbink","Goomy","Sliggoo","Goodra","Klefki","Phantump","Trevenant","Pumpkaboo Average","Gourgeist Average","Bergmite","Avalugg","Noibat","Noivern","Xerneas","Yveltal","Zygarde 50","Diancie","Hoopa","Volcanion","Rowlet","Dartrix","Decidueye","Litten","Torracat","Incineroar","Popplio","Brionne","Primarina","Pikipek","Trumbeak","Toucannon","Yungoos","Gumshoos","Grubbin","Charjabug","Vikavolt","Crabrawler","Crabominable","Oricorio Baile","Cutiefly","Ribombee","Rockruff","Lycanroc Midday","Wishiwashi Solo","Mareanie","Toxapex","Mudbray","Mudsdale","Dewpider","Araquanid","Fomantis","Lurantis","Morelull","Shiinotic","Salandit","Salazzle","Stufful","Bewear","Bounsweet","Steenee","Tsareena","Comfey","Oranguru","Passimian","Wimpod","Golisopod","Sandygast","Palossand","Pyukumuku","Type Null","Silvally","Minior Red Meteor","Komala","Turtonator","Togedemaru","Mimikyu Disguised","Bruxish","Drampa","Dhelmise","Jangmo O","Hakamo O","Kommo O","Tapu Koko","Tapu Lele","Tapu Bulu","Tapu Fini","Cosmog","Cosmoem","Solgaleo","Lunala","Nihilego","Buzzwole","Pheromosa","Xurkitree","Celesteela","Kartana","Guzzlord","Necrozma","Magearna","Marshadow","Poipole","Naganadel","Stakataka","Blacephalon","Zeraora","Meltan","Melmetal","Grookey","Thwackey","Rillaboom","Scorbunny","Raboot","Cinderace","Sobble","Drizzile","Inteleon","Skwovet","Greedent","Rookidee","Corvisquire","Corviknight","Blipbug","Dottler","Orbeetle","Nickit","Thievul","Gossifleur","Eldegoss","Wooloo","Dubwool","Chewtle","Drednaw","Yamper","Boltund","Rolycoly","Carkol","Coalossal","Applin","Flapple","Appletun","Silicobra","Sandaconda","Cramorant","Arrokuda","Barraskewda","Toxel","Toxtricity Amped","Sizzlipede","Centiskorch","Clobbopus","Grapploct","Sinistea","Polteageist","Hatenna","Hattrem","Hatterene","Impidimp","Morgrem","Grimmsnarl","Obstagoon","Perrserker","Cursola","Sirfetchd","Mr Rime","Runerigus","Milcery","Alcremie","Falinks","Pincurchin","Snom","Frosmoth","Stonjourner","Eiscue Ice","Indeedee Male","Morpeko Full Belly","Cufant","Copperajah","Dracozolt","Arctozolt","Dracovish","Arctovish","Duraludon","Dreepy","Drakloak","Dragapult","Zacian","Zamazenta","Eternatus","Kubfu","Urshifu Single Strike","Zarude","Regieleki","Regidrago","Glastrier","Spectrier","Calyrex","Wyrdeer","Kleavor","Ursaluna","Basculegion Male","Sneasler","Overqwil","Enamorus Incarnate","Sprigatito","Floragato","Meowscarada","Fuecoco","Crocalor","Skeledirge","Quaxly","Quaxwell","Quaquaval","Lechonk","Oinkologne Male","Tarountula","Spidops","Nymble","Lokix","Pawmi","Pawmo","Pawmot","Tandemaus","Maushold Family Of Four","Fidough","Dachsbun","Smoliv","Dolliv","Arboliva","Squawkabilly Green Plumage","Nacli","Naclstack","Garganacl","Charcadet","Armarouge","Ceruledge","Tadbulb","Bellibolt","Wattrel","Kilowattrel","Maschiff","Mabosstiff","Shroodle","Grafaiai","Bramblin","Brambleghast","Toedscool","Toedscruel","Klawf","Capsakid","Scovillain","Rellor","Rabsca","Flittle","Espathra","Tinkatink","Tinkatuff","Tinkaton","Wiglett","Wugtrio","Bombirdier","Finizen","Palafin Zero","Varoom","Revavroom","Cyclizar","Orthworm","Glimmet","Glimmora","Greavard","Houndstone","Flamigo","Cetoddle","Cetitan","Veluza","Dondozo","Tatsugiri Curly","Annihilape","Clodsire","Farigiraf","Dudunsparce Two Segment","Kingambit","Great Tusk","Scream Tail","Brute Bonnet","Flutter Mane","Slither Wing","Sandy Shocks","Iron Treads","Iron Bundle","Iron Hands","Iron Jugulis","Iron Moth","Iron Thorns","Frigibax","Arctibax","Baxcalibur","Gimmighoul","Gholdengo","Wo Chien","Chien Pao","Ting Lu","Chi Yu","Roaring Moon","Iron Valiant","Koraidon","Miraidon","Walking Wake","Iron Leaves","Dipplin","Poltchageist","Sinistcha","Okidogi","Munkidori","Fezandipiti","Ogerpon","Archaludon","Hydrapple","Gouging Fire","Raging Bolt","Iron Boulder","Iron Crown","Terapagos","Pecharunt"];

const GEN1_INTERNAL_TO_DEX = {
    0x01: 112, 0x02: 115, 0x03: 32, 0x04: 35, 0x05: 21, 0x06: 100, 0x07: 34, 0x08: 80, 0x09: 2, 0x0A: 103,
    0x0B: 108, 0x0C: 102, 0x0D: 88, 0x0E: 94, 0x0F: 29, 0x10: 31, 0x11: 104, 0x12: 111, 0x13: 131, 0x14: 59,
    0x15: 151, 0x16: 130, 0x17: 90, 0x18: 72, 0x19: 92, 0x1A: 123, 0x1B: 120, 0x1C: 9, 0x1D: 127, 0x1E: 114,
    0x21: 58, 0x22: 95, 0x23: 22, 0x24: 16, 0x25: 79, 0x26: 64, 0x27: 75, 0x28: 113, 0x29: 67, 0x2A: 122,
    0x2B: 106, 0x2C: 107, 0x2D: 24, 0x2E: 47, 0x2F: 54, 0x30: 96, 0x31: 76, 0x33: 126, 0x35: 125, 0x36: 82,
    0x37: 109, 0x39: 56, 0x3A: 86, 0x3B: 50, 0x3C: 128, 0x40: 83, 0x41: 48, 0x42: 149, 0x46: 84, 0x47: 60,
    0x48: 124, 0x49: 146, 0x4A: 144, 0x4B: 145, 0x4C: 132, 0x4D: 52, 0x4E: 98, 0x52: 37, 0x53: 38, 0x54: 25,
    0x55: 26, 0x58: 147, 0x59: 148, 0x5A: 140, 0x5B: 141, 0x5C: 116, 0x5D: 117, 0x60: 27, 0x61: 28, 0x62: 138,
    0x63: 139, 0x64: 39, 0x65: 40, 0x66: 133, 0x67: 134, 0x68: 135, 0x69: 136, 0x6A: 66, 0x6B: 41, 0x6C: 23,
    0x6D: 46, 0x6E: 61, 0x6F: 62, 0x70: 13, 0x71: 14, 0x72: 15, 0x74: 85, 0x75: 57, 0x76: 51, 0x77: 49,
    0x78: 87, 0x7B: 10, 0x7C: 11, 0x7D: 12, 0x7E: 68, 0x80: 55, 0x81: 97, 0x82: 42, 0x83: 150, 0x84: 143,
    0x85: 129, 0x88: 89, 0x8A: 99, 0x8B: 91, 0x8D: 101, 0x8E: 36, 0x8F: 110, 0x90: 53, 0x91: 105, 0x93: 93,
    0x94: 63, 0x95: 65, 0x96: 17, 0x97: 18, 0x98: 121, 0x99: 1, 0x9A: 3, 0x9B: 73, 0x9D: 118, 0x9E: 119,
    0xA3: 77, 0xA4: 78, 0xA5: 19, 0xA6: 20, 0xA7: 33, 0xA8: 30, 0xA9: 74, 0xAA: 137, 0xAB: 142, 0xAD: 81,
    0xB0: 4, 0xB1: 7, 0xB2: 5, 0xB3: 8, 0xB4: 6, 0xB9: 43, 0xBA: 44, 0xBB: 45, 0xBC: 69, 0xBD: 70, 0xBE: 71
};

const blockOrders = [
    [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1], [0, 3, 1, 2], [0, 3, 2, 1],
    [1, 0, 2, 3], [1, 0, 3, 2], [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0],
    [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0], [2, 3, 0, 1], [2, 3, 1, 0],
    [3, 0, 1, 2], [3, 0, 2, 1], [3, 1, 0, 2], [3, 1, 2, 0], [3, 2, 0, 1], [3, 2, 1, 0]
];

function cleanSpeciesName(name) {
    if (!name) return "";
    return name
        .replace(/^[-\s]+|[-\s]+$/g, "")
        .replace(" Deoxys Normal", "Deoxys")
        .replace("Deoxys Normal", "Deoxys")
        .replace("Wormadam Plant", "Wormadam")
        .replace("Giratina Altered", "Giratina")
        .replace("Shaymin Land", "Shaymin")
        .replace("Basculin Red Striped", "Basculin")
        .replace("Darmanitan Standard", "Darmanitan")
        .replace("Frillish Male", "Frillish")
        .replace("Jellicent Male", "Jellicent")
        .replace("Tornadus Incarnate", "Tornadus")
        .replace("Thundurus Incarnate", "Thundurus")
        .replace("Landorus Incarnate", "Landorus")
        .replace("Keldeo Ordinary", "Keldeo")
        .replace("Meloetta Aria", "Meloetta")
        .replace("Pyroar Male", "Pyroar")
        .replace("Meowstic Male", "Meowstic")
        .replace("Aegislash Shield", "Aegislash")
        .replace("Pumpkaboo Average", "Pumpkaboo")
        .replace("Gourgeist Average", "Gourgeist")
        .replace("Zygarde 50", "Zygarde")
        .replace("Wishiwashi Solo", "Wishiwashi")
        .replace("Lycanroc Midday", "Lycanroc")
        .replace("Mimikyu Disguised", "Mimikyu")
        .replace("Minior Red Meteor", "Minior")
        .replace("Toxtricity Amped", "Toxtricity")
        .replace("Indeedee Male", "Indeedee")
        .replace("Morpeko Full Belly", "Morpeko")
        .replace("Urshifu Single Strike", "Urshifu")
        .replace("Eimscue Ice", "Eiscue")
        .replace("Eiscue Ice", "Eiscue")
        .replace("Enamorus Incarnate", "Enamorus")
        .replace("Oinkologne Male", "Oinkologne")
        .replace("Dudunsparce Two Segment", "Dudunsparce")
        .replace("Palafin Zero", "Palafin")
        .replace("Tatsugiri Curly", "Tatsugiri")
        .replace("Maushold Family Of Four", "Maushold")
        .replace("Squawkabilly Green Plumage", "Squawkabilly")
        .replace("Sirfetchd", "Sirfetch'd")
        .trim();
}

function decodeGen1String(bytes) {
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (b === 0x50 || b === 0x00) break; 
        if (b >= 0x80 && b <= 0x99) {
            str += String.fromCharCode("A".charCodeAt(0) + (b - 0x80));
        } else if (b >= 0xA0 && b <= 0xB9) {
            str += String.fromCharCode("a".charCodeAt(0) + (b - 0xA0));
        } else if (b >= 0xF2 && b <= 0xFB) {
            str += String.fromCharCode("0".charCodeAt(0) + (b - 0xF2));
        } else if (b === 0xE1) {
            str += "PK";
        } else if (b === 0xE2) {
            str += "MN";
        } else if (b === 0xE3) {
            str += "-";
        } else if (b === 0xE6) {
            str += "?";
        } else if (b === 0xE7) {
            str += "!";
        } else if (b === 0x7F) {
            str += " ";
        } else {
            str += "";
        }
    }
    return str.trim();
}

function decodeGen3String(bytes) {
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (b === 0xFF) break;
        if (b === 0x00) {
            str += " ";
        } else if (b >= 0xBB && b <= 0xD4) {
            str += String.fromCharCode("A".charCodeAt(0) + (b - 0xBB));
        } else if (b >= 0xD5 && b <= 0xEE) {
            str += String.fromCharCode("a".charCodeAt(0) + (b - 0xD5));
        } else if (b >= 0xA1 && b <= 0xAA) {
            str += String.fromCharCode("0".charCodeAt(0) + (b - 0xA1));
        } else if (b === 0x5A) {
            str += "♂";
        } else if (b === 0x5B) {
            str += "♀";
        } else if (b === 0xF0) {
            str += ":";
        } else if (b === 0xE1) {
            str += "PK";
        } else if (b === 0xE2) {
            str += "MN";
        } else if (b === 0xB5) {
            str += "e";
        } else if (b === 0x1B || b === 0x1C) {
            str += "é";
        } else if (b === 0x7F) {
            str += " ";
        }
    }
    return str.trim();
}

function decodeUTF16String(uint16Array) {
    let str = "";
    for (let i = 0; i < uint16Array.length; i++) {
        const val = uint16Array[i];
        if (val === 0xFFFF || val === 0x0000) break;
        if (val === 0x2642) {
            str += "♂";
        } else if (val === 0x2640) {
            str += "♀";
        } else {
            str += String.fromCharCode(val);
        }
    }
    return str.trim();
}

function parseGen1Save(buffer) {
    const u8 = new Uint8Array(buffer);
    const parsedList = [];

    // Parse Team (offset 0x2F2C)
    const teamCount = u8[0x2F2C];
    if (teamCount > 0 && teamCount <= 6) {
        for (let i = 0; i < teamCount; i++) {
            const internalId = u8[0x2F2D + i];
            const pokedexId = GEN1_INTERNAL_TO_DEX[internalId];
            if (!pokedexId) continue;
            
            const structOffset = 0x2F34 + (i * 44);
            const level = u8[structOffset + 33];
            
            const nickOffset = 0x307E + (i * 11);
            const nickBytes = u8.subarray(nickOffset, nickOffset + 11);
            const nickname = decodeGen1String(nickBytes);
            
            const otId = u8[structOffset + 12] * 256 + u8[structOffset + 13];
            const otOffset = 0x303C + (i * 11);
            const otName = decodeGen1String(u8.subarray(otOffset, otOffset + 11));
            
            const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || "Desconhecido");
            
            parsedList.push({
                sourceSlot: `Equipa Gen 1 #${i+1}`,
                pokedexId,
                species: speciesName,
                nickname: nickname || speciesName,
                level: level || 5,
                otName: otName,
                otId: otId,
                saveMeta: {
                    gen: 1,
                    isParty: true,
                    structOffset: structOffset,
                    index: i
                }
            });
        }
    }

    // Parse Active Box (offset 0x30C0)
    const boxCount = u8[0x30C0];
    if (boxCount > 0 && boxCount <= 20) {
        for (let i = 0; i < boxCount; i++) {
            const internalId = u8[0x30C1 + i];
            const pokedexId = GEN1_INTERNAL_TO_DEX[internalId];
            if (!pokedexId) continue;
            
            const structOffset = 0x30D6 + (i * 33);
            const level = u8[structOffset + 3];
            
            const nickOffset = 0x3446 + (i * 11);
            const nickBytes = u8.subarray(nickOffset, nickOffset + 11);
            const nickname = decodeGen1String(nickBytes);
            
            const otId = u8[structOffset + 12] * 256 + u8[structOffset + 13];
            const otOffset = 0x336A + (i * 11);
            const otName = decodeGen1String(u8.subarray(otOffset, otOffset + 11));
            
            const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || "Desconhecido");
            
            parsedList.push({
                sourceSlot: `Box Ativa Gen 1 #${i+1}`,
                pokedexId,
                species: speciesName,
                nickname: nickname || speciesName,
                level: level || 5,
                otName: otName,
                otId: otId,
                saveMeta: {
                    gen: 1,
                    isParty: false,
                    structOffset: structOffset,
                    index: i
                }
            });
        }
    }

    return parsedList;
}

function parseGen2Save(buffer) {
    const u8 = new Uint8Array(buffer);
    const parsedList = [];
    
    let count = 0;
    let isCrystal = false;
    
    const countGS = u8[0x2D0C];
    const countCrystal = u8[0x2D82];
    
    if (countCrystal >= 1 && countCrystal <= 6) {
        count = countCrystal;
        isCrystal = true;
    } else if (countGS >= 1 && countGS <= 6) {
        count = countGS;
        isCrystal = false;
    } else {
        return [];
    }
    
    const listOffset = isCrystal ? 0x2D83 : 0x2D0D;
    const structStart = isCrystal ? 0x2D8A : 0x2D14;
    const nickStart = isCrystal ? 0x2EEC : 0x2E76;
    
    for (let i = 0; i < count; i++) {
        const pokedexId = u8[listOffset + i];
        if (pokedexId === 0 || pokedexId > 251) continue;
        
        const structOffset = structStart + (i * 48);
        const level = u8[structOffset + 32];
        
        const nickOffset = nickStart + (i * 11);
        const nickBytes = u8.subarray(nickOffset, nickOffset + 11);
        const nickname = decodeGen1String(nickBytes);
        
        const otId = u8[structOffset + 6] * 256 + u8[structOffset + 7];
        const otStart = isCrystal ? 0x2EAA : 0x2E34;
        const otOffset = otStart + (i * 11);
        const otName = decodeGen1String(u8.subarray(otOffset, otOffset + 11));
        
        const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || `Species #${pokedexId}`);
        
        parsedList.push({
            sourceSlot: isCrystal ? `Equipa Crystal #${i+1}` : `Equipa Gold/Silver #${i+1}`,
            pokedexId,
            species: speciesName,
            nickname: nickname || speciesName,
            level: level || 5,
            otName: otName,
            otId: otId,
            saveMeta: {
                gen: 2,
                isCrystal: isCrystal,
                isParty: true,
                structOffset: structOffset,
                index: i
            }
        });
    }
    
    return parsedList;
}

function parseGen3Save(buffer) {
    const u8 = new Uint8Array(buffer);
    
    let maxSaveIndex0 = -1;
    let maxSaveIndex1 = -1;
    const numSectors = Math.floor(u8.length / 4096);
    
    for (let i = 0; i < 14 && i < numSectors; i++) {
        const offset = i * 4096;
        const sig = u8[offset + 0x0FF8] | (u8[offset + 0x0FF9] << 8) | (u8[offset + 0x0FFA] << 16) | (u8[offset + 0x0FFB] << 24);
        if (sig === 0x08012025) {
            const saveIndex = u8[offset + 0x0FFC] | (u8[offset + 0x0FFD] << 8) | (u8[offset + 0x0FFE] << 16) | (u8[offset + 0x0FFF] << 24);
            if (saveIndex > maxSaveIndex0) maxSaveIndex0 = saveIndex;
        }
    }
    
    if (numSectors >= 28) {
        for (let i = 14; i < 28; i++) {
            const offset = i * 4096;
            const sig = u8[offset + 0x0FF8] | (u8[offset + 0x0FF9] << 8) | (u8[offset + 0x0FFA] << 16) | (u8[offset + 0x0FFB] << 24);
            if (sig === 0x08012025) {
                const saveIndex = u8[offset + 0x0FFC] | (u8[offset + 0x0FFD] << 8) | (u8[offset + 0x0FFE] << 16) | (u8[offset + 0x0FFF] << 24);
                if (saveIndex > maxSaveIndex1) maxSaveIndex1 = saveIndex;
            }
        }
    }
    
    let activeSlotStartSector = 0;
    if (numSectors >= 28 && maxSaveIndex1 > maxSaveIndex0) {
        activeSlotStartSector = 14;
    }
    
    const activeSectors = {};
    for (let i = 0; i < 14; i++) {
        const sectorIndex = activeSlotStartSector + i;
        const offset = sectorIndex * 4096;
        const sig = u8[offset + 0x0FF8] | (u8[offset + 0x0FF9] << 8) | (u8[offset + 0x0FFA] << 16) | (u8[offset + 0x0FFB] << 24);
        if (sig === 0x08012025) {
            const sectionId = u8[offset + 0x0FF4];
            activeSectors[sectionId] = u8.subarray(offset, offset + 4096);
        }
    }
    
    if (!activeSectors[1]) {
        return [];
    }
    
    const section1 = activeSectors[1];
    
    let teamCount = 0;
    let listOffset = 0;
    
    const countRSE = section1[0x0234] | (section1[0x0235] << 8) | (section1[0x0236] << 16) | (section1[0x0237] << 24);
    const countFRLG = section1[0x0034] | (section1[0x0035] << 8) | (section1[0x0036] << 16) | (section1[0x0037] << 24);
    
    if (countRSE >= 1 && countRSE <= 6) {
        teamCount = countRSE;
        listOffset = 0x0238;
    } else if (countFRLG >= 1 && countFRLG <= 6) {
        teamCount = countFRLG;
        listOffset = 0x0038;
    } else {
        teamCount = countRSE;
        listOffset = 0x0238;
    }
    
    const parsedList = [];
    
    for (let i = 0; i < teamCount; i++) {
        const structOffset = listOffset + (i * 100);
        if (structOffset + 100 > section1.length) break;
        
        const pid = section1[structOffset] |
                    (section1[structOffset + 1] << 8) |
                    (section1[structOffset + 2] << 16) |
                    (section1[structOffset + 3] << 24);
                    
        const otid = section1[structOffset + 4] |
                     (section1[structOffset + 5] << 8) |
                     (section1[structOffset + 6] << 16) |
                     (section1[structOffset + 7] << 24);
                     
        const nickBytes = section1.subarray(structOffset + 8, structOffset + 18);
        const nickname = decodeGen3String(nickBytes);
        
        const key = pid ^ otid;
        const decryptedWords = new Uint32Array(12);
        for (let j = 0; j < 12; j++) {
            const wordOffset = structOffset + 0x20 + j * 4;
            const encryptedWord = section1[wordOffset] |
                                  (section1[wordOffset + 1] << 8) |
                                  (section1[wordOffset + 2] << 16) |
                                  (section1[wordOffset + 3] << 24);
            decryptedWords[j] = encryptedWord ^ key;
        }
        
        const decryptedBytes = new Uint8Array(decryptedWords.buffer);
        const shuffleIndex = pid % 24;
        const order = blockOrders[shuffleIndex];
        
        let blockG = null;
        for (let b = 0; b < 4; b++) {
            const blockType = order[b];
            if (blockType === 0) {
                blockG = decryptedBytes.subarray(b * 12, b * 12 + 12);
                break;
            }
        }
        
        if (!blockG) continue;
        
        const pokedexId = blockG[0] | (blockG[1] << 8);
        if (pokedexId === 0 || pokedexId > 386) continue;
        
        const level = section1[structOffset + 84];
        const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || `Species #${pokedexId}`);
        
        const otId = otid & 0xFFFF;
        const otNameBytes = section1.subarray(structOffset + 20, structOffset + 20 + 7);
        const otName = decodeGen3String(otNameBytes);
        
        parsedList.push({
            sourceSlot: `Equipa GBA #${i+1}`,
            pokedexId,
            species: speciesName,
            nickname: nickname || speciesName,
            level: level || 5,
            otName: otName,
            otId: otId,
            saveMeta: {
                gen: 3,
                isParty: true,
                structOffset: structOffset,
                index: i,
                pid: pid,
                otid: otid,
                shuffleIndex: shuffleIndex
            }
        });
    }
    
    return parsedList;
}

function parseGen4Gen5Save(buffer) {
    const u8 = new Uint8Array(buffer);
    const parsedList = [];
    const seenPids = new Set();
    
    const limit = u8.length - 136;
    for (let offset = 0; offset <= limit; offset += 2) {
        const pid = u8[offset] | (u8[offset + 1] << 8) | (u8[offset + 2] << 16) | (u8[offset + 3] << 24);
        if (pid === 0) continue;
        if (seenPids.has(pid)) continue;
        
        const checksum = u8[offset + 6] | (u8[offset + 7] << 8);
        if (checksum === 0 || checksum === 0xFFFF) continue;
        
        let seed = checksum;
        const decryptedWords = new Uint16Array(64);
        let sum = 0;
        for (let j = 0; j < 64; j++) {
            const encryptedWord = u8[offset + 8 + j * 2] | (u8[offset + 9 + j * 2] << 8);
            seed = (Math.imul(seed, 1103515245) + 24691) | 0;
            const key = (seed >>> 16) & 0xFFFF;
            const dec = encryptedWord ^ key;
            decryptedWords[j] = dec;
            sum = (sum + dec) & 0xFFFF;
        }
        
        if (sum === checksum) {
            const shuffleIndex = ((pid & 0x3E000) >>> 13) % 24;
            const order = blockOrders[shuffleIndex];
            
            const blockA = new Uint16Array(16);
            const blockC = new Uint16Array(16);
            const blockD = new Uint16Array(16);
            
            for (let b = 0; b < 4; b++) {
                const targetBlock = order[b];
                let dest = null;
                if (targetBlock === 0) dest = blockA;
                else if (targetBlock === 2) dest = blockC;
                else if (targetBlock === 3) dest = blockD;
                
                if (dest) {
                    for (let w = 0; w < 16; w++) {
                        dest[w] = decryptedWords[b * 16 + w];
                    }
                }
            }
            
            const pokedexId = blockA[0];
            if (pokedexId === 0 || pokedexId > 649) continue;
            
            const exp = blockA[4] | (blockA[5] << 16);
            const otId = blockA[2];
            const nickname = decodeUTF16String(blockC.subarray(0, 11));
            const otName = decodeUTF16String(blockD.subarray(4, 12));
            
            let level = Math.max(1, Math.min(100, Math.round(Math.pow(exp, 1/3))));
            let isParty = false;
            
            if (offset + 236 <= u8.length) {
                const l = u8[offset + 140];
                if (l >= 1 && l <= 100) {
                    level = l;
                    isParty = true;
                }
            }
            
            const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || `Species #${pokedexId}`);
            
            parsedList.push({
                sourceSlot: isParty ? `Equipa (Gen 4/5)` : `Box (Gen 4/5)`,
                pokedexId,
                species: speciesName,
                nickname: nickname || speciesName,
                level: level,
                otName: otName,
                otId: otId
            });
            
            seenPids.add(pid);
        }
    }
    
    return parsedList;
}

function parseDecryptedPKM(buffer, fileName) {
    const size = buffer.byteLength;
    const u8 = new Uint8Array(buffer);
    const u16 = new Uint16Array(buffer);
    const u32 = new Uint32Array(buffer);
    
    let pokedexId = 0;
    let exp = 0;
    let nickname = "";
    let level = 5;
    let sourceSlot = "Ficheiro PKM";
    let otId = 0;
    let otName = "";
    
    if (size === 100) {
        // PK3
        pokedexId = u16[32 / 2];
        const nickBytes = u8.subarray(8, 18);
        nickname = decodeGen3String(nickBytes);
        level = u8[84] || 5;
        sourceSlot = "Ficheiro PK3 Decifrado";
        
        otId = u16[4 / 2];
        const otNameBytes = u8.subarray(20, 27);
        otName = decodeGen3String(otNameBytes);
    } else if (size === 136 || size === 220 || size === 236) {
        // PK4 / PK5
        pokedexId = u16[8 / 2];
        exp = u32[16 / 4];
        const nickWords = u16.subarray(72 / 2, 72 / 2 + 11);
        nickname = decodeUTF16String(nickWords);
        
        otId = u16[12 / 2];
        const otWords = u16.subarray(112 / 2, 112 / 2 + 8);
        otName = decodeUTF16String(otWords);
        
        if (size === 236) {
            level = u8[140] || 5;
        } else {
            level = Math.max(1, Math.min(100, Math.round(Math.pow(exp, 1/3))));
        }
        sourceSlot = `Ficheiro PK${size === 236 ? '4/5 Party' : '4/5 Box'}`;
    } else if (size === 232 || size === 260) {
        // PK6 / PK7
        pokedexId = u16[0x08 / 2];
        exp = u32[0x10 / 4];
        const nickWords = u16.subarray(0x40 / 2, 0x40 / 2 + 12);
        nickname = decodeUTF16String(nickWords);
        
        otId = u16[0x0C / 2];
        const otWords = u16.subarray(176 / 2, 176 / 2 + 12);
        otName = decodeUTF16String(otWords);
        
        if (size === 260) {
            level = u8[240];
        } else {
            level = Math.max(1, Math.min(100, Math.round(Math.pow(exp, 1/3))));
        }
        sourceSlot = `Ficheiro PK${size === 232 ? '6/7 Box' : '6/7 Party'}`;
    } else if (size === 328 || size === 344) {
        // PK8 / PK9
        pokedexId = u16[0x08 / 2];
        exp = u32[0x10 / 4];
        const nickWords = u16.subarray(0x58 / 2, 0x58 / 2 + 12);
        nickname = decodeUTF16String(nickWords);
        
        otId = u16[0x0C / 2];
        const otWords = u16.subarray(248 / 2, 248 / 2 + 12);
        otName = decodeUTF16String(otWords);
        
        level = Math.max(1, Math.min(100, Math.round(Math.pow(exp, 1/3))));
        sourceSlot = `Ficheiro PK${size === 328 ? '8' : '9'}`;
    } else {
        return null;
    }
    
    if (pokedexId === 0 || pokedexId > 1025) {
        return null;
    }
    
    const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || `Species #${pokedexId}`);
    
    return [{
        sourceSlot: sourceSlot,
        pokedexId,
        species: speciesName,
        nickname: nickname || speciesName,
        level: level,
        otName: otName,
        otId: otId
    }];
}

function parseGen8Gen9Save(buffer) {
    const u8 = new Uint8Array(buffer);
    const size = buffer.byteLength;
    
    let pkLen = 328;
    if (size > 2000000) {
        pkLen = 344;
    }
    
    const parsedList = [];
    const totalSlots = 960;
    const blockLen = totalSlots * pkLen;
    let bestOffset = -1;
    
    for (let offset = 0; offset <= size - blockLen; offset += 8) {
        let validOrZeroCount = 0;
        let nonZeroCount = 0;
        
        for (let i = 0; i < totalSlots; i++) {
            const slotStart = offset + (i * pkLen);
            let isZero = true;
            for (let j = 0; j < pkLen; j++) {
                if (u8[slotStart + j] !== 0) {
                    isZero = false;
                    break;
                }
            }
            
            if (isZero) {
                validOrZeroCount++;
            } else {
                if (isValidPKMRecord(buffer, slotStart, pkLen)) {
                    validOrZeroCount++;
                    nonZeroCount++;
                } else {
                    break;
                }
            }
        }
        
        if (validOrZeroCount === totalSlots && nonZeroCount > 0) {
            bestOffset = offset;
            break;
        }
    }
    
    if (bestOffset !== -1) {
        for (let i = 0; i < totalSlots; i++) {
            const slotStart = bestOffset + (i * pkLen);
            let isZero = true;
            for (let j = 0; j < pkLen; j++) {
                if (u8[slotStart + j] !== 0) {
                    isZero = false;
                    break;
                }
            }
            if (isZero) continue;
            
            const pkBuffer = buffer.slice(slotStart, slotStart + pkLen);
            const parsed = parseDecryptedPKM(pkBuffer, `Slot ${i + 1}`);
            if (parsed && parsed.length > 0) {
                const boxNum = Math.floor(i / 30) + 1;
                const slotNum = (i % 30) + 1;
                parsed[0].sourceSlot = `Caixa ${boxNum} Slot ${slotNum}`;
                parsedList.push(parsed[0]);
            }
        }
    }
    
    return parsedList;
}

function isValidPKMRecord(buffer, start, len) {
    const u16 = new Uint16Array(buffer, start, len / 2);
    const u32 = new Uint32Array(buffer, start, len / 4);
    
    const pokedexId = u16[4];
    const exp = u32[4];
    
    if (pokedexId === 0 || pokedexId > 1025) return false;
    if (exp > 1640000) return false;
    
    const nickWords = u16.subarray(44, 44 + 12);
    const nickname = decodeUTF16String(nickWords);
    
    for (let j = 0; j < nickname.length; j++) {
        const charCode = nickname.charCodeAt(j);
        if (charCode < 32 || (charCode > 126 && charCode < 160)) {
            if (charCode !== 0x2642 && charCode !== 0x2640) {
                return false;
            }
        }
    }
    
    return true;
}

function populateBulkImportSelectors() {
    const gameSelect = document.getElementById("bulk-import-game");
    const trainerSelect = document.getElementById("bulk-import-trainer");
    if (!gameSelect || !trainerSelect) return;
    
    gameSelect.innerHTML = GAMES_DB.map(g => `<option value="${g.id}" ${g.id === currentGameId ? 'selected' : ''}>${g.name}</option>`).join("");
    updateBulkTrainers(gameSelect.value);
}

function updateBulkTrainers(gameId) {
    const trainerSelect = document.getElementById("bulk-import-trainer");
    if (!trainerSelect) return;
    
    const gameTrainers = trainersList.filter(t => t.gameId === gameId);
    trainerSelect.innerHTML = gameTrainers.map(t => {
        const display = t.tid !== "00000" && t.tid ? `${t.name} (${t.tid})` : t.name;
        return `<option value="${t.id}">${display}</option>`;
    }).join("");
}

function applyBulkSettings() {
    const gameSelect = document.getElementById("bulk-import-game");
    const trainerSelect = document.getElementById("bulk-import-trainer");
    if (!gameSelect || !trainerSelect) return;
    
    const targetGameId = gameSelect.value;
    const targetTrainerId = trainerSelect.value;
    
    const gameSelects = document.querySelectorAll(".import-row-game");
    const trainerSelects = document.querySelectorAll(".import-row-trainer");
    
    gameSelects.forEach(sel => {
        sel.value = targetGameId;
        const idx = parseInt(sel.getAttribute("data-idx"));
        updateImportRowTrainers(idx, targetGameId);
    });
    
    trainerSelects.forEach(sel => {
        sel.value = targetTrainerId;
    });
}

function openSaveImportModal() {
    const modal = document.getElementById("save-import-modal");
    if (!modal) return;
    
    document.getElementById("save-file-input").value = "";
    document.getElementById("save-file-name").textContent = "Nenhum ficheiro selecionado";
    document.getElementById("save-import-results").style.display = "none";
    document.getElementById("save-import-tbody").innerHTML = "";
    tempImportList = [];
    
    modal.classList.add("active");
}

function closeSaveImportModal() {
    const modal = document.getElementById("save-import-modal");
    if (modal) modal.classList.remove("active");
}

function handleSaveFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    document.getElementById("save-file-name").textContent = file.name;
    
    const r = new FileReader();
    r.onload = function(evt) {
        try {
            const buffer = evt.target.result;
            const size = buffer.byteLength;
            const u8 = new Uint8Array(buffer);
            let parsed = [];
            
            let detectedGen = 0;
            let isCrystal = false;
            let activeSlotStartSector = 0;
            
            // Check individual files (PK3/4/5/6/7/8/9) first
            if (size === 100 || size === 136 || size === 220 || size === 232 || size === 236 || size === 260 || size === 328 || size === 344) {
                parsed = parseDecryptedPKM(buffer, file.name);
                detectedGen = 0;
            } else if (size >= 32000 && size <= 35000) {
                parsed = parseGen1Save(buffer);
                if (parsed && parsed.length > 0) {
                    detectedGen = 1;
                } else {
                    parsed = parseGen2Save(buffer);
                    if (parsed && parsed.length > 0) {
                        detectedGen = 2;
                        const countCrystal = u8[0x2D82];
                        if (countCrystal >= 1 && countCrystal <= 6) {
                            isCrystal = true;
                        }
                    }
                }
            } else if ((size >= 120000 && size <= 140000) || (size >= 60000 && size <= 70000)) {
                parsed = parseGen3Save(buffer);
                if (parsed && parsed.length > 0) {
                    detectedGen = 3;
                    let maxSaveIndex0 = -1;
                    let maxSaveIndex1 = -1;
                    const numSectors = Math.floor(u8.length / 4096);
                    for (let i = 0; i < 14 && i < numSectors; i++) {
                        const offset = i * 4096;
                        const sig = u8[offset + 0x0FF8] | (u8[offset + 0x0FF9] << 8) | (u8[offset + 0x0FFA] << 16) | (u8[offset + 0x0FFB] << 24);
                        if (sig === 0x08012025) {
                            const saveIndex = u8[offset + 0x0FFC] | (u8[offset + 0x0FFD] << 8) | (u8[offset + 0x0FFE] << 16) | (u8[offset + 0x0FFF] << 24);
                            if (saveIndex > maxSaveIndex0) maxSaveIndex0 = saveIndex;
                        }
                    }
                    if (numSectors >= 28) {
                        for (let i = 14; i < 28; i++) {
                            const offset = i * 4096;
                            const sig = u8[offset + 0x0FF8] | (u8[offset + 0x0FF9] << 8) | (u8[offset + 0x0FFA] << 16) | (u8[offset + 0x0FFB] << 24);
                            if (sig === 0x08012025) {
                                const saveIndex = u8[offset + 0x0FFC] | (u8[offset + 0x0FFD] << 8) | (u8[offset + 0x0FFE] << 16) | (u8[offset + 0x0FFF] << 24);
                                if (saveIndex > maxSaveIndex1) maxSaveIndex1 = saveIndex;
                            }
                        }
                    }
                    if (numSectors >= 28 && maxSaveIndex1 > maxSaveIndex0) {
                        activeSlotStartSector = 14;
                    }
                }
            } else if (size >= 500000 && size <= 550000) {
                parsed = parseGen4Gen5Save(buffer);
                detectedGen = 4;
            } else if (size >= 900000 && size <= 4800000) {
                parsed = parseGen8Gen9Save(buffer);
                detectedGen = 8;
            } else {
                alert(`Tamanho de ficheiro não reconhecido (${size} bytes). Apenas saves de cartucho (~32KB, ~128KB, ~512KB), saves de Switch (~1MB-4.5MB) ou ficheiros individuais descodificados (PKM) são suportados.`);
                return;
            }
            
            if (!parsed || parsed.length === 0) {
                alert("Não foi possível encontrar nenhum Pokémon no ficheiro de save ou o formato não é suportado.");
                return;
            }
            
            // Grava variáveis do save para a sessão de edição
            uploadedSaveBuffer = buffer;
            uploadedSaveName = file.name;
            uploadedSaveGen = detectedGen;
            uploadedSaveIsCrystal = isCrystal;
            uploadedSaveActiveSectorStart = activeSlotStartSector;
            
            const exportBtn = document.getElementById("btn-export-modified-save");
            if (exportBtn) {
                exportBtn.style.display = (detectedGen >= 1 && detectedGen <= 3) ? "block" : "none";
            }
            
            // Auto-register any new trainers found in the save
            let trainersChanged = false;
            parsed.forEach(p => {
                if (p.otName) {
                    const cleanOt = p.otName.toLowerCase().trim();
                    const formattedOtId = p.otId !== undefined && p.otId !== null ? String(p.otId).padStart(5, '0') : "00000";
                    
                    const exists = trainersList.some(t => {
                        if (t.gameId !== currentGameId) return false;
                        if (t.name.toLowerCase().trim() !== cleanOt) return false;
                        const cleanTid = String(t.tid || "").padStart(5, '0');
                        return cleanTid === formattedOtId;
                    });
                    
                    if (!exists) {
                        const newTrainerId = "trainer_" + currentGameId + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
                        trainersList.push({
                            id: newTrainerId,
                            gameId: currentGameId,
                            name: p.otName,
                            tid: formattedOtId,
                            sid: "00000"
                        });
                        trainersChanged = true;
                    }
                }
            });
            if (trainersChanged) {
                localStorage.setItem("bb_trainers", JSON.stringify(trainersList));
                updateTrainerSelect();
            }
            
            tempImportList = parsed;
            populateBulkImportSelectors();
            renderSaveImportList();
            document.getElementById("save-import-results").style.display = "block";
        } catch (err) {
            alert("Erro ao ler ficheiro de save: " + err.message);
        }
    };
    r.readAsArrayBuffer(file);
}

function renderSaveImportList() {
    const tbody = document.getElementById("save-import-tbody");
    if (!tbody) return;
    
    tbody.innerHTML = tempImportList.map((p, idx) => {
        let selectedGameId = currentGameId;
        let selectedTrainerId = `trainer_${selectedGameId}_default`;
        
        if (p.otName) {
            const cleanOt = p.otName.toLowerCase().trim();
            const formattedOtId = p.otId !== undefined && p.otId !== null ? String(p.otId).padStart(5, '0') : "00000";
            
            let matchedTrainer = trainersList.find(t => {
                if (t.name.toLowerCase().trim() !== cleanOt) return false;
                const cleanTid = String(t.tid || "").padStart(5, '0');
                return cleanTid === formattedOtId;
            });
            
            if (!matchedTrainer) {
                matchedTrainer = trainersList.find(t => t.name.toLowerCase().trim() === cleanOt);
            }
            
            if (!matchedTrainer) {
                // Auto-create for selectedGameId (currentGameId)
                const newTrainerId = "trainer_" + selectedGameId + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
                matchedTrainer = {
                    id: newTrainerId,
                    gameId: selectedGameId,
                    name: p.otName,
                    tid: formattedOtId,
                    sid: "00000"
                };
                trainersList.push(matchedTrainer);
                localStorage.setItem("bb_trainers", JSON.stringify(trainersList));
                updateTrainerSelect();
            }
            
            selectedGameId = matchedTrainer.gameId;
            selectedTrainerId = matchedTrainer.id;
        }
        
        const gameOptionsHtml = GAMES_DB.map(g => `<option value="${g.id}" ${g.id === selectedGameId ? 'selected' : ''}>${g.name}</option>`).join("");
        const gameTrainers = trainersList.filter(t => t.gameId === selectedGameId);
        const trainerOptionsHtml = gameTrainers.map(t => {
            const display = t.tid !== "00000" && t.tid ? `${t.name} (${t.tid})` : t.name;
            return `<option value="${t.id}" ${t.id === selectedTrainerId ? 'selected' : ''}>${display}</option>`;
        }).join("");
        
        let spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokedexId}.png`;
        
        return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 8px;"><input type="checkbox" class="import-row-checkbox" data-idx="${idx}" checked></td>
                <td style="padding: 8px; color: var(--text-muted); font-size: 0.7rem;">${p.sourceSlot}</td>
                <td style="padding: 8px; display: flex; align-items: center; gap: 6px;">
                    <img src="${spriteUrl}" alt="${p.species}" style="width: 28px; height: 28px;" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">
                    <div>
                        <strong style="color: #fff;">${p.nickname}</strong>
                        <div style="font-size: 0.65rem; color: var(--text-muted);">${p.species}</div>
                    </div>
                </td>
                <td style="padding: 8px; font-weight: bold; color: #fff;">${p.level}</td>
                <td style="padding: 8px;">
                    <select class="import-row-game" data-idx="${idx}" onchange="updateImportRowTrainers(${idx}, this.value)" style="padding: 4px; border-radius: 4px; background: rgba(0,0,0,0.5); color:#fff; border: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; width: 100%;">
                        ${gameOptionsHtml}
                    </select>
                </td>
                <td style="padding: 8px;">
                    <select class="import-row-trainer" id="import-row-trainer-${idx}" style="padding: 4px; border-radius: 4px; background: rgba(0,0,0,0.5); color:#fff; border: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; width: 100%;">
                        ${trainerOptionsHtml}
                    </select>
                </td>
            </tr>
        `;
    }).join("");
}

function updateImportRowTrainers(idx, gameId) {
    const select = document.getElementById(`import-row-trainer-${idx}`);
    if (!select) return;
    
    const p = tempImportList[idx];
    let selectedTrainerId = `trainer_${gameId}_default`;
    
    if (p && p.otName) {
        const cleanOt = p.otName.toLowerCase().trim();
        const formattedOtId = p.otId !== undefined && p.otId !== null ? String(p.otId).padStart(5, '0') : "00000";
        
        let matchedTrainer = trainersList.find(t => {
            if (t.gameId !== gameId) return false;
            if (t.name.toLowerCase().trim() !== cleanOt) return false;
            const cleanTid = String(t.tid || "").padStart(5, '0');
            return cleanTid === formattedOtId;
        });
        
        if (!matchedTrainer) {
            matchedTrainer = trainersList.find(t => t.gameId === gameId && t.name.toLowerCase().trim() === cleanOt);
        }
        
        if (!matchedTrainer) {
            // Dynamically create a trainer profile for this game!
            const newTrainerId = "trainer_" + gameId + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
            matchedTrainer = {
                id: newTrainerId,
                gameId: gameId,
                name: p.otName,
                tid: formattedOtId,
                sid: "00000"
            };
            trainersList.push(matchedTrainer);
            localStorage.setItem("bb_trainers", JSON.stringify(trainersList));
            updateTrainerSelect();
        }
        
        selectedTrainerId = matchedTrainer.id;
    }
    
    const gameTrainers = trainersList.filter(t => t.gameId === gameId);
    const trainerOptionsHtml = gameTrainers.map(t => {
        const display = t.tid !== "00000" && t.tid ? `${t.name} (${t.tid})` : t.name;
        return `<option value="${t.id}" ${t.id === selectedTrainerId ? 'selected' : ''}>${display}</option>`;
    }).join("");
    
    select.innerHTML = trainerOptionsHtml;
}

function toggleSelectAllImport(checked) {
    const checkboxes = document.querySelectorAll(".import-row-checkbox");
    checkboxes.forEach(cb => cb.checked = checked);
}

function toggleAutoRibbons(checked) {
    autoRibbonsEnabled = checked;
    localStorage.setItem("bb_auto_ribbons", checked ? "true" : "false");
}

function applyAutoRibbons(pokemon, targetGameId) {
    if (!pokemon.ribbons) pokemon.ribbons = [];
    const game = GAMES_DB.find(g => g.id === targetGameId);
    if (!game) return;

    // Champion Ribbons based on destination game/generation
    let ribbonToAdd = "";
    if (["ruby", "sapphire", "emerald", "omegaruby", "alphasapphire"].includes(targetGameId)) {
        ribbonToAdd = "champion_hoenn";
    } else if (["diamond", "pearl", "platinum", "brilliantdiamond", "shiningpearl"].includes(targetGameId)) {
        ribbonToAdd = "champion_sinnoh";
    } else if (["heartgold", "soulsilver"].includes(targetGameId)) {
        ribbonToAdd = "legend"; // Red Defeat Ribbon in HGSS
    } else if (["x", "y"].includes(targetGameId)) {
        ribbonToAdd = "champion_kalos";
    } else if (["sun", "moon", "ultrasun", "ultramoon"].includes(targetGameId)) {
        ribbonToAdd = "champion_alola";
    } else if (["sword", "shield"].includes(targetGameId)) {
        ribbonToAdd = "champion_galar";
    } else if (targetGameId === "legendsarceus") {
        ribbonToAdd = "pioneer_hisui";
    } else if (["scarlet", "violet"].includes(targetGameId)) {
        ribbonToAdd = "champion_paldea";
    }

    if (ribbonToAdd && !pokemon.ribbons.includes(ribbonToAdd)) {
        pokemon.ribbons.push(ribbonToAdd);
    }

    // Level 100 Ribbons
    if (pokemon.level === 100) {
        if (game.gen >= 4) {
            if (!pokemon.ribbons.includes("footprint")) {
                pokemon.ribbons.push("footprint");
            }
        } else if (game.gen === 3) {
            if (!pokemon.ribbons.includes("effort")) {
                pokemon.ribbons.push("effort");
            }
        }
    }
}

function executeSaveImport() {
    const checkboxes = document.querySelectorAll(".import-row-checkbox");
    let count = 0;
    
    checkboxes.forEach(cb => {
        if (cb.checked) {
            const idx = parseInt(cb.getAttribute("data-idx"));
            const p = tempImportList[idx];
            if (!p) return;
            
            const gameSelect = document.querySelector(`.import-row-game[data-idx="${idx}"]`);
            const trainerSelect = document.getElementById(`import-row-trainer-${idx}`);
            
            const targetGameId = gameSelect ? gameSelect.value : currentGameId;
            const targetTrainerId = trainerSelect ? trainerSelect.value : `trainer_${targetGameId}_default`;
            
            const isParty = p.saveMeta && p.saveMeta.isParty === true;
            const slotType = isParty ? "team" : "box";
            const slotIndex = isParty ? (p.saveMeta.index !== undefined ? p.saveMeta.index : 0) : 0;
            
            const newPokemon = {
                id: "pkmn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
                pokedexId: p.pokedexId,
                species: p.species,
                nickname: p.nickname,
                level: p.level,
                isShiny: p.isShiny || false,
                gender: p.gender || "⚲",
                nature: p.nature || "",
                ability: p.ability || "",
                type1: p.type1 || "normal",
                type2: p.type2 || "",
                moves: p.moves || [],
                ribbons: p.ribbons || [],
                ivs: p.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
                evs: p.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
                currentGame: targetGameId,
                trainerId: targetTrainerId,
                slotType: slotType,
                slotIndex: slotIndex,
                history: [],
                notes: `Importado do ficheiro de save.`,
                saveMeta: p.saveMeta || null
            };
            
            // Auto-Stamp ribbons if enabled
            if (autoRibbonsEnabled) {
                const isParty = p.sourceSlot && (
                    p.sourceSlot.includes("Equipa") || 
                    p.sourceSlot.includes("Party") || 
                    p.sourceSlot.includes("Equipa GBA")
                );
                if (isParty) {
                    applyAutoRibbons(newPokemon, targetGameId);
                }
            }
            
            pokemonDatabase.push(newPokemon);
            count++;
        }
    });
    
    if (count > 0) {
        cleanupDuplicates();
        localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
        renderAll();
        closeSaveImportModal();
        alert(`Sucesso! ${count} Pokémon foram importados em massa para os respetivos cartuchos/treinadores.`);
    } else {
        alert("Nenhum Pokémon selecionado para importação.");
    }
}

async function fetchPokemonTypes(sp) {
    if (!sp) return; 
    const cl = sp.toLowerCase().trim()
        .replace(/[\s']/g, "-")
        .replace(/\./g, "")
        .replace(/-+$/, "");
    if (SPECIES_TYPE_CACHE[cl]) { 
        applyTypes(SPECIES_TYPE_CACHE[cl]); 
        return; 
    }
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cl}`);
        if (res.ok) { 
            const d = await res.json(); 
            const t = { 
                t1: d.types[0].type.name, 
                t2: d.types[1] ? d.types[1].type.name : "" 
            }; 
            SPECIES_TYPE_CACHE[cl] = t; 
            applyTypes(t); 
        }
    } catch (e) {}
}

function applyTypes(t) { 
    document.getElementById("form-type1").value = t.t1; 
    document.getElementById("form-type2").value = t.t2; 
}

async function loadSpeciesDatalist() {
    try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
        if (res.ok) { 
            const d = await res.json(); 
            document.getElementById("species-list").innerHTML = d.results.map(p => {
                const nameFormatted = p.name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                return `<option value="${nameFormatted}"></option>`;
            }).join(""); 
        }
    } catch (e) {}
}

// --- SECTION SCREENSHOT COMPRESSION & UPLOAD ---
function handleHofUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

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
            
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
            
            saveHofImage(currentGameId, compressedBase64)
                .then(() => {
                    renderAll();
                })
                .catch(err => {
                    console.error("Erro ao gravar HOF no IndexedDB:", err);
                    alert("Falha ao salvar imagem do Hall of Fame.");
                });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
// ----------------------------------------------

function cleanupDuplicates() {
    if (!Array.isArray(pokemonDatabase) || pokemonDatabase.length === 0) return;
    
    // Filter out null/undefined/invalid items first
    pokemonDatabase = pokemonDatabase.filter(p => p !== null && p !== undefined && typeof p === 'object');
    if (pokemonDatabase.length === 0) return;
    
    // 1. Remove entries with duplicate IDs (keeping the first one, or the one in the team)
    const seenIds = new Set();
    const uniqueList = [];
    
    // Sort team members first to make sure if there is a duplicate ID, we keep the team version
    const sortedDb = [...pokemonDatabase].sort((a, b) => {
        const aVal = (a && a.slotType === "team") ? 1 : 0;
        const bVal = (b && b.slotType === "team") ? 1 : 0;
        return bVal - aVal;
    });

    for (const p of sortedDb) {
        if (!p.id) {
            p.id = "pkmn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
        }
        if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            uniqueList.push(p);
        }
    }
    
    pokemonDatabase = uniqueList;
    
    // 2. Remove duplicates by same attributes where one is team and one is box
    const teamPokemon = pokemonDatabase.filter(p => p.slotType === "team");
    const boxPokemon = pokemonDatabase.filter(p => p.slotType === "box");
    
    const idsToRemove = new Set();
    for (const tp of teamPokemon) {
        for (const bp of boxPokemon) {
            if (tp.id !== bp.id &&
                tp.species === bp.species &&
                (tp.nickname || "") === (bp.nickname || "") &&
                tp.level === bp.level &&
                tp.currentGame === bp.currentGame) {
                idsToRemove.add(bp.id);
            }
        }
    }
    
    if (idsToRemove.size > 0) {
        pokemonDatabase = pokemonDatabase.filter(p => !idsToRemove.has(p.id));
        console.log(`blackbox: Removed ${idsToRemove.size} duplicate specimens from the box.`);
    }
    
    localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
}

function toggleSelectionMode() {
    selectionMode = !selectionMode;
    const btn = document.getElementById("btn-toggle-select-mode");
    const bar = document.getElementById("multi-action-bar");
    
    if (selectionMode) {
        btn.innerText = "✕ Sair da Seleção";
        btn.classList.add("btn-danger");
        bar.classList.add("active");
        selectedPokemonIds.clear();
        updateFabSelectedCount();
        
        // Populate game select in fab
        const gameOptions = GAMES_DB.map(g => `<option value="${g.id}">${g.name} (Gen ${g.gen})</option>`).join("");
        document.getElementById("fab-transfer-game").innerHTML = gameOptions;
    } else {
        btn.innerText = "✅ Seleção Múltipla";
        btn.classList.remove("btn-danger");
        bar.classList.remove("active");
        selectedPokemonIds.clear();
        
        // Remove selection classes
        document.querySelectorAll(".slot.selected-specimen").forEach(el => {
            el.classList.remove("selected-specimen");
        });
    }
}

function toggleSpecimenSelection(id) {
    const slotEl = document.querySelector(`.slot[data-id="${id}"]`);
    if (selectedPokemonIds.has(id)) {
        selectedPokemonIds.delete(id);
        if (slotEl) slotEl.classList.remove("selected-specimen");
    } else {
        selectedPokemonIds.add(id);
        if (slotEl) slotEl.classList.add("selected-specimen");
    }
    updateFabSelectedCount();
}

function updateFabSelectedCount() {
    const count = selectedPokemonIds.size;
    document.getElementById("fab-selected-count").innerText = `${count} Pokémon selecionados`;
    
    // Disable/enable action buttons based on selection count
    const buttons = document.querySelectorAll("#multi-action-bar button");
    buttons.forEach(btn => {
        if (btn.innerText.includes("Cancelar")) return;
        btn.disabled = count === 0;
    });
}

function executeMassTransfer() {
    const count = selectedPokemonIds.size;
    if (count === 0) return;
    
    const targetGameId = document.getElementById("fab-transfer-game").value;
    const targetGameName = GAMES_DB.find(g => g.id === targetGameId)?.name || targetGameId;
    
    if (!confirm(`Tens a certeza que queres migrar os ${count} Pokémon selecionados para o cartucho ${targetGameName}?`)) {
        return;
    }
    
    let migratedCount = 0;
    selectedPokemonIds.forEach(id => {
        const pkmn = pokemonDatabase.find(p => p.id === id);
        if (pkmn) {
            if (pkmn.currentGame !== targetGameId) {
                if (!pkmn.history) pkmn.history = [];
                pkmn.history.push(pkmn.currentGame);
                pkmn.currentGame = targetGameId;
                const targetActiveTrainer = localStorage.getItem("bb_active_trainer_" + targetGameId) || `trainer_${targetGameId}_default`;
                pkmn.trainerId = targetActiveTrainer;
            }
            pkmn.slotType = "box";
            pkmn.slotIndex = 0;
            migratedCount++;
        }
    });
    
    if (migratedCount > 0) {
        localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
        alert(`${migratedCount} Pokémon migrados com sucesso para ${targetGameName}!`);
        toggleSelectionMode();
        renderAll();
    }
}

function executeMassDelete() {
    const count = selectedPokemonIds.size;
    if (count === 0) return;
    
    if (!confirm(`PERIGO: Tens a certeza absoluta que queres eliminar permanentemente os ${count} Pokémon selecionados da tua Caixa Negra?`)) {
        return;
    }
    
    pokemonDatabase = pokemonDatabase.filter(p => !selectedPokemonIds.has(p.id));
    localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
    
    alert(`${count} Pokémon eliminados da base de dados.`);
    toggleSelectionMode();
    renderAll();
}

// --- SECTION Matchup & Comparison Logic ---

function openMatchupModal() {
    const modal = document.getElementById("matchup-modal");
    if (!modal) return;
    
    populateMatchupA();
    
    // Reset B
    const selectB = document.getElementById("matchup-select-b");
    selectB.innerHTML = '<option value="">-- Escolhe o Pokémon A primeiro --</option>';
    selectB.disabled = true;
    
    // Reset comparison area
    const comparisonArea = document.getElementById("matchup-comparison-area");
    comparisonArea.innerHTML = `
        <div class="glass-panel" style="text-align: center; padding: 40px 20px; border: 1px dashed var(--border-color); background: rgba(255,255,255,0.01);">
            <div style="font-size: 3rem; margin-bottom: 12px; filter: grayscale(1);">⚖️</div>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
                Selecione o **Pokémon A** e o **Pokémon B** acima para analisar a sua evolução, mudanças de movimentos, estatísticas e fitas adquiridas ao longo da sua jornada intergeracional.
            </p>
        </div>
    `;
    
    modal.classList.add("active");
}

function closeMatchupModal() {
    const modal = document.getElementById("matchup-modal");
    if (modal) {
        modal.classList.remove("active");
    }
}

function populateMatchupA() {
    const selectA = document.getElementById("matchup-select-a");
    if (!selectA) return;
    
    // Sort pokemonDatabase by species name, then nickname
    const sorted = [...pokemonDatabase].sort((a, b) => {
        const specA = a.species.toLowerCase();
        const specB = b.species.toLowerCase();
        if (specA < specB) return -1;
        if (specA > specB) return 1;
        return (a.nickname || "").localeCompare(b.nickname || "");
    });
    
    let html = '<option value="">-- Escolhe o Pokémon A --</option>';
    sorted.forEach(p => {
        const gameName = GAMES_DB.find(g => g.id === p.currentGame)?.name || p.currentGame.toUpperCase();
        const displayName = `${p.nickname ? p.nickname + ' (' + p.species + ')' : p.species} - Nível ${p.level} [${gameName}]`;
        html += `<option value="${p.id}">${displayName}</option>`;
    });
    
    selectA.innerHTML = html;
}

function onMatchupAChange() {
    const selectA = document.getElementById("matchup-select-a");
    const selectB = document.getElementById("matchup-select-b");
    const comparisonArea = document.getElementById("matchup-comparison-area");
    if (!selectA || !selectB) return;
    
    const idA = selectA.value;
    if (!idA) {
        selectB.innerHTML = '<option value="">-- Escolhe o Pokémon A primeiro --</option>';
        selectB.disabled = true;
        comparisonArea.innerHTML = `
            <div class="glass-panel" style="text-align: center; padding: 40px 20px; border: 1px dashed var(--border-color); background: rgba(255,255,255,0.01);">
                <div style="font-size: 3rem; margin-bottom: 12px; filter: grayscale(1);">⚖️</div>
                <p style="color: var(--text-muted); font-size: 0.85rem;">
                    Selecione o **Pokémon A** e o **Pokémon B** acima para analisar a sua evolução, mudanças de movimentos, estatísticas e fitas adquiridas ao longo da sua jornada intergeracional.
                </p>
            </div>
        `;
        return;
    }
    
    const pkmnA = pokemonDatabase.find(p => p.id === idA);
    if (!pkmnA) return;
    
    // Filter database for same species (same pokedexId) and different ID
    const sameSpecies = pokemonDatabase.filter(p => p.pokedexId === pkmnA.pokedexId && p.id !== idA);
    
    let html = '<option value="">-- Escolhe o Pokémon B --</option>';
    if (sameSpecies.length === 0) {
        html = '<option value="">Sem outros espécimes da mesma espécie</option>';
        selectB.disabled = true;
    } else {
        sameSpecies.sort((a, b) => (a.nickname || "").localeCompare(b.nickname || ""));
        sameSpecies.forEach(p => {
            const gameName = GAMES_DB.find(g => g.id === p.currentGame)?.name || p.currentGame.toUpperCase();
            const displayName = `${p.nickname ? p.nickname + ' (' + p.species + ')' : p.species} - Nível ${p.level} [${gameName}]`;
            html += `<option value="${p.id}">${displayName}</option>`;
        });
        selectB.disabled = false;
    }
    
    selectB.innerHTML = html;
    
    // Clear comparison until B is chosen
    comparisonArea.innerHTML = `
        <div class="glass-panel" style="text-align: center; padding: 40px 20px; border: 1px dashed var(--border-color); background: rgba(255,255,255,0.01);">
            <div style="font-size: 3rem; margin-bottom: 12px;">⚖️</div>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
                Pokémon A selecionado! Agora escolha outro espécime de **${pkmnA.species}** na lista do Pokémon B para comparar.
            </p>
        </div>
    `;
}

function onMatchupBChange() {
    renderMatchupComparison();
}

function renderMatchupComparison() {
    const idA = document.getElementById("matchup-select-a").value;
    const idB = document.getElementById("matchup-select-b").value;
    const comparisonArea = document.getElementById("matchup-comparison-area");
    if (!comparisonArea) return;
    
    if (!idA || !idB) return;
    
    const pkmnA = pokemonDatabase.find(p => p.id === idA);
    const pkmnB = pokemonDatabase.find(p => p.id === idB);
    if (!pkmnA || !pkmnB) return;
    
    // Get species details & sprites
    const getSpriteUrl = (p) => {
        const id = p.pokedexId || 1;
        const cleanName = p.species.toLowerCase().trim()
            .replace(/[\s']/g, "-")
            .replace(/\./g, "")
            .replace(/-+$/, "");
        
        if (currentSpriteStyle === "classic") {
            return p.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        } else if (currentSpriteStyle === "3d-home") {
            return p.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
        } else {
            // Animated/Showdown
            return p.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
        }
    };
    
    const spriteA = getSpriteUrl(pkmnA);
    const spriteB = getSpriteUrl(pkmnB);
    
    const gameA = GAMES_DB.find(g => g.id === pkmnA.currentGame);
    const gameB = GAMES_DB.find(g => g.id === pkmnB.currentGame);
    
    const gameNameA = gameA?.name || pkmnA.currentGame.toUpperCase();
    const gameNameB = gameB?.name || pkmnB.currentGame.toUpperCase();
    
    // Level difference
    const levelDiff = pkmnB.level - pkmnA.level;
    let levelDiffText = "";
    if (levelDiff > 0) {
        levelDiffText = `<span style="color: var(--accent-success); font-weight:800; font-size: 0.7rem; margin-left: 6px;">📈 +${levelDiff} níveis</span>`;
    } else if (levelDiff < 0) {
        levelDiffText = `<span style="color: var(--accent-danger); font-weight:800; font-size: 0.7rem; margin-left: 6px;">📉 ${levelDiff} níveis</span>`;
    } else {
        levelDiffText = `<span style="color: var(--text-muted); font-size: 0.7rem; margin-left: 6px;">(Sem alteração)</span>`;
    }
    
    // Compare nature & ability
    const natureMatch = pkmnA.nature === pkmnB.nature;
    const abilityMatch = pkmnA.ability === pkmnB.ability;
    
    const natureHTML = natureMatch
        ? `<span style="color: var(--accent-success); font-weight: 700;">${pkmnA.nature}</span>`
        : `<div style="display:flex; flex-direction:column; gap:2px;">
             <span style="color: var(--text-muted); text-decoration: line-through; font-size: 0.75rem;">${pkmnA.nature || "Sem Nature"}</span>
             <span style="color: var(--game-color); font-weight: 700;">${pkmnB.nature || "Sem Nature"}</span>
           </div>`;
           
    const abilityHTML = abilityMatch
        ? `<span style="color: var(--accent-success); font-weight: 700;">${pkmnA.ability}</span>`
        : `<div style="display:flex; flex-direction:column; gap:2px;">
             <span style="color: var(--text-muted); text-decoration: line-through; font-size: 0.75rem;">${pkmnA.ability || "Sem Habilidade"}</span>
             <span style="color: var(--game-color); font-weight: 700;">${pkmnB.ability || "Sem Habilidade"}</span>
           </div>`;
           
    // Moveset evolution
    const movesA = pkmnA.moves || [];
    const movesB = pkmnB.moves || [];
    
    // Identify signature moves (moves present in both A and B)
    const signatureMoves = movesA.filter(m => movesB.includes(m));
    
    let movesHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div>
                <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 6px;">Anterior [${gameA?.id.toUpperCase() || ""}]</div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
    `;
    
    // Render Moves A
    if (movesA.length === 0) {
        movesHTML += `<span style="font-style: italic; font-size: 0.8rem; color: var(--text-muted);">Sem movimentos</span>`;
    } else {
        movesA.forEach(m => {
            const isSig = signatureMoves.includes(m);
            movesHTML += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; background: ${isSig ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isSig ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)'};">
                    <span>${m}</span>
                    ${isSig ? '<span style="color: var(--accent-success); font-size: 0.65rem; font-weight: 800;">⭐ Assinatura</span>' : ''}
                </div>
            `;
        });
    }
    
    movesHTML += `
                </div>
            </div>
            <div>
                <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 6px;">Atual [${gameB?.id.toUpperCase() || ""}]</div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
    `;
    
    // Render Moves B
    if (movesB.length === 0) {
        movesHTML += `<span style="font-style: italic; font-size: 0.8rem; color: var(--text-muted);">Sem movimentos</span>`;
    } else {
        movesB.forEach(m => {
            const isSig = signatureMoves.includes(m);
            movesHTML += `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; background: ${isSig ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)'}; border: 1px solid ${isSig ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'};">
                    <span>${m}</span>
                    ${isSig 
                        ? '<span style="color: var(--accent-success); font-size: 0.65rem; font-weight: 800;">⭐ Assinatura</span>' 
                        : '<span style="color: var(--game-color); font-size: 0.65rem; font-weight: 800;">🆕 Novo</span>'}
                </div>
            `;
        });
    }
    
    movesHTML += `
                </div>
            </div>
        </div>
    `;

    // Compare Ribbons
    const ribbonsA = pkmnA.ribbons || [];
    const ribbonsB = pkmnB.ribbons || [];
    
    const sharedRibbons = ribbonsA.filter(r => ribbonsB.includes(r));
    const newRibbons = ribbonsB.filter(r => !ribbonsA.includes(r));
    const lostRibbons = ribbonsA.filter(r => !ribbonsB.includes(r));

    let ribbonsHTML = "";
    if (ribbonsA.length === 0 && ribbonsB.length === 0) {
        ribbonsHTML = `<span style="font-style: italic; font-size: 0.8rem; color: var(--text-muted);">Sem fitas registadas em nenhum dos espécimes.</span>`;
    } else {
        ribbonsHTML += `
            <div style="font-size: 0.8rem; display: flex; flex-wrap: wrap; gap: 6px;">
        `;
        sharedRibbons.forEach(r => {
            ribbonsHTML += `<span class="badge" style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight:700;">🏅 ${r}</span>`;
        });
        newRibbons.forEach(r => {
            ribbonsHTML += `<span class="badge" style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.4); color: var(--game-color); padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight:800;">✨ ${r} (Adquirida)</span>`;
        });
        lostRibbons.forEach(r => {
            ribbonsHTML += `<span class="badge" style="background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); color: var(--text-muted); padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; text-decoration: line-through;">🏅 ${r}</span>`;
        });
        ribbonsHTML += `</div>`;
        
        if (newRibbons.length > 0) {
            ribbonsHTML += `<div style="font-size: 0.75rem; color: var(--accent-success); font-weight:700; margin-top: 8px;">🎉 Adquiriu +${newRibbons.length} fitas nesta transição!</div>`;
        }
    }

    // Individual stat comparison helper
    const renderStatComparison = (statName, valA, valB) => {
        const diff = valB - valA;
        let diffHTML = "";
        if (diff > 0) {
            diffHTML = `<span style="color: var(--accent-success); font-weight:700;">+${diff}</span>`;
        } else if (diff < 0) {
            diffHTML = `<span style="color: var(--accent-danger); font-weight:700;">${diff}</span>`;
        } else {
            diffHTML = `<span style="color: var(--text-muted);">0</span>`;
        }
        return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                <td style="padding: 6px 0; font-weight:700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">${statName}</td>
                <td style="padding: 6px 0; text-align: center; font-size: 0.8rem;">${valA}</td>
                <td style="padding: 6px 0; text-align: center; font-size: 0.8rem;">${valB}</td>
                <td style="padding: 6px 0; text-align: center; font-size: 0.8rem; font-weight: 800;">${diffHTML}</td>
            </tr>
        `;
    };

    // Calculate total IVs & EVs
    const totalIvA = Object.values(pkmnA.ivs || {}).reduce((x, y) => x + y, 0);
    const totalIvB = Object.values(pkmnB.ivs || {}).reduce((x, y) => x + y, 0);
    const totalEvA = Object.values(pkmnA.evs || {}).reduce((x, y) => x + y, 0);
    const totalEvB = Object.values(pkmnB.evs || {}).reduce((x, y) => x + y, 0);

    // Build the full HTML structure
    comparisonArea.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:20px;">
            <!-- Header visual Cards -->
            <div class="matchup-grid">
                <!-- Card A -->
                <div class="glass-panel" style="width: 100%; text-align: center; padding: 14px; border: 1px solid rgba(255,255,255,0.08); background: rgba(${pkmnA.currentGame === 'red' || pkmnA.currentGame === 'firered' ? '239,68,68' : '99,102,241'}, 0.05);">
                    <div class="game-badge-mini" style="background: var(--game-color-${pkmnA.currentGame}); border-radius: 4px; padding: 2px 6px; font-size: 0.65rem; font-weight:800; display: inline-block; margin-bottom: 6px; border:1px solid rgba(255,255,255,0.1);">
                        ${gameNameA}
                    </div>
                    <div style="width: 90px; height: 90px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                        <img src="${spriteA}" alt="${pkmnA.species}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmnA.pokedexId}.png'">
                    </div>
                    <h3 style="margin: 6px 0 2px 0; font-size: 0.95rem; font-weight:800; color:#fff;">${pkmnA.nickname || pkmnA.species}</h3>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${pkmnA.species}</div>
                </div>

                <!-- Versus Arrow -->
                <div class="matchup-vs">
                    ➡️
                </div>

                <!-- Card B -->
                <div class="glass-panel" style="width: 100%; text-align: center; padding: 14px; border: 1px solid rgba(255,255,255,0.08); background: rgba(${pkmnB.currentGame === 'red' || pkmnB.currentGame === 'firered' ? '239,68,68' : '99,102,241'}, 0.05);">
                    <div class="game-badge-mini" style="background: var(--game-color-${pkmnB.currentGame}); border-radius: 4px; padding: 2px 6px; font-size: 0.65rem; font-weight:800; display: inline-block; margin-bottom: 6px; border:1px solid rgba(255,255,255,0.1);">
                        ${gameNameB}
                    </div>
                    <div style="width: 90px; height: 90px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                        <img src="${spriteB}" alt="${pkmnB.species}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmnB.pokedexId}.png'">
                    </div>
                    <h3 style="margin: 6px 0 2px 0; font-size: 0.95rem; font-weight:800; color:#fff;">${pkmnB.nickname || pkmnB.species}</h3>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${pkmnB.species}</div>
                </div>
            </div>

            <!-- Comparison Table -->
            <div class="glass-panel" style="padding: 16px;">
                <div class="panel-title" style="margin-bottom: 12px; font-size: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                    🧬 Perfil e Evolução de Atributos
                </div>
                
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                            <th style="padding: 6px 0; font-size: 0.75rem; color: var(--text-muted); width: 40%;">Parâmetro</th>
                            <th style="padding: 6px 0; font-size: 0.75rem; color: var(--text-muted); text-align: center; width: 20%;">Pokémon A</th>
                            <th style="padding: 6px 0; font-size: 0.75rem; color: var(--text-muted); text-align: center; width: 20%;">Pokémon B</th>
                            <th style="padding: 6px 0; font-size: 0.75rem; color: var(--text-muted); text-align: center; width: 20%;">Diferença</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <td style="padding: 8px 0; font-weight:700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Nível</td>
                            <td style="padding: 8px 0; text-align: center; font-size: 0.85rem; font-weight: 800;">Lv. ${pkmnA.level}</td>
                            <td style="padding: 8px 0; text-align: center; font-size: 0.85rem; font-weight: 800;">Lv. ${pkmnB.level}</td>
                            <td style="padding: 8px 0; text-align: center; font-size: 0.85rem;">${levelDiffText}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <td style="padding: 8px 0; font-weight:700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Natureza</td>
                            <td style="padding: 8px 0; text-align: center; font-size: 0.8rem;">${pkmnA.nature || "Sem Nature"}</td>
                            <td style="padding: 8px 0; text-align: center; font-size: 0.8rem;">${pkmnB.nature || "Sem Nature"}</td>
                            <td style="padding: 8px 0; text-align: center; font-size: 0.8rem;">${natureHTML}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <td style="padding: 8px 0; font-weight:700; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Habilidade</td>
                            <td style="padding: 8px 0; text-align: center; font-size: 0.8rem;">${pkmnA.ability || "Sem Habilidade"}</td>
                            <td style="padding: 8px 0; text-align: center; font-size: 0.8rem;">${pkmnB.ability || "Sem Habilidade"}</td>
                            <td style="padding: 8px 0; text-align: center; font-size: 0.8rem;">${abilityHTML}</td>
                        </tr>
                        ${renderStatComparison("Total IVs", totalIvA, totalIvB)}
                        ${renderStatComparison("Total EVs", totalEvA, totalEvB)}
                    </tbody>
                </table>
            </div>

            <!-- Moveset section -->
            <div class="glass-panel" style="padding: 16px;">
                <div class="panel-title" style="margin-bottom: 12px; font-size: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                    ⚔️ Evolução do Moveset
                </div>
                ${movesHTML}
            </div>

            <!-- Ribbons comparison -->
            <div class="glass-panel" style="padding: 16px;">
                <div class="panel-title" style="margin-bottom: 12px; font-size: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                    🏅 Fitas Adquiridas
                </div>
                ${ribbonsHTML}
            </div>
        </div>
    `;
}

// --- SECTION Trainer Management Logic ---

function openTrainerManagerModal() {
    const modal = document.getElementById("trainer-manager-modal");
    if (!modal) return;
    
    // Clear form inputs
    const nameInput = document.getElementById("new-trainer-name");
    const tidInput = document.getElementById("new-trainer-tid");
    const sidInput = document.getElementById("new-trainer-sid");
    if (nameInput) nameInput.value = "";
    if (tidInput) tidInput.value = "";
    if (sidInput) sidInput.value = "";
    
    renderTrainerManagerList();
    modal.classList.add("active");
}

function closeTrainerManagerModal() {
    const modal = document.getElementById("trainer-manager-modal");
    if (modal) {
        modal.classList.remove("active");
    }
}

function renderTrainerManagerList() {
    const container = document.getElementById("trainer-manager-list");
    if (!container) return;
    
    const gameTrainers = trainersList.filter(t => t.gameId === currentGameId);
    let html = "";
    
    gameTrainers.forEach(t => {
        const isDefault = t.id === `trainer_${currentGameId}_default`;
        const tidDisplay = t.tid !== "00000" && t.tid ? `TID: ${t.tid}` : "";
        const sidDisplay = t.sid !== "00000" && t.sid ? `SID: ${t.sid}` : "";
        const idBadge = [tidDisplay, sidDisplay].filter(b => b !== "").join(" / ");
        
        html += `
            <div class="trainer-item">
                <div>
                    <strong style="color: #fff; font-size: 0.85rem;">${t.name}</strong>
                    ${idBadge ? `<div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">${idBadge}</div>` : ""}
                </div>
                <div>
                    ${isDefault 
                        ? `<span style="font-size: 0.7rem; color: var(--text-muted); font-weight:700; padding: 2px 6px; background: rgba(255,255,255,0.05); border-radius: 4px;">Padrão</span>`
                        : `<button class="btn btn-danger" onclick="deleteTrainerProfile('${t.id}')" style="width: auto; padding: 4px 8px; font-size: 0.65rem;">🗑️ Apagar</button>`
                    }
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function addNewTrainer() {
    const nameInput = document.getElementById("new-trainer-name");
    const tidInput = document.getElementById("new-trainer-tid");
    const sidInput = document.getElementById("new-trainer-sid");
    
    const name = nameInput.value.trim();
    const tid = tidInput.value.trim() || "00000";
    const sid = sidInput.value.trim() || "00000";
    
    if (!name) {
        alert("O nome do treinador é obrigatório!");
        return;
    }
    
    const newTrainerId = "trainer_" + currentGameId + "_" + Date.now();
    trainersList.push({
        id: newTrainerId,
        gameId: currentGameId,
        name: name,
        tid: tid,
        sid: sid
    });
    
    localStorage.setItem("bb_trainers", JSON.stringify(trainersList));
    
    // Auto-select new trainer
    activeTrainerId = newTrainerId;
    localStorage.setItem(`bb_active_trainer_${currentGameId}`, activeTrainerId);
    
    updateTrainerSelect();
    renderAll();
    closeTrainerManagerModal();
}

function deleteTrainerProfile(trainerId) {
    if (trainerId === `trainer_${currentGameId}_default`) {
        alert("Não é possível apagar o Treinador Padrão.");
        return;
    }
    
    if (!confirm("Tem a certeza de que deseja apagar este perfil? Todos os Pokémon e Mural de Honra associados serão movidos para o Treinador Padrão deste cartucho.")) {
        return;
    }
    
    const defaultTrainerId = `trainer_${currentGameId}_default`;
    
    // 1. Reatribuir Pokémon
    pokemonDatabase.forEach(p => {
        if (p.currentGame === currentGameId && p.trainerId === trainerId) {
            p.trainerId = defaultTrainerId;
        }
    });
    localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
    
    // 2. Reatribuir HOFs no IndexedDB
    if (dbInstance) {
        const keyOld = currentGameId + "_" + trainerId;
        const keyNew = currentGameId + "_" + defaultTrainerId;
        
        const tx = dbInstance.transaction("hall_of_fame", "readwrite");
        const store = tx.objectStore("hall_of_fame");
        
        store.get(keyOld).onsuccess = (e) => {
            const oldRecords = e.target.result || [];
            if (oldRecords.length > 0) {
                store.get(keyNew).onsuccess = (ne) => {
                    const newRecords = ne.target.result || [];
                    const mergedRecords = [...newRecords, ...oldRecords];
                    
                    const writeTx = dbInstance.transaction("hall_of_fame", "readwrite");
                    writeTx.objectStore("hall_of_fame").put(mergedRecords, keyNew);
                    writeTx.objectStore("hall_of_fame").delete(keyOld);
                };
            } else {
                store.delete(keyOld);
            }
        };
    }
    
    // 3. Remover o treinador da lista
    trainersList = trainersList.filter(t => t.id !== trainerId);
    localStorage.setItem("bb_trainers", JSON.stringify(trainersList));
    
    // 4. Se o treinador apagado era o ativo, redefinir para o default
    if (activeTrainerId === trainerId) {
        activeTrainerId = defaultTrainerId;
        localStorage.setItem(`bb_active_trainer_${currentGameId}`, activeTrainerId);
    }
    
    updateTrainerSelect();
    renderAll();
    closeTrainerManagerModal();
}

function switchTrainer(trainerId) {
    activeTrainerId = trainerId;
    localStorage.setItem(`bb_active_trainer_${currentGameId}`, activeTrainerId);
    
    renderAll();
}

// --- SECTION Trainer Resume & Challenge Log (Phase 1) ---

function switchTab(tabId) {
    activeTab = tabId;
    const btnBoxes = document.getElementById("tab-btn-boxes");
    const btnResume = document.getElementById("tab-btn-resume");
    const btnAllocation = document.getElementById("tab-btn-allocation");
    const contentBoxes = document.getElementById("tab-content-boxes");
    const contentResume = document.getElementById("tab-content-resume");
    const contentAllocation = document.getElementById("tab-content-allocation");

    if (btnBoxes) btnBoxes.classList.remove("active");
    if (btnResume) btnResume.classList.remove("active");
    if (btnAllocation) btnAllocation.classList.remove("active");
    if (contentBoxes) contentBoxes.style.display = "none";
    if (contentResume) contentResume.style.display = "none";
    if (contentAllocation) contentAllocation.style.display = "none";

    if (tabId === "boxes") {
        if (btnBoxes) btnBoxes.classList.add("active");
        if (contentBoxes) contentBoxes.style.display = "block";
    } else if (tabId === "resume") {
        if (btnResume) btnResume.classList.add("active");
        if (contentResume) contentResume.style.display = "block";
        renderTrainerResume();
    } else if (tabId === "allocation") {
        if (btnAllocation) btnAllocation.classList.add("active");
        if (contentAllocation) contentAllocation.style.display = "block";
        renderAllocationTab();
    }
}

function countTotalHofRecords() {
    return new Promise((resolve) => {
        if (!dbInstance) {
            resolve(0);
            return;
        }
        const tx = dbInstance.transaction("hall_of_fame", "readonly");
        const store = tx.objectStore("hall_of_fame");
        const request = store.openCursor();
        let total = 0;
        request.onsuccess = function(e) {
            const cursor = e.target.result;
            if (cursor) {
                const value = cursor.value;
                if (Array.isArray(value)) {
                    total += value.length;
                } else if (value) {
                    total += 1;
                }
                cursor.continue();
            } else {
                resolve(total);
            }
        };
        request.onerror = function() {
            resolve(0);
        };
    });
}

function getHofCountsByGame() {
    return new Promise((resolve) => {
        if (!dbInstance) {
            resolve({});
            return;
        }
        const tx = dbInstance.transaction("hall_of_fame", "readonly");
        const store = tx.objectStore("hall_of_fame");
        const request = store.openCursor();
        const counts = {};
        request.onsuccess = function(e) {
            const cursor = e.target.result;
            if (cursor) {
                const key = cursor.key; // e.g. "red_trainer_red_default"
                const value = cursor.value;
                const gameId = key.split("_")[0];
                let count = 0;
                if (Array.isArray(value)) {
                    count = value.length;
                } else if (value) {
                    count = 1;
                }
                counts[gameId] = (counts[gameId] || 0) + count;
                cursor.continue();
            } else {
                resolve(counts);
            }
        };
        request.onerror = function() {
            resolve({});
        };
    });
}

function openChallengeModal(challengeId = null) {
    const modal = document.getElementById("challenge-modal");
    if (!modal) return;
    
    // Make sure associated game select is populated (fallback)
    const chGameSelect = document.getElementById("challenge-game");
    if (chGameSelect && chGameSelect.children.length === 0) {
        const gameOptions = GAMES_DB.map(g => `<option value="${g.id}">${g.name} (Gen ${g.gen})</option>`).join("");
        chGameSelect.innerHTML = gameOptions;
    }

    if (challengeId) {
        const ch = challengesList.find(c => c.id === challengeId);
        if (ch) {
            document.getElementById("challenge-id").value = ch.id;
            document.getElementById("challenge-title").value = ch.title || "";
            document.getElementById("challenge-game").value = ch.gameId || currentGameId;
            document.getElementById("challenge-type").value = ch.type || "nuzlocke";
            document.getElementById("challenge-status").value = ch.status || "in_progress";
            document.getElementById("challenge-notes").value = ch.notes || "";
        }
    } else {
        document.getElementById("challenge-id").value = "";
        document.getElementById("challenge-title").value = "";
        document.getElementById("challenge-game").value = currentGameId;
        document.getElementById("challenge-type").value = "nuzlocke";
        document.getElementById("challenge-status").value = "in_progress";
        document.getElementById("challenge-notes").value = "";
    }
    modal.classList.add("active");
}

function closeChallengeModal() {
    const modal = document.getElementById("challenge-modal");
    if (modal) modal.classList.remove("active");
}

function saveChallenge() {
    const id = document.getElementById("challenge-id").value;
    const title = document.getElementById("challenge-title").value.trim();
    const gameId = document.getElementById("challenge-game").value;
    const type = document.getElementById("challenge-type").value;
    const status = document.getElementById("challenge-status").value;
    const notes = document.getElementById("challenge-notes").value;

    if (!title) {
        alert("Por favor, introduza um título para o desafio.");
        return;
    }

    if (id) {
        const index = challengesList.findIndex(c => c.id === id);
        if (index !== -1) {
            const existing = challengesList[index];
            challengesList[index] = { 
                id, 
                title, 
                gameId, 
                type, 
                status, 
                notes,
                trainerId: existing.trainerId || activeTrainerId
            };
        }
    } else {
        const newChallenge = {
            id: "challenge_" + Date.now(),
            title,
            gameId,
            type,
            status,
            notes,
            trainerId: activeTrainerId
        };
        challengesList.push(newChallenge);
    }

    localStorage.setItem("bb_challenges", JSON.stringify(challengesList));
    closeChallengeModal();
    renderTrainerResume();
}

function deleteChallenge(challengeId) {
    if (confirm("Tem a certeza que deseja eliminar este desafio?")) {
        challengesList = challengesList.filter(c => c.id !== challengeId);
        localStorage.setItem("bb_challenges", JSON.stringify(challengesList));
        renderTrainerResume();
    }
}

function getGameColor(gameId) {
    const colors = {
        red: "#ef4444", blue: "#3b82f6", yellow: "#eab308", gold: "#d97706", silver: "#9ca3af", crystal: "#06b6d4",
        ruby: "#b91c1c", sapphire: "#1d4ed8", emerald: "#10b981", firered: "#f97316", leafgreen: "#22c55e",
        diamond: "#60a5fa", pearl: "#f472b6", platinum: "#94a3b8", heartgold: "#ea580c", soulsilver: "#3b82f6",
        black: "#4b5563", white: "#f9fafb", black2: "#2563eb", white2: "#f59e0b", x: "#3b82f6", y: "#ef4444",
        omegaruby: "#ea580c", alphasapphire: "#0284c7", sun: "#f59e0b", moon: "#3b82f6", ultrasun: "#ea580c",
        ultramoon: "#06b6d4", sword: "#06b6d4", shield: "#e11d48", brilliantdiamond: "#60a5fa", shiningpearl: "#f472b6",
        legendsarceus: "#475569", scarlet: "#dc2626", violet: "#7c3aed"
    };
    return colors[gameId] || "#6366f1";
}

function renderChallengesList() {
    const container = document.getElementById("challenges-list-container");
    if (!container) return;

    const activeTrainerChallenges = challengesList.filter(ch => {
        const challengeTrainerId = ch.trainerId || `trainer_${ch.gameId}_default`;
        return challengeTrainerId === activeTrainerId;
    });

    if (activeTrainerChallenges.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.75rem;">
                Nenhum desafio registado para este treinador. Clique em "➕ Registar" para começar!
            </div>
        `;
        return;
    }

    container.innerHTML = activeTrainerChallenges.map(ch => {
        const game = GAMES_DB.find(g => g.id === ch.gameId);
        const gameName = game ? game.name : "Desconhecido";
        const gameColor = getGameColor(ch.gameId);
        
        let statusLabel = "Em Progresso";
        if (ch.status === "completed") statusLabel = "Vitória";
        if (ch.status === "failed") statusLabel = "Derrota";

        let typeLabel = "Desafio";
        if (ch.type === "nuzlocke") typeLabel = "Nuzlocke";
        if (ch.type === "speedrun") typeLabel = "Speedrun";
        if (ch.type === "ribbon_quest") typeLabel = "Ribbon Quest";
        if (ch.type === "custom") typeLabel = "Outro";

        return `
            <div class="glass-panel" style="padding: 14px; margin-bottom: 0px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.015); border-radius: 12px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="margin: 0; font-size: 0.85rem; font-weight: 700; color: #fff;">${ch.title}</h4>
                        <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
                            <span style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">${typeLabel}</span>
                            <span style="font-size: 0.6rem; color: ${gameColor}; font-weight: 800;">• ${gameName}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="status-badge status-${ch.status}">${statusLabel}</span>
                        <button class="btn btn-action" onclick="openChallengeModal('${ch.id}')" style="width: auto; padding: 2px 6px; font-size: 0.6rem; height: 22px;">✏️</button>
                        <button class="btn btn-danger" onclick="deleteChallenge('${ch.id}')" style="width: auto; padding: 2px 6px; font-size: 0.6rem; height: 22px;">🗑️</button>
                    </div>
                </div>
                ${ch.notes ? `<p style="margin: 0; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 6px; white-space: pre-wrap;">${ch.notes}</p>` : ''}
            </div>
        `;
    }).join("");
}

function renderTimeline(HofCountsMap) {
    const container = document.getElementById("timeline-container");
    if (!container) return;

    const activeGames = GAMES_DB.filter(game => {
        const gameTrainers = trainersList.filter(t => t.gameId === game.id);
        const gamePokemon = pokemonDatabase.filter(p => p.currentGame === game.id);
        const gameHofCount = HofCountsMap[game.id] || 0;
        
        const gameActiveTrainerId = localStorage.getItem("bb_active_trainer_" + game.id) || `trainer_${game.id}_default`;
        const gameChallenges = challengesList.filter(c => c.gameId === game.id && (c.trainerId === gameActiveTrainerId || (!c.trainerId && gameActiveTrainerId === `trainer_${game.id}_default`)));
        
        return gameTrainers.length > 0 || gamePokemon.length > 0 || gameHofCount > 0 || gameChallenges.length > 0;
    });

    if (activeGames.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.75rem;">
                A sua jornada está vazia. Adicione treinadores ou registe Pokémon para ver a sua Linha Temporal!
            </div>
        `;
        return;
    }

    container.innerHTML = activeGames.map(game => {
        const gameTrainers = trainersList.filter(t => t.gameId === game.id);
        const gamePokemon = pokemonDatabase.filter(p => p.currentGame === game.id);
        const gameHofCount = HofCountsMap[game.id] || 0;
        
        const gameActiveTrainerId = localStorage.getItem("bb_active_trainer_" + game.id) || `trainer_${game.id}_default`;
        const gameChallenges = challengesList.filter(c => c.gameId === game.id && (c.trainerId === gameActiveTrainerId || (!c.trainerId && gameActiveTrainerId === `trainer_${game.id}_default`)));
        
        const gameColor = getGameColor(game.id);

        return `
            <div style="position: relative; padding-bottom: 8px; margin-bottom: 12px; cursor: pointer; transition: transform 0.2s, background-color 0.2s; padding: 6px; border-radius: 8px;" 
                 class="timeline-node-item"
                 onmouseover="this.style.transform='translateX(4px)'; this.style.backgroundColor='rgba(255,255,255,0.02)';" 
                 onmouseout="this.style.transform='none'; this.style.backgroundColor='transparent';" 
                 onclick="selectTimelineGame('${game.id}')">
                <div class="timeline-dot" style="position: absolute; left: -26px; top: 12px; width: 10px; height: 10px; border-radius: 50%; background: ${gameColor}; box-shadow: 0 0 8px ${gameColor}; border: 2px solid var(--bg-main);"></div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span class="game-badge" style="background: ${gameColor}; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">
                            ${game.name}
                        </span>
                        <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 800;">
                            GERAÇÃO ${game.gen}
                        </span>
                    </div>
                    
                    <!-- Trainers info -->
                    <div style="font-size: 0.75rem; color: var(--text-main); font-weight: 600;">
                        👤 Treinadores: ${gameTrainers.length > 0 ? gameTrainers.map(t => `<span style="color: ${gameColor}; font-weight: 800;">${t.name}</span> (ID: ${t.tid})`).join(", ") : `<span style="color: var(--text-muted);">Nenhum profile ativo</span>`}
                    </div>
                    
                    <!-- Stats row -->
                    <div style="display: flex; gap: 12px; font-size: 0.7rem; color: var(--text-muted);">
                        <span>📦 Pokémon na Box: <strong style="color: #fff;">${gamePokemon.length}</strong></span>
                        <span>🏆 Hall of Fame: <strong style="color: #fff;">${gameHofCount}</strong></span>
                        <span>🎗️ Desafios: <strong style="color: #fff;">${gameChallenges.length}</strong></span>
                    </div>

                    <!-- Associated challenges list if any -->
                    ${gameChallenges.length > 0 ? `
                        <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 4px;" onclick="event.stopPropagation()">
                            ${gameChallenges.map(c => `
                                <div style="background: rgba(0,0,0,0.2); border-left: 3px solid ${c.status === 'completed' ? 'var(--accent-success)' : c.status === 'failed' ? 'var(--accent-danger)' : 'var(--game-color)'}; padding: 4px 8px; border-radius: 0 6px 6px 0; font-size: 0.7rem; display: flex; justify-content: space-between; align-items: center;">
                                    <span>${c.type.toUpperCase()}: ${c.title}</span>
                                    <span style="font-weight: 800; color: ${c.status === 'completed' ? 'var(--accent-success)' : c.status === 'failed' ? 'var(--accent-danger)' : '#eab308'}">${c.status === 'completed' ? 'Concluído' : c.status === 'failed' ? 'Falhado' : 'Em Progresso'}</span>
                                </div>
                            `).join("")}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join("");
}

function selectTimelineGame(gameId) {
    switchGame(gameId);
    switchTab('boxes');
}

function renderTrainerResume() {
    const totalTrainersBadge = document.getElementById("resume-total-trainers");
    const completedChallengesBadge = document.getElementById("resume-completed-challenges");
    const totalHofBadge = document.getElementById("resume-total-hof");

    if (totalTrainersBadge) {
        totalTrainersBadge.textContent = trainersList.length;
    }
    if (completedChallengesBadge) {
        completedChallengesBadge.textContent = challengesList.filter(c => c.status === "completed" && (c.trainerId === activeTrainerId || (!c.trainerId && activeTrainerId === `trainer_${c.gameId}_default`))).length;
    }

    countTotalHofRecords().then(totalHofs => {
        if (totalHofBadge) {
            totalHofBadge.textContent = totalHofs;
        }
    });

    getHofCountsByGame().then(HofCountsMap => {
        renderTimeline(HofCountsMap);
        renderChallengesList();
    });
}

// --- SECTION Owndex (Species Profile) Logic ---

const NATURE_EFFECTS = {
    Adamant: { plus: "atk", minus: "spa" },
    Bold: { plus: "def", minus: "atk" },
    Brave: { plus: "atk", minus: "spe" },
    Calm: { plus: "spd", minus: "atk" },
    Careful: { plus: "spd", minus: "spa" },
    Hasty: { plus: "spe", minus: "def" },
    Impish: { plus: "def", minus: "spa" },
    Jolly: { plus: "spe", minus: "spa" },
    Lonely: { plus: "atk", minus: "def" },
    Mild: { plus: "spa", minus: "def" },
    Modest: { plus: "spa", minus: "atk" },
    Naive: { plus: "spe", minus: "spd" },
    Naughty: { plus: "atk", minus: "spd" },
    Quiet: { plus: "spa", minus: "spe" },
    Rash: { plus: "spa", minus: "spd" },
    Relaxed: { plus: "def", minus: "spe" },
    Sassy: { plus: "spd", minus: "spe" },
    Timid: { plus: "spe", minus: "atk" }
};

function calculateFinalStats(p, baseStats) {
    const level = p.level || 50;
    const stats = {};
    const ivs = p.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    const evs = p.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    
    // HP
    const baseHP = baseStats.hp || 80;
    if (p.species.toLowerCase().trim() === "shedinja") {
        stats.hp = 1;
    } else {
        stats.hp = Math.floor(((2 * baseHP + (ivs.hp || 0) + Math.floor((evs.hp || 0) / 4)) * level) / 100) + level + 10;
    }
    
    // Others
    const keys = ["atk", "def", "spa", "spd", "spe"];
    keys.forEach(k => {
        const baseVal = baseStats[k] || 80;
        let val = Math.floor(((2 * baseVal + (ivs[k] || 0) + Math.floor((evs[k] || 0) / 4)) * level) / 100) + 5;
        
        // Nature multiplier
        if (p.nature && NATURE_EFFECTS[p.nature]) {
            if (NATURE_EFFECTS[p.nature].plus === k) {
                val = Math.floor(val * 1.1);
            } else if (NATURE_EFFECTS[p.nature].minus === k) {
                val = Math.floor(val * 0.9);
            }
        }
        stats[k] = val;
    });
    
    return stats;
}

function calculateTacticalAptitude(p, baseStats) {
    const bStats = baseStats || { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 };
    const stats = calculateFinalStats(p, bStats);
    
    const moves = (p.moves || []).map(m => m.toLowerCase().trim()).filter(Boolean);
    
    // 1. Pivot: has pivoting moves
    const pivotMoves = ["u-turn", "volt switch", "teleport", "flip turn", "parting shot"];
    const hasPivotMove = moves.some(m => pivotMoves.includes(m));
    
    // 2. Support: has setup/entry hazards/defensive utility moves
    const supportMoves = [
        "stealth rock", "spikes", "toxic spikes", "sticky web", "defog", "rapid spin",
        "toxic", "will-o-wisp", "thunder wave", "yawn", "spore", "sleep powder",
        "wish", "soft-boiled", "recover", "roost", "milk drink", "slack off",
        "reflect", "light screen", "aurora veil", "tailwind", "trick room", "heal bell", "aromatherapy"
    ];
    const supportMoveCount = moves.filter(m => supportMoves.includes(m)).length;
    
    // Physical vs Special preference
    const isPhysical = stats.atk > stats.spa * 1.1;
    const isSpecial = stats.spa > stats.atk * 1.1;
    
    // High Speed? Speed > 100
    const isFast = stats.spe > 100; 
    
    // Bulk values
    const physicalBulk = stats.hp + stats.def;
    const specialBulk = stats.hp + stats.spd;
    const mixedBulk = stats.hp + stats.def + stats.spd;
    
    // Let's check highest EV investment
    const evs = p.evs || {};
    const maxEVKey = Object.keys(evs).reduce((a, b) => (evs[a] || 0) > (evs[b] || 0) ? a : b, "hp");
    const maxEVVal = evs[maxEVKey] || 0;
    
    if (hasPivotMove && stats.spe > 90) {
        return "Pivot Tático";
    }
    
    if (supportMoveCount >= 2 || (supportMoveCount >= 1 && (maxEVKey === "hp" || maxEVKey === "def" || maxEVKey === "spd") && maxEVVal >= 128)) {
        if (physicalBulk > specialBulk * 1.1) return "Defensivo Físico";
        if (specialBulk > physicalBulk * 1.1) return "Defensivo Especial";
        return "Suporte Utilitário";
    }
    
    if (isFast) {
        if (isPhysical && (evs.atk > 120 || bStats.atk > bStats.spa)) return "Physical Sweeper";
        if (isSpecial && (evs.spa > 120 || bStats.spa > bStats.atk)) return "Special Sweeper";
        return "Mixed Sweeper";
    }
    
    // If not fast, but has high offense: Tank / Bulky Attacker
    const isOffensive = stats.atk > 95 || stats.spa > 95 || evs.atk > 120 || evs.spa > 120;
    if (isOffensive) {
        if (isPhysical) return "Physical Tank";
        if (isSpecial) return "Special Tank";
        return "Bulky Attacker";
    }
    
    // High bulk, low offense
    if (physicalBulk > specialBulk * 1.15) {
        return "Barreira Física (Wall)";
    }
    if (specialBulk > physicalBulk * 1.15) {
        return "Barreira Especial (Wall)";
    }
    if (mixedBulk > 350) {
        return "Muralha Mista";
    }
    
    return "Equilibrado";
}

function openOwndexModal(pokedexId, speciesName) {
    const modal = document.getElementById("owndex-modal");
    if (!modal) return;
    
    // Set basic info initially
    document.getElementById("owndex-species-name").innerText = speciesName;
    document.getElementById("owndex-species-dex").innerText = `#${pokedexId.toString().padStart(3, '0')}`;
    
    // Sprite
    let spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`;
    document.getElementById("owndex-species-sprite").src = spriteUrl;
    
    // Reset types & stats UI
    document.getElementById("owndex-species-types").innerHTML = "";
    document.getElementById("owndex-base-stats-container").innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">A carregar dados base da PokeAPI...</span>`;
    
    // Show modal
    modal.classList.add("active");
    
    // Initial renders with fallback stats
    renderOwndexSpecimens(pokedexId, null);
    renderMovesetHeatmap(pokedexId);
    renderDexitCompatibility(pokedexId, null);
    
    // Fetch species details for Dexit-Strategist
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokedexId}`)
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Erro na rede species");
        })
        .then(speciesData => {
            renderDexitCompatibility(pokedexId, speciesData);
        })
        .catch(err => {
            console.error("Erro ao carregar dados de species da PokeAPI:", err);
        });
    
    // Fetch stats and types from PokeAPI
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokedexId}`)
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Erro na rede");
        })
        .then(d => {
            // Render types
            document.getElementById("owndex-species-types").innerHTML = d.types.map(t => {
                return `<span class="type-badge t-${t.type.name}" style="font-size: 0.6rem; padding: 2px 6px; text-transform: uppercase;">${t.type.name}</span>`;
            }).join("");
            
            // Build base stats object
            const baseStats = {};
            d.stats.forEach(s => {
                if (s.stat.name === "hp") baseStats.hp = s.base_stat;
                else if (s.stat.name === "attack") baseStats.atk = s.base_stat;
                else if (s.stat.name === "defense") baseStats.def = s.base_stat;
                else if (s.stat.name === "special-attack") baseStats.spa = s.base_stat;
                else if (s.stat.name === "special-defense") baseStats.spd = s.base_stat;
                else if (s.stat.name === "speed") baseStats.spe = s.base_stat;
            });
            
            // Render base stats bars
            const statLabels = {
                "hp": "HP", "attack": "Ataque", "defense": "Defesa",
                "special-attack": "Sp. Atk", "special-defense": "Sp. Def", "speed": "Veloc"
            };
            const maxStatVal = 255;
            
            const statsHtml = d.stats.map(s => {
                const name = statLabels[s.stat.name] || s.stat.name;
                const val = s.base_stat;
                const pct = (val / maxStatVal) * 100;
                
                // Color bar depending on value
                let barColor = "var(--accent-danger)";
                if (val >= 90) barColor = "var(--accent-success)";
                else if (val >= 60) barColor = "var(--game-color)";
                else if (val >= 40) barColor = "#eab308";
                
                return `
                    <div class="base-stat-row">
                        <span class="base-stat-label">${name}</span>
                        <span class="base-stat-val">${val}</span>
                        <div class="base-stat-bar-bg">
                            <div class="base-stat-bar-fill" style="width: ${pct}%; background-color: ${barColor};"></div>
                        </div>
                    </div>
                `;
            }).join("");
            document.getElementById("owndex-base-stats-container").innerHTML = statsHtml;
            
            // Re-render list with actual baseStats for highly accurate role calculation
            renderOwndexSpecimens(pokedexId, baseStats);
        })
        .catch(err => {
            console.error("Erro ao carregar dados da PokeAPI:", err);
            document.getElementById("owndex-base-stats-container").innerHTML = `<span style="font-size:0.75rem; color:var(--accent-danger);">Erro ao carregar dados da PokeAPI.</span>`;
        });
}

function closeOwndexModal() {
    const modal = document.getElementById("owndex-modal");
    if (modal) modal.classList.remove("active");
    closeVoyageModal();
}

const GAME_GENS = {
    red: { gen: 1, name: "Pokémon Red" },
    blue: { gen: 1, name: "Pokémon Blue" },
    yellow: { gen: 1, name: "Pokémon Yellow" },
    gold: { gen: 2, name: "Pokémon Gold" },
    silver: { gen: 2, name: "Pokémon Silver" },
    crystal: { gen: 2, name: "Pokémon Crystal" },
    ruby: { gen: 3, name: "Pokémon Ruby" },
    sapphire: { gen: 3, name: "Pokémon Sapphire" },
    emerald: { gen: 3, name: "Pokémon Emerald" },
    firered: { gen: 3, name: "Pokémon FireRed" },
    leafgreen: { gen: 3, name: "Pokémon LeafGreen" },
    diamond: { gen: 4, name: "Pokémon Diamond" },
    pearl: { gen: 4, name: "Pokémon Pearl" },
    platinum: { gen: 4, name: "Pokémon Platinum" },
    heartgold: { gen: 4, name: "Pokémon HeartGold" },
    soulsilver: { gen: 4, name: "Pokémon SoulSilver" },
    black: { gen: 5, name: "Pokémon Black" },
    white: { gen: 5, name: "Pokémon White" },
    black2: { gen: 5, name: "Pokémon Black 2" },
    white2: { gen: 5, name: "Pokémon White 2" },
    x: { gen: 6, name: "Pokémon X" },
    y: { gen: 6, name: "Pokémon Y" },
    omegaruby: { gen: 6, name: "Pokémon Omega Ruby" },
    alphasapphire: { gen: 6, name: "Pokémon Alpha Sapphire" },
    sun: { gen: 7, name: "Pokémon Sun" },
    moon: { gen: 7, name: "Pokémon Moon" },
    ultrasun: { gen: 7, name: "Pokémon Ultra Sun" },
    ultramoon: { gen: 7, name: "Pokémon Ultra Moon" },
    sword: { gen: 8, name: "Pokémon Sword" },
    shield: { gen: 8, name: "Pokémon Shield" },
    brilliantdiamond: { gen: 8, name: "Pokémon Brilliant Diamond" },
    shiningpearl: { gen: 8, name: "Pokémon Shining Pearl" },
    legendsarceus: { gen: 8, name: "Pokémon Legends: Arceus" },
    scarlet: { gen: 9, name: "Pokémon Scarlet" },
    violet: { gen: 9, name: "Pokémon Violet" }
};

function renderDexitCompatibility(pokedexId, speciesData = null) {
    const container = document.getElementById("owndex-dexit-compatibility");
    if (!container) return;
    
    let isSwSh = false;
    let isBDSP = pokedexId <= 493;
    let isPLA = false;
    let isSV = false;
    
    if (speciesData && speciesData.pokedex_numbers) {
        const dns = speciesData.pokedex_numbers.map(dn => dn.pokedex.name);
        isSwSh = dns.some(name => ["galar", "isle-of-armor", "crown-tundra"].includes(name)) || [25, 133, 150].includes(pokedexId);
        isPLA = dns.some(name => name === "hisui");
        isSV = dns.some(name => ["paldea", "kitakami", "blueberry"].includes(name));
    } else {
        // Rules base fallback
        isSwSh = pokedexId <= 151 || (pokedexId >= 252 && pokedexId <= 386 && pokedexId !== 289) || pokedexId >= 800;
        isPLA = pokedexId <= 151 || (pokedexId >= 387 && pokedexId <= 493) || [722, 723, 724, 501, 502, 503].includes(pokedexId);
        isSV = pokedexId <= 151 || pokedexId >= 900 || [252, 253, 254, 387, 388, 389].includes(pokedexId);
    }
    
    const badges = [
        { label: "⚔️🛡️ SwSh", status: isSwSh },
        { label: "💎✨ BDSP", status: isBDSP },
        { label: "🏔️ Legends", status: isPLA },
        { label: "🍊🍇 SV", status: isSV }
    ];
    
    container.innerHTML = badges.map(b => {
        if (b.status) {
            return `
                <span class="game-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); padding: 4px 8px; border-radius: 6px; font-size: 0.6rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
                    ✓ ${b.label}
                </span>
            `;
        } else {
            return `
                <span class="game-badge" style="background: rgba(239, 68, 68, 0.1); color: var(--text-muted); border: 1px solid rgba(239, 68, 68, 0.25); padding: 4px 8px; border-radius: 6px; font-size: 0.6rem; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; text-decoration: line-through; opacity: 0.6;">
                    ✕ ${b.label}
                </span>
            `;
        }
    }).join("");
    
    window.currentSpeciesLegality = { swsh: isSwSh, bdsp: isBDSP, pla: isPLA, sv: isSV };
}

function openVoyageModal(pokemonId) {
    const p = pokemonDatabase.find(x => x.id === pokemonId);
    if (!p) return;
    
    const modal = document.getElementById("voyage-modal");
    if (!modal) return;
    
    const legality = window.currentSpeciesLegality || { swsh: true, bdsp: true, pla: true, sv: true };
    
    document.getElementById("voyage-pkmn-name").innerText = `${p.nickname || p.species} (Nível ${p.level})`;
    document.getElementById("voyage-pkmn-badge").innerText = p.isShiny ? "⭐" : "📦";
    
    const currentGameName = GAME_GENS[p.currentGame]?.name || p.currentGame;
    const originGameName = GAME_GENS[p.originGame]?.name || p.originGame;
    document.getElementById("voyage-pkmn-game").innerText = `Origem: ${originGameName} | Local Atual: ${currentGameName}`;
    
    const originGen = GAME_GENS[p.originGame]?.gen || 1;
    const currentGen = GAME_GENS[p.currentGame]?.gen || 1;
    
    const historyGens = (p.history || []).map(h => GAME_GENS[h]?.gen).filter(Boolean);
    historyGens.push(originGen);
    historyGens.push(currentGen);
    const crossedGens = [...new Set(historyGens)].sort((a, b) => a - b);
    
    let timelineHtml = "";
    crossedGens.forEach((g, idx) => {
        let gameForGen = "";
        if (g === originGen) gameForGen = GAME_GENS[p.originGame]?.name;
        else if (g === currentGen) gameForGen = GAME_GENS[p.currentGame]?.name;
        else {
            const histGame = (p.history || []).find(h => GAME_GENS[h]?.gen === g);
            gameForGen = histGame ? GAME_GENS[histGame]?.name : `Geração ${g}`;
        }
        
        timelineHtml += `
            <div style="display: flex; gap: 10px; align-items: flex-start; position: relative;">
                <div style="width: 20px; height: 20px; border-radius: 50%; background: var(--game-color); border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; color: #fff; z-index: 2;">
                    ${g}
                </div>
                <div style="font-size: 0.75rem; color: #fff; padding-top: 2px;">
                    Geração ${g} <span style="color: var(--text-muted); font-size: 0.65rem;">(${gameForGen})</span>
                </div>
            </div>
        `;
    });
    
    document.getElementById("voyage-history-timeline").innerHTML = timelineHtml;
    
    let guideHtml = "";
    const isAmbassador = pokemonId === window.currentSpeciesAmbassadorId;
    if (isAmbassador) {
        guideHtml += `
            <div style="display:flex; align-items:center; gap:8px; background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 8px; padding: 10px; color:#f59e0b; font-weight:bold; margin-bottom:12px; font-size:0.75rem;">
                👑 Este espécime é o Embaixador Recomendado para migração desta espécie! (${window.currentSpeciesAmbassadorReason})
            </div>
        `;
    }
    if (currentGen === 9) {
        guideHtml = `
            <div style="display:flex; align-items:center; gap:8px; color:var(--accent-success); font-weight:bold; margin-bottom:8px;">
                🎉 Destino Final Alcançado!
            </div>
            Este Pokémon já se encontra na Geração 9 (Scarlet/Violet), a geração mais moderna disponível. Pode transferi-lo livremente entre Scarlet e Violet usando o <strong>Pokémon HOME</strong>.
        `;
    } else {
        guideHtml += `<div style="font-weight:bold; color:var(--game-color); margin-bottom:8px;">Roteiro de Transferência até à Gen 9:</div>`;
        
        let steps = [];
        let tempGen = currentGen;
        
        if (tempGen === 1 || tempGen === 2) {
            steps.push({
                title: `Geração ${tempGen} ➔ Geração 7 (Consola Virtual 3DS)`,
                desc: "Se estiver a usar a Consola Virtual da Nintendo 3DS, pode transferir para a Geração 7 usando o **Poké Transporter** e **Banco Pokémon**."
            });
            tempGen = 7;
        }
        
        if (tempGen === 3) {
            steps.push({
                title: "Geração 3 ➔ Geração 4 (Pal Park)",
                desc: "Insira o cartucho de GBA e o cartucho de DS (Diamond/Pearl/Platinum/HGSS) na mesma consola Nintendo DS Lite. Aceda ao **Pal Park** no jogo de Gen 4 para capturar e transferir."
            });
            tempGen = 4;
        }
        
        if (tempGen === 4) {
            steps.push({
                title: "Geração 4 ➔ Geração 5 (Poké Transfer)",
                desc: "Requer duas consolas Nintendo DS/3DS. Use o **Poké Transfer Lab** na Rota 15 de Black/White/B2W2 para receber os Pokémon do jogo de Gen 4 através de download de jogo DS."
            });
            tempGen = 5;
        }
        
        if (tempGen === 5) {
            steps.push({
                title: "Geração 5 ➔ Geração 6 / 7 (Banco Pokémon)",
                desc: "Na Nintendo 3DS, use a aplicação **Poké Transporter** para mover Pokémon da Box 1 de Black/White/B2W2 para a Box de Transferência do **Banco Pokémon**."
            });
            tempGen = 7;
        }
        
        if (tempGen === 6 || tempGen === 7) {
            steps.push({
                title: `Geração ${tempGen} ➔ HOME (Nintendo Switch)`,
                desc: "Use a função de transferência do **Banco Pokémon** na 3DS para enviar os seus Pokémon para a sua conta do **Pokémon HOME** na Nintendo Switch."
            });
            tempGen = 8;
        }
        
        if (tempGen >= 8) {
            let compatibleGames = [];
            if (legality.sv) compatibleGames.push("<strong>Scarlet/Violet (Gen 9)</strong>");
            if (legality.swsh) compatibleGames.push("<strong>Sword/Shield (Gen 8)</strong>");
            if (legality.bdsp) compatibleGames.push("<strong>Brilliant Diamond/Shining Pearl (Gen 8)</strong>");
            if (legality.pla) compatibleGames.push("<strong>Legends: Arceus (Gen 8)</strong>");
            
            if (compatibleGames.length > 0) {
                steps.push({
                    title: "HOME ➔ Consolas Switch Modernas",
                    desc: `No Pokémon HOME, pode enviar o seu Pokémon diretamente para as caixas de: ${compatibleGames.join(", ")}.`
                });
            } else {
                steps.push({
                    title: "⚠️ Dexit: Sem Compatibilidade Switch",
                    desc: "Infelizmente, esta espécie não está programada em nenhum dos jogos da Nintendo Switch. Terá de aguardar que seja incluída numa Pokédex futura."
                });
            }
        }
        
        guideHtml += steps.map((s, idx) => `
            <div style="margin-bottom:10px;">
                <div style="font-weight:bold; color:#fff;">${idx+1}. ${s.title}</div>
                <div style="color:var(--text-muted); margin-top:2px;">${s.desc}</div>
            </div>
        `).join("");
    }
    
    document.getElementById("voyage-transfer-guide").innerHTML = guideHtml;
    modal.classList.add("active");
}

function closeVoyageModal() {
    const modal = document.getElementById("voyage-modal");
    if (modal) modal.classList.remove("active");
}

function openOwndexFromEditor() {
    const speciesInput = document.getElementById("form-species").value.trim();
    if (!speciesInput) return;
    
    const editId = document.getElementById("form-id").value;
    const targetPokemon = pokemonDatabase.find(p => p.id === editId);
    let pokedexId = targetPokemon ? targetPokemon.pokedexId : null;
    
    if (!pokedexId) {
        const match = pokemonDatabase.find(p => p.species.toLowerCase() === speciesInput.toLowerCase());
        if (match) pokedexId = match.pokedexId;
    }
    
    if (!pokedexId) {
        pokedexId = 1; // Fallback to Bulbasaur
    }
    
    closeModal(); // Close editor modal
    openOwndexModal(pokedexId, speciesInput);
}

function renderOwndexSpecimens(pokedexId, baseStats = null) {
    const tbody = document.getElementById("owndex-specimens-tbody");
    const noSpecimens = document.getElementById("owndex-no-specimens");
    if (!tbody) return;
    
    const specimens = pokemonDatabase.filter(p => p.pokedexId === pokedexId);
    
    if (specimens.length === 0) {
        tbody.innerHTML = "";
        if (noSpecimens) noSpecimens.style.display = "block";
        return;
    }
    
    if (noSpecimens) noSpecimens.style.display = "none";
    
    // Calculate Generation Ambassador (Embaixador de Geração)
    let ambassadorId = null;
    let ambassadorReason = "";
    if (specimens.length > 1) {
        let bestScore = -1;
        let bestPkmn = null;
        let bestReason = "";
        
        specimens.forEach(p => {
            let score = 0;
            let reasons = [];
            
            if (p.ivs) {
                const totalIv = Object.values(p.ivs).reduce((a, b) => a + b, 0);
                score += totalIv;
                if (totalIv >= 180) reasons.push("IVs excelentes");
            }
            if (p.evs) {
                const totalEv = Object.values(p.evs).reduce((a, b) => a + b, 0);
                score += Math.floor(totalEv / 4);
                if (totalEv >= 508) reasons.push("EVs maximizados");
            }
            if (p.isShiny) {
                score += 50;
                reasons.push("Raridade Shiny");
            }
            if (p.ribbons && p.ribbons.length > 0) {
                score += p.ribbons.length * 15;
                reasons.push(`${p.ribbons.length} Fitas ganhas`);
            }
            if (p.level === 100) {
                score += 15;
                reasons.push("Nível Máximo");
            } else if (p.level) {
                score += Math.floor(p.level / 10);
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestPkmn = p;
                bestReason = reasons.join(", ") || "Melhor conjunto de atributos";
            }
        });
        
        if (bestPkmn) {
            ambassadorId = bestPkmn.id;
            ambassadorReason = bestReason;
        }
    }
    
    // Save globally so that Voyage Logistics guide can check it
    window.currentSpeciesAmbassadorId = ambassadorId;
    window.currentSpeciesAmbassadorReason = ambassadorReason;
    
    tbody.innerHTML = specimens.map(p => {
        const game = GAMES_DB.find(g => g.id === p.currentGame);
        const gameName = game ? game.name : p.currentGame;
        const gameColor = getGameColor(p.currentGame);
        
        const trainer = trainersList.find(t => t.id === p.trainerId);
        const trainerName = trainer ? trainer.name : "Padrão";
        const trainerTid = trainer && trainer.tid !== "00000" ? `(TID: ${trainer.tid})` : "";
        
        const ivs = p.ivs ? `HP:${p.ivs.hp||0} A:${p.ivs.atk||0} D:${p.ivs.def||0} S:${p.ivs.spa||0} SD:${p.ivs.spd||0} SP:${p.ivs.spe||0}` : "N/A";
        const evs = p.evs ? `HP:${p.evs.hp||0} A:${p.evs.atk||0} D:${p.evs.def||0} S:${p.evs.spa||0} SD:${p.evs.spd||0} SP:${p.evs.spe||0}` : "N/A";
        
        const tacticalRole = calculateTacticalAptitude(p, baseStats);
        
        const moves = (p.moves || []).filter(m => m !== "").join(", ") || "Nenhum";
        const ribbonsCount = p.ribbons ? p.ribbons.length : 0;
        
        const isAmbassador = p.id === ambassadorId;
        const ambassadorBadge = isAmbassador ? `<span style="background: rgba(234, 179, 8, 0.15); color: #f59e0b; border: 1px solid rgba(234, 179, 8, 0.4); padding: 1px 4px; border-radius: 4px; font-size: 0.55rem; font-weight: 800; margin-left: 6px; display: inline-flex; align-items: center; gap: 2px;">👑 Embaixador</span>` : "";
        const nicknameDisplay = p.isShiny ? `⭐ ${p.nickname || p.species}` : (p.nickname || p.species);
        
        const evolutionNotes = p.evolutionNotes || "";
        const generalNotes = p.notes || "";
        
        let notesDisplay = `<span style="color:var(--text-muted); font-style:italic;">Sem notas</span>`;
        if (evolutionNotes && generalNotes) {
            notesDisplay = `
                <div><strong style="color: var(--game-color);">Evolução:</strong> ${evolutionNotes}</div>
                <div style="margin-top: 4px;"><strong style="color: var(--text-muted);">Geral:</strong> ${generalNotes}</div>
            `;
        } else if (evolutionNotes) {
            notesDisplay = `<div><strong style="color: var(--game-color);">Evolução:</strong> ${evolutionNotes}</div>`;
        } else if (generalNotes) {
            notesDisplay = `<div><strong style="color: var(--text-muted);">Geral:</strong> ${generalNotes}</div>`;
        }
        
        return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 10px; font-weight: bold;">
                    <div style="color: ${p.isShiny ? 'var(--color-electric)' : '#fff'}; display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                        ${nicknameDisplay} ${ambassadorBadge}
                    </div>
                    <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: normal; margin-top: 2px;">Nível ${p.level}</div>
                </td>
                <td style="padding: 10px;">
                    <span class="game-badge" style="background: ${gameColor}; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase;">
                        ${gameName}
                    </span>
                    <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px;">Treinador: <strong>${trainerName}</strong> ${trainerTid}</div>
                </td>
                <td style="padding: 10px; font-size: 0.65rem; line-height: 1.4;">
                    <div><strong style="color: var(--text-muted);">IVs:</strong> <span style="color: #fff;">${ivs}</span></div>
                    <div style="margin-top: 2px;"><strong style="color: var(--text-muted);">EVs:</strong> <span style="color: #fff;">${evs}</span></div>
                </td>
                <td style="padding: 10px;">
                    <span style="background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 800;">
                        ${tacticalRole}
                    </span>
                </td>
                <td style="padding: 10px; color: var(--text-muted); font-style: italic;">
                    ${moves}
                </td>
                <td style="padding: 10px; font-weight: 800; color: var(--color-electric);">
                    ${ribbonsCount > 0 ? `🎗️ ${ribbonsCount} Fitas` : `<span style="color:var(--text-muted); font-weight:normal;">Nenhuma</span>`}
                </td>
                <td style="padding: 10px; max-width: 220px; font-size: 0.7rem; line-height: 1.4; color: #fff; word-break: break-word;">
                    ${notesDisplay}
                </td>
                <td style="padding: 10px; text-align: center;">
                    <button class="btn btn-action" style="width:auto; padding: 4px 8px; font-size: 0.6rem; height: auto; line-height: 1; background: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.35);" onclick="openVoyageModal('${p.id}')">
                        ✈️ Viagem
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function renderMovesetHeatmap(pokedexId) {
    const container = document.getElementById("owndex-heatmap-container");
    if (!container) return;
    
    const specimens = pokemonDatabase
        .filter(p => p.pokedexId === pokedexId)
        .sort((a, b) => {
            const genA = GAMES_DB.find(g => g.id === a.currentGame)?.gen || 1;
            const genB = GAMES_DB.find(g => g.id === b.currentGame)?.gen || 1;
            if (genA !== genB) return genA - genB;
            return (a.level || 0) - (b.level || 0);
        });
        
    if (specimens.length === 0) {
        container.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">Adicione exemplares a este ecrã para ver a evolução de movesets.</span>`;
        return;
    }
    
    // Extract unique moves
    const allUniqueMoves = [];
    specimens.forEach(p => {
        (p.moves || []).forEach(m => {
            const cleanMove = m.trim();
            if (cleanMove && !allUniqueMoves.includes(cleanMove)) {
                allUniqueMoves.push(cleanMove);
            }
        });
    });
    
    if (allUniqueMoves.length === 0) {
        container.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">Nenhum dos exemplares tem movimentos registados.</span>`;
        return;
    }
    
    // Sort moves alphabetically
    allUniqueMoves.sort();
    
    // Build table header (columns = specimens)
    let headerHtml = `<th style="text-align: left; padding: 6px 10px; color: var(--text-muted);">Movimento</th>`;
    specimens.forEach(p => {
        const game = GAMES_DB.find(g => g.id === p.currentGame);
        const gameName = game ? game.name : p.currentGame;
        const genText = game ? `Gen ${game.gen}` : "";
        headerHtml += `
            <th style="padding: 6px 10px; text-align: center; font-size: 0.65rem; min-width: 100px;">
                <div style="font-weight: 900; color: #fff;">${p.nickname || p.species}</div>
                <div style="font-size: 0.55rem; color: var(--text-muted); margin-top: 2px;">Nível ${p.level} (${genText})</div>
            </th>
        `;
    });
    
    // Build table rows (rows = moves)
    let rowsHtml = "";
    allUniqueMoves.forEach(move => {
        rowsHtml += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">`;
        rowsHtml += `<td class="move-name">${move}</td>`;
        
        specimens.forEach((p, idx) => {
            const currentHas = (p.moves || []).includes(move);
            const prevHas = idx > 0 && (specimens[idx - 1].moves || []).includes(move);
            
            let cellClass = "heatmap-cell-none";
            let cellText = "·";
            
            if (currentHas && !prevHas) {
                cellClass = "heatmap-cell-new";
                cellText = "+ NOVO";
            } else if (currentHas && prevHas) {
                cellClass = "heatmap-cell-retained";
                cellText = "✓";
            } else if (!currentHas && prevHas) {
                cellClass = "heatmap-cell-deleted";
                cellText = "✕ DEL";
            }
            
            rowsHtml += `
                <td style="padding: 4px; text-align: center;">
                    <div class="heatmap-cell ${cellClass}">${cellText}</div>
                </td>
            `;
        });
        rowsHtml += `</tr>`;
    });
    
    container.innerHTML = `
        <table class="heatmap-table">
            <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    ${headerHtml}
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;
}

const TYPE_EFFECTIVENESS = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

const LEAGUE_OPPONENTS = {
    // Kanto
    red: { name: "Indigo Plateau (Kanto)", opponents: [
        { name: "Lorelei", emoji: "❄️", types: ["ice", "water"], weaknesses: ["electric", "grass", "fighting", "rock"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Agatha", emoji: "👻", types: ["ghost", "poison"], weaknesses: ["psychic", "ground", "ghost"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric", "dragon"] },
        { name: "Rival Blue", emoji: "👑", types: ["normal", "flying", "water"], weaknesses: ["electric", "ice", "rock", "ground"] }
    ]},
    blue: { name: "Indigo Plateau (Kanto)", opponents: [
        { name: "Lorelei", emoji: "❄️", types: ["ice", "water"], weaknesses: ["electric", "grass", "fighting", "rock"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Agatha", emoji: "👻", types: ["ghost", "poison"], weaknesses: ["psychic", "ground", "ghost"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric", "dragon"] },
        { name: "Rival Blue", emoji: "👑", types: ["normal", "flying", "fire"], weaknesses: ["water", "rock", "ground", "electric"] }
    ]},
    yellow: { name: "Indigo Plateau (Kanto)", opponents: [
        { name: "Lorelei", emoji: "❄️", types: ["ice", "water"], weaknesses: ["electric", "grass", "fighting", "rock"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Agatha", emoji: "👻", types: ["ghost", "poison"], weaknesses: ["psychic", "ground", "ghost"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric", "dragon"] },
        { name: "Rival Blue", emoji: "👑", types: ["normal", "flying", "electric"], weaknesses: ["ground", "ice", "rock", "electric"] }
    ]},
    firered: { name: "Indigo Plateau (Kanto)", opponents: [
        { name: "Lorelei", emoji: "❄️", types: ["ice", "water"], weaknesses: ["electric", "grass", "fighting", "rock"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Agatha", emoji: "👻", types: ["ghost", "poison"], weaknesses: ["psychic", "ground", "ghost", "dark"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric", "dragon"] },
        { name: "Rival", emoji: "👑", types: ["normal", "flying", "fire"], weaknesses: ["water", "rock", "ground", "electric"] }
    ]},
    leafgreen: { name: "Indigo Plateau (Kanto)", opponents: [
        { name: "Lorelei", emoji: "❄️", types: ["ice", "water"], weaknesses: ["electric", "grass", "fighting", "rock"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Agatha", emoji: "👻", types: ["ghost", "poison"], weaknesses: ["psychic", "ground", "ghost", "dark"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric", "dragon"] },
        { name: "Rival", emoji: "👑", types: ["normal", "flying", "water"], weaknesses: ["electric", "ice", "rock", "ground"] }
    ]},
    
    // Johto
    gold: { name: "Indigo Plateau (Johto)", opponents: [
        { name: "Will", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Koga", emoji: "☠️", types: ["poison"], weaknesses: ["psychic", "ground", "fire"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Karen", emoji: "🌙", types: ["dark"], weaknesses: ["fighting", "bug"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric"] }
    ]},
    silver: { name: "Indigo Plateau (Johto)", opponents: [
        { name: "Will", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Koga", emoji: "☠️", types: ["poison"], weaknesses: ["psychic", "ground", "fire"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Karen", emoji: "🌙", types: ["dark"], weaknesses: ["fighting", "bug"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric"] }
    ]},
    crystal: { name: "Indigo Plateau (Johto)", opponents: [
        { name: "Will", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Koga", emoji: "☠️", types: ["poison"], weaknesses: ["psychic", "ground", "fire"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Karen", emoji: "🌙", types: ["dark"], weaknesses: ["fighting", "bug"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric"] }
    ]},
    heartgold: { name: "Indigo Plateau (Johto)", opponents: [
        { name: "Will", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Koga", emoji: "☠️", types: ["poison"], weaknesses: ["psychic", "ground", "fire"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Karen", emoji: "🌙", types: ["dark"], weaknesses: ["fighting", "bug"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric"] }
    ]},
    soulsilver: { name: "Indigo Plateau (Johto)", opponents: [
        { name: "Will", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Koga", emoji: "☠️", types: ["poison"], weaknesses: ["psychic", "ground", "fire"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Karen", emoji: "🌙", types: ["dark"], weaknesses: ["fighting", "bug"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric"] }
    ]},
    
    // Hoenn
    ruby: { name: "Ever Grande City (Hoenn)", opponents: [
        { name: "Sidney", emoji: "🕶️", types: ["dark"], weaknesses: ["fighting", "bug"] },
        { name: "Phoebe", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Glacia", emoji: "❄️", types: ["ice"], weaknesses: ["fighting", "fire", "rock", "steel"] },
        { name: "Drake", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon"] },
        { name: "Steven", emoji: "🔩", types: ["steel", "rock"], weaknesses: ["fire", "fighting", "ground"] }
    ]},
    sapphire: { name: "Ever Grande City (Hoenn)", opponents: [
        { name: "Sidney", emoji: "🕶️", types: ["dark"], weaknesses: ["fighting", "bug"] },
        { name: "Phoebe", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Glacia", emoji: "❄️", types: ["ice"], weaknesses: ["fighting", "fire", "rock", "steel"] },
        { name: "Drake", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon"] },
        { name: "Steven", emoji: "🔩", types: ["steel", "rock"], weaknesses: ["fire", "fighting", "ground"] }
    ]},
    emerald: { name: "Ever Grande City (Hoenn)", opponents: [
        { name: "Sidney", emoji: "🕶️", types: ["dark"], weaknesses: ["fighting", "bug"] },
        { name: "Phoebe", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Glacia", emoji: "❄️", types: ["ice"], weaknesses: ["fighting", "fire", "rock", "steel"] },
        { name: "Drake", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon"] },
        { name: "Wallace", emoji: "🌊", types: ["water"], weaknesses: ["electric", "grass"] }
    ]},
    omegaruby: { name: "Ever Grande City (Hoenn)", opponents: [
        { name: "Sidney", emoji: "🕶️", types: ["dark"], weaknesses: ["fighting", "bug", "fairy"] },
        { name: "Phoebe", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Glacia", emoji: "❄️", types: ["ice"], weaknesses: ["fighting", "fire", "rock", "steel"] },
        { name: "Drake", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon", "fairy"] },
        { name: "Steven", emoji: "🔩", types: ["steel", "rock"], weaknesses: ["fire", "fighting", "ground"] }
    ]},
    alphasapphire: { name: "Ever Grande City (Hoenn)", opponents: [
        { name: "Sidney", emoji: "🕶️", types: ["dark"], weaknesses: ["fighting", "bug", "fairy"] },
        { name: "Phoebe", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Glacia", emoji: "❄️", types: ["ice"], weaknesses: ["fighting", "fire", "rock", "steel"] },
        { name: "Drake", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon", "fairy"] },
        { name: "Steven", emoji: "🔩", types: ["steel", "rock"], weaknesses: ["fire", "fighting", "ground"] }
    ]},
    
    // Sinnoh
    diamond: { name: "Pokémon League (Sinnoh)", opponents: [
        { name: "Aaron", emoji: "🐞", types: ["bug"], weaknesses: ["fire", "flying", "rock"] },
        { name: "Bertha", emoji: "🏜️", types: ["ground", "rock"], weaknesses: ["water", "grass", "ice"] },
        { name: "Flint", emoji: "🔥", types: ["fire"], weaknesses: ["water", "ground", "rock"] },
        { name: "Lucian", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Cynthia", emoji: "👑", types: ["dragon", "water", "ground"], weaknesses: ["ice", "dragon", "fairy"] }
    ]},
    pearl: { name: "Pokémon League (Sinnoh)", opponents: [
        { name: "Aaron", emoji: "🐞", types: ["bug"], weaknesses: ["fire", "flying", "rock"] },
        { name: "Bertha", emoji: "🏜️", types: ["ground", "rock"], weaknesses: ["water", "grass", "ice"] },
        { name: "Flint", emoji: "🔥", types: ["fire"], weaknesses: ["water", "ground", "rock"] },
        { name: "Lucian", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Cynthia", emoji: "👑", types: ["dragon", "water", "ground"], weaknesses: ["ice", "dragon", "fairy"] }
    ]},
    platinum: { name: "Pokémon League (Sinnoh)", opponents: [
        { name: "Aaron", emoji: "🐞", types: ["bug"], weaknesses: ["fire", "flying", "rock"] },
        { name: "Bertha", emoji: "🏜️", types: ["ground", "rock"], weaknesses: ["water", "grass", "ice"] },
        { name: "Flint", emoji: "🔥", types: ["fire"], weaknesses: ["water", "ground", "rock"] },
        { name: "Lucian", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Cynthia", emoji: "👑", types: ["dragon", "water", "ground"], weaknesses: ["ice", "dragon", "fairy"] }
    ]},
    brilliantdiamond: { name: "Pokémon League (Sinnoh)", opponents: [
        { name: "Aaron", emoji: "🐞", types: ["bug"], weaknesses: ["fire", "flying", "rock"] },
        { name: "Bertha", emoji: "🏜️", types: ["ground", "rock"], weaknesses: ["water", "grass", "ice"] },
        { name: "Flint", emoji: "🔥", types: ["fire"], weaknesses: ["water", "ground", "rock"] },
        { name: "Lucian", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Cynthia", emoji: "👑", types: ["dragon", "water", "ground"], weaknesses: ["ice", "dragon", "fairy"] }
    ]},
    shiningpearl: { name: "Pokémon League (Sinnoh)", opponents: [
        { name: "Aaron", emoji: "🐞", types: ["bug"], weaknesses: ["fire", "flying", "rock"] },
        { name: "Bertha", emoji: "🏜️", types: ["ground", "rock"], weaknesses: ["water", "grass", "ice"] },
        { name: "Flint", emoji: "🔥", types: ["fire"], weaknesses: ["water", "ground", "rock"] },
        { name: "Lucian", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Cynthia", emoji: "👑", types: ["dragon", "water", "ground"], weaknesses: ["ice", "dragon", "fairy"] }
    ]},
    
    // Unova
    black: { name: "Pokémon League (Unova)", opponents: [
        { name: "Shauntal", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Marshal", emoji: "👊", types: ["fighting"], weaknesses: ["psychic", "flying"] },
        { name: "Grimsley", emoji: "🌙", types: ["dark"], weaknesses: ["fighting", "bug"] },
        { name: "Caitlin", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Alder", emoji: "👑", types: ["bug", "fire"], weaknesses: ["fire", "flying", "rock", "water"] }
    ]},
    white: { name: "Pokémon League (Unova)", opponents: [
        { name: "Shauntal", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Marshal", emoji: "👊", types: ["fighting"], weaknesses: ["psychic", "flying"] },
        { name: "Grimsley", emoji: "🌙", types: ["dark"], weaknesses: ["fighting", "bug"] },
        { name: "Caitlin", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Alder", emoji: "👑", types: ["bug", "fire"], weaknesses: ["fire", "flying", "rock", "water"] }
    ]},
    black2: { name: "Pokémon League (Unova)", opponents: [
        { name: "Shauntal", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Marshal", emoji: "👊", types: ["fighting"], weaknesses: ["psychic", "flying", "fairy"] },
        { name: "Grimsley", emoji: "🌙", types: ["dark"], weaknesses: ["fighting", "bug", "fairy"] },
        { name: "Caitlin", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Iris", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon", "fairy"] }
    ]},
    white2: { name: "Pokémon League (Unova)", opponents: [
        { name: "Shauntal", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Marshal", emoji: "👊", types: ["fighting"], weaknesses: ["psychic", "flying", "fairy"] },
        { name: "Grimsley", emoji: "🌙", types: ["dark"], weaknesses: ["fighting", "bug", "fairy"] },
        { name: "Caitlin", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Iris", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon", "fairy"] }
    ]},
    
    // Kalos
    x: { name: "Lumiose City (Kalos)", opponents: [
        { name: "Malva", emoji: "🔥", types: ["fire"], weaknesses: ["water", "ground", "rock"] },
        { name: "Siebold", emoji: "🌊", types: ["water"], weaknesses: ["electric", "grass"] },
        { name: "Wikstrom", emoji: "🛡️", types: ["steel"], weaknesses: ["fire", "fighting", "ground"] },
        { name: "Drasna", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon", "fairy"] },
        { name: "Diantha", emoji: "👑", types: ["fairy", "rock"], weaknesses: ["steel", "poison"] }
    ]},
    y: { name: "Lumiose City (Kalos)", opponents: [
        { name: "Malva", emoji: "🔥", types: ["fire"], weaknesses: ["water", "ground", "rock"] },
        { name: "Siebold", emoji: "🌊", types: ["water"], weaknesses: ["electric", "grass"] },
        { name: "Wikstrom", emoji: "🛡️", types: ["steel"], weaknesses: ["fire", "fighting", "ground"] },
        { name: "Drasna", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon", "fairy"] },
        { name: "Diantha", emoji: "👑", types: ["fairy", "rock"], weaknesses: ["steel", "poison"] }
    ]},
    
    // Alola
    sun: { name: "Mount Lanakila (Alola)", opponents: [
        { name: "Hala", emoji: "👊", types: ["fighting"], weaknesses: ["psychic", "flying", "fairy"] },
        { name: "Olivia", emoji: "💎", types: ["rock"], weaknesses: ["water", "grass", "fighting", "ground", "steel"] },
        { name: "Acerola", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Kahili", emoji: "🦅", types: ["flying"], weaknesses: ["electric", "ice", "rock"] },
        { name: "Prof. Kukui", emoji: "👑", types: ["water", "fire", "grass"], weaknesses: ["electric", "ice", "ground"] }
    ]},
    moon: { name: "Mount Lanakila (Alola)", opponents: [
        { name: "Hala", emoji: "👊", types: ["fighting"], weaknesses: ["psychic", "flying", "fairy"] },
        { name: "Olivia", emoji: "💎", types: ["rock"], weaknesses: ["water", "grass", "fighting", "ground", "steel"] },
        { name: "Acerola", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Kahili", emoji: "🦅", types: ["flying"], weaknesses: ["electric", "ice", "rock"] },
        { name: "Prof. Kukui", emoji: "👑", types: ["water", "fire", "grass"], weaknesses: ["electric", "ice", "ground"] }
    ]},
    ultrasun: { name: "Mount Lanakila (Alola)", opponents: [
        { name: "Molayne", emoji: "🛡️", types: ["steel"], weaknesses: ["fire", "fighting", "ground"] },
        { name: "Olivia", emoji: "💎", types: ["rock"], weaknesses: ["water", "grass", "fighting", "ground", "steel"] },
        { name: "Acerola", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Kahili", emoji: "🦅", types: ["flying"], weaknesses: ["electric", "ice", "rock"] },
        { name: "Hau", emoji: "👑", types: ["water", "fire", "electric"], weaknesses: ["ground", "grass", "electric"] }
    ]},
    ultramoon: { name: "Mount Lanakila (Alola)", opponents: [
        { name: "Molayne", emoji: "🛡️", types: ["steel"], weaknesses: ["fire", "fighting", "ground"] },
        { name: "Olivia", emoji: "💎", types: ["rock"], weaknesses: ["water", "grass", "fighting", "ground", "steel"] },
        { name: "Acerola", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Kahili", emoji: "🦅", types: ["flying"], weaknesses: ["electric", "ice", "rock"] },
        { name: "Hau", emoji: "👑", types: ["water", "fire", "electric"], weaknesses: ["ground", "grass", "electric"] }
    ]},
    
    // Galar
    sword: { name: "Wyndon Stadium (Galar)", opponents: [
        { name: "Nessa", emoji: "🌊", types: ["water"], weaknesses: ["electric", "grass"] },
        { name: "Bea", emoji: "👊", types: ["fighting"], weaknesses: ["psychic", "flying", "fairy"] },
        { name: "Raihan", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon", "fairy"] },
        { name: "Leon", emoji: "👑", types: ["fire", "dragon", "ghost"], weaknesses: ["electric", "ice", "rock"] }
    ]},
    shield: { name: "Wyndon Stadium (Galar)", opponents: [
        { name: "Nessa", emoji: "🌊", types: ["water"], weaknesses: ["electric", "grass"] },
        { name: "Allister", emoji: "👻", types: ["ghost"], weaknesses: ["ghost", "dark"] },
        { name: "Raihan", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon", "fairy"] },
        { name: "Leon", emoji: "👑", types: ["fire", "dragon", "ghost"], weaknesses: ["electric", "ice", "rock"] }
    ]},
    
    // Hisui
    legendsarceus: { name: "Templo de Sinnoh (Hisui)", opponents: [
        { name: "Beni", emoji: "🥷", types: ["poison", "psychic", "fairy"], weaknesses: ["ground", "ghost"] },
        { name: "Kamado", emoji: "🛡️", types: ["steel", "fighting"], weaknesses: ["fire", "fighting", "ground"] },
        { name: "Volo", emoji: "⚡", types: ["fairy", "dragon", "fire"], weaknesses: ["ice", "fairy", "dragon"] },
        { name: "Giratina", emoji: "🐉", types: ["ghost", "dragon"], weaknesses: ["ghost", "dark", "ice", "fairy", "dragon"] }
    ]},

    // Paldea
    scarlet: { name: "Mesagoza (Paldea)", opponents: [
        { name: "Rika", emoji: "🏜️", types: ["ground"], weaknesses: ["water", "grass", "ice"] },
        { name: "Poppy", emoji: "🛡️", types: ["steel"], weaknesses: ["fire", "fighting", "ground"] },
        { name: "Larry", emoji: "🦅", types: ["flying"], weaknesses: ["electric", "ice", "rock"] },
        { name: "Hassel", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon", "fairy"] },
        { name: "Geeta", emoji: "👑", types: ["rock", "steel", "psychic"], weaknesses: ["fire", "fighting", "dark", "ghost"] }
    ]},
    violet: { name: "Mesagoza (Paldea)", opponents: [
        { name: "Rika", emoji: "🏜️", types: ["ground"], weaknesses: ["water", "grass", "ice"] },
        { name: "Poppy", emoji: "🛡️", types: ["steel"], weaknesses: ["fire", "fighting", "ground"] },
        { name: "Larry", emoji: "🦅", types: ["flying"], weaknesses: ["electric", "ice", "rock"] },
        { name: "Hassel", emoji: "🐉", types: ["dragon"], weaknesses: ["ice", "dragon", "fairy"] },
        { name: "Geeta", emoji: "👑", types: ["rock", "steel", "psychic"], weaknesses: ["fire", "fighting", "dark", "ghost"] }
    ]},
    
    // --- Ligas Extra, Revanches e Chefes Especiais ---
    firered_rematch: { name: "Indigo Plateau - Revanche (Kanto)", opponents: [
        { name: "Lorelei", emoji: "❄️", types: ["ice", "water"], weaknesses: ["electric", "grass", "fighting", "rock"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Agatha", emoji: "👻", types: ["ghost", "poison"], weaknesses: ["psychic", "ground", "ghost", "dark"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric", "dragon"] },
        { name: "Rival Blue", emoji: "👑", types: ["normal", "flying", "fire", "steel", "dark"], weaknesses: ["water", "rock", "ground", "fighting"] }
    ]},
    leafgreen_rematch: { name: "Indigo Plateau - Revanche (Kanto)", opponents: [
        { name: "Lorelei", emoji: "❄️", types: ["ice", "water"], weaknesses: ["electric", "grass", "fighting", "rock"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Agatha", emoji: "👻", types: ["ghost", "poison"], weaknesses: ["psychic", "ground", "ghost", "dark"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric", "dragon"] },
        { name: "Rival Blue", emoji: "👑", types: ["normal", "flying", "water", "steel", "dark"], weaknesses: ["electric", "ice", "rock", "fighting"] }
    ]},
    heartgold_rematch: { name: "Indigo Plateau - Revanche (Johto)", opponents: [
        { name: "Will", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Koga", emoji: "☠️", types: ["poison", "steel"], weaknesses: ["psychic", "ground", "fire"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Karen", emoji: "🌙", types: ["dark", "ghost"], weaknesses: ["fighting", "bug"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric"] }
    ]},
    soulsilver_rematch: { name: "Indigo Plateau - Revanche (Johto)", opponents: [
        { name: "Will", emoji: "🔮", types: ["psychic"], weaknesses: ["ghost", "dark", "bug"] },
        { name: "Koga", emoji: "☠️", types: ["poison", "steel"], weaknesses: ["psychic", "ground", "fire"] },
        { name: "Bruno", emoji: "👊", types: ["fighting", "rock"], weaknesses: ["psychic", "flying", "water", "grass"] },
        { name: "Karen", emoji: "🌙", types: ["dark", "ghost"], weaknesses: ["fighting", "bug"] },
        { name: "Lance", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "electric"] }
    ]},
    johto_red: { name: "Mt. Silver: Treinador Red (Johto)", opponents: [
        { name: "Red", emoji: "👑", types: ["electric", "normal", "water", "fire", "grass", "ice"], weaknesses: ["ground", "fighting", "rock"] }
    ]},
    emerald_rematch: { name: "Ever Grande City - Revanche (Hoenn)", opponents: [
        { name: "Sidney", emoji: "🕶️", types: ["dark", "grass"], weaknesses: ["fighting", "bug", "fire", "fairy"] },
        { name: "Phoebe", emoji: "👻", types: ["ghost", "dark"], weaknesses: ["ghost", "dark"] },
        { name: "Glacia", emoji: "❄️", types: ["ice", "water"], weaknesses: ["fighting", "fire", "rock", "steel"] },
        { name: "Drake", emoji: "🐉", types: ["dragon", "flying"], weaknesses: ["ice", "rock", "dragon", "fairy"] },
        { name: "Wallace", emoji: "🌊", types: ["water"], weaknesses: ["electric", "grass"] }
    ]},
    emerald_steven: { name: "Meteor Falls: Steven Stone (Hoenn)", opponents: [
        { name: "Steven Stone", emoji: "🔩", types: ["steel", "rock", "ground"], weaknesses: ["fire", "fighting", "ground", "water"] }
    ]},
    bw_cynthia: { name: "Undella Town: Campeã Cynthia (Unova)", opponents: [
        { name: "Cynthia", emoji: "🎼", types: ["dragon", "ground", "ghost", "water", "fighting"], weaknesses: ["ice", "fairy", "ghost", "dark"] }
    ]}
};

const GAME_CHALLENGES = {
    red: [{ id: "red", name: "🏆 Liga Pokémon (Primeira Run)" }],
    blue: [{ id: "blue", name: "🏆 Liga Pokémon (Primeira Run)" }],
    yellow: [{ id: "yellow", name: "🏆 Liga Pokémon (Primeira Run)" }],
    gold: [
        { id: "gold", name: "🏆 Liga Pokémon (Primeira Run)" },
        { id: "johto_red", name: "⛰️ Red no Mt. Silver" }
    ],
    silver: [
        { id: "silver", name: "🏆 Liga Pokémon (Primeira Run)" },
        { id: "johto_red", name: "⛰️ Red no Mt. Silver" }
    ],
    crystal: [
        { id: "crystal", name: "🏆 Liga Pokémon (Primeira Run)" },
        { id: "johto_red", name: "⛰️ Red no Mt. Silver" }
    ],
    firered: [
        { id: "firered", name: "🏆 Liga Pokémon (Primeira Run)" },
        { id: "firered_rematch", name: "⚡ Liga Pokémon (Revanche)" }
    ],
    leafgreen: [
        { id: "leafgreen", name: "🏆 Liga Pokémon (Primeira Run)" },
        { id: "leafgreen_rematch", name: "⚡ Liga Pokémon (Revanche)" }
    ],
    ruby: [{ id: "ruby", name: "🏆 Liga Pokémon (Primeira Run)" }],
    sapphire: [{ id: "sapphire", name: "🏆 Liga Pokémon (Primeira Run)" }],
    emerald: [
        { id: "emerald", name: "🏆 Liga Pokémon (Primeira Run)" },
        { id: "emerald_rematch", name: "⚡ Liga Pokémon (Revanche)" },
        { id: "emerald_steven", name: "💎 Steven nas Meteor Falls" }
    ],
    heartgold: [
        { id: "heartgold", name: "🏆 Liga Pokémon (Primeira Run)" },
        { id: "heartgold_rematch", name: "⚡ Liga Pokémon (Revanche)" },
        { id: "johto_red", name: "⛰️ Red no Mt. Silver" }
    ],
    soulsilver: [
        { id: "soulsilver", name: "🏆 Liga Pokémon (Primeira Run)" },
        { id: "soulsilver_rematch", name: "⚡ Liga Pokémon (Revanche)" },
        { id: "johto_red", name: "⛰️ Red no Mt. Silver" }
    ],
    black: [
        { id: "black", name: "🏆 Liga Pokémon (Primeira Run)" },
        { id: "bw_cynthia", name: "🎼 Cynthia em Undella Town" }
    ],
    white: [
        { id: "white", name: "🏆 Liga Pokémon (Primeira Run)" },
        { id: "bw_cynthia", name: "🎼 Cynthia em Undella Town" }
    ]
};

const COMMON_MOVES_TYPES = {
    "body slam": "normal", "slash": "normal", "hyper beam": "normal", "double edge": "normal", "quick attack": "normal",
    "extreme speed": "normal", "return": "normal", "frustration": "normal", "facade": "normal",
    "flamethrower": "fire", "fire blast": "fire", "fire punch": "fire", "flare blitz": "fire", "overheat": "fire", "ember": "fire",
    "surf": "water", "hydro pump": "water", "waterfall": "water", "scald": "water", "water gun": "water", "aqua tail": "water",
    "thunderbolt": "electric", "thunder": "electric", "thunder punch": "electric", "volt switch": "electric", "spark": "electric",
    "solarbeam": "grass", "solar beam": "grass", "giga drain": "grass", "energy ball": "grass", "leaf storm": "grass", "razor leaf": "grass",
    "ice beam": "ice", "blizzard": "ice", "ice punch": "ice", "icicle crash": "ice", "powder snow": "ice", "avalanche": "ice",
    "close combat": "fighting", "superpower": "fighting", "dynamic punch": "fighting", "brick break": "fighting", "drain punch": "fighting",
    "sludge bomb": "poison", "toxic": "poison", "poison jab": "poison", "gunk shot": "poison", "sludge wave": "poison",
    "earthquake": "ground", "earth power": "ground", "dig": "ground", "mud shot": "ground",
    "fly": "flying", "hurricane": "flying", "brave bird": "flying", "air slash": "flying", "gust": "flying",
    "psychic": "psychic", "psyshock": "psychic", "zen headbutt": "psychic", "confusion": "psychic",
    "bug buzz": "bug", "u-turn": "bug", "x-scissor": "bug", "signal beam": "bug", "leech life": "bug",
    "rock slide": "rock", "stone edge": "rock", "power gem": "rock", "rock tomb": "rock",
    "shadow ball": "ghost", "shadow claw": "ghost", "shadow sneak": "ghost", "astonish": "ghost",
    "dragon claw": "dragon", "draco meteor": "dragon", "dragon pulse": "dragon", "outrage": "dragon",
    "dark pulse": "dark", "crunch": "dark", "bite": "dark", "knock off": "dark", "foul play": "dark",
    "iron head": "steel", "flash cannon": "steel", "steel wing": "steel", "meteor mash": "steel",
    "moonblast": "fairy", "play rough": "fairy", "dazzling gleam": "fairy", "draining kiss": "fairy"
};

function getTypeMultiplier(atk, def, gen = 9) {
    atk = atk.toLowerCase();
    def = def.toLowerCase();
    
    // Gen 1 specific checks
    if (gen === 1) {
        if (atk === "ghost" && def === "psychic") return 0;
        if (atk === "bug" && def === "poison") return 2;
        if (atk === "poison" && def === "bug") return 2;
        if (["dark", "steel", "fairy"].includes(atk) || ["dark", "steel", "fairy"].includes(def)) return 1;
    }
    
    // Pre-Gen 6 Steel resistances
    if (gen < 6) {
        if (def === "steel" && (atk === "ghost" || atk === "dark")) return 0.5;
    }
    
    // No Fairy type before Gen 6
    if (gen < 6) {
        if (atk === "fairy" || def === "fairy") return 1;
    }
    
    // Normal lookup
    if (TYPE_EFFECTIVENESS[atk] && TYPE_EFFECTIVENESS[atk][def] !== undefined) {
        return TYPE_EFFECTIVENESS[atk][def];
    }
    
    return 1;
}

function guessMoveType(moveName) {
    const clean = moveName.toLowerCase().trim().replace("-", " ");
    if (COMMON_MOVES_TYPES[clean]) {
        return COMMON_MOVES_TYPES[clean];
    }
    if (clean.includes("fire") || clean.includes("flame") || clean.includes("blitz") || clean.includes("burn")) return "fire";
    if (clean.includes("water") || clean.includes("hydro") || clean.includes("surf") || clean.includes("aqua") || clean.includes("liquid")) return "water";
    if (clean.includes("bolt") || clean.includes("thunder") || clean.includes("volt") || clean.includes("spark")) return "electric";
    if (clean.includes("grass") || clean.includes("leaf") || clean.includes("solar") || clean.includes("seed") || clean.includes("mega")) return "grass";
    if (clean.includes("ice") || clean.includes("blizzard") || clean.includes("freeze") || clean.includes("snow") || clean.includes("frost")) return "ice";
    if (clean.includes("punch") || clean.includes("kick") || clean.includes("combat") || clean.includes("fist") || clean.includes("chop")) return "fighting";
    if (clean.includes("poison") || clean.includes("sludge") || clean.includes("toxic") || clean.includes("acid")) return "poison";
    if (clean.includes("earth") || clean.includes("ground") || clean.includes("mud") || clean.includes("sand") || clean.includes("dig")) return "ground";
    if (clean.includes("fly") || clean.includes("air") || clean.includes("wing") || clean.includes("hurricane") || clean.includes("gust")) return "flying";
    if (clean.includes("psych") || clean.includes("psy") || clean.includes("mind") || clean.includes("zen")) return "psychic";
    if (clean.includes("bug") || clean.includes("scissor") || clean.includes("leech") || clean.includes("sting") || clean.includes("web")) return "bug";
    if (clean.includes("rock") || clean.includes("stone") || clean.includes("gem") || clean.includes("slide")) return "rock";
    if (clean.includes("ghost") || clean.includes("shadow") || clean.includes("spook") || clean.includes("curse")) return "ghost";
    if (clean.includes("dragon") || clean.includes("draco") || clean.includes("outrage")) return "dragon";
    if (clean.includes("dark") || clean.includes("crunch") || clean.includes("bite") || clean.includes("shadow") || clean.includes("night") || clean.includes("thief")) return "dark";
    if (clean.includes("steel") || clean.includes("iron") || clean.includes("metal") || clean.includes("shield")) return "steel";
    if (clean.includes("fairy") || clean.includes("gleam") || clean.includes("moon") || clean.includes("kiss") || clean.includes("charm") || clean.includes("play")) return "fairy";
    
    return "normal";
}

function calculatePokemonLeagueScore(p, opponent, gen) {
    let score = 0;
    
    score += (p.level || 50) * 1.5;
    
    let defenseRating = 0;
    opponent.types.forEach(opType => {
        const mult1 = getTypeMultiplier(opType, p.type1 || "normal", gen);
        const mult2 = p.type2 ? getTypeMultiplier(opType, p.type2, gen) : 1;
        const totalMult = mult1 * mult2;
        
        if (totalMult < 1) {
            defenseRating += 15;
            if (totalMult === 0) defenseRating += 10;
        } else if (totalMult > 1) {
            defenseRating -= 20;
        }
    });
    score += defenseRating;
    
    let offenseRating = 0;
    opponent.types.forEach(opType => {
        const mult1 = getTypeMultiplier(p.type1 || "normal", opType, gen);
        const mult2 = p.type2 ? getTypeMultiplier(p.type2, opType, gen) : 1;
        if (mult1 > 1 || mult2 > 1) {
            offenseRating += 10;
        }
    });
    
    const moves = p.moves || [];
    let hasSuperEffectiveMove = false;
    
    moves.forEach(m => {
        if (!m) return;
        const moveType = guessMoveType(m);
        
        opponent.types.forEach(opType => {
            const mult = getTypeMultiplier(moveType, opType, gen);
            if (mult > 1) {
                hasSuperEffectiveMove = true;
                offenseRating += 20;
                if (moveType === p.type1 || moveType === p.type2) {
                    offenseRating += 5;
                }
            }
        });
    });
    
    if (hasSuperEffectiveMove) {
        offenseRating += 15;
    }
    
    score += offenseRating;
    return score;
}

let currentAllocationRecommendation = [];
let currentAllocationOpponentId = null;

function populateOpponentSelect() {
    const select = document.getElementById("allocation-opponent-select");
    if (!select) return;
    
    const allGroups = [
        {
            label: "Geração 1 (Kanto)",
            options: [
                { id: "red", name: "🏆 Liga Pokémon - Red" },
                { id: "blue", name: "🏆 Liga Pokémon - Blue" },
                { id: "yellow", name: "🏆 Liga Pokémon - Yellow" }
            ]
        },
        {
            label: "Geração 2 (Johto)",
            options: [
                { id: "gold", name: "🏆 Liga Pokémon - Gold" },
                { id: "silver", name: "🏆 Liga Pokémon - Silver" },
                { id: "crystal", name: "🏆 Liga Pokémon - Crystal" },
                { id: "johto_red", name: "⛰️ Red no Mt. Silver" }
            ]
        },
        {
            label: "Geração 3 (Hoenn / Kanto)",
            options: [
                { id: "ruby", name: "🏆 Liga Pokémon - Ruby" },
                { id: "sapphire", name: "🏆 Liga Pokémon - Sapphire" },
                { id: "emerald", name: "🏆 Liga Pokémon - Emerald" },
                { id: "emerald_rematch", name: "⚡ Liga Pokémon (Revanche) - Emerald" },
                { id: "emerald_steven", name: "💎 Steven nas Meteor Falls" },
                { id: "firered", name: "🏆 Liga Pokémon - FireRed" },
                { id: "leafgreen", name: "🏆 Liga Pokémon - LeafGreen" },
                { id: "firered_rematch", name: "⚡ Liga Pokémon (Revanche) - FireRed" },
                { id: "leafgreen_rematch", name: "⚡ Liga Pokémon (Revanche) - LeafGreen" }
            ]
        },
        {
            label: "Geração 4 (Sinnoh / Johto)",
            options: [
                { id: "diamond", name: "🏆 Liga Pokémon - Diamond" },
                { id: "pearl", name: "🏆 Liga Pokémon - Pearl" },
                { id: "platinum", name: "🏆 Liga Pokémon - Platinum" },
                { id: "heartgold", name: "🏆 Liga Pokémon - HeartGold" },
                { id: "soulsilver", name: "🏆 Liga Pokémon - SoulSilver" },
                { id: "heartgold_rematch", name: "⚡ Liga Pokémon (Revanche) - HeartGold" },
                { id: "soulsilver_rematch", name: "⚡ Liga Pokémon (Revanche) - SoulSilver" }
            ]
        },
        {
            label: "Geração 5 (Unova)",
            options: [
                { id: "black", name: "🏆 Liga Pokémon - Black" },
                { id: "white", name: "🏆 Liga Pokémon - White" },
                { id: "black2", name: "🏆 Liga Pokémon - Black 2" },
                { id: "white2", name: "🏆 Liga Pokémon - White 2" },
                { id: "bw_cynthia", name: "🎼 Cynthia em Undella Town" }
            ]
        },
        {
            label: "Geração 6 (Kalos / Hoenn)",
            options: [
                { id: "x", name: "🏆 Liga Pokémon - X" },
                { id: "y", name: "🏆 Liga Pokémon - Y" },
                { id: "omegaruby", name: "🏆 Liga Pokémon - Omega Ruby" },
                { id: "alphasapphire", name: "🏆 Liga Pokémon - Alpha Sapphire" }
            ]
        },
        {
            label: "Geração 7 (Alola)",
            options: [
                { id: "sun", name: "🏆 Liga Pokémon - Sun" },
                { id: "moon", name: "🏆 Liga Pokémon - Moon" },
                { id: "ultrasun", name: "🏆 Liga Pokémon - Ultra Sun" },
                { id: "ultramoon", name: "🏆 Liga Pokémon - Ultra Moon" }
            ]
        },
        {
            label: "Geração 8 (Galar / Sinnoh / Hisui)",
            options: [
                { id: "sword", name: "🏆 Copa dos Campeões - Sword" },
                { id: "shield", name: "🏆 Copa dos Campeões - Shield" },
                { id: "brilliantdiamond", name: "🏆 Liga Pokémon - Brilliant Diamond" },
                { id: "shiningpearl", name: "🏆 Liga Pokémon - Shining Pearl" },
                { id: "legendsarceus", name: "⛰️ Templo de Sinnoh (Legends)" }
            ]
        },
        {
            label: "Geração 9 (Paldea)",
            options: [
                { id: "scarlet", name: "🏆 Liga Pokémon - Scarlet" },
                { id: "violet", name: "🏆 Liga Pokémon - Violet" }
            ]
        }
    ];
    
    let allChallengeIds = [];
    allGroups.forEach(grp => {
        allChallengeIds = allChallengeIds.concat(grp.options.map(o => o.id));
    });
    
    if (!currentAllocationOpponentId || !allChallengeIds.includes(currentAllocationOpponentId)) {
        const currentCartridgeChallenges = GAME_CHALLENGES[currentGameId] || [{ id: currentGameId }];
        currentAllocationOpponentId = currentCartridgeChallenges[0].id;
    }
    
    select.innerHTML = allGroups.map(grp => {
        const optionsHtml = grp.options.map(o => `<option value="${o.id}">${o.name}</option>`).join("");
        return `<optgroup label="${grp.label}">${optionsHtml}</optgroup>`;
    }).join("");
    
    select.value = currentAllocationOpponentId;
}

function changeAllocationOpponent(opponentId) {
    currentAllocationOpponentId = opponentId;
    renderAllocationTab();
}

function saveRecommendedAsPreset() {
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
        trainerId: activeTrainerId,
        name: presetName,
        pokemonIds: currentAllocationRecommendation.map(p => p.id)
    };
    
    teamPresetsList.push(newPreset);
    localStorage.setItem("bb_team_presets", JSON.stringify(teamPresetsList));
    
    renderPresets();
    
    alert(`Preset "${presetName}" gravado com sucesso!`);
}

function getRecommendedAllocation() {
    const game = GAMES_DB.find(g => g.id === currentGameId);
    const gen = game ? game.gen : 9;
    
    const opponentId = currentAllocationOpponentId || currentGameId;
    const league = LEAGUE_OPPONENTS[opponentId] || LEAGUE_OPPONENTS[currentGameId] || LEAGUE_OPPONENTS["red"];
    
    const boxList = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.trainerId === activeTrainerId);
    
    if (boxList.length === 0) {
        return [];
    }
    
    const chosenTeam = [];
    const usedIds = new Set();
    
    league.opponents.forEach(opponent => {
        let bestPkmn = null;
        let bestScore = -999;
        
        boxList.forEach(p => {
            if (usedIds.has(p.id)) return;
            const score = calculatePokemonLeagueScore(p, opponent, gen);
            if (score > bestScore) {
                bestScore = score;
                bestPkmn = p;
            }
        });
        
        if (bestPkmn) {
            chosenTeam.push({
                pokemon: bestPkmn,
                counterFor: opponent.name,
                counterEmoji: opponent.emoji,
                score: bestScore
            });
            usedIds.add(bestPkmn.id);
        }
    });
    
    while (chosenTeam.length < 6 && chosenTeam.length < boxList.length) {
        let bestPkmn = null;
        let bestScore = -999;
        let counterFor = "Reserva Tática";
        let counterEmoji = "🛡️";
        
        boxList.forEach(p => {
            if (usedIds.has(p.id)) return;
            
            let avgScore = 0;
            league.opponents.forEach(opponent => {
                avgScore += calculatePokemonLeagueScore(p, opponent, gen);
            });
            avgScore /= league.opponents.length;
            
            if (avgScore > bestScore) {
                bestScore = avgScore;
                bestPkmn = p;
            }
        });
        
        if (bestPkmn) {
            chosenTeam.push({
                pokemon: bestPkmn,
                counterFor: counterFor,
                counterEmoji: counterEmoji,
                score: bestScore
            });
            usedIds.add(bestPkmn.id);
        }
    }
    
    currentAllocationRecommendation = chosenTeam.map(t => t.pokemon);
    return chosenTeam;
}

function applyRecommendedAllocation() {
    if (currentAllocationRecommendation.length === 0) {
        alert("Nenhum Pokémon disponível na Box do treinador ativo para efetuar a alocação.");
        return;
    }
    
    if (!confirm(`Desejas alocar estes ${currentAllocationRecommendation.length} Pokémon como a tua equipa ativa para a Liga local?`)) {
        return;
    }
    
    pokemonDatabase.forEach(p => {
        if (p.currentGame === currentGameId && p.trainerId === activeTrainerId) {
            p.slotType = "box";
        }
    });
    
    currentAllocationRecommendation.forEach((pkmn, index) => {
        const found = pokemonDatabase.find(p => p.id === pkmn.id);
        if (found) {
            found.slotType = "team";
            found.slotIndex = index;
        }
    });
    
    localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
    renderAll();
    switchTab("boxes");
    alert("Frota tática alocada com sucesso! A tua equipa ativa foi atualizada.");
}

function renderAllocationTab() {
    const game = GAMES_DB.find(g => g.id === currentGameId);
    const gen = game ? game.gen : 9;
    
    populateOpponentSelect();
    
    const opponentId = currentAllocationOpponentId || currentGameId;
    const league = LEAGUE_OPPONENTS[opponentId] || LEAGUE_OPPONENTS[currentGameId] || LEAGUE_OPPONENTS["red"];
    
    const leagueNameSpan = document.getElementById("allocation-league-name");
    if (leagueNameSpan) {
        leagueNameSpan.textContent = league.name;
    }
    
    const opponentsGrid = document.getElementById("allocation-opponents-grid");
    if (opponentsGrid) {
        opponentsGrid.innerHTML = league.opponents.map(opp => {
            const typesBadge = opp.types.map(t => `<span class="type-badge t-${t}" style="font-size: 0.55rem; padding: 2px 4px; border-radius: 4px; text-transform: uppercase;">${t}</span>`).join(" ");
            const weakBadges = opp.weaknesses.map(w => `<span class="type-badge t-${w}" style="font-size: 0.5rem; padding: 1px 3px; border-radius: 3px; text-transform: uppercase;" title="Fraco a ${w}">${w}</span>`).join("");
            
            return `
                <div class="glass-panel" style="padding: 10px; text-align: center; border: 1px solid rgba(255,255,255,0.04); background: rgba(0,0,0,0.15);">
                    <div style="font-size: 1.5rem; margin-bottom: 4px;">${opp.emoji}</div>
                    <div style="font-weight: 800; font-size: 0.8rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${opp.name}">${opp.name}</div>
                    <div style="margin-top: 4px; display: flex; justify-content: center; gap: 2px; flex-wrap: wrap;">${typesBadge}</div>
                    <div style="margin-top: 6px;">
                        <div style="font-size: 0.55rem; color: var(--text-muted); margin-bottom: 2px;">Vulnerabilidades:</div>
                        <div style="display: flex; gap: 2px; justify-content: center; flex-wrap: wrap;">${weakBadges}</div>
                    </div>
                </div>
            `;
        }).join("");
    }
    
    const recommendations = getRecommendedAllocation();
    
    const teamGrid = document.getElementById("allocation-team-grid");
    if (teamGrid) {
        if (recommendations.length === 0) {
            teamGrid.innerHTML = `<div style="grid-column: span 6; text-align: center; padding: 20px; font-size: 0.8rem; color: var(--text-muted);">Nenhum Pokémon registado na Box do Treinador Ativo. Regista exemplares ou importa um save para ver a alocação!</div>`;
        } else {
            teamGrid.innerHTML = recommendations.map(rec => {
                const p = rec.pokemon;
                const getSprite = (pkmn) => {
                    const id = pkmn.pokedexId || 1;
                    if (currentSpriteStyle === "classic") {
                        return pkmn.isShiny
                            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
                            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
                    } else if (currentSpriteStyle === "3d-home") {
                        return pkmn.isShiny
                            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`
                            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
                    } else {
                        return pkmn.isShiny
                            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`
                            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
                    }
                };
                
                const typeBadges = [p.type1];
                if (p.type2) typeBadges.push(p.type2);
                const typeBadgesHtml = typeBadges.map(t => `<span class="type-badge t-${t}" style="font-size: 0.55rem; padding: 2px 4px; border-radius: 4px; text-transform: uppercase;">${t}</span>`);
                
                return `
                    <div class="glass-panel slot" style="padding: 12px; text-align: center; border-radius: 12px; background: rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.03);">
                        <span style="font-size: 0.55rem; font-weight: 800; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--accent-success); padding: 1px 4px; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px; margin-bottom: 4px;">
                            ${rec.counterEmoji} Counter: ${rec.counterFor}
                        </span>
                        <div style="width: 60px; height: 60px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                            <img src="${getSprite(p)}" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokedexId}.png'">
                        </div>
                        <h4 style="font-size: 0.8rem; margin: 4px 0 2px 0; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nickname || p.species}</h4>
                        <div style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 4px;">Nível ${p.level}</div>
                        <div style="display: flex; gap: 2px; justify-content: center;">${typeBadgesHtml.join(" ")}</div>
                    </div>
                `;
            }).join("");
        }
    }
    
    const activeTeam = recommendations.map(rec => rec.pokemon);
    renderWeaknessAnalysis(activeTeam, gen);
    renderPresets();
}

function renderWeaknessAnalysis(team, gen) {
    const critWeaknessesDiv = document.getElementById("allocation-critical-weaknesses");
    const coveragesDiv = document.getElementById("allocation-team-coverages");
    const redundanciesDiv = document.getElementById("allocation-type-redundancies");
    const suggestionsDiv = document.getElementById("allocation-moveset-suggestions");
    
    if (!critWeaknessesDiv || !coveragesDiv || !redundanciesDiv || !suggestionsDiv) return;
    
    if (team.length === 0) {
        critWeaknessesDiv.innerHTML = `<span style="color: var(--text-muted);">Sem dados de equipa.</span>`;
        coveragesDiv.innerHTML = `<span style="color: var(--text-muted);">Sem dados de equipa.</span>`;
        redundanciesDiv.innerHTML = `<span style="color: var(--text-muted);">Sem dados de equipa.</span>`;
        suggestionsDiv.innerHTML = `<span style="color: var(--text-muted);">Sem dados de equipa.</span>`;
        return;
    }
    
    const types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
    
    const weaknessCounts = {};
    const resistanceCounts = {};
    const immunityCounts = {};
    
    types.forEach(t => {
        weaknessCounts[t] = 0;
        resistanceCounts[t] = 0;
        immunityCounts[t] = 0;
    });
    
    team.forEach(p => {
        types.forEach(t => {
            const mult1 = getTypeMultiplier(t, p.type1 || "normal", gen);
            const mult2 = p.type2 ? getTypeMultiplier(t, p.type2, gen) : 1;
            const totalMult = mult1 * mult2;
            
            if (totalMult === 0) {
                immunityCounts[t]++;
            } else if (totalMult < 1) {
                resistanceCounts[t]++;
            } else if (totalMult > 1) {
                weaknessCounts[t]++;
            }
        });
    });
    
    const criticals = types.filter(t => weaknessCounts[t] >= 3);
    if (criticals.length === 0) {
        critWeaknessesDiv.innerHTML = `<span style="color: var(--accent-success); font-weight: 800; display: flex; align-items: center; gap: 4px;">✅ Nenhuma fraqueza crítica! A equipa está bem equilibrada.</span>`;
    } else {
        critWeaknessesDiv.innerHTML = criticals.map(t => {
            return `<span class="type-badge t-${t}" style="font-size: 0.65rem; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; font-weight: 900; border: 1px solid var(--accent-danger); box-shadow: 0 0 8px rgba(239, 68, 68, 0.1);" title="${weaknessCounts[t]} membros fracos a ${t}">
                ⚠️ ${t} (${weaknessCounts[t]}x fracos)
            </span>`;
        }).join(" ");
    }
    
    const coverages = types.filter(t => (resistanceCounts[t] + immunityCounts[t]) >= 3);
    if (coverages.length === 0) {
        coveragesDiv.innerHTML = `<span style="color: var(--text-muted);">Nenhuma imunidade/resistência predominante (>= 3).</span>`;
    } else {
        coveragesDiv.innerHTML = coverages.map(t => {
            const label = immunityCounts[t] > 0 ? `🛡️ ${t} (imune+res)` : `🛡️ ${t}`;
            return `<span class="type-badge t-${t}" style="font-size: 0.65rem; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; font-weight: 900; border: 1px solid var(--accent-success); opacity: 0.85;" title="${resistanceCounts[t] + immunityCounts[t]} coberturas contra ${t}">
                ${label}
            </span>`;
        }).join(" ");
    }
    
    const typeCounts = {};
    team.forEach(p => {
        if (p.type1) typeCounts[p.type1] = (typeCounts[p.type1] || 0) + 1;
        if (p.type2) typeCounts[p.type2] = (typeCounts[p.type2] || 0) + 1;
    });
    
    const redundancies = Object.keys(typeCounts).filter(t => typeCounts[t] >= 2);
    if (redundancies.length === 0) {
        redundanciesDiv.innerHTML = `<span style="color: var(--accent-success); font-weight: 800;">✅ Excelente diversidade de tipagem. Sem redundâncias de tipo!</span>`;
    } else {
        redundanciesDiv.innerHTML = redundancies.map(t => {
            return `
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.02); padding: 4px 0;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="type-badge t-${t}" style="font-size: 0.55rem; padding: 1px 4px; border-radius: 4px; text-transform: uppercase;">${t}</span>
                        <span>Partilhado por <strong>${typeCounts[t]}</strong> Pokémon</span>
                    </div>
                    <span style="font-size: 0.65rem; color: var(--text-muted);">Sugestão: diversificar tipo</span>
                </div>
            `;
        }).join("");
    }
    
    const suggestions = [];
    
    team.forEach(p => {
        const moves = p.moves || [];
        const isWater = p.type1 === "water" || p.type2 === "water";
        const isFire = p.type1 === "fire" || p.type2 === "fire";
        const isFighting = p.type1 === "fighting" || p.type2 === "fighting";
        const isNormal = p.type1 === "normal" || p.type2 === "normal";
        const isElectric = p.type1 === "electric" || p.type2 === "electric";
        const isGrass = p.type1 === "grass" || p.type2 === "grass";
        const isPsychic = p.type1 === "psychic" || p.type2 === "psychic";
        const isGround = p.type1 === "ground" || p.type2 === "ground";
        const isDragon = p.type1 === "dragon" || p.type2 === "dragon";
        
        const hasIceMove = moves.some(m => guessMoveType(m) === "ice");
        const hasGroundMove = moves.some(m => guessMoveType(m) === "ground");
        const hasFireMove = moves.some(m => guessMoveType(m) === "fire");
        const hasElectricMove = moves.some(m => guessMoveType(m) === "electric");
        const hasGhostDarkMove = moves.some(m => ["ghost", "dark"].includes(guessMoveType(m)));
        const hasFightingMove = moves.some(m => guessMoveType(m) === "fighting");
        const hasRockMove = moves.some(m => guessMoveType(m) === "rock");
        
        if (isWater && !hasIceMove) {
            const list = [
                { display: "Raio Gelo (Ice Beam)", english: "Ice Beam" },
                { display: "Nevasca (Blizzard)", english: "Blizzard" }
            ].filter(m => canPokemonLearnMove(p, m.english, gen));
            
            if (list.length > 0) {
                const moveDesc = list.map(m => m.display).join(" / ");
                suggestions.push({
                    pkmn: p,
                    move: moveDesc,
                    movesList: list,
                    reason: "Fornece cobertura super eficaz crucial contra os tipos Planta e Dragão que ameaçam Pokémon de Água."
                });
            }
        }
        
        if (isFire && !hasGroundMove && !hasRockMove) {
            const list = [
                { display: "Terramoto (Earthquake)", english: "Earthquake" },
                { display: "Deslize de Rocha (Rock Slide)", english: "Rock Slide" }
            ].filter(m => canPokemonLearnMove(p, m.english, gen));
            
            if (list.length > 0) {
                const moveDesc = list.map(m => m.display).join(" / ");
                suggestions.push({
                    pkmn: p,
                    move: moveDesc,
                    movesList: list,
                    reason: "Permite atacar outros Pokémon de Fogo, Rocha e Aço de forma super eficaz."
                });
            }
        }
        
        if (isNormal && !hasFightingMove && !hasGroundMove) {
            let list = [
                { display: "Combate Próximo (Close Combat)", english: "Close Combat" },
                { display: "Terramoto (Earthquake)", english: "Earthquake" }
            ];
            if (gen === 1) {
                list = [
                    { display: "Submissão (Submission)", english: "Submission" },
                    { display: "Terramoto (Earthquake)", english: "Earthquake" }
                ];
            } else if (gen === 2) {
                list = [
                    { display: "Soco Dinâmico (Dynamic Punch)", english: "Dynamic Punch" },
                    { display: "Terramoto (Earthquake)", english: "Earthquake" }
                ];
            } else if (gen === 3) {
                list = [
                    { display: "Quebra Tijolo (Brick Break)", english: "Brick Break" },
                    { display: "Terramoto (Earthquake)", english: "Earthquake" }
                ];
            }
            const filteredList = list.filter(m => canPokemonLearnMove(p, m.english, gen));
            if (filteredList.length > 0) {
                const moveDesc = filteredList.map(m => m.display).join(" / ");
                suggestions.push({
                    pkmn: p,
                    move: moveDesc,
                    movesList: filteredList,
                    reason: "Normal precisa de movimentos de Luta/Terra para passar por adversários de Rocha e Aço."
                });
            }
        }
        
        if (isFighting && !hasRockMove && !hasIceMove) {
            const list = [
                { display: "Deslize de Rocha (Rock Slide)", english: "Rock Slide" },
                { display: "Soco Gelo (Ice Punch)", english: "Ice Punch" }
            ].filter(m => canPokemonLearnMove(p, m.english, gen));
            
            if (list.length > 0) {
                const moveDesc = list.map(m => m.display).join(" / ");
                suggestions.push({
                    pkmn: p,
                    move: moveDesc,
                    movesList: list,
                    reason: "Excelente cobertura para abater as ameaças dos tipos Voador e Psíquico."
                });
            }
        }
        
        if (isElectric) {
            const hasGrass = moves.some(m => guessMoveType(m) === "grass");
            if (!hasIceMove && !hasGrass) {
                let list = [
                    { display: "Poder Oculto (Planta/Gelo)", english: "Hidden Power" },
                    { display: "Sinal Luminoso (Signal Beam)", english: "Signal Beam" }
                ];
                if (gen === 1) {
                    list = [
                        { display: "Golpe de Corpo (Body Slam)", english: "Body Slam" },
                        { display: "Submissão (Submission)", english: "Submission" }
                    ];
                } else if (gen === 2) {
                    list = [
                        { display: "Poder Oculto (Planta/Gelo)", english: "Hidden Power" },
                        { display: "Swift", english: "Swift" }
                    ];
                }
                const filteredList = list.filter(m => canPokemonLearnMove(p, m.english, gen));
                if (filteredList.length > 0) {
                    const moveDesc = filteredList.map(m => m.display).join(" / ");
                    suggestions.push({
                        pkmn: p,
                        move: moveDesc,
                        movesList: filteredList,
                        reason: "Evita ser completamente parado por Pokémon do tipo Terra imunes a Elétrico."
                    });
                }
            }
        }
        
        if (isPsychic && !hasGhostDarkMove) {
            let list = [
                { display: "Bola Sombra (Shadow Ball)", english: "Shadow Ball" },
                { display: "Pulso Sombrio (Dark Pulse)", english: "Dark Pulse" }
            ];
            if (gen === 1) {
                list = [
                    { display: "Relâmpago (Thunderbolt)", english: "Thunderbolt" },
                    { display: "Raio Gelo (Ice Beam)", english: "Ice Beam" }
                ];
            } else if (gen === 2 || gen === 3) {
                list = [
                    { display: "Bola Sombra (Shadow Ball)", english: "Shadow Ball" },
                    { display: "Mordida (Bite)", english: "Bite" }
                ];
            }
            const filteredList = list.filter(m => canPokemonLearnMove(p, m.english, gen));
            if (filteredList.length > 0) {
                const moveDesc = filteredList.map(m => m.display).join(" / ");
                suggestions.push({
                    pkmn: p,
                    move: moveDesc,
                    movesList: filteredList,
                    reason: "Crucial para revidar contra outros Psíquicos e contra o tipo Fantasma."
                });
            }
        }
        
        if (isDragon && !hasFireMove && !hasGroundMove) {
            const list = [
                { display: "Lança-Chamas (Flamethrower)", english: "Flamethrower" },
                { display: "Terramoto (Earthquake)", english: "Earthquake" }
            ].filter(m => canPokemonLearnMove(p, m.english, gen));
            
            if (list.length > 0) {
                const moveDesc = list.map(m => m.display).join(" / ");
                suggestions.push({
                    pkmn: p,
                    move: moveDesc,
                    movesList: list,
                    reason: "Impede que Pokémon do tipo Aço resistam aos teus ataques de Dragão."
                });
            }
        }
        
        // Check for duplicate moves
        const uniqueMoves = new Set();
        let hasDuplicates = false;
        moves.forEach(m => {
            if (m) {
                const norm = m.toLowerCase().trim();
                if (uniqueMoves.has(norm)) {
                    hasDuplicates = true;
                }
                uniqueMoves.add(norm);
            }
        });
        
        if (hasDuplicates) {
            const recommendedFour = getFourRecommendedMoves(p, gen);
            const movesList = recommendedFour.filter(r => !moves.some(m => m && m.toLowerCase().trim() === r.english.toLowerCase().trim()));
            
            if (movesList.length > 0) {
                suggestions.push({
                    pkmn: p,
                    move: "Substituir ataques repetidos",
                    movesList: movesList,
                    reason: "Este exemplar tem ataques repetidos no moveset. Substitui por ataques de cobertura para diversificar."
                });
            }
        }
        
        if (moves.length < 4) {
            const recommendedFour = getFourRecommendedMoves(p, gen);
            const movesList = recommendedFour.filter(r => !moves.some(m => m && m.toLowerCase().trim() === r.english.toLowerCase().trim()));
            
            if (movesList.length > 0) {
                suggestions.push({
                    pkmn: p,
                    move: "Preencher slots vazios",
                    movesList: movesList,
                    reason: "Este exemplar tem slots de movimentos vazios. Completa o moveset com ataques de cobertura úteis."
                });
            }
        }
    });
    
    suggestions.sort((a, b) => (b.pkmn.level || 0) - (a.pkmn.level || 0));
    
    if (suggestions.length === 0) {
        suggestionsDiv.innerHTML = `<span style="color: var(--accent-success); font-size: 0.75rem;">A equipa tem um excelente leque de coberturas em todos os movesets!</span>`;
    } else {
        suggestionsDiv.innerHTML = suggestions.slice(0, 5).map(s => {
            const buttonsHtml = (s.movesList || []).map(m => {
                const escapedEnglish = m.english.replace(/'/g, "\\'");
                const escapedDisplay = m.display.replace(/'/g, "\\'");
                return `
                    <button class="btn btn-action" onclick="applyRecommendedMove('${s.pkmn.id}', '${escapedEnglish}', '${escapedDisplay}')" style="font-size: 0.6rem; padding: 2px 6px; font-weight: 800; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.05); color: #fff; cursor: pointer;">
                        ➕ ${m.english}
                    </button>
                `;
            }).join(" ");
            
            return `
                <div style="background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04); display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-weight: 800; font-size: 0.8rem; color: #fff;">${s.pkmn.nickname || s.pkmn.species}</span>
                        <span style="font-size: 0.7rem; font-weight: 800; color: var(--game-color); background: rgba(99,102,241,0.08); padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(99,102,241,0.25);">
                            Recomenda-se: ${s.move}
                        </span>
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-muted); line-height: 1.3;">
                        ${s.reason}
                    </div>
                    ${buttonsHtml ? `<div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;"><span style="font-size: 0.6rem; color: var(--text-muted); font-weight: 800;">Aplicar:</span> ${buttonsHtml}</div>` : ""}
                </div>
            `;
        }).join("");
    }
}

function applyRecommendedMove(pokemonId, moveEnglishName, moveDisplayName) {
    const pkmn = pokemonDatabase.find(p => p.id === pokemonId);
    if (!pkmn) {
        alert("Pokémon não encontrado!");
        return;
    }
    
    const moves = pkmn.moves || [];
    let targetSlot = -1;
    
    // Check if there is an empty slot first
    for (let i = 0; i < 4; i++) {
        if (!moves[i]) {
            targetSlot = i;
            break;
        }
    }
    
    if (targetSlot !== -1) {
        moves[targetSlot] = moveEnglishName;
        pkmn.moves = moves;
        localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
        renderAll();
        alert(`Sucesso! Adicionado o ataque "${moveEnglishName}" no slot vazio de ${pkmn.nickname || pkmn.species}.`);
        return;
    }
    
    // Prompt the user to replace one of the existing moves
    const msg = `Qual ataque de ${pkmn.nickname || pkmn.species} desejas substituir por "${moveEnglishName}"?\n` +
                `1: ${moves[0] || 'Vazio'}\n` +
                `2: ${moves[1] || 'Vazio'}\n` +
                `3: ${moves[2] || 'Vazio'}\n` +
                `4: ${moves[3] || 'Vazio'}\n\n` +
                `Digite o número da opção (1, 2, 3 ou 4):`;
                
    const choice = prompt(msg);
    if (choice === null) return;
    
    const choiceNum = parseInt(choice.trim(), 10);
    if (choiceNum >= 1 && choiceNum <= 4) {
        const oldMove = moves[choiceNum - 1];
        moves[choiceNum - 1] = moveEnglishName;
        pkmn.moves = moves;
        localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
        renderAll();
        alert(`Sucesso! Substituído o ataque "${oldMove || 'Vazio'}" por "${moveEnglishName}" em ${pkmn.nickname || pkmn.species}.`);
    } else {
        alert("Escolha inválida. Introduza um número de 1 a 4.");
    }
}

let tempGeneratedPartition = [];

function openPartitionModal() {
    const modal = document.getElementById("partition-modal");
    if (modal) modal.classList.add("active");
}

function closePartitionModal() {
    const modal = document.getElementById("partition-modal");
    if (modal) modal.classList.remove("active");
}

function generateAndShowBoxPartition() {
    const pool = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.trainerId === activeTrainerId);
    if (pool.length < 6) {
        alert("Precisas de ter pelo menos 6 Pokémon registados sob o treinador ativo para efetuar a divisão em equipas.");
        return;
    }

    const game = GAMES_DB.find(g => g.id === currentGameId);
    const gen = game ? game.gen : 9;
    const league = LEAGUE_OPPONENTS[currentGameId] || LEAGUE_OPPONENTS["red"];
    
    const remainingPool = [...pool];
    const generatedTeams = [];
    
    let teamCounter = 1;
    
    while (remainingPool.length >= 6) {
        const team = [];
        const usedIndices = new Set();
        
        league.opponents.forEach(opponent => {
            if (team.length >= 6) return;
            let bestIdx = -1;
            let bestScore = -999;
            
            remainingPool.forEach((p, idx) => {
                if (usedIndices.has(idx)) return;
                const score = calculatePokemonLeagueScore(p, opponent, gen);
                if (score > bestScore) {
                    bestScore = score;
                    bestIdx = idx;
                }
            });
            
            if (bestIdx !== -1) {
                team.push(remainingPool[bestIdx]);
                usedIndices.add(bestIdx);
            }
        });
        
        while (team.length < 6 && team.length < remainingPool.length) {
            let bestIdx = -1;
            let bestScore = -999;
            
            remainingPool.forEach((p, idx) => {
                if (usedIndices.has(idx)) return;
                
                let avgScore = 0;
                league.opponents.forEach(opponent => {
                    avgScore += calculatePokemonLeagueScore(p, opponent, gen);
                });
                avgScore /= league.opponents.length;
                
                if (avgScore > bestScore) {
                    bestScore = avgScore;
                    bestIdx = idx;
                }
            });
            
            if (bestIdx !== -1) {
                team.push(remainingPool[bestIdx]);
                usedIndices.add(bestIdx);
            }
        }
        
        const sortedIndices = Array.from(usedIndices).sort((a, b) => b - a);
        sortedIndices.forEach(idx => {
            remainingPool.splice(idx, 1);
        });
        
        generatedTeams.push({
            id: "gen_team_" + teamCounter,
            defaultName: `Equipa Tática #${teamCounter}`,
            pokemon: team
        });
        
        teamCounter++;
    }
    
    tempGeneratedPartition = generatedTeams;
    renderPartitionModalResults();
    openPartitionModal();
}

function renderPartitionModalResults() {
    const container = document.getElementById("partition-results-container");
    if (!container) return;
    
    if (tempGeneratedPartition.length === 0) {
        container.innerHTML = `<p style="font-size: 0.8rem; text-align: center; color: var(--text-muted);">Nenhuma equipa pôde ser gerada.</p>`;
        return;
    }
    
    const getSprite = (p) => {
        const id = p.pokedexId || 1;
        if (currentSpriteStyle === "classic") {
            return p.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        } else if (currentSpriteStyle === "3d-home") {
            return p.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
        } else {
            return p.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
        }
    };
    
    let html = "";
    
    tempGeneratedPartition.forEach((gt, idx) => {
        const membersHtml = gt.pokemon.map(p => {
            const types = [p.type1];
            if (p.type2) types.push(p.type2);
            const badges = types.map(t => `<span class="type-badge t-${t}" style="font-size: 0.5rem; padding: 1px 3px; border-radius: 3px; text-transform: uppercase;">${t}</span>`).join(" ");
            
            return `
                <div style="flex: 1; text-align: center; min-width: 60px; background: rgba(255,255,255,0.02); padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);">
                    <img src="${getSprite(p)}" style="width: 40px; height: 40px; object-fit: contain;" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokedexId}.png'">
                    <div style="font-size: 0.65rem; font-weight: 800; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.nickname || p.species}</div>
                    <div style="font-size: 0.55rem; color: var(--text-muted); margin-bottom: 2px;">Nível ${p.level}</div>
                    <div>${badges}</div>
                </div>
            `;
        }).join("");
        
        html += `
            <div class="glass-panel" style="padding: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(99, 102, 241, 0.01);">
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 8px;">
                    <span style="font-size: 0.75rem; font-weight: 800; color: var(--game-color);">Nome da Equipa:</span>
                    <input type="text" id="partition-name-${gt.id}" value="${gt.defaultName}" style="flex: 1; padding: 6px 10px; font-size: 0.75rem; border-radius: 6px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); color: #fff;">
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${membersHtml}
                </div>
            </div>
        `;
    });
    
    const pool = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.trainerId === activeTrainerId);
    const usedCount = tempGeneratedPartition.length * 6;
    const leftoverCount = pool.length - usedCount;
    
    if (leftoverCount > 0) {
        html += `
            <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 10px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px; background: rgba(255,255,255,0.01);">
                ℹ️ Sobraram <strong>${leftoverCount}</strong> Pokémon na Box que não completaram um grupo de 6 e permanecerão na Box.
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function saveGeneratedPartitionPresets() {
    if (tempGeneratedPartition.length === 0) return;
    
    tempGeneratedPartition.forEach(gt => {
        const input = document.getElementById(`partition-name-${gt.id}`);
        const finalName = input ? input.value.trim() : gt.defaultName;
        
        const newPreset = {
            id: "preset_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
            name: finalName || gt.defaultName,
            gameId: currentGameId,
            trainerId: activeTrainerId,
            pokemonIds: gt.pokemon.map(p => p.id)
        };
        
        teamPresetsList.push(newPreset);
    });
    
    localStorage.setItem("bb_team_presets", JSON.stringify(teamPresetsList));
    closePartitionModal();
    renderPresets();
    alert("Presets salvos com sucesso! Podes visualizá-los e ativá-los abaixo.");
}

function renderPresets() {
    const container = document.getElementById("allocation-presets-container");
    if (!container) return;
    
    const activePresets = teamPresetsList.filter(tp => tp.gameId === currentGameId && tp.trainerId === activeTrainerId);
    
    if (activePresets.length === 0) {
        container.innerHTML = `
            <div style="grid-column: span 3; text-align: center; padding: 20px; font-size: 0.75rem; color: var(--text-muted); border: 1px dashed rgba(255,255,255,0.05); border-radius: 8px; background: rgba(0,0,0,0.1);">
                Nenhum preset de equipa registado para este cartucho/treinador. Clica em "Dividir Box em Equipas" para gerar automaticamente.
            </div>
        `;
        return;
    }
    
    const getSprite = (p) => {
        const id = p.pokedexId || 1;
        if (currentSpriteStyle === "classic") {
            return p.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        } else if (currentSpriteStyle === "3d-home") {
            return p.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
        } else {
            return p.isShiny
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
        }
    };
    
    container.innerHTML = activePresets.map(preset => {
        const resolvedMembers = [];
        preset.pokemonIds.forEach(id => {
            const found = pokemonDatabase.find(p => p.id === id);
            if (found) resolvedMembers.push(found);
        });
        
        const membersHtml = resolvedMembers.map(p => {
            return `
                <div style="text-align: center; flex: 1; min-width: 38px;">
                    <img src="${getSprite(p)}" style="width: 32px; height: 32px; object-fit: contain;" title="${p.nickname || p.species} (Nível ${p.level})" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokedexId}.png'">
                    <div style="font-size: 0.55rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 36px;">${p.nickname || p.species}</div>
                </div>
            `;
        }).join("");
        
        return `
            <div class="glass-panel" style="padding: 12px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.01); display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 800; font-size: 0.8rem; color: #fff;" id="preset-title-${preset.id}">${preset.name}</span>
                        <div style="display: flex; gap: 4px;">
                            <button class="btn btn-action" style="width: auto; padding: 2px 6px; font-size: 0.6rem;" onclick="renamePreset('${preset.id}')" title="Renomear">✏️</button>
                            <button class="btn btn-danger" style="width: auto; padding: 2px 6px; font-size: 0.6rem;" onclick="deletePreset('${preset.id}')" title="Eliminar">🗑️</button>
                        </div>
                    </div>
                    <div style="display: flex; gap: 4px; background: rgba(0,0,0,0.15); padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.03);">
                        ${membersHtml}
                        ${resolvedMembers.length < 6 ? '<span style="font-size:0.6rem; color:var(--text-muted); align-self:center;">(Incompleta)</span>' : ''}
                    </div>
                </div>
                <button class="btn btn-primary" onclick="loadPreset('${preset.id}')" style="width: 100%; padding: 6px; font-size: 0.7rem; font-weight: 800; background: rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.25); color: var(--game-color);">
                    ⚡ Ativar este Preset
                </button>
            </div>
        `;
    }).join("");
}

function loadPreset(presetId) {
    const preset = teamPresetsList.find(tp => tp.id === presetId);
    if (!preset) return;
    
    if (!confirm(`Desejas carregar o preset "${preset.name}"? Isso irá substituir a tua equipa ativa atual.`)) {
        return;
    }
    
    pokemonDatabase.forEach(p => {
        if (p.currentGame === currentGameId && p.trainerId === activeTrainerId) {
            p.slotType = "box";
        }
    });
    
    preset.pokemonIds.forEach((id, index) => {
        const found = pokemonDatabase.find(p => p.id === id);
        if (found) {
            found.slotType = "team";
            found.slotIndex = index;
        }
    });
    
    localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
    renderAll();
    switchTab("boxes");
    alert(`Preset "${preset.name}" ativado com sucesso!`);
}

function deletePreset(presetId) {
    const preset = teamPresetsList.find(tp => tp.id === presetId);
    if (!preset) return;
    
    if (!confirm(`Tem a certeza que deseja eliminar o preset "${preset.name}"?`)) {
        return;
    }
    
    teamPresetsList = teamPresetsList.filter(tp => tp.id !== presetId);
    localStorage.setItem("bb_team_presets", JSON.stringify(teamPresetsList));
    renderPresets();
}

function renamePreset(presetId) {
    const preset = teamPresetsList.find(tp => tp.id === presetId);
    if (!preset) return;
    
    const newName = prompt(`Introduza o novo nome para o preset "${preset.name}":`, preset.name);
    if (newName === null) return;
    
    const trimmed = newName.trim();
    if (!trimmed) {
        alert("O nome do preset não pode estar vazio.");
        return;
    }
    
    preset.name = trimmed;
    localStorage.setItem("bb_team_presets", JSON.stringify(teamPresetsList));
    renderPresets();
}
function cleanSlateActiveTrainer() {
    const trainer = trainersList.find(t => t.id === activeTrainerId && t.gameId === currentGameId);
    const trainerName = trainer ? trainer.name : "Treinador Atual";
    
    if (!confirm(`Desejas mesmo apagar TODOS os Pokémon e Presets do treinador "${trainerName}" no jogo atual? Esta ação é irreversível e apagará também as fotos do Mural de Honra!`)) {
        return;
    }
    
    // 1. Limpar Pokémon da base de dados para o treinador ativo e jogo atual
    pokemonDatabase = pokemonDatabase.filter(p => !(p.currentGame === currentGameId && p.trainerId === activeTrainerId));
    localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
    
    // 2. Limpar Presets de Equipa para o treinador ativo e jogo atual
    teamPresetsList = teamPresetsList.filter(tp => !(tp.gameId === currentGameId && tp.trainerId === activeTrainerId));
    localStorage.setItem("bb_team_presets", JSON.stringify(teamPresetsList));
    
    // 2.1. Limpar Desafios para o treinador ativo e jogo atual
    challengesList = challengesList.filter(ch => !(ch.gameId === currentGameId && (ch.trainerId === activeTrainerId || (!ch.trainerId && activeTrainerId === `trainer_${ch.gameId}_default`))));
    localStorage.setItem("bb_challenges", JSON.stringify(challengesList));
    
    // 3. Limpar Mural de Honra (Hall of Fame) deste treinador no IndexedDB
    if (dbInstance) {
        try {
            const tx = dbInstance.transaction("hall_of_fame", "readwrite");
            const store = tx.objectStore("hall_of_fame");
            const key = currentGameId + "_" + activeTrainerId;
            store.delete(key);
        } catch (err) {
            console.error("Erro ao apagar registos do Mural de Honra no IndexedDB:", err);
        }
    }
    
    // 4. Re-renderizar tudo
    renderAll();
    alert(`Clean Slate concluído! Todos os dados de Pokémon, presets e mural do treinador "${trainerName}" foram eliminados.`);
}

let minimalModeEnabled = localStorage.getItem("bb_minimal_mode") === "true";
let uploadedSaveBuffer = null;
let uploadedSaveName = "";
let uploadedSaveGen = 0;
let uploadedSaveIsCrystal = false;
let uploadedSaveActiveSectorStart = 0;

let currentVisualTheme = localStorage.getItem("bb_visual_theme") || "default";

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
        loadSpeciesDatalist(); 
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
    }).catch(err => {
        console.error("Falha ao carregar IndexedDB, inicializando com localStorage de fallback:", err);
        cleanupDuplicates();
        setupDatalists(); 
        loadSpeciesDatalist(); 
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
    });
};

// ==========================================================================
// 💾 Dicionários e Editor de Saves Binários (Gen 1-3)
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

function exportModifiedSave() {
    if (!uploadedSaveBuffer) {
        alert("Nenhum ficheiro de save foi carregado nesta sessão.");
        return;
    }
    
    if (uploadedSaveGen < 1 || uploadedSaveGen > 3) {
        alert("A gravação e exportação de saves é suportada apenas para as Gerações 1, 2 e 3.");
        return;
    }

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
    
    const workingBuffer = uploadedSaveBuffer.slice(0);
    const u8 = new Uint8Array(workingBuffer);
    
    const rawSavable = pokemonDatabase.filter(p => p.saveMeta && p.saveMeta.gen === uploadedSaveGen);
    
    // Deduplicate savable pokemon by unique memory slot to prevent older unmodified imports from overwriting newer edits
    const uniqueSlots = new Map();
    rawSavable.forEach(p => {
        const meta = p.saveMeta;
        let slotKey = "";
        if (meta.gen === 1) {
            slotKey = `${meta.isParty}_${meta.structOffset}`;
        } else if (meta.gen === 2) {
            slotKey = `${meta.isParty}_${meta.structOffset}`;
        } else if (meta.gen === 3) {
            slotKey = `${meta.structOffset}`;
        }
        
        if (uniqueSlots.has(slotKey)) {
            const existing = uniqueSlots.get(slotKey);
            // Select the one with the most moves or customized notes (i.e. the one edited by the user)
            const existingScore = (existing.notes && existing.notes !== "Importado do ficheiro de save." ? 5 : 0) + (existing.moves && existing.moves.length > 0 ? existing.moves.length : 0);
            const currentScore = (p.notes && p.notes !== "Importado do ficheiro de save." ? 5 : 0) + (p.moves && p.moves.length > 0 ? p.moves.length : 0);
            if (currentScore > existingScore) {
                uniqueSlots.set(slotKey, p);
            }
        } else {
            uniqueSlots.set(slotKey, p);
        }
    });
    
    const savablePokemon = Array.from(uniqueSlots.values());
    
    if (savablePokemon.length === 0) {
        alert("Não existem alterações para gravar de volta no save.");
        return;
    }
    
    let modifyCount = 0;
    
    savablePokemon.forEach(pkmn => {
        const meta = pkmn.saveMeta;
        
        if (meta.gen === 1) {
            const structOffset = meta.structOffset;
            const moves = pkmn.moves || [];
            
            for (let m = 0; m < 4; m++) {
                const moveName = getEnglishMoveName(moves[m]);
                const moveId = BINARY_MOVES_MAP[moveName] || 0;
                u8[structOffset + 8 + m] = moveId;
                
                if (moveId > 0) {
                    u8[structOffset + 29 + m] = 20; // PP
                } else {
                    u8[structOffset + 29 + m] = 0;
                }
            }
            
            if (meta.isParty === false) {
                // If it is in the Active Box, recalculate the Active Box checksum at 0x3522
                let boxSum = 0;
                for (let i = 0x30C0; i < 0x3522; i++) {
                    boxSum += u8[i];
                }
                u8[0x3522] = (~boxSum) & 0xFF;
            }
            
            modifyCount++;
        } 
        else if (meta.gen === 2) {
            // Write to both primary slot and backup slot (which is primary offset + 0x4000)
            const offsets = [meta.structOffset, meta.structOffset + 0x4000];
            
            offsets.forEach(structOffset => {
                const itemName = getEnglishItemName(pkmn.item);
                const itemId = BINARY_ITEMS_MAP_GEN2[itemName] || 0;
                u8[structOffset + 1] = itemId;
                
                const moves = pkmn.moves || [];
                for (let m = 0; m < 4; m++) {
                    const moveName = getEnglishMoveName(moves[m]);
                    const moveId = BINARY_MOVES_MAP[moveName] || 0;
                    u8[structOffset + 2 + m] = moveId;
                    
                    if (moveId > 0) {
                        u8[structOffset + 23 + m] = 20; // PP
                    } else {
                        u8[structOffset + 23 + m] = 0;
                    }
                }
            });
            
            modifyCount++;
        }
        else if (meta.gen === 3) {
            let sectorIndex = -1;
            for (let s = 0; s < 14; s++) {
                const sIdx = uploadedSaveActiveSectorStart + s;
                const offset = sIdx * 4096;
                const sig = u8[offset + 0x0FF8] | (u8[offset + 0x0FF9] << 8) | (u8[offset + 0x0FFA] << 16) | (u8[offset + 0x0FFB] << 24);
                if (sig === 0x08012025 && u8[offset + 0x0FF4] === 1) {
                    sectorIndex = sIdx;
                    break;
                }
            }
            
            if (sectorIndex === -1) return;
            
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
                const encryptedWord = u8[wordOffset] | (u8[wordOffset + 1] << 8) | (u8[wordOffset + 2] << 16) | (u8[wordOffset + 3] << 24);
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
                const itemName = getEnglishItemName(pkmn.item);
                const itemId = BINARY_ITEMS_MAP_GEN3[itemName] || 0;
                decryptedBytes[gOffset + 2] = itemId & 0xFF;
                decryptedBytes[gOffset + 3] = (itemId >> 8) & 0xFF;
            }
            
            if (blockAIdx !== -1) {
                const aOffset = blockAIdx * 12;
                const moves = pkmn.moves || [];
                for (let m = 0; m < 4; m++) {
                    const moveName = getEnglishMoveName(moves[m]);
                    const moveId = BINARY_MOVES_MAP[moveName] || 0;
                    
                    decryptedBytes[aOffset + m * 2] = moveId & 0xFF;
                    decryptedBytes[aOffset + m * 2 + 1] = (moveId >> 8) & 0xFF;
                    
                    if (moveId > 0) {
                        decryptedBytes[aOffset + 8 + m] = 20;
                    } else {
                        decryptedBytes[aOffset + 8 + m] = 0;
                    }
                }
            }
            
            // Recalculate 16-bit decrypted Pokémon checksum
            let pkmnSum = 0;
            const decryptedWords16 = new Uint16Array(decryptedWords.buffer);
            for (let k = 0; k < 24; k++) {
                pkmnSum = (pkmnSum + decryptedWords16[k]) & 0xFFFF;
            }
            u8[structOffset + 28] = pkmnSum & 0xFF;
            u8[structOffset + 29] = (pkmnSum >> 8) & 0xFF;
            
            // Re-encrypt the 12 words of the data block and write them back
            const encryptedWords = new Uint32Array(decryptedWords.buffer);
            for (let j = 0; j < 12; j++) {
                const wordOffset = structOffset + 0x20 + j * 4;
                const encryptedWord = encryptedWords[j] ^ key;
                
                u8[wordOffset] = encryptedWord & 0xFF;
                u8[wordOffset + 1] = (encryptedWord >> 8) & 0xFF;
                u8[wordOffset + 2] = (encryptedWord >> 16) & 0xFF;
                u8[wordOffset + 3] = (encryptedWord >> 24) & 0xFF;
            }
            
            // Recalculate Sector 1 Checksum
            let sum = 0;
            for (let j = 0; j < 0x0F80; j += 4) {
                const offsetInSector = sectorOffset + j;
                const val = u8[offsetInSector] | (u8[offsetInSector + 1] << 8) | (u8[offsetInSector + 2] << 16) | (u8[offsetInSector + 3] << 24);
                sum += val;
            }
            const checksum = ((sum & 0xFFFF) + (sum >>> 16)) & 0xFFFF;
            
            u8[sectorOffset + 0x0FF6] = checksum & 0xFF;
            u8[sectorOffset + 0x0FF7] = (checksum >> 8) & 0xFF;
            
            modifyCount++;
        }
    });
    
    if (uploadedSaveGen === 1) {
        let sum = 0;
        for (let i = 0x2598; i < 0x3523; i++) {
            sum += u8[i];
        }
        u8[0x3523] = (~sum) & 0xFF;
    } 
    else if (uploadedSaveGen === 2) {
        if (uploadedSaveIsCrystal) {
            let sum1 = 0;
            for (let i = 0x2009; i <= 0x2B82; i++) {
                sum1 += u8[i];
            }
            u8[0x2B83] = (sum1 >> 8) & 0xFF;
            u8[0x2B84] = sum1 & 0xFF;
            
            let sum2 = 0;
            for (let i = 0x2B85; i <= 0x2D0C; i++) {
                sum2 += u8[i];
            }
            u8[0x2D0D] = (sum2 >> 8) & 0xFF;
            u8[0x2D0E] = sum2 & 0xFF;
            
            // Also write crystal backup checksums (Bank 2)
            let sum1Backup = 0;
            for (let i = 0x6009; i <= 0x6B82; i++) {
                sum1Backup += u8[i];
            }
            u8[0x6B83] = (sum1Backup >> 8) & 0xFF;
            u8[0x6B84] = sum1Backup & 0xFF;
            
            let sum2Backup = 0;
            for (let i = 0x6B85; i <= 0x6D0C; i++) {
                sum2Backup += u8[i];
            }
            u8[0x6D0D] = (sum2Backup >> 8) & 0xFF;
            u8[0x6D0E] = sum2Backup & 0xFF;
        } else {
            let sum = 0;
            for (let i = 0x2009; i <= 0x2D0C; i++) {
                sum += u8[i];
            }
            u8[0x2D0D] = (sum >> 8) & 0xFF;
            u8[0x2D0E] = sum & 0xFF;
            
            // Also write GS backup checksum (Bank 2)
            let sumBackup = 0;
            for (let i = 0x6009; i <= 0x6D0C; i++) {
                sumBackup += u8[i];
            }
            u8[0x6D0D] = (sumBackup >> 8) & 0xFF;
            u8[0x6D0E] = sumBackup & 0xFF;
        }
    }
    
    const blob = new Blob([workingBuffer], {type: "application/octet-stream"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = (uploadedSaveName || "savefile.sav").replace(/\.sav$/i, "_editado.sav");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Sucesso! Save modificado gravado com ${modifyCount} alterações.`);
}

// --- SECTION MOVESET LEARNSET VALIDATION ---
const LEARNSET_CACHE = {};
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
            
            // Re-render recommendations since we now have the accurate learnset
            const game = GAMES_DB.find(g => g.id === currentGameId);
            const gen = game ? game.gen : 9;
            const recommendations = getRecommendedAllocation();
            const activeTeam = recommendations.map(rec => rec.pokemon);
            renderWeaknessAnalysis(activeTeam, gen);
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

function getFourRecommendedMoves(pkmn, gen) {
    const moves = [];
    const addMove = (mEnglish, mDisplay) => {
        if (moves.length >= 4) return;
        if (moves.some(x => x.english === mEnglish)) return;
        if (canPokemonLearnMove(pkmn, mEnglish, gen)) {
            moves.push({ display: mDisplay, english: mEnglish });
        }
    };

    const isType = (t) => pkmn.type1 === t || pkmn.type2 === t;

    // 1. Water STAB / Coverage
    if (isType("water")) {
        addMove("Surf", "Surf (Surf)");
        addMove("Ice Beam", "Raio Gelo (Ice Beam)");
        addMove("Earthquake", "Terramoto (Earthquake)");
        addMove("Body Slam", "Golpe de Corpo (Body Slam)");
        addMove("Blizzard", "Nevasca (Blizzard)");
        addMove("Bite", "Mordida (Bite)");
    }
    // 2. Fire STAB / Coverage
    if (isType("fire")) {
        addMove("Flamethrower", "Lança-Chamas (Flamethrower)");
        addMove("Earthquake", "Terramoto (Earthquake)");
        addMove("Rock Slide", "Deslize de Rocha (Rock Slide)");
        addMove("Body Slam", "Golpe de Corpo (Body Slam)");
        addMove("Brick Break", "Quebra Tijolo (Brick Break)");
    }
    // 3. Electric STAB / Coverage
    if (isType("electric")) {
        addMove("Thunderbolt", "Relâmpago (Thunderbolt)");
        addMove("Body Slam", "Golpe de Corpo (Body Slam)");
        addMove("Swift", "Swift (Swift)");
        addMove("Submission", "Submissão (Submission)");
        addMove("Brick Break", "Quebra Tijolo (Brick Break)");
    }
    // 4. Grass STAB / Coverage
    if (isType("grass")) {
        addMove("Giga Drain", "Giga Dreno (Giga Drain)");
        addMove("Sludge Bomb", "Bomba Lodo (Sludge Bomb)");
        addMove("Body Slam", "Golpe de Corpo (Body Slam)");
        addMove("Earthquake", "Terramoto (Earthquake)");
    }
    // 5. Psychic STAB / Coverage
    if (isType("psychic")) {
        addMove("Psychic", "Psíquico (Psychic)");
        addMove("Thunderbolt", "Relâmpago (Thunderbolt)");
        addMove("Ice Beam", "Raio Gelo (Ice Beam)");
        addMove("Shadow Ball", "Bola Sombra (Shadow Ball)");
        addMove("Bite", "Mordida (Bite)");
    }
    // 6. Fighting STAB / Coverage
    if (isType("fighting")) {
        if (gen >= 4) addMove("Close Combat", "Combate Próximo (Close Combat)");
        addMove("Brick Break", "Quebra Tijolo (Brick Break)");
        addMove("Rock Slide", "Deslize de Rocha (Rock Slide)");
        addMove("Ice Punch", "Soco Gelo (Ice Punch)");
        addMove("Submission", "Submissão (Submission)");
        addMove("Earthquake", "Terramoto (Earthquake)");
    }
    // 7. Dragon STAB / Coverage
    if (isType("dragon")) {
        addMove("Dragon Claw", "Garra Dragão (Dragon Claw)");
        addMove("Flamethrower", "Lança-Chamas (Flamethrower)");
        addMove("Earthquake", "Terramoto (Earthquake)");
        addMove("Rock Slide", "Deslize de Rocha (Rock Slide)");
    }
    // 8. Normal STAB / Coverage
    if (isType("normal")) {
        addMove("Body Slam", "Golpe de Corpo (Body Slam)");
        addMove("Earthquake", "Terramoto (Earthquake)");
        if (gen >= 4) addMove("Close Combat", "Combate Próximo (Close Combat)");
        addMove("Brick Break", "Quebra Tijolo (Brick Break)");
        addMove("Shadow Ball", "Bola Sombra (Shadow Ball)");
        addMove("Rock Slide", "Deslize de Rocha (Rock Slide)");
    }

    // Generic Fallbacks
    const genericPool = [
        { english: "Return", display: "Retorno (Return)" },
        { english: "Double-Edge", display: "Fronte Dupla (Double-Edge)" },
        { english: "Hyper Beam", display: "Hiper Raio (Hyper Beam)" },
        { english: "Dig", display: "Cavar (Dig)" },
        { english: "Psychic", display: "Psíquico (Psychic)" },
        { english: "Thunderbolt", display: "Relâmpago (Thunderbolt)" },
        { english: "Ice Beam", display: "Raio Gelo (Ice Beam)" },
        { english: "Flamethrower", display: "Lança-Chamas (Flamethrower)" }
    ];

    for (let i = 0; i < genericPool.length && moves.length < 4; i++) {
        addMove(genericPool[i].english, genericPool[i].display);
    }

    return moves;
}

