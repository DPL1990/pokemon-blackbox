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

function getHofRecords(gameId) {
    return new Promise((resolve, reject) => {
        if (!dbInstance) {
            resolve([]);
            return;
        }
        const tx = dbInstance.transaction("hall_of_fame", "readonly");
        const store = tx.objectStore("hall_of_fame");
        const request = store.get(gameId);
        
        request.onsuccess = (e) => {
            const data = e.target.result;
            if (!data) {
                resolve([]);
            } else if (typeof data === "string") {
                // Migração de dados legados (imagem base64 única)
                const legacyRecord = {
                    id: "hof_legacy_" + Date.now(),
                    type: "upload",
                    data: data,
                    title: "Mural de Honra (Legado)",
                    date: new Date().toLocaleDateString('pt-PT')
                };
                const migratedList = [legacyRecord];
                
                // Grava a lista migrada em segundo plano de forma silenciosa
                const writeTx = dbInstance.transaction("hall_of_fame", "readwrite");
                writeTx.objectStore("hall_of_fame").put(migratedList, gameId);
                
                resolve(migratedList);
            } else if (Array.isArray(data)) {
                resolve(data);
            } else {
                resolve([]);
            }
        };
        request.onerror = (e) => reject(e.target.error);
    });
}

function saveHofRecord(gameId, record) {
    return getHofRecords(gameId).then(records => {
        records.push(record);
        return new Promise((resolve, reject) => {
            if (!dbInstance) {
                reject("Banco de dados não inicializado");
                return;
            }
            const tx = dbInstance.transaction("hall_of_fame", "readwrite");
            const store = tx.objectStore("hall_of_fame");
            const request = store.put(records, gameId);
            
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    });
}

function saveHofImage(gameId, base64Data) {
    const record = {
        id: "hof_upload_" + Date.now(),
        type: "upload",
        data: base64Data,
        title: "Mural Carregado",
        date: new Date().toLocaleDateString('pt-PT')
    };
    return saveHofRecord(gameId, record);
}

function deleteHofRecord(gameId, index) {
    return getHofRecords(gameId).then(records => {
        if (index >= 0 && index < records.length) {
            records.splice(index, 1);
            return new Promise((resolve, reject) => {
                if (!dbInstance) {
                    reject("Banco de dados não inicializado");
                    return;
                }
                const tx = dbInstance.transaction("hall_of_fame", "readwrite");
                const store = tx.objectStore("hall_of_fame");
                const request = store.put(records, gameId);
                
                request.onsuccess = () => resolve();
                request.onerror = (e) => reject(e.target.error);
            });
        }
    });
}

function generateHofFromActiveTeam() {
    const activeTeam = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.slotType === "team");
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
}

function switchGame(gameId) {
    currentGameId = gameId; 
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
    renderAll();
}

function updateDexitMonitor() {
    const statsBox = document.getElementById("dexit-stats-box");
    const regionalPokemon = pokemonDatabase.filter(p => p.currentGame === currentGameId);
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
    
    const teamContainer = document.getElementById("team-container");
    const boxContainer = document.getElementById("box-container");
    
    // Filters based on current game location:
    const boxSlots = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.slotType === "box");

    // Render Active Team Slots (Exactly 6 slots)
    teamContainer.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const p = pokemonDatabase.find(pkmn => pkmn.currentGame === currentGameId && pkmn.slotType === "team" && pkmn.slotIndex === i);
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
        </div>
    `;
}

function updateStats() {
    document.getElementById("stat-total").innerText = pokemonDatabase.length;
    document.getElementById("stat-team").innerText = `${pokemonDatabase.filter(p => p.currentGame === currentGameId && p.slotType === "team").length}/6`;
}

// --- SECTION UNIFIED DRAG & DROP LOGIC ---
let draggedPokemonId = null;

function executeDropLogic(id, targetSlotType, targetSlotIndex, targetId) {
    const pkmnIndex = pokemonDatabase.findIndex(p => p.id === id); 
    if (pkmnIndex === -1) return;
    
    const draggedPkmn = pokemonDatabase[pkmnIndex]; 

    if (targetId && targetId !== id) {
        // Swapping occupied slots
        const targetPkmnIndex = pokemonDatabase.findIndex(p => p.id === targetId);
        if (targetPkmnIndex !== -1) {
            const targetPkmn = pokemonDatabase[targetPkmnIndex];
            
            // Synchronize game context when swapping between team and box
            if (draggedPkmn.slotType !== targetPkmn.slotType) {
                if (targetPkmn.slotType === "team") draggedPkmn.currentGame = currentGameId;
                if (draggedPkmn.slotType === "team") targetPkmn.currentGame = currentGameId;
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
            const blocking = pokemonDatabase.find(p => p.currentGame === currentGameId && p.slotType === "team" && p.slotIndex === targetSlotIndex);
            if (blocking) { 
                blocking.slotType = "box"; 
                blocking.slotIndex = 0; 
            }
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
    document.getElementById("pkhex-text").value = ""; 
    document.getElementById("form-origin-game").value = currentGameId;
    document.getElementById("btn-delete-pkmn").style.display = "none"; 
    document.getElementById("modal-title").innerText = "➕ Registar Novo Espécime";
    document.getElementById("passport-display").innerHTML = `<span>O passaporte será gerado ao gravar.</span>`;
    
    renderCustomRibbonsTags();
    validateEVs();
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
    document.getElementById("form-origin-game").value = p.originGame || currentGameId;
    
    document.getElementById("btn-delete-pkmn").style.display = "block"; 
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
    const originGame = document.getElementById("form-origin-game").value;

    let targetPokemon = null;
    if (id) {
        targetPokemon = pokemonDatabase.find(p => p.id === id);
        if (targetPokemon && targetPokemon.currentGame !== currentGameId) {
            if (!targetPokemon.history) targetPokemon.history = [];
            targetPokemon.history.push(targetPokemon.currentGame);
            targetPokemon.currentGame = currentGameId;
            targetPokemon.slotType = "box"; 
            targetPokemon.slotIndex = 0;
        }
    }
    
    if (!targetPokemon) {
        targetPokemon = { 
            id: id || "pkmn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5), 
            history: [], 
            currentGame: currentGameId, 
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
                cleanupDuplicates();
                localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase)); 
                renderAll(); 
            }
        } catch (err) {}
    }; 
    r.readAsText(file);
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
    
    // 1. Remove entries with duplicate IDs (keeping the first one, or the one in the team)
    const seenIds = new Set();
    const uniqueList = [];
    
    // Sort team members first to make sure if there is a duplicate ID, we keep the team version
    const sortedDb = [...pokemonDatabase].sort((a, b) => {
        const aVal = a.slotType === "team" ? 1 : 0;
        const bVal = b.slotType === "team" ? 1 : 0;
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

window.onload = function() {
    initDB().then(() => {
        cleanupDuplicates();
        setupDatalists(); 
        loadSpeciesDatalist(); 
        renderRibbonChecklist();
        initTouchDragAndDrop();
        document.getElementById("sprite-style-select").value = currentSpriteStyle;
        switchGame(currentGameId);
    }).catch(err => {
        console.error("Falha ao carregar IndexedDB, inicializando com localStorage de fallback:", err);
        cleanupDuplicates();
        setupDatalists(); 
        loadSpeciesDatalist(); 
        renderRibbonChecklist();
        initTouchDragAndDrop();
        document.getElementById("sprite-style-select").value = currentSpriteStyle;
        switchGame(currentGameId);
    });
};
