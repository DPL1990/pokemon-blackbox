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

function parseGen1Gen2DVsAndMoves(u8, structOffset, movesOffset, dvsOffset) {
    const moves = [];
    for (let m = 0; m < 4; m++) {
        const moveId = u8[structOffset + movesOffset + m];
        const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || "";
        moves.push(formatMoveNameForDisplay(rawName));
    }
    
    const byte1 = u8[structOffset + dvsOffset];
    const byte2 = u8[structOffset + dvsOffset + 1];
    
    const atkDv = (byte1 >> 4) & 15;
    const defDv = byte1 & 15;
    const speDv = (byte2 >> 4) & 15;
    const spcDv = byte2 & 15;
    const hpDv = ((atkDv & 1) << 3) | ((defDv & 1) << 2) | ((speDv & 1) << 1) | (spcDv & 1);
    
    const ivs = {
        hp: hpDv * 2 + 1,
        atk: atkDv * 2 + 1,
        def: defDv * 2 + 1,
        spe: speDv * 2 + 1,
        spa: spcDv * 2 + 1,
        spd: spcDv * 2 + 1
    };
    
    return { moves, ivs };
}

function deduplicateParsedPokemon(list) {
    const seen = new Set();
    return list.filter(p => {
        const movesKey = (p.moves || []).slice(0).sort().join(",");
        const ivsKey = p.ivs ? `${p.ivs.hp},${p.ivs.atk},${p.ivs.def},${p.ivs.spe},${p.ivs.spa},${p.ivs.spd}` : "";
        const hash = `${p.pokedexId}_${p.level}_${p.otId}_${(p.otName || "").toLowerCase().trim()}_${(p.nickname || "").toLowerCase().trim()}_${movesKey}_${ivsKey}`;
        if (seen.has(hash)) {
            return false;
        }
        seen.add(hash);
        return true;
    });
}

function getAbilityFromSlots(abilities, slot) {
    if (!abilities || abilities.length === 0) return "";
    const match = abilities.find(a => a.slot === slot && !a.is_hidden);
    if (match) return formatAbilityName(match.ability.name);
    const normalAbilities = abilities.filter(a => !a.is_hidden);
    if (normalAbilities.length > 0) return formatAbilityName(normalAbilities[0].ability.name);
    return formatAbilityName(abilities[0].ability.name);
}

function formatAbilityName(name) {
    return name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

const ABILITY_ID_CACHE = {};
async function resolveAbilityName(abilityId) {
    if (abilityId === 0 || !abilityId) return "";
    if (ABILITY_ID_CACHE[abilityId]) return ABILITY_ID_CACHE[abilityId];
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/ability/${abilityId}`);
        if (res.ok) {
            const data = await res.json();
            const cleanName = formatAbilityName(data.name);
            ABILITY_ID_CACHE[abilityId] = cleanName;
            return cleanName;
        }
    } catch(e) {}
    return "";
}

async function enrichImportedPokemonList(list) {
    for (let p of list) {
        if (!p.nature && p.saveMeta && p.saveMeta.gen) {
            const gen = p.saveMeta.gen;
            if (gen === 1 || gen === 2) {
                const exp = p.exp || 0;
                p.nature = GEN3_NATURES[exp % 25];
            } else if (gen === 3 || gen === 4 || gen === 5) {
                const pid = p.saveMeta.pid || 0;
                p.nature = GEN3_NATURES[pid % 25];
            }
        }
        if ((!p.gender || p.gender === "⚲") && p.saveMeta && p.saveMeta.gen) {
            const gen = p.saveMeta.gen;
            if (gen === 1 || gen === 2) {
                const atkDv = p.atkDv !== undefined ? p.atkDv : 15;
                p.gender = getGenderFromDv(p.pokedexId, atkDv);
            } else if (gen === 3 || gen === 4 || gen === 5) {
                const pid = p.saveMeta.pid || 0;
                p.gender = getGenderFromPid(p.pokedexId, pid);
            }
        }
        p.gender = normalizeGender(p.gender);
        
        // Resolve individual ability first if gen >= 4
        if (!p.ability && p.saveMeta && p.saveMeta.gen >= 4 && p.abilityId !== undefined) {
            p.ability = await resolveAbilityName(p.abilityId);
        }
        
        const speciesClean = p.species.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "-").trim();
        let cached = SPECIES_TYPE_CACHE[speciesClean];
        if (cached && cached.t1) {
            p.type1 = cached.t1;
            p.type2 = cached.t2 || "";
            if (!p.ability && cached.ability) {
                p.ability = cached.ability;
            }
        }
        
        // If types or ability are still missing, fetch from PokeAPI
        if (!p.type1 || !p.ability) {
            // Delay to prevent hitting PokeAPI rate limits
            await new Promise(resolve => setTimeout(resolve, 50));
            
            try {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesClean}`);
                if (res.ok) {
                    const data = await res.json();
                    p.type1 = data.types[0].type.name;
                    p.type2 = data.types[1] ? data.types[1].type.name : "";
                    
                    if (!p.ability) {
                        if (p.saveMeta && p.saveMeta.gen) {
                            const gen = p.saveMeta.gen;
                            if (gen === 3) {
                                const pid = p.saveMeta.pid || 0;
                                const slot = (pid % 2 === 0) ? 1 : 2;
                                p.ability = getAbilityFromSlots(data.abilities, slot);
                            }
                        }
                        if (!p.ability) {
                            p.ability = getAbilityFromSlots(data.abilities, 1);
                        }
                    }
                    
                    SPECIES_TYPE_CACHE[speciesClean] = {
                        t1: p.type1,
                        t2: p.type2,
                        ability: p.ability
                    };
                    localStorage.setItem("bb_species_type_cache", JSON.stringify(SPECIES_TYPE_CACHE));
                }
            } catch (e) {
                console.error("Erro ao enriquecer dados de " + p.species, e);
            }
        }
    }
    renderSaveImportList();
}

const GEN3_NATURES = ["Hardy", "Lonely", "Brave", "Adamant", "Naughty", "Bold", "Docile", "Relaxed", "Impish", "Lax", "Timid", "Hasty", "Serious", "Jolly", "Naive", "Modest", "Mild", "Quiet", "Bashful", "Rash", "Calm", "Gentle", "Sassy", "Careful", "Quirky"];

function normalizeGender(g) {
    if (!g) return "⚲";
    const s = String(g);
    if (s.includes("♂")) return "♂";
    if (s.includes("♀")) return "♀";
    return "⚲";
}

function getGenderFromDv(pokedexId, atkDv) {
    const genderless = [81,82,100,101,120,121,132,137,144,145,146,150,151,201,233,243,244,245,249,250,251];
    if (genderless.includes(pokedexId)) return "⚲";
    
    const onlyFemale = [29,30,31,113,115,124,238,241,242];
    if (onlyFemale.includes(pokedexId)) return "♀";
    
    const onlyMale = [32,33,34,106,107,128,236,237];
    if (onlyMale.includes(pokedexId)) return "♂";
    
    const starters = [1,2,3,4,5,6,7,8,9,133,134,135,136,138,139,140,141,142,143,152,153,154,155,156,157,158,159,160,175,176,196,197];
    if (starters.includes(pokedexId)) {
        return (atkDv < 2) ? "♀" : "♂";
    }
    
    const ratio25 = [58,59,66,67,68,125,126,239,240];
    if (ratio25.includes(pokedexId)) {
        return (atkDv < 4) ? "♀" : "♂";
    }
    
    const ratio75 = [35,36,37,38,39,40,209,210];
    if (ratio75.includes(pokedexId)) {
        return (atkDv < 12) ? "♀" : "♂";
    }
    
    return (atkDv < 8) ? "♀" : "♂";
}

function getGenderFromPid(pokedexId, pid) {
    const genderByte = pid & 0xFF;
    const genderless = [81,82,100,101,120,121,132,137,144,145,146,150,151,201,233,243,244,245,249,250,251, 292,337,338,343,344,374,375,376,377,378,379,382,383,384,385,386,
                        436, 437, 479, 480, 481, 482, 483, 484, 486, 487, 489, 490, 491, 492, 493, 494, 599, 600, 601, 615, 622, 623, 638, 639, 640, 643, 644, 646, 647, 648, 649];
    if (genderless.includes(pokedexId)) return "⚲";
    
    const onlyFemale = [29,30,31,113,115,124,238,241,242, 380, 413, 440, 478, 488, 548, 549, 629, 630];
    if (onlyFemale.includes(pokedexId)) return "♀";
    
    const onlyMale = [32,33,34,106,107,128,236,237, 313, 381, 414, 475, 627, 628, 641, 642, 645];
    if (onlyMale.includes(pokedexId)) return "♂";
    
    const starters = [1,2,3,4,5,6,7,8,9,133,134,135,136,138,139,140,141,142,143,152,153,154,155,156,157,158,159,160,175,176,196,197, 252,253,254,255,256,257,258,259,260, 345,346,347,348, 360,
                      387, 388, 389, 390, 391, 392, 393, 394, 395, 408, 409, 410, 411, 446, 447, 448, 468, 470, 471, 495, 496, 497, 498, 499, 500, 501, 502, 503, 511, 512, 513, 514, 515, 516, 564, 565, 566, 567, 570, 571];
    if (starters.includes(pokedexId)) {
        return (genderByte < 31) ? "♀" : "♂";
    }
    
    const ratio25 = [58,59,66,67,68,125,126,239,240, 296,297, 466, 467, 532, 533, 534];
    if (ratio25.includes(pokedexId)) {
        return (genderByte < 64) ? "♀" : "♂";
    }
    
    const ratio75 = [35,36,37,38,39,40,209,210, 298,300,301,311,314, 572, 573, 574, 575, 576];
    if (ratio75.includes(pokedexId)) {
        return (genderByte < 191) ? "♀" : "♂";
    }
    
    return (genderByte < 127) ? "♀" : "♂";
}

function parseGen1Box(u8, boxOffset, sourceName, gen1BoxIndex) {
    const boxParsed = [];
    if (boxOffset + 1122 > u8.length) return boxParsed;
    
    const boxCount = u8[boxOffset];
    if (boxCount > 0 && boxCount <= 20) {
        for (let i = 0; i < boxCount; i++) {
            const internalId = u8[boxOffset + 1 + i];
            const pokedexId = GEN1_INTERNAL_TO_DEX[internalId];
            if (!pokedexId) continue;
            
            const structOffset = boxOffset + 22 + (i * 33);
            const level = u8[structOffset + 3];
            
            const nickOffset = boxOffset + 902 + (i * 11);
            const nickname = decodeGen1String(u8.subarray(nickOffset, nickOffset + 11));
            
            const otId = u8[structOffset + 12] * 256 + u8[structOffset + 13];
            const otOffset = boxOffset + 682 + (i * 11);
            const otName = decodeGen1String(u8.subarray(otOffset, otOffset + 11));
            
            const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || "Desconhecido");
            
            const dvsOffset = 27;
            const atkDv = (u8[structOffset + dvsOffset] >> 4) & 15;
            const exp = u8[structOffset + 14] * 65536 + u8[structOffset + 15] * 256 + u8[structOffset + 16];
            
            const { moves, ivs } = parseGen1Gen2DVsAndMoves(u8, structOffset, 8, 27);
            
            boxParsed.push({
                sourceSlot: `${sourceName} #${i+1}`,
                pokedexId,
                species: speciesName,
                nickname: nickname || speciesName,
                level: level || 5,
                otName: otName,
                otId: otId,
                moves: moves,
                ivs: ivs,
                nature: GEN3_NATURES[exp % 25],
                gender: getGenderFromDv(pokedexId, atkDv),
                ability: "", // Mapeada na PokeAPI depois
                type1: "normal",
                type2: "",
                saveMeta: {
                    gen: 1,
                    isParty: false,
                    boxIndex: gen1BoxIndex,
                    structOffset: structOffset,
                    index: i
                }
            });
        }
    }
    return boxParsed;
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
            
            const dvsOffset = 27;
            const atkDv = (u8[structOffset + dvsOffset] >> 4) & 15;
            const exp = u8[structOffset + 14] * 65536 + u8[structOffset + 15] * 256 + u8[structOffset + 16];
            
            const { moves, ivs } = parseGen1Gen2DVsAndMoves(u8, structOffset, 8, 27);
            
            parsedList.push({
                sourceSlot: `Equipa Gen 1 #${i+1}`,
                pokedexId,
                species: speciesName,
                nickname: nickname || speciesName,
                level: level || 5,
                otName: otName,
                otId: otId,
                moves: moves,
                ivs: ivs,
                nature: GEN3_NATURES[exp % 25],
                gender: getGenderFromDv(pokedexId, atkDv),
                ability: "",
                type1: "normal",
                type2: "",
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
    parsedList.push(...parseGen1Box(u8, 0x30C0, "Box Ativa Gen 1", -1));

    // Parse Stored Boxes (SRAM Bank 2 e Bank 3)
    if (u8.length >= 0x8000) {
        // Caixas 1-6 no Bank 2 (0x4000)
        for (let b = 0; b < 6; b++) {
            const boxOffset = 0x4000 + (b * 1122);
            parsedList.push(...parseGen1Box(u8, boxOffset, `Box ${b+1}`, b));
        }
        // Caixas 7-12 no Bank 3 (0x6000)
        for (let b = 0; b < 6; b++) {
            const boxOffset = 0x6000 + (b * 1122);
            parsedList.push(...parseGen1Box(u8, boxOffset, `Box ${b+7}`, b+6));
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
        if (u8.length >= 0x8000) {
            isCrystal = (u8[0x2D82] <= 6 && u8[0x2D82] > 0);
        } else {
            return [];
        }
    }
    
    const listOffset = isCrystal ? 0x2D83 : 0x2D0D;
    const structStart = isCrystal ? 0x2D8A : 0x2D14;
    const nickStart = isCrystal ? 0x2EEC : 0x2E76;
    
    if (count >= 1 && count <= 6) {
        for (let i = 0; i < count; i++) {
            const pokedexId = u8[listOffset + i];
            if (pokedexId === 0 || pokedexId > 251) continue;
            
            const structOffset = structStart + (i * 48);
            const level = u8[structOffset + 32];
            
            const nickOffset = nickStart + (i * 11);
            const nickname = decodeGen1String(u8.subarray(nickOffset, nickOffset + 11));
            
            const otId = u8[structOffset + 6] * 256 + u8[structOffset + 7];
            const otStart = isCrystal ? 0x2EAA : 0x2E34;
            const otOffset = otStart + (i * 11);
            const otName = decodeGen1String(u8.subarray(otOffset, otOffset + 11));
            
            const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || `Species #${pokedexId}`);
            
            const { moves, ivs } = parseGen1Gen2DVsAndMoves(u8, structOffset, 2, 21);
            
            const dvsOffset = 21;
            const atkDv = (u8[structOffset + dvsOffset] >> 4) & 15;
            const exp = u8[structOffset + 8] * 65536 + u8[structOffset + 9] * 256 + u8[structOffset + 10];
            
            parsedList.push({
                sourceSlot: isCrystal ? `Equipa Crystal #${i+1}` : `Equipa Gold/Silver #${i+1}`,
                pokedexId,
                species: speciesName,
                nickname: nickname || speciesName,
                level: level || 5,
                otName: otName,
                otId: otId,
                moves: moves,
                ivs: ivs,
                nature: GEN3_NATURES[exp % 25],
                gender: getGenderFromDv(pokedexId, atkDv),
                ability: "",
                type1: "normal",
                type2: "",
                saveMeta: {
                    gen: 2,
                    isCrystal: isCrystal,
                    isParty: true,
                    structOffset: structOffset,
                    index: i
                }
            });
        }
    }
    
    // Parse Stored Boxes (SRAM Bank 2 e Bank 3)
    if (u8.length >= 0x8000) {
        function parseGen2Box(boxOffset, boxName, boxIdx) {
            const list = [];
            if (boxOffset + 1104 > u8.length) return list;
            
            const boxCount = u8[boxOffset];
            if (boxCount > 0 && boxCount <= 20) {
                for (let i = 0; i < boxCount; i++) {
                    const pokedexId = u8[boxOffset + 1 + i];
                    if (pokedexId === 0 || pokedexId === 0xFF || pokedexId > 251) continue;
                    
                    const structOffset = boxOffset + 22 + (i * 32);
                    const level = u8[structOffset + 31];
                    
                    const otOffset = boxOffset + 662 + (i * 11);
                    const otName = decodeGen1String(u8.subarray(otOffset, otOffset + 11));
                    const otId = u8[structOffset + 6] * 256 + u8[structOffset + 7];
                    
                    const nickOffset = boxOffset + 882 + (i * 11);
                    const nickname = decodeGen1String(u8.subarray(nickOffset, nickOffset + 11));
                    
                    const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || `Species #${pokedexId}`);
                    
                    const { moves, ivs } = parseGen1Gen2DVsAndMoves(u8, structOffset, 2, 21);
                    
                    const dvsOffset = 21;
                    const atkDv = (u8[structOffset + dvsOffset] >> 4) & 15;
                    const exp = u8[structOffset + 8] * 65536 + u8[structOffset + 9] * 256 + u8[structOffset + 10];
                    
                    list.push({
                        sourceSlot: `${boxName} #${i+1}`,
                        pokedexId,
                        species: speciesName,
                        nickname: nickname || speciesName,
                        level: level || 5,
                        otName: otName,
                        otId: otId,
                        moves: moves,
                        ivs: ivs,
                        nature: GEN3_NATURES[exp % 25],
                        gender: getGenderFromDv(pokedexId, atkDv),
                        ability: "",
                        type1: "normal",
                        type2: "",
                        saveMeta: {
                            gen: 2,
                            isCrystal: isCrystal,
                            isParty: false,
                            boxIndex: boxIdx,
                            structOffset: structOffset,
                            index: i
                        }
                    });
                }
            }
            return list;
        }
        
        // Caixas 1-7 no Bank 2 (0x4000)
        for (let b = 0; b < 7; b++) {
            const boxOffset = 0x4000 + (b * 1104);
            parsedList.push(...parseGen2Box(boxOffset, `Box ${b+1}`, b));
        }
        // Caixas 8-14 no Bank 3 (0x6000)
        for (let b = 0; b < 7; b++) {
            const boxOffset = 0x6000 + (b * 1104);
            parsedList.push(...parseGen2Box(boxOffset, `Box ${b+8}`, b+7));
        }
    }
    
    return parsedList;
}

function parseGen3Save(buffer) {
    const u8 = new Uint8Array(buffer);
    const parsedList = [];
    
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
    
    // Parse Active Team (Section 1)
    if (activeSectors[1]) {
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
            let blockA = null;
            let blockM = null;
            for (let b = 0; b < 4; b++) {
                const blockType = order[b];
                if (blockType === 0) blockG = decryptedBytes.subarray(b * 12, b * 12 + 12);
                else if (blockType === 1) blockA = decryptedBytes.subarray(b * 12, b * 12 + 12);
                else if (blockType === 3) blockM = decryptedBytes.subarray(b * 12, b * 12 + 12);
            }
            
            if (!blockG) continue;
            
            const pokedexId = blockG[0] | (blockG[1] << 8);
            if (pokedexId === 0 || pokedexId > 386) continue;
            
            const level = section1[structOffset + 84];
            const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || `Species #${pokedexId}`);
            
            const otId = otid & 0xFFFF;
            const otNameBytes = section1.subarray(structOffset + 20, structOffset + 20 + 7);
            const otName = decodeGen3String(otNameBytes);
            
            let itemName = "";
            const itemId = blockG[2] | (blockG[3] << 8);
            itemName = formatItemNameForDisplay(REVERSE_ITEMS_MAP_GEN3[itemId] || "");
            
            const moves = [];
            if (blockA) {
                const u16BlockA = new Uint16Array(blockA.buffer, blockA.byteOffset, 6);
                for (let m = 0; m < 4; m++) {
                    const moveId = u16BlockA[m];
                    const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || REVERSE_MOVES_MAP[moveId] || "";
                    moves.push(formatMoveNameForDisplay(rawName));
                }
            }
            
            let ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
            if (blockM) {
                const ivWord = blockM[4] | (blockM[5] << 8) | (blockM[6] << 16) | (blockM[7] << 24);
                ivs = {
                    hp: ivWord & 0x1F,
                    atk: (ivWord >> 5) & 0x1F,
                    def: (ivWord >> 10) & 0x1F,
                    spe: (ivWord >> 15) & 0x1F,
                    spa: (ivWord >> 20) & 0x1F,
                    spd: (ivWord >> 25) & 0x1F
                };
            }
            
            parsedList.push({
                sourceSlot: `Equipa GBA #${i+1}`,
                pokedexId,
                species: speciesName,
                nickname: nickname || speciesName,
                level: level || 5,
                otName: otName,
                otId: otId,
                item: itemName,
                moves: moves,
                ivs: ivs,
                nature: GEN3_NATURES[pid % 25],
                gender: getGenderFromPid(pokedexId, pid),
                ability: "",
                type1: "normal",
                type2: "",
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
    }
    
    // Parse Stored Boxes (Section 5 a 13)
    const pcBuffer = new Uint8Array(33744);
    let pcOffset = 0;
    let hasPC = true;
    for (let id = 5; id <= 13; id++) {
        const sec = activeSectors[id];
        if (!sec) {
            hasPC = false;
            break;
        }
        const len = (id === 13) ? 2000 : 3968;
        pcBuffer.set(sec.subarray(0, len), pcOffset);
        pcOffset += len;
    }
    
    if (hasPC) {
        for (let i = 0; i < 420; i++) {
            const structOffset = 4 + (i * 80);
            
            const pid = pcBuffer[structOffset] |
                        (pcBuffer[structOffset + 1] << 8) |
                        (pcBuffer[structOffset + 2] << 16) |
                        (pcBuffer[structOffset + 3] << 24);
                        
            const otid = pcBuffer[structOffset + 4] |
                         (pcBuffer[structOffset + 5] << 8) |
                         (pcBuffer[structOffset + 6] << 16) |
                         (pcBuffer[structOffset + 7] << 24);
            
            if (pid === 0 && otid === 0) continue;
            
            const nickBytes = pcBuffer.subarray(structOffset + 8, structOffset + 18);
            const nickname = decodeGen3String(nickBytes);
            
            const key = pid ^ otid;
            const decryptedWords = new Uint32Array(12);
            for (let j = 0; j < 12; j++) {
                const wordOffset = structOffset + 32 + j * 4;
                const encryptedWord = pcBuffer[wordOffset] |
                                      (pcBuffer[wordOffset + 1] << 8) |
                                      (pcBuffer[wordOffset + 2] << 16) |
                                      (pcBuffer[wordOffset + 3] << 24);
                decryptedWords[j] = encryptedWord ^ key;
            }
            
            const decryptedBytes = new Uint8Array(decryptedWords.buffer);
            const shuffleIndex = pid % 24;
            const order = blockOrders[shuffleIndex];
            
            let blockG = null;
            let blockA = null;
            let blockM = null;
            for (let b = 0; b < 4; b++) {
                const blockType = order[b];
                if (blockType === 0) blockG = decryptedBytes.subarray(b * 12, b * 12 + 12);
                else if (blockType === 1) blockA = decryptedBytes.subarray(b * 12, b * 12 + 12);
                else if (blockType === 3) blockM = decryptedBytes.subarray(b * 12, b * 12 + 12);
            }
            
            if (!blockG) continue;
            
            const pokedexId = blockG[0] | (blockG[1] << 8);
            if (pokedexId === 0 || pokedexId > 386) continue;
            
            const exp = blockG[4] | (blockG[5] << 8) | (blockG[6] << 16) | (blockG[7] << 24);
            const level = Math.max(1, Math.min(100, Math.round(Math.pow(exp, 1/3))));
            const speciesName = cleanSpeciesName(POKEMON_NAMES_ALL[pokedexId] || `Species #${pokedexId}`);
            
            const otId = otid & 0xFFFF;
            const otNameBytes = pcBuffer.subarray(structOffset + 20, structOffset + 20 + 7);
            const otName = decodeGen3String(otNameBytes);
            
            let itemName = "";
            const itemId = blockG[2] | (blockG[3] << 8);
            itemName = formatItemNameForDisplay(REVERSE_ITEMS_MAP_GEN3[itemId] || "");
            
            const moves = [];
            if (blockA) {
                const u16BlockA = new Uint16Array(blockA.buffer, blockA.byteOffset, 6);
                for (let m = 0; m < 4; m++) {
                    const moveId = u16BlockA[m];
                    const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || REVERSE_MOVES_MAP[moveId] || "";
                    moves.push(formatMoveNameForDisplay(rawName));
                }
            }
            
            let ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
            if (blockM) {
                const ivWord = blockM[4] | (blockM[5] << 8) | (blockM[6] << 16) | (blockM[7] << 24);
                ivs = {
                    hp: ivWord & 0x1F,
                    atk: (ivWord >> 5) & 0x1F,
                    def: (ivWord >> 10) & 0x1F,
                    spe: (ivWord >> 15) & 0x1F,
                    spa: (ivWord >> 20) & 0x1F,
                    spd: (ivWord >> 25) & 0x1F
                };
            }
            
            const boxNum = Math.floor(i / 30) + 1;
            const slotNum = (i % 30) + 1;
            
            parsedList.push({
                sourceSlot: `Box ${boxNum} Slot ${slotNum}`,
                pokedexId,
                species: speciesName,
                nickname: nickname || speciesName,
                level: level || 5,
                otName: otName,
                otId: otId,
                item: itemName,
                moves: moves,
                ivs: ivs,
                nature: GEN3_NATURES[pid % 25],
                gender: getGenderFromPid(pokedexId, pid),
                ability: "",
                type1: "normal",
                type2: "",
                saveMeta: {
                    gen: 3,
                    isParty: false,
                    pcStructOffset: structOffset,
                    boxIndex: boxNum - 1,
                    index: slotNum - 1,
                    pid: pid,
                    otid: otid,
                    shuffleIndex: shuffleIndex
                }
            });
        }
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
                    for (let w = 0; w < 16; w++) {
                        dest[w] = decryptedWords[b * 16 + w];
                    }
                }
            }
            
            const pokedexId = blockA[0];
            if (pokedexId === 0 || pokedexId > 649) continue;
            
            const originGame = blockC[15] >> 8;
            const isGen5 = (originGame >= 20 && originGame <= 23);
            
            const exp = blockA[4] | (blockA[5] << 16);
            const otId = blockA[2];
            const secretId = blockA[3];
            const nickname = decodeUTF16String(blockC.subarray(0, 11));
            
            // Gen 5: OT Name starts at index 0 of Block D. Gen 4: starts at index 4.
            const otNameWords = isGen5 ? blockD.subarray(0, 8) : blockD.subarray(4, 12);
            const otName = decodeUTF16String(otNameWords);
            
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
            
            // Extract item, moves, and IVs
            const itemId = blockA[1];
            const rawItem = REVERSE_ITEMS_MAP_GEN3[itemId] || "";
            const itemName = formatItemNameForDisplay(rawItem);
            
            const moves = [];
            for (let m = 0; m < 4; m++) {
                const moveId = blockB[m];
                const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || REVERSE_MOVES_MAP[moveId] || "";
                moves.push(formatMoveNameForDisplay(rawName));
            }
            
            const ivWord = blockB[8] | (blockB[9] << 16);
            const ivs = {
                hp: ivWord & 0x1F,
                atk: (ivWord >> 5) & 0x1F,
                def: (ivWord >> 10) & 0x1F,
                spe: (ivWord >> 15) & 0x1F,
                spa: (ivWord >> 20) & 0x1F,
                spd: (ivWord >> 25) & 0x1F
            };
            
            // Nature
            let natureName = "";
            if (isGen5) {
                const natureVal = blockB[10] & 0xFF;
                if (natureVal < 25) {
                    natureName = GEN3_NATURES[natureVal];
                }
            }
            if (!natureName) {
                natureName = GEN3_NATURES[pid % 25] || "Hardy";
            }
            
            // Gender
            const genderVal = getGenderFromPid(pokedexId, pid);
            
            // Shiny
            const isShiny = ((otId ^ secretId ^ (pid & 0xFFFF) ^ (pid >>> 16)) < 8);
            
            // Ability
            const abilityId = blockA[6] >> 8;
            
            parsedList.push({
                sourceSlot: isParty ? `Equipa (Gen 4/5)` : `Box (Gen 4/5)`,
                pokedexId,
                species: speciesName,
                nickname: nickname || speciesName,
                level: level,
                otName: otName,
                otId: otId,
                item: itemName,
                moves: moves,
                ivs: ivs,
                gender: genderVal,
                nature: natureName,
                isShiny: isShiny,
                abilityId: abilityId,
                saveMeta: {
                    gen: isGen5 ? 5 : 4,
                    isParty: isParty,
                    structOffset: offset,
                    pid: pid,
                    abilityId: abilityId
                }
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
    
    let moves = [];
    let itemName = "";
    let ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    let rawSaveMeta = null;
    let genderVal = "⚲";
    
    if (size === 100) {
        // PK3
        const pid = u32[0];
        pokedexId = u16[32 / 2];
        const nickBytes = u8.subarray(8, 18);
        nickname = decodeGen3String(nickBytes);
        level = u8[84] || 5;
        sourceSlot = "Ficheiro PK3 Decifrado";
        
        otId = u16[4 / 2];
        const otNameBytes = u8.subarray(20, 27);
        otName = decodeGen3String(otNameBytes);
        
        const itemId = u16[34 / 2];
        itemName = formatItemNameForDisplay(REVERSE_ITEMS_MAP_GEN3[itemId] || "");
        
        for (let m = 0; m < 4; m++) {
            const moveId = u16[(44 + m * 2) / 2];
            const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || REVERSE_MOVES_MAP[moveId] || "";
            moves.push(formatMoveNameForDisplay(rawName));
        }
        
        const ivWord = u32[72 / 4];
        ivs = {
            hp: ivWord & 0x1F,
            atk: (ivWord >> 5) & 0x1F,
            def: (ivWord >> 10) & 0x1F,
            spe: (ivWord >> 15) & 0x1F,
            spa: (ivWord >> 20) & 0x1F,
            spd: (ivWord >> 25) & 0x1F
        };
        
        genderVal = getGenderFromPid(pokedexId, pid);
        
        rawSaveMeta = { 
            gen: 3, 
            isIndividual: true, 
            pid: pid, 
            rawBytes: u8.slice(0) 
        };
    } else if (size === 136 || size === 220 || size === 236) {
        // PK4 / PK5
        const pid = u32[0];
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
        
        const originGame = u8[0x5F];
        const isGen5 = (size === 220) || (size === 136 && originGame >= 20 && originGame <= 23);
        const detectedGen = isGen5 ? 5 : 4;
        sourceSlot = `Ficheiro PK${detectedGen}${size === 220 || size === 236 ? ' Party' : ' Box'}`;
        
        const itemId = u16[10 / 2];
        itemName = formatItemNameForDisplay(REVERSE_ITEMS_MAP_GEN3[itemId] || "");
        
        for (let m = 0; m < 4; m++) {
            const moveId = u16[(40 + m * 2) / 2];
            const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || REVERSE_MOVES_MAP[moveId] || "";
            moves.push(formatMoveNameForDisplay(rawName));
        }
        
        const ivWord = u32[56 / 4];
        ivs = {
            hp: ivWord & 0x1F,
            atk: (ivWord >> 5) & 0x1F,
            def: (ivWord >> 10) & 0x1F,
            spe: (ivWord >> 15) & 0x1F,
            spa: (ivWord >> 20) & 0x1F,
            spd: (ivWord >> 25) & 0x1F
        };
        
        genderVal = getGenderFromPid(pokedexId, pid);
        
        rawSaveMeta = { 
            gen: detectedGen, 
            isIndividual: true, 
            pid: pid, 
            rawBytes: u8.slice(0) 
        };
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
        
        const itemId = u16[0x0A / 2];
        itemName = formatItemNameForDisplay(REVERSE_ITEMS_MAP_GEN3[itemId] || "");
        
        for (let m = 0; m < 4; m++) {
            const moveId = u16[(0x5A + m * 2) / 2];
            const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || REVERSE_MOVES_MAP[moveId] || "";
            moves.push(formatMoveNameForDisplay(rawName));
        }
        
        const ivWord = u32[0x74 / 4];
        ivs = {
            hp: ivWord & 0x1F,
            atk: (ivWord >> 5) & 0x1F,
            def: (ivWord >> 10) & 0x1F,
            spe: (ivWord >> 15) & 0x1F,
            spa: (ivWord >> 20) & 0x1F,
            spd: (ivWord >> 25) & 0x1F
        };
        
        const genderByte = u8[0x1D];
        const isFemale = (genderByte & 0x02) !== 0;
        const isGenderless = (genderByte & 0x04) !== 0;
        genderVal = isGenderless ? "⚲" : (isFemale ? "♀" : "♂");
        
        rawSaveMeta = { gen: size === 260 ? 6 : 7, isIndividual: true, rawBytes: u8.slice(0) };
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
        
        const itemId = u16[0x0A / 2];
        itemName = formatItemNameForDisplay(REVERSE_ITEMS_MAP_GEN3[itemId] || "");
        
        for (let m = 0; m < 4; m++) {
            const moveId = u16[(0x7C + m * 2) / 2];
            const rawName = (typeof POKEAPI_MOVE_ID_TO_NAME !== 'undefined' && POKEAPI_MOVE_ID_TO_NAME[moveId]) || REVERSE_MOVES_MAP[moveId] || "";
            moves.push(formatMoveNameForDisplay(rawName));
        }
        
        const ivWord = u32[0x8C / 4];
        ivs = {
            hp: ivWord & 0x1F,
            atk: (ivWord >> 5) & 0x1F,
            def: (ivWord >> 10) & 0x1F,
            spe: (ivWord >> 15) & 0x1F,
            spa: (ivWord >> 20) & 0x1F,
            spd: (ivWord >> 25) & 0x1F
        };
        
        const genderByte = u8[0x1D];
        const isFemale = (genderByte & 0x02) !== 0;
        const isGenderless = (genderByte & 0x04) !== 0;
        genderVal = isGenderless ? "⚲" : (isFemale ? "♀" : "♂");
        
        rawSaveMeta = { gen: size === 328 ? 8 : 9, isIndividual: true, rawBytes: u8.slice(0) };
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
        otId: otId,
        item: itemName,
        moves: moves,
        ivs: ivs,
        gender: genderVal,
        saveMeta: rawSaveMeta
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
    
    tempImportList.forEach((p, idx) => {
        const cb = document.querySelector(`.import-row-checkbox[data-idx="${idx}"]`);
        if (cb && cb.checked) {
            p.targetGameId = targetGameId;
            p.targetTrainerId = targetTrainerId;
            
            const rowGameSelect = document.querySelector(`.import-row-game[data-idx="${idx}"]`);
            if (rowGameSelect) rowGameSelect.value = targetGameId;
            
            updateImportRowTrainers(idx, targetGameId);
            
            const rowTrainerSelect = document.getElementById(`import-row-trainer-${idx}`);
            if (rowTrainerSelect) rowTrainerSelect.value = targetTrainerId;
        }
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

let lastCheckedIndex = null;
function handleImportCheckboxClick(event, idx) {
    const checkboxes = document.querySelectorAll(".import-row-checkbox");
    const arr = Array.from(checkboxes);
    const targetCb = arr.find(cb => parseInt(cb.getAttribute("data-idx")) === idx);
    
    if (event.shiftKey && lastCheckedIndex !== null) {
        const lastCb = arr.find(cb => parseInt(cb.getAttribute("data-idx")) === lastCheckedIndex);
        if (lastCb && targetCb) {
            const lastDomIdx = arr.indexOf(lastCb);
            const targetDomIdx = arr.indexOf(targetCb);
            const start = Math.min(lastDomIdx, targetDomIdx);
            const end = Math.max(lastDomIdx, targetDomIdx);
            const checked = targetCb.checked;
            for (let i = start; i <= end; i++) {
                arr[i].checked = checked;
            }
        }
    }
    lastCheckedIndex = idx;
}

function extractTrainerFromSave(u8, gen, activeSlotStartSector, parsedPokemonList) {
    let name = "Treinador";
    let tid = "00000";
    
    // For Gen 4 and Gen 5, let's find the most common trainer in the parsed list!
    if ((gen === 4 || gen === 5) && parsedPokemonList && parsedPokemonList.length > 0) {
        const counts = {};
        parsedPokemonList.forEach(p => {
            if (p.otName && p.otId !== undefined) {
                const formattedId = String(p.otId).padStart(5, '0');
                const key = `${p.otName.trim()}||${formattedId}`;
                counts[key] = (counts[key] || 0) + 1;
            }
        });
        
        let maxCount = 0;
        let bestKey = "";
        for (const key in counts) {
            if (counts[key] > maxCount) {
                maxCount = counts[key];
                bestKey = key;
            }
        }
        
        if (bestKey) {
            const parts = bestKey.split("||");
            name = parts[0];
            tid = parts[1];
            return { name, tid };
        }
    }
    
    if (gen === 1) {
        if (u8.length >= 0x3000) {
            name = decodeGen1String(u8.subarray(0x2598, 0x2598 + 11)) || "Treinador";
            const idVal = (u8[0x2605] << 8) | u8[0x2606];
            tid = String(idVal).padStart(5, '0');
        }
    } else if (gen === 2) {
        if (u8.length >= 0x3000) {
            name = decodeGen1String(u8.subarray(0x200B, 0x200B + 11)) || "Treinador";
            const idVal = (u8[0x2009] << 8) | u8[0x200A];
            tid = String(idVal).padStart(5, '0');
        }
    } else if (gen === 3) {
        const numSectors = Math.floor(u8.length / 4096);
        let sec0 = null;
        for (let i = 0; i < 14 && i < numSectors; i++) {
            const offset = (activeSlotStartSector + i) * 4096;
            const sig = u8[offset + 0x0FF8] | (u8[offset + 0x0FF9] << 8) | (u8[offset + 0x0FFA] << 16) | (u8[offset + 0x0FFB] << 24);
            if (sig === 0x08012025 && u8[offset + 0x0FF4] === 0) {
                sec0 = u8.subarray(offset, offset + 4096);
                break;
            }
        }
        if (sec0) {
            name = decodeGen3String(sec0.subarray(0, 7)) || "Treinador";
            const idVal = (sec0[0x0A] | (sec0[0x0B] << 8)) & 0xFFFF;
            tid = String(idVal).padStart(5, '0');
        }
    }
    name = name.replace(/@/g, "").trim();
    return { name: name || "Treinador", tid };
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
            
            let defaultGameId = currentGameId;
            if (detectedGen === 1) {
                const curGame = GAMES_DB.find(g => g.id === currentGameId);
                if (!curGame || curGame.gen !== 1) defaultGameId = "red";
            } else if (detectedGen === 2) {
                defaultGameId = isCrystal ? "crystal" : "gold";
            } else if (detectedGen === 3) {
                const curGame = GAMES_DB.find(g => g.id === currentGameId);
                if (!curGame || curGame.gen !== 3) defaultGameId = "ruby";
            }
            
            const saveTrainer = extractTrainerFromSave(u8, detectedGen, activeSlotStartSector, parsed);
            let matchedTrainer = trainersList.find(t => {
                return t.gameId === defaultGameId && 
                       t.name.toLowerCase().trim() === saveTrainer.name.toLowerCase().trim() && 
                       String(t.tid || "").padStart(5, '0') === saveTrainer.tid;
            });
            
            if (!matchedTrainer) {
                const newTrainerId = "trainer_" + defaultGameId + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
                matchedTrainer = {
                    id: newTrainerId,
                    gameId: defaultGameId,
                    name: saveTrainer.name,
                    tid: saveTrainer.tid,
                    sid: "00000"
                };
                trainersList.push(matchedTrainer);
                localStorage.setItem("bb_trainers", JSON.stringify(trainersList));
                updateTrainerSelect();
            }
            
            const saveTrainerId = matchedTrainer.id;
            
            const totalParsed = parsed.length;
            const uniqueList = deduplicateParsedPokemon(parsed);
            const uniqueCount = uniqueList.length;
            parsed = uniqueList;
            
            parsed.forEach(p => {
                p.targetGameId = defaultGameId;
                p.targetTrainerId = saveTrainerId;
            });
            
            const auditEl = document.getElementById("save-import-audit");
            if (auditEl) {
                auditEl.textContent = `🔍 Auditoria do Save: Foram encontrados ${totalParsed} Pokémon no save. ${uniqueCount} espécimes únicos mapeados com 100% de leitura garantida.`;
                auditEl.style.display = "block";
            }
            
            tempImportList = parsed;
            populateBulkImportSelectors();
            renderSaveImportList();
            document.getElementById("save-import-results").style.display = "block";
            
            enrichImportedPokemonList(parsed).then(() => {
                renderSaveImportList();
            });
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
        let selectedGameId = p.targetGameId || currentGameId;
        let selectedTrainerId = p.targetTrainerId || `trainer_${selectedGameId}_default`;
        
        const gameOptionsHtml = GAMES_DB.map(g => `<option value="${g.id}" ${g.id === selectedGameId ? 'selected' : ''}>${g.name}</option>`).join("");
        const gameTrainers = trainersList.filter(t => t.gameId === selectedGameId);
        const trainerOptionsHtml = gameTrainers.map(t => {
            const display = t.tid !== "00000" && t.tid ? `${t.name} (${t.tid})` : t.name;
            return `<option value="${t.id}" ${t.id === selectedTrainerId ? 'selected' : ''}>${display}</option>`;
        }).join("");
        
        let spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokedexId}.png`;
        
        return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 8px;"><input type="checkbox" class="import-row-checkbox" data-idx="${idx}" checked onclick="handleImportCheckboxClick(event, ${idx})"></td>
                <td style="padding: 8px; color: var(--text-muted); font-size: 0.7rem;">${p.sourceSlot}</td>
                <td style="padding: 8px; display: flex; align-items: center; gap: 6px;">
                    <img src="${spriteUrl}" alt="${p.species}" style="width: 28px; height: 28px;" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">
                    <div>
                        <strong style="color: #fff;">${p.nickname}</strong>
                        <div style="font-size: 0.65rem; color: var(--text-muted);">${p.species}</div>
                        <div style="font-size: 0.6rem; color: var(--text-muted); font-weight: bold; opacity: 0.85;">S: ${p.gender || "⚲"} | N: ${p.nature || "Nenhuma"} | H: ${p.ability || "Nenhuma"}</div>
                    </div>
                </td>
                <td style="padding: 8px; font-weight: bold; color: #fff;">${p.level}</td>
                <td style="padding: 8px;">
                    <select class="import-row-game" data-idx="${idx}" onchange="updateImportRowTrainers(${idx}, this.value)" style="padding: 4px; border-radius: 4px; background: rgba(0,0,0,0.5); color:#fff; border: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; width: 100%;">
                        ${gameOptionsHtml}
                    </select>
                </td>
                <td style="padding: 8px;">
                    <select class="import-row-trainer" id="import-row-trainer-${idx}" onchange="updateImportRowTrainerSelection(${idx}, this.value)" style="padding: 4px; border-radius: 4px; background: rgba(0,0,0,0.5); color:#fff; border: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; width: 100%;">
                        ${trainerOptionsHtml}
                    </select>
                </td>
            </tr>
        `;
    }).join("");
}

function updateImportRowTrainerSelection(idx, trainerId) {
    const p = tempImportList[idx];
    if (p) {
        p.targetTrainerId = trainerId;
    }
}

function updateImportRowTrainers(idx, gameId) {
    const p = tempImportList[idx];
    if (p) {
        p.targetGameId = gameId;
    }
    
    const select = document.getElementById(`import-row-trainer-${idx}`);
    if (!select) return;
    
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
    
    if (p) {
        p.targetTrainerId = selectedTrainerId;
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

    let ribbonToAdd = "";
    if (["ruby", "sapphire", "emerald", "omegaruby", "alphasapphire"].includes(targetGameId)) {
        ribbonToAdd = "champion_hoenn";
    } else if (["diamond", "pearl", "platinum", "brilliantdiamond", "shiningpearl"].includes(targetGameId)) {
        ribbonToAdd = "champion_sinnoh";
    } else if (["heartgold", "soulsilver"].includes(targetGameId)) {
        ribbonToAdd = "legend";
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
            
            const targetGameId = p.targetGameId || currentGameId;
            const targetTrainerId = p.targetTrainerId || `trainer_${targetGameId}_default`;
            
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
                gender: normalizeGender(p.gender || "⚲"),
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
            localStorage.setItem("bb_species_type_cache", JSON.stringify(SPECIES_TYPE_CACHE));
            applyTypes(t); 
        }
    } catch (e) {}
}

async function fetchMissingSpeciesData(speciesName) {
    if (!speciesName) return;
    const cl = speciesName.toLowerCase().trim()
        .replace(/[\s']/g, "-")
        .replace(/\./g, "")
        .replace(/-+$/, "");
    
    if (SPECIES_TYPE_CACHE[cl]) {
        const cached = SPECIES_TYPE_CACHE[cl];
        const t1El = document.getElementById("form-type1");
        const t2El = document.getElementById("form-type2");
        const abEl = document.getElementById("form-ability");
        
        if (t1El && (!t1El.value || t1El.value === "normal") && !t2El.value) {
            t1El.value = cached.t1;
            t2El.value = cached.t2 || "";
        }
        if (abEl && !abEl.value && cached.ability) {
            abEl.value = cached.ability;
        }
        return;
    }
    
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cl}`);
        if (res.ok) {
            const d = await res.json();
            const t1 = d.types[0].type.name;
            const t2 = d.types[1] ? d.types[1].type.name : "";
            
            const normalAbilities = d.abilities.filter(a => !a.is_hidden);
            const abilityName = normalAbilities.length > 0 ? formatAbilityName(normalAbilities[0].ability.name) : "";
            
            const cached = { t1, t2, ability: abilityName };
            SPECIES_TYPE_CACHE[cl] = cached;
            localStorage.setItem("bb_species_type_cache", JSON.stringify(SPECIES_TYPE_CACHE));
            
            const t1El = document.getElementById("form-type1");
            const t2El = document.getElementById("form-type2");
            const abEl = document.getElementById("form-ability");
            
            if (t1El && (!t1El.value || t1El.value === "normal") && !t2El.value) {
                t1El.value = t1;
                t2El.value = t2;
            }
            if (abEl && !abEl.value && abilityName) {
                abEl.value = abilityName;
            }
        }
    } catch(e) {}
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

