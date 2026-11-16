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

currentAllocationRecommendation = [];
currentAllocationOpponentId = null;

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

function saveActiveTeamAsOpponentPreset() {
    const activeTeam = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.slotType === "team");
    if (activeTeam.length === 0) {
        alert("A tua equipa ativa está vazia. Não é possível gravar um preset vazio.");
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
        pokemonIds: activeTeam.map(p => p.id)
    };
    
    teamPresetsList.push(newPreset);
    localStorage.setItem("bb_team_presets", JSON.stringify(teamPresetsList));
    
    renderPresets();
    updateOpponentPresetsList();
    
    alert(`Preset "${presetName}" gravado com sucesso!`);
}

function updateOpponentPresetsList() {
    const container = document.getElementById("opponent-preset-container");
    const select = document.getElementById("opponent-preset-select");
    if (!container || !select) return;
    
    const opponentId = currentAllocationOpponentId || currentGameId;
    const filteredPresets = teamPresetsList.filter(tp => tp.gameId === currentGameId && tp.opponentId === opponentId);
    
    if (filteredPresets.length > 0) {
        container.style.display = "flex";
        select.innerHTML = `
            <option value="" disabled selected>-- Escolhe um Preset --</option>
            ` + filteredPresets.map(tp => `<option value="${tp.id}">${tp.name}</option>`).join("");
    } else {
        container.style.display = "none";
        select.innerHTML = "";
    }
}

function loadOpponentPreset(presetId) {
    if (!presetId) return;
    const preset = teamPresetsList.find(tp => tp.id === presetId);
    if (!preset) return;
    
    if (!confirm(`Desejas carregar o preset "${preset.name}"? Isso irá substituir a tua equipa ativa atual.`)) {
        document.getElementById("opponent-preset-select").value = "";
        return;
    }
    
    pokemonDatabase.forEach(p => {
        if (p.currentGame === currentGameId) {
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
    
    // Reset selection select
    document.getElementById("opponent-preset-select").value = "";
    alert(`Preset "${preset.name}" ativado com sucesso!`);
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
        if (p.currentGame === currentGameId) {
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
    
    // Render current active team inside #allocation-current-team-grid
    const currentActiveTeam = pokemonDatabase.filter(p => p.currentGame === currentGameId && p.slotType === "team");
    currentActiveTeam.sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0));
    
    const currentTeamGrid = document.getElementById("allocation-current-team-grid");
    if (currentTeamGrid) {
        if (currentActiveTeam.length === 0) {
            currentTeamGrid.innerHTML = `<div style="grid-column: span 6; text-align: center; padding: 20px; font-size: 0.8rem; color: var(--text-muted);">A tua equipa ativa está vazia. Adiciona Pokémon à equipa na Box!</div>`;
        } else {
            currentTeamGrid.innerHTML = currentActiveTeam.map((p, index) => {
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
                        <span style="font-size: 0.55rem; font-weight: 800; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); color: var(--game-color); padding: 1px 4px; border-radius: 4px; display: inline-flex; align-items: center; gap: 2px; margin-bottom: 4px;">
                            Slot ${index + 1}
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
    
    // Render recommended team inside #allocation-team-grid
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
    
    // Analyze active team weaknesses
    renderWeaknessAnalysis(currentActiveTeam, gen);
    
    // Update opponent presets list dropdown and general presets list
    updateOpponentPresetsList();
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
    
    const activePresets = teamPresetsList.filter(tp => tp.gameId === currentGameId);
    
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
        if (p.currentGame === currentGameId) {
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
        setupEditorMovesListeners();
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
        setupEditorMovesListeners();
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

function exportModifiedSave() {
    if (!uploadedSaveBuffer) {
        alert("Nenhum ficheiro de save foi carregado nesta sessão.");
        return;
    }
    
    if (uploadedSaveGen < 1 || uploadedSaveGen > 3) {
        alert("A gravação e exportação de saves é suportada apenas para as Gerações 1, 2 e 3.");
        return;
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
    
    // 1. Validate moves generation for all savable Pokemon
    for (const pkmn of savablePokemon) {
        const moves = pkmn.moves || [];
        const movesVal = validateMovesGeneration(moves, uploadedSaveGen);
        if (!movesVal.valid) {
            alert(`Validação Geracional: O ataque "${movesVal.move}" do Pokémon ${pkmn.nickname || pkmn.species} pertence à Geração ${movesVal.moveGen}, mas este save (${GAMES_DB.find(g => g.gen === uploadedSaveGen)?.name || 'Geração ' + uploadedSaveGen}) só suporta até à Geração ${movesVal.targetGen}.`);
            return;
        }
    }

    // 2. Compile diff report
    const diffReport = compileSaveDiffReport(savablePokemon, uploadedSaveBuffer);
    if (diffReport.length === 0) {
        alert("Não existem alterações detetadas para gravar.");
        return;
    }

    // 3. Trigger backup download of original save
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
    const backupBlob = new Blob([uploadedSaveBuffer], {type: "application/octet-stream"});
    const backupLink = document.createElement("a");
    backupLink.href = URL.createObjectURL(backupBlob);
    backupLink.download = `save_backup_${timestamp}.sav`;
    document.body.appendChild(backupLink);
    backupLink.click();
    document.body.removeChild(backupLink);

    // 4. Populate diff-list-container
    const container = document.getElementById("diff-list-container");
    container.innerHTML = diffReport.map(diff => {
        let itemsHtml = "";
        if (diff.itemChanged) {
            itemsHtml = `
                <div style="font-size: 0.7rem; margin-top: 4px;">
                    <strong>Item:</strong> 
                    <span style="color: #ef4444; text-decoration: line-through;">${diff.origItem}</span> 
                    ➔ 
                    <span style="color: #10b981;">${diff.newItem}</span>
                </div>
            `;
        }
        
        let movesHtml = "";
        if (diff.movesChanged) {
            movesHtml = `
                <div style="font-size: 0.7rem; margin-top: 4px;">
                    <strong>Moveset:</strong><br>
                    <span style="color: #ef4444; text-decoration: line-through;">${diff.origMoves}</span><br>
                    ➔<br>
                    <span style="color: #10b981;">${diff.newMoves}</span>
                </div>
            `;
        }
        
        return `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 8px;">
                <div style="font-size: 0.75rem; font-weight: bold; color: var(--game-color); display: flex; align-items: center; gap: 6px;">
                    <span>${diff.nickname} (${diff.species})</span>
                </div>
                ${itemsHtml}
                ${movesHtml}
            </div>
        `;
    }).join("");

    // Show modal
    document.getElementById("diff-modal").classList.add("active");

    // 5. Bind btn-confirm-diff-save to process modifications on confirm
    const btnConfirm = document.getElementById("btn-confirm-diff-save");
    btnConfirm.onclick = () => {
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
                
                // Grava DVs (Individual Values divididos por 2)
                const ivs = pkmn.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
                const atkDv = Math.max(0, Math.min(15, Math.floor((ivs.atk || 31) / 2)));
                const defDv = Math.max(0, Math.min(15, Math.floor((ivs.def || 31) / 2)));
                const speDv = Math.max(0, Math.min(15, Math.floor((ivs.spe || 31) / 2)));
                const spcDv = Math.max(0, Math.min(15, Math.floor((ivs.spa || 31) / 2)));
                
                u8[structOffset + 27] = (atkDv << 4) | defDv;
                u8[structOffset + 28] = (speDv << 4) | spcDv;
                
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
                    
                    // Grava DVs (Individual Values)
                    const ivs = pkmn.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
                    const atkDv = Math.max(0, Math.min(15, Math.floor((ivs.atk || 31) / 2)));
                    const defDv = Math.max(0, Math.min(15, Math.floor((ivs.def || 31) / 2)));
                    const speDv = Math.max(0, Math.min(15, Math.floor((ivs.spe || 31) / 2)));
                    const spcDv = Math.max(0, Math.min(15, Math.floor((ivs.spa || 31) / 2)));
                    
                    u8[structOffset + 21] = (atkDv << 4) | defDv;
                    u8[structOffset + 22] = (speDv << 4) | spcDv;
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
                let blockMIdx = -1;
                for (let b = 0; b < 4; b++) {
                    if (order[b] === 0) blockGIdx = b;
                    if (order[b] === 1) blockAIdx = b;
                    if (order[b] === 3) blockMIdx = b;
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
                
                if (blockMIdx !== -1) {
                    const mOffset = blockMIdx * 12;
                    let ivWord = decryptedBytes[mOffset + 4] |
                                 (decryptedBytes[mOffset + 5] << 8) |
                                 (decryptedBytes[mOffset + 6] << 16) |
                                 (decryptedBytes[mOffset + 7] << 24);
                                 
                    const ivs = pkmn.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
                    const hpIv = Math.max(0, Math.min(31, ivs.hp !== undefined ? ivs.hp : 31));
                    const atkIv = Math.max(0, Math.min(31, ivs.atk !== undefined ? ivs.atk : 31));
                    const defIv = Math.max(0, Math.min(31, ivs.def !== undefined ? ivs.def : 31));
                    const speIv = Math.max(0, Math.min(31, ivs.spe !== undefined ? ivs.spe : 31));
                    const spaIv = Math.max(0, Math.min(31, ivs.spa !== undefined ? ivs.spa : 31));
                    const spdIv = Math.max(0, Math.min(31, ivs.spd !== undefined ? ivs.spd : 31));
                    
                    ivWord = (ivWord & 0xC0000000) |
                             hpIv |
                             (atkIv << 5) |
                             (defIv << 10) |
                             (speIv << 15) |
                             (spaIv << 20) |
                             (spdIv << 25);
                             
                    decryptedBytes[mOffset + 4] = ivWord & 0xFF;
                    decryptedBytes[mOffset + 5] = (ivWord >> 8) & 0xFF;
                    decryptedBytes[mOffset + 6] = (ivWord >> 16) & 0xFF;
                    decryptedBytes[mOffset + 7] = (ivWord >> 24) & 0xFF;
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
        
        closeDiffModal();
        alert(`Sucesso! Save modificado gravado com ${modifyCount} alterações.`);
    };
}

function exportIndividualPkx() {
    const id = document.getElementById("form-id").value;
    if (!id) return;
    const pkmn = pokemonDatabase.find(p => p.id === id);
    if (!pkmn) return;
    
    let gen = 3;
    if (pkmn.saveMeta && pkmn.saveMeta.gen) {
        gen = pkmn.saveMeta.gen;
    } else {
        const game = GAMES_DB.find(g => g.id === currentGameId);
        gen = game ? game.gen : 9;
    }
    
    let size = 136;
    let ext = "pk4";
    if (gen === 3) { size = 100; ext = "pk3"; }
    else if (gen === 4 || gen === 5) { size = 136; ext = `pk${gen}`; }
    else if (gen === 6 || gen === 7) { size = 232; ext = `pk${gen}`; }
    else if (gen === 8) { size = 328; ext = "pk8"; }
    else if (gen === 9) { size = 344; ext = "pk9"; }
    
    let u8 = null;
    if (pkmn.saveMeta && pkmn.saveMeta.isIndividual && pkmn.saveMeta.rawBytes) {
        u8 = new Uint8Array(pkmn.saveMeta.rawBytes);
    } else if (uploadedSaveBuffer && pkmn.saveMeta && pkmn.saveMeta.structOffset !== undefined) {
        const saveU8 = new Uint8Array(uploadedSaveBuffer);
        if (gen === 3) {
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
                u8 = saveU8.slice(sectorOffset + pkmn.saveMeta.structOffset, sectorOffset + pkmn.saveMeta.structOffset + 100);
            }
        } else if (gen === 4 || gen === 5) {
            u8 = saveU8.slice(pkmn.saveMeta.structOffset, pkmn.saveMeta.structOffset + 136);
        } else if (gen === 6 || gen === 7) {
            u8 = saveU8.slice(pkmn.saveMeta.structOffset, pkmn.saveMeta.structOffset + 232);
        } else if (gen === 8 || gen === 9) {
            u8 = saveU8.slice(pkmn.saveMeta.structOffset, pkmn.saveMeta.structOffset + size);
        }
    }
    
    if (!u8 || u8.length !== size) {
        u8 = new Uint8Array(size);
        u8[0] = pkmn.pokedexId & 0xFF;
        u8[1] = (pkmn.pokedexId >> 8) & 0xFF;
    }
    
    const u16 = new Uint16Array(u8.buffer, u8.byteOffset, u8.length / 2);
    const u32 = new Uint32Array(u8.buffer, u8.byteOffset, u8.length / 4);
    
    const moves = [
        document.getElementById("form-move1").value,
        document.getElementById("form-move2").value,
        document.getElementById("form-move3").value,
        document.getElementById("form-move4").value
    ].filter(m => m !== "");
    
    const ivs = {
        hp: parseInt(document.getElementById("iv-hp").value) || 31,
        atk: parseInt(document.getElementById("iv-atk").value) || 31,
        def: parseInt(document.getElementById("iv-def").value) || 31,
        spa: parseInt(document.getElementById("iv-spa").value) || 31,
        spd: parseInt(document.getElementById("iv-spd").value) || 31,
        spe: parseInt(document.getElementById("iv-spe").value) || 31
    };
    
    const item = document.getElementById("form-item").value;
    const nickname = document.getElementById("form-nickname").value || pkmn.species;
    const level = parseInt(document.getElementById("form-level").value, 10) || 50;
    
    if (gen === 3) {
        let pid = pkmn.saveMeta ? pkmn.saveMeta.pid : 0;
        let otid = pkmn.saveMeta ? pkmn.saveMeta.otid : 0;
        let shuffleIndex = 0;
        if (pkmn.saveMeta) {
            shuffleIndex = pkmn.saveMeta.shuffleIndex;
        } else {
            pid = Math.floor(Math.random() * 0xFFFFFFFF);
            otid = Math.floor(Math.random() * 0xFFFFFFFF);
            shuffleIndex = pid % 24;
            
            u32[0] = pid;
            u32[1] = otid;
            
            const otName = "BlackBox";
            const nick = nickname;
            for (let j = 0; j < 7; j++) {
                u8[20 + j] = j < otName.length ? otName.charCodeAt(j) : 0xFF;
            }
            for (let j = 0; j < 10; j++) {
                u8[8 + j] = j < nick.length ? nick.charCodeAt(j) : 0xFF;
            }
            u8[84] = level;
        }
        
        const key = pid ^ otid;
        const decryptedWords = new Uint32Array(12);
        for (let j = 0; j < 12; j++) {
            const wordOffset = 0x20 + j * 4;
            const encryptedWord = u8[wordOffset] | (u8[wordOffset + 1] << 8) | (u8[wordOffset + 2] << 16) | (u8[wordOffset + 3] << 24);
            decryptedWords[j] = encryptedWord ^ key;
        }
        const decryptedBytes = new Uint8Array(decryptedWords.buffer);
        const order = blockOrders[shuffleIndex];
        
        let blockGIdx = -1;
        let blockAIdx = -1;
        let blockMIdx = -1;
        for (let b = 0; b < 4; b++) {
            if (order[b] === 0) blockGIdx = b;
            if (order[b] === 1) blockAIdx = b;
            if (order[b] === 3) blockMIdx = b;
        }
        
        if (blockGIdx !== -1) {
            const gOffset = blockGIdx * 12;
            const itemName = getEnglishItemName(item);
            const itemId = BINARY_ITEMS_MAP_GEN3[itemName] || 0;
            decryptedBytes[gOffset + 2] = itemId & 0xFF;
            decryptedBytes[gOffset + 3] = (itemId >> 8) & 0xFF;
            
            decryptedBytes[gOffset] = pkmn.pokedexId & 0xFF;
            decryptedBytes[gOffset + 1] = (pkmn.pokedexId >> 8) & 0xFF;
        }
        
        if (blockAIdx !== -1) {
            const aOffset = blockAIdx * 12;
            for (let m = 0; m < 4; m++) {
                const moveName = getEnglishMoveName(moves[m]);
                const moveId = BINARY_MOVES_MAP[moveName] || 0;
                decryptedBytes[aOffset + m * 2] = moveId & 0xFF;
                decryptedBytes[aOffset + m * 2 + 1] = (moveId >> 8) & 0xFF;
                decryptedBytes[aOffset + 8 + m] = moveId > 0 ? 20 : 0;
            }
        }
        
        if (blockMIdx !== -1) {
            const mOffset = blockMIdx * 12;
            let ivWord = decryptedBytes[mOffset + 4] |
                         (decryptedBytes[mOffset + 5] << 8) |
                         (decryptedBytes[mOffset + 6] << 16) |
                         (decryptedBytes[mOffset + 7] << 24);
                         
            const hpIv = Math.max(0, Math.min(31, ivs.hp || 31));
            const atkIv = Math.max(0, Math.min(31, ivs.atk || 31));
            const defIv = Math.max(0, Math.min(31, ivs.def || 31));
            const speIv = Math.max(0, Math.min(31, ivs.spe || 31));
            const spaIv = Math.max(0, Math.min(31, ivs.spa || 31));
            const spdIv = Math.max(0, Math.min(31, ivs.spd || 31));
            
            ivWord = (ivWord & 0xC0000000) | hpIv | (atkIv << 5) | (defIv << 10) | (speIv << 15) | (spaIv << 20) | (spdIv << 25);
            decryptedBytes[mOffset + 4] = ivWord & 0xFF;
            decryptedBytes[mOffset + 5] = (ivWord >> 8) & 0xFF;
            decryptedBytes[mOffset + 6] = (ivWord >> 16) & 0xFF;
            decryptedBytes[mOffset + 7] = (ivWord >> 24) & 0xFF;
        }
        
        let pkmnSum = 0;
        const decryptedWords16 = new Uint16Array(decryptedWords.buffer);
        for (let k = 0; k < 24; k++) pkmnSum = (pkmnSum + decryptedWords16[k]) & 0xFFFF;
        u8[28] = pkmnSum & 0xFF;
        u8[29] = (pkmnSum >> 8) & 0xFF;
        
        const encryptedWords = new Uint32Array(decryptedWords.buffer);
        for (let j = 0; j < 12; j++) {
            const wordOffset = 0x20 + j * 4;
            const encryptedWord = encryptedWords[j] ^ key;
            u8[wordOffset] = encryptedWord & 0xFF;
            u8[wordOffset + 1] = (encryptedWord >> 8) & 0xFF;
            u8[wordOffset + 2] = (encryptedWord >> 16) & 0xFF;
            u8[wordOffset + 3] = (encryptedWord >> 24) & 0xFF;
        }
    } 
    else if (gen === 4 || gen === 5) {
        let pid = pkmn.saveMeta ? pkmn.saveMeta.pid : 0;
        let otid = pkmn.saveMeta ? pkmn.saveMeta.otid : 0;
        let shuffleIndex = 0;
        if (pkmn.saveMeta) {
            shuffleIndex = ((pid & 0x3E000) >>> 13) % 24;
        } else {
            pid = Math.floor(Math.random() * 0xFFFFFFFF);
            otid = Math.floor(Math.random() * 0xFFFFFFFF);
            shuffleIndex = ((pid & 0x3E000) >>> 13) % 24;
            u32[0] = pid;
            u16[4] = pkmn.pokedexId & 0xFFFF;
        }
        
        const checksum = u8[6] | (u8[7] << 8);
        let seed = checksum;
        const decryptedWords = new Uint16Array(64);
        for (let j = 0; j < 64; j++) {
            const encryptedWord = u8[8 + j * 2] | (u8[8 + j * 2 + 1] << 8);
            seed = (Math.imul(seed, 1103515245) + 24691) | 0;
            const key = (seed >>> 16) & 0xFFFF;
            decryptedWords[j] = encryptedWord ^ key;
        }
        
        const order = blockOrders[shuffleIndex];
        const blockA = new Uint16Array(16);
        const blockB = new Uint16Array(16);
        const blockC = new Uint16Array(16);
        const blockD = new Uint16Array(16);
        
        for (let b = 0; b < 4; b++) {
            const targetBlock = order[b];
            let dest = null;
            if (targetBlock === 0) dest = blockA;
            else if (targetBlock === 1) dest = blockB;
            else if (targetBlock === 2) dest = blockC;
            else if (targetBlock === 3) dest = blockD;
            
            if (dest) {
                for (let w = 0; w < 16; w++) dest[w] = decryptedWords[b * 16 + w];
            }
        }
        
        blockA[0] = pkmn.pokedexId & 0xFFFF;
        
        const itemName = getEnglishItemName(item);
        const itemId = BINARY_ITEMS_MAP_GEN3[itemName] || 0;
        blockA[1] = itemId & 0xFFFF;
        
        for (let m = 0; m < 4; m++) {
            const moveName = getEnglishMoveName(moves[m]);
            const moveId = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && Object.keys(POKEAPI_MOVE_ID_TO_NAME).find(k => POKEAPI_MOVE_ID_TO_NAME[k] === moveName.toLowerCase())) || BINARY_MOVES_MAP[moveName] || 0;
            blockB[m] = moveId & 0xFFFF;
        }
        
        blockB[4] = (blockB[0] > 0 ? 20 : 0) | ((blockB[1] > 0 ? 20 : 0) << 8);
        blockB[5] = (blockB[2] > 0 ? 20 : 0) | ((blockB[3] > 0 ? 20 : 0) << 8);
        
        let ivWord = blockB[8] | (blockB[9] << 16);
        const hpIv = Math.max(0, Math.min(31, ivs.hp || 31));
        const atkIv = Math.max(0, Math.min(31, ivs.atk || 31));
        const defIv = Math.max(0, Math.min(31, ivs.def || 31));
        const speIv = Math.max(0, Math.min(31, ivs.spe || 31));
        const spaIv = Math.max(0, Math.min(31, ivs.spa || 31));
        const spdIv = Math.max(0, Math.min(31, ivs.spd || 31));
        
        ivWord = (ivWord & 0xC0000000) | hpIv | (atkIv << 5) | (defIv << 10) | (speIv << 15) | (spaIv << 20) | (spdIv << 25);
        blockB[8] = ivWord & 0xFFFF;
        blockB[9] = (ivWord >> 16) & 0xFFFF;
        
        const shuffledWords = new Uint16Array(64);
        for (let b = 0; b < 4; b++) {
            const blockType = order[b];
            const src = blockType === 0 ? blockA : (blockType === 1 ? blockB : (blockType === 2 ? blockC : blockD));
            const destOffset = b * 16;
            for (let w = 0; w < 16; w++) shuffledWords[destOffset + w] = src[w];
        }
        
        let sum = 0;
        for (let w = 0; w < 64; w++) sum = (sum + shuffledWords[w]) & 0xFFFF;
        
        u8[6] = sum & 0xFF;
        u8[7] = (sum >> 8) & 0xFF;
        
        let encryptSeed = sum;
        for (let j = 0; j < 64; j++) {
            encryptSeed = (Math.imul(encryptSeed, 1103515245) + 24691) | 0;
            const key = (encryptSeed >>> 16) & 0xFFFF;
            const enc = shuffledWords[j] ^ key;
            u8[8 + j * 2] = enc & 0xFF;
            u8[8 + j * 2 + 1] = (enc >> 8) & 0xFF;
        }
    } 
    else if (gen === 6 || gen === 7) {
        u16[0x08 / 2] = pkmn.pokedexId & 0xFFFF;
        
        const itemName = getEnglishItemName(item);
        const itemId = BINARY_ITEMS_MAP_GEN3[itemName] || 0;
        u16[0x0A / 2] = itemId & 0xFFFF;
        
        for (let m = 0; m < 4; m++) {
            const moveName = getEnglishMoveName(moves[m]);
            const moveId = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && Object.keys(POKEAPI_MOVE_ID_TO_NAME).find(k => POKEAPI_MOVE_ID_TO_NAME[k] === moveName.toLowerCase())) || BINARY_MOVES_MAP[moveName] || 0;
            u16[(0x5A + m * 2) / 2] = moveId & 0xFFFF;
            u8[0x62 + m] = moveId > 0 ? 20 : 0;
        }
        
        let ivWord = u32[0x74 / 4];
        const hpIv = Math.max(0, Math.min(31, ivs.hp || 31));
        const atkIv = Math.max(0, Math.min(31, ivs.atk || 31));
        const defIv = Math.max(0, Math.min(31, ivs.def || 31));
        const speIv = Math.max(0, Math.min(31, ivs.spe || 31));
        const spaIv = Math.max(0, Math.min(31, ivs.spa || 31));
        const spdIv = Math.max(0, Math.min(31, ivs.spd || 31));
        
        ivWord = (ivWord & 0xC0000000) | hpIv | (atkIv << 5) | (defIv << 10) | (speIv << 15) | (spaIv << 20) | (spdIv << 25);
        u32[0x74 / 4] = ivWord;
        
        let sum = 0;
        for (let w = 0; w < 112; w++) {
            sum = (sum + u16[4 + w]) & 0xFFFF;
        }
        u8[6] = sum & 0xFF;
        u8[7] = (sum >> 8) & 0xFF;
    } 
    else if (gen === 8 || gen === 9) {
        u16[0x08 / 2] = pkmn.pokedexId & 0xFFFF;
        
        const itemName = getEnglishItemName(item);
        const itemId = BINARY_ITEMS_MAP_GEN3[itemName] || 0;
        u16[0x0A / 2] = itemId & 0xFFFF;
        
        for (let m = 0; m < 4; m++) {
            const moveName = getEnglishMoveName(moves[m]);
            const moveId = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && Object.keys(POKEAPI_MOVE_ID_TO_NAME).find(k => POKEAPI_MOVE_ID_TO_NAME[k] === moveName.toLowerCase())) || BINARY_MOVES_MAP[moveName] || 0;
            u16[(0x7C + m * 2) / 2] = moveId & 0xFFFF;
            u8[0x84 + m] = moveId > 0 ? 20 : 0;
        }
        
        let ivWord = u32[0x8C / 4];
        const hpIv = Math.max(0, Math.min(31, ivs.hp || 31));
        const atkIv = Math.max(0, Math.min(31, ivs.atk || 31));
        const defIv = Math.max(0, Math.min(31, ivs.def || 31));
        const speIv = Math.max(0, Math.min(31, ivs.spe || 31));
        const spaIv = Math.max(0, Math.min(31, ivs.spa || 31));
        const spdIv = Math.max(0, Math.min(31, ivs.spd || 31));
        
        ivWord = (ivWord & 0xC0000000) | hpIv | (atkIv << 5) | (defIv << 10) | (speIv << 15) | (spaIv << 20) | (spdIv << 25);
        u32[0x8C / 4] = ivWord;
        
        let sum = 0;
        const numWords = (size - 8) / 2;
        for (let w = 0; w < numWords; w++) {
            sum = (sum + u16[4 + w]) & 0xFFFF;
        }
        u8[6] = sum & 0xFF;
        u8[7] = (sum >> 8) & 0xFF;
    }
    
    const blob = new Blob([u8], { type: "application/octet-stream" });
    const link = document.createElement("a");
    const filename = `${pkmn.nickname || pkmn.species}_${ext}.${ext}`;
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

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

