// --- SECTION UNIFIED DRAG & DROP LOGIC ---
let draggedPokemonId = null;

function executeDropLogic(id, targetSlotType, targetSlotIndex, targetId) {
    const pkmnIndex = pokemonDatabase.findIndex(p => p.id === id); 
    if (pkmnIndex === -1) return;
    
    const draggedPkmn = pokemonDatabase[pkmnIndex]; 

    // Validate drop to active team from other games
    if (targetSlotType === "team" && draggedPkmn.currentGame !== currentGameId) {
        alert("Este Pokémon pertence a outra Versão e não pode ser colocado na equipa ativa deste cartucho.");
        return;
    }

    if (targetId && targetId !== id) {
        // Swapping occupied slots
        const targetPkmnIndex = pokemonDatabase.findIndex(p => p.id === targetId);
        if (targetPkmnIndex !== -1) {
            const targetPkmn = pokemonDatabase[targetPkmnIndex];
            
            // Check Dexit if target is moving to team
            if (targetPkmn.slotType === "team" && !isPokemonAllowedInGame(draggedPkmn.pokedexId || 1, currentGameId)) {
                alert(`Dexit: O Pokémon ${draggedPkmn.species} não é compatível com esta versão (${GAMES_DB.find(g => g.id === currentGameId)?.name}) e não pode ser colocado na equipa ativa.`);
                return;
            }
            if (draggedPkmn.slotType === "team" && !isPokemonAllowedInGame(targetPkmn.pokedexId || 1, currentGameId)) {
                alert(`Dexit: O Pokémon ${targetPkmn.species} não é compatível com esta versão (${GAMES_DB.find(g => g.id === currentGameId)?.name}) e não pode ser colocado na equipa ativa.`);
                return;
            }

            // Validate drops to team for swap operations
            if (targetPkmn.slotType === "team" && draggedPkmn.currentGame !== currentGameId) {
                alert("Este Pokémon pertence a outra Versão e não pode ser colocado na equipa ativa deste cartucho.");
                return;
            }
            if (draggedPkmn.slotType === "team" && targetPkmn.currentGame !== currentGameId) {
                alert("Este Pokémon pertence a outra Versão e não pode ser colocado na equipa ativa deste cartucho.");
                return;
            }
            
            // Validate active team rules for the swap
            if (targetPkmn.slotType === "team") {
                const candidatePkmn = { ...draggedPkmn, slotType: "team" };
                const teamVal = validateActiveTeamRules(candidatePkmn);
                if (!teamVal.valid) {
                    alert(teamVal.reason);
                    return;
                }
            }
            if (draggedPkmn.slotType === "team") {
                const candidatePkmn = { ...targetPkmn, slotType: "team" };
                const teamVal = validateActiveTeamRules(candidatePkmn);
                if (!teamVal.valid) {
                    alert(teamVal.reason);
                    return;
                }
            }
            
            // Synchronize game context when swapping between team and box
            if (draggedPkmn.slotType !== targetPkmn.slotType) {
                if (targetPkmn.slotType === "team") {
                    draggedPkmn.currentGame = currentGameId;
                }
                if (draggedPkmn.slotType === "team") {
                    targetPkmn.currentGame = currentGameId;
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
            // Check Dexit for dragged Pokemon
            if (!isPokemonAllowedInGame(draggedPkmn.pokedexId || 1, currentGameId)) {
                alert(`Dexit: O Pokémon ${draggedPkmn.species} não é compatível com esta versão (${GAMES_DB.find(g => g.id === currentGameId)?.name}) e não pode ser colocado na equipa ativa.`);
                return;
            }

            const candidatePkmn = { ...draggedPkmn, slotType: "team" };
            const teamVal = validateActiveTeamRules(candidatePkmn);
            if (!teamVal.valid) {
                alert(teamVal.reason);
                return;
            }

            draggedPkmn.currentGame = currentGameId; 
            const blocking = pokemonDatabase.find(p => p.currentGame === currentGameId && p.slotType === "team" && p.slotIndex === targetSlotIndex);
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

function setFormLockedState(isLocked) {
    const warningEl = document.getElementById("editor-lock-warning");
    if (isLocked) {
        warningEl.style.display = "block";
        warningEl.innerText = "⚠️ Este espécime está trancado porque faz parte de uma equipa vencedora do Hall of Fame 🏆 e não pode ser editado nem eliminado.";
    } else {
        warningEl.style.display = "none";
    }
    
    // Select all inputs, selects, textareas inside the modal content
    const elementsToToggle = document.querySelectorAll(
        "#editor-modal input, #editor-modal select, #editor-modal textarea, #editor-modal button:not([onclick='closeModal()']):not(#btn-export-individual-pkx)"
    );
    
    elementsToToggle.forEach(el => {
        el.disabled = isLocked;
    });
}

function openModalForNew() {
    editorViewingAlternativeMoves = false;
    activePokemonEditorMoves = { moves: ["", "", "", ""], alternativeMoves: ["", "", "", ""] };
    const btnToggleAlt = document.getElementById("btn-toggle-alt-moves");
    if (btnToggleAlt) btnToggleAlt.textContent = "🔄 Mostrar Conjunto Alternativo";
    setFormLockedState(false);
    
    const footerActions = document.querySelector("#editor-modal .footer-actions");
    const saveBtn = footerActions ? footerActions.querySelector(".btn-primary") : null;
    if (saveBtn) saveBtn.style.display = "inline-block";

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
    
    populateMoveSelects({
        species: "",
        currentGame: currentGameId,
        moves: ["", "", "", ""]
    });
    const btnExport = document.getElementById("btn-export-individual-pkx");
    if (btnExport) btnExport.style.display = "none";    
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
    
    editorViewingAlternativeMoves = false;
    activePokemonEditorMoves = {
        moves: p.moves ? [...p.moves] : ["", "", "", ""],
        alternativeMoves: p.alternativeMoves ? [...p.alternativeMoves] : ["", "", "", ""]
    };
    const btnToggleAlt = document.getElementById("btn-toggle-alt-moves");
    if (btnToggleAlt) btnToggleAlt.textContent = "🔄 Mostrar Conjunto Alternativo";
    
    setFormLockedState(!!p.isLocked);
    
    const btnDelete = document.getElementById("btn-delete-pkmn");
    const footerActions = document.querySelector("#editor-modal .footer-actions");
    const saveBtn = footerActions ? footerActions.querySelector(".btn-primary") : null;
    
    if (p.isLocked) {
        if (btnDelete) btnDelete.style.display = "none";
        if (saveBtn) saveBtn.style.display = "none";
    } else {
        if (btnDelete) btnDelete.style.display = "block";
        if (saveBtn) saveBtn.style.display = "inline-block";
    }
    
    document.getElementById("form-id").value = p.id; 
    document.getElementById("form-species").value = p.species; 
    document.getElementById("form-nickname").value = p.nickname || "";
    document.getElementById("form-level").value = p.level || 50; 
    document.getElementById("form-gender").value = normalizeGender(p.gender); 
    document.getElementById("form-nature").value = p.nature || "";
    document.getElementById("form-ability").value = p.ability || ""; 
    document.getElementById("form-type1").value = p.type1 || "normal"; 
    document.getElementById("form-type2").value = p.type2 || "";
    document.getElementById("form-ball").value = p.ball || "poke"; 
    document.getElementById("form-item").value = p.item || ""; 
    
    // Auto-fetch missing types or ability in the background
    if (!p.type2 && (!p.type1 || p.type1 === "normal") || !p.ability) {
        fetchMissingSpeciesData(p.species);
    }
    
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
    
    populateMoveSelects(p);
    
    let gen = 3;
    if (p.saveMeta && p.saveMeta.gen) {
        gen = p.saveMeta.gen;
    } else {
        const game = GAMES_DB.find(g => g.id === p.currentGame);
        gen = game ? game.gen : 9;
    }
    const btnExport = document.getElementById("btn-export-individual-pkx");
    if (btnExport) {
        if (gen >= 3) {
            btnExport.style.display = "inline-block";
        } else {
            btnExport.style.display = "none";
        }
    }    
    document.getElementById("form-notes").value = p.notes || ""; 
    document.getElementById("form-evolution-notes").value = p.evolutionNotes || ""; 
    document.getElementById("form-origin-game").value = p.originGame || currentGameId;
    
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

function toggleEditorMovesetView() {
    const currentFormMoves = [
        document.getElementById("form-move1").value.trim(), 
        document.getElementById("form-move2").value.trim(), 
        document.getElementById("form-move3").value.trim(), 
        document.getElementById("form-move4").value.trim()
    ];
    if (editorViewingAlternativeMoves) {
        activePokemonEditorMoves.alternativeMoves = currentFormMoves;
    } else {
        activePokemonEditorMoves.moves = currentFormMoves;
    }
    editorViewingAlternativeMoves = !editorViewingAlternativeMoves;
    const btnToggleAlt = document.getElementById("btn-toggle-alt-moves");
    if (btnToggleAlt) {
        btnToggleAlt.textContent = editorViewingAlternativeMoves ? "🔄 Mostrar Conjunto Principal" : "🔄 Mostrar Conjunto Alternativo";
    }
    const targetMovesList = editorViewingAlternativeMoves ? activePokemonEditorMoves.alternativeMoves : activePokemonEditorMoves.moves;
    for (let slotNum = 1; slotNum <= 4; slotNum++) {
        const inputEl = document.getElementById(`form-move${slotNum}`);
        if (inputEl) inputEl.value = targetMovesList[slotNum - 1] || "";
    }
    const currentId = document.getElementById("form-id").value;
    const currentSpecies = document.getElementById("form-species")?.value.trim() || "";
    const currentOrigin = document.getElementById("form-origin-game")?.value || currentGameId;
    let p = pokemonDatabase.find(pkmn => pkmn.id === currentId);
    if (p) {
        populateMoveSelects({
            ...p,
            species: currentSpecies,
            currentGame: currentOrigin,
            moves: targetMovesList,
            alternativeMoves: activePokemonEditorMoves.alternativeMoves
        });
    } else {
        populateMoveSelects({
            species: currentSpecies,
            currentGame: currentOrigin,
            moves: targetMovesList,
            alternativeMoves: activePokemonEditorMoves.alternativeMoves
        });
    }
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

    if (id) {
        const existing = pokemonDatabase.find(p => p.id === id);
        if (existing && existing.isLocked) {
            alert("Este espécime está trancado e não pode ser editado nem gravado!");
            return;
        }
    }
    
    // Validate EVs before saving
    if (!validateEVs()) {
        alert("A soma total de EVs excede o limite competitivo de 510!");
        return;
    }

    const nickname = document.getElementById("form-nickname").value.trim();
    const level = parseInt(document.getElementById("form-level").value, 10) || 50;
    const gender = normalizeGender(document.getElementById("form-gender").value);
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

    const currentFormMoves = [
        document.getElementById("form-move1").value.trim(), 
        document.getElementById("form-move2").value.trim(), 
        document.getElementById("form-move3").value.trim(), 
        document.getElementById("form-move4").value.trim()
    ];
    if (editorViewingAlternativeMoves) {
        activePokemonEditorMoves.alternativeMoves = currentFormMoves;
    } else {
        activePokemonEditorMoves.moves = currentFormMoves;
    }
    const moves = activePokemonEditorMoves.moves.filter(m => m !== "");
    const alternativeMoves = activePokemonEditorMoves.alternativeMoves.filter(m => m !== "");

    // Generational moveset check
    const movesVal = validateMovesGeneration(moves, currentGameId);
    if (!movesVal.valid) {
        alert(`Validação Geracional: O ataque "${movesVal.move}" pertence à Geração ${movesVal.moveGen}, mas este jogo (${GAMES_DB.find(g => g.id === currentGameId)?.name}) só suporta até à Geração ${movesVal.targetGen}.`);
        return;
    }
    const altMovesVal = validateMovesGeneration(alternativeMoves, currentGameId);
    if (!altMovesVal.valid) {
        alert(`Validação Geracional (Conjunto Alternativo): O ataque "${altMovesVal.move}" pertence à Geração ${altMovesVal.moveGen}, mas este jogo (${GAMES_DB.find(g => g.id === currentGameId)?.name}) só suporta até à Geração ${altMovesVal.targetGen}.`);
        return;
    }

    // Resolve pokedex ID locally or fallback
    let pokedexId = 1;
    const lowerSpecies = species.toLowerCase().trim();
    let localDexId = POKEMON_NAMES_ALL.findIndex(name => name && name.toLowerCase().trim() === lowerSpecies);
    if (localDexId === -1) {
        localDexId = POKEMON_NAMES_ALL.findIndex(name => {
            if (!name) return false;
            const cleanA = name.toLowerCase().replace(/[^a-z0-9]/g, "");
            const cleanB = lowerSpecies.replace(/[^a-z0-9]/g, "");
            return cleanA === cleanB;
        });
    }
    if (localDexId !== -1) {
        pokedexId = localDexId;
    } else {
        try {
            const cleanName = species.toLowerCase().trim()
                .replace(/[\s']/g, "-")
                .replace(/\./g, "")
                .replace(/-+$/, "");
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanName}`);
            if (res.ok) { 
                const data = await res.json(); 
                pokedexId = data.id;
            }
        } catch (err) { 
            console.log(err); 
        }
    }

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
    
    const slotType = targetPokemon ? targetPokemon.slotType : "box";
    if (slotType === "team") {
        // Dexit Check
        if (!isPokemonAllowedInGame(pokedexId, currentGameId)) {
            alert(`Dexit: O Pokémon ${species} não é compatível com esta versão (${GAMES_DB.find(g => g.id === currentGameId)?.name}) e não pode ser colocado na equipa ativa.`);
            return;
        }

        const candidatePkmn = {
            id: id || "temp_id",
            species,
            pokedexId,
            item,
            nature,
            moves
        };
        const activeTeamVal = validateActiveTeamRules(candidatePkmn);
        if (!activeTeamVal.valid) {
            alert(activeTeamVal.reason);
            return;
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
    targetPokemon.pokedexId = pokedexId;
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
    targetPokemon.alternativeMoves = alternativeMoves;
    targetPokemon.ribbons = ribbons; 
    targetPokemon.notes = notes; 
    targetPokemon.evolutionNotes = evolutionNotes;
    targetPokemon.originGame = originGame;

    localStorage.setItem("bb_database", JSON.stringify(pokemonDatabase));
    closeModal();
    renderAll();
}

function deletePokemon() {
    const id = document.getElementById("form-id").value; 
    if (!id) return;
    
    const existing = pokemonDatabase.find(p => p.id === id);
    if (existing && existing.isLocked) {
        alert("Este espécime está trancado e não pode ser eliminado!");
        return;
    }
    
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
            pkmn.gender = "♂"; 
            idPart = idPart.replace("(M)", "").trim(); 
        }
        if (idPart.includes("(F)")) { 
            pkmn.gender = "♀"; 
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

