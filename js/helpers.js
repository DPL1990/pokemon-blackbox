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


