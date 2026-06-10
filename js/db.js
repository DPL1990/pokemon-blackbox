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

function getRibbonForOpponent(opponentId) {
    switch (opponentId) {
        case "ruby":
        case "sapphire":
        case "emerald":
        case "emerald_rematch":
        case "firered":
        case "leafgreen":
        case "firered_rematch":
        case "leafgreen_rematch":
        case "omegaruby":
        case "alphasapphire":
            return "Hoenn Champion Ribbon";
            
        case "diamond":
        case "pearl":
        case "platinum":
        case "brilliantdiamond":
        case "shiningpearl":
        case "heartgold":
        case "soulsilver":
        case "heartgold_rematch":
        case "soulsilver_rematch":
            return "Sinnoh Champion Ribbon";
            
        case "johto_red":
            return "Legend Ribbon (Red Defeat)";
            
        case "x":
        case "y":
            return "Kalos Champion Ribbon";
            
        case "sun":
        case "moon":
        case "ultrasun":
        case "ultramoon":
            return "Alola Champion Ribbon";
            
        case "sword":
        case "shield":
            return "Galar Champion Ribbon";
            
        case "legendsarceus":
            return "Pioneer Ribbon (Hisui)";
            
        case "scarlet":
        case "violet":
            return "Paldea Champion Ribbon";
            
        default:
            return null;
    }
}

function generateHofFromActiveTeam() {
    const activeTeam = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.slotType === "team");
    if (activeTeam.length === 0) {
        alert("A tua equipa ativa para este cartucho está vazia! Adiciona Pokémon à equipa primeiro.");
        return;
    }
    activeTeam.sort((a, b) => a.slotIndex - b.slotIndex);
    
    // Obter o nome do oponente selecionado
    const opponentSelect = document.getElementById("allocation-opponent-select");
    const opponentName = opponentSelect && opponentSelect.selectedIndex >= 0
        ? opponentSelect.options[opponentSelect.selectedIndex].text
        : (GAMES_DB.find(g => g.id === currentGameId)?.name || "Pokémon");
    
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
        
        // Nome do oponente/desafio campeão
        ctx.fillStyle = accentColor;
        ctx.font = "900 15px 'Outfit', system-ui, -apple-system, sans-serif";
        ctx.fillText(opponentName.toUpperCase(), 400, 92);
        
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
            title: opponentName,
            date: new Date().toLocaleDateString('pt-PT')
        };
        
        // Atribuir a fita automaticamente se aplicável
        const ribbonToGrant = getRibbonForOpponent(currentAllocationOpponentId);
        if (ribbonToGrant) {
            activeTeam.forEach(p => {
                if (!p.ribbons) p.ribbons = [];
                if (!p.ribbons.includes(ribbonToGrant)) {
                    p.ribbons.push(ribbonToGrant);
                }
            });
            localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
        }

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
    
    if (typeof POKEAPI_ITEM_ID_TO_NAME !== 'undefined') {
        const itemNames = Object.values(POKEAPI_ITEM_ID_TO_NAME).map(name => formatItemNameForDisplay(name));
        itemNames.sort((a, b) => a.localeCompare(b));
        document.getElementById("items-list").innerHTML = itemNames.map(name => `<option value="${name}"></option>`).join("");
    }
    
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

    const isAllowed = isPokemonAllowedInGame(pokedexId, currentGameId);
    const dexitClass = isAllowed ? '' : 'dexit-incompatible';
    const dexitBadge = isAllowed ? '' : `<span class="dexit-incompatible-badge">Incompatível</span>`;
    const trophyBadge = p.isLocked ? `<span class="locked-trophy-badge" title="Este espécime está trancado por ser vencedor de um desafio">🏆</span>` : '';

    return `
        <div class="slot ${typeClass} ${selectedClass} ${dexitClass}" draggable="true" data-id="${p.id}" data-slot-type="${type}" data-slot-index="${index}" onclick="openModalForEdit('${p.id}')" ondragover="allowDrop(event)" ondragleave="dragLeave(event)" ondrop="handleDrop(event)">
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
            ${dexitBadge}
            ${trophyBadge}
        </div>
    `;
}

function updateStats() {
    const totalEl = document.getElementById("stat-total");
    if (totalEl) totalEl.innerText = pokemonDatabase.length;
    
    const teamEl = document.getElementById("stat-team");
    if (teamEl) {
        teamEl.innerText = `${pokemonDatabase.filter(p => p.currentGame === currentGameId && p.slotType === "team").length}/6`;
    }
}

