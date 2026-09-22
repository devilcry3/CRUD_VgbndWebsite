/* ==========================
   ARCHETYPE DATA MODEL
   ========================== */
const ARCHETYPES = {
   Alchemist: { gear: ["Alchemy Tools", "Materials (1g)", "Light Armor"], currency: "87s" },
   Assassin: { gear: ["Alchemy Tools", "Materials (1g)", "Dagger x2", "Basic Poison", "Light Armor"], currency: "60s" },
   Astronomer: { gear: ["Trinket", "Telescope", "Astrolabe", "Map Case"], currency: "7s" },
   Blacksmith: { gear: ["Warhammer", "Heavy Armor", "Blacksmithing Tools", "Materials (50s)"], currency: "47s" },
   BountyHunter: { gear: ["Rifle", "Handgun", "Box of Bullets", "Rope", "Manacles", "Lockpicks x3", "Light Armor"], currency: "15s" },
   Brawler: { gear: ["Caestus x2", "Medium Armor", "Tankard"], currency: "1g 46s" },
   Charlatan: { gear: ["Club", "Dagger", "Light Armor", "Loaded Dice", "Playing Cards"], currency: "2g 34s" },
   Conman: { gear: ["Dagger x2", "Light Armor", "Loaded Dice Set", "Marked Deck"], currency: "1g 50s" },
   Cook: { gear: ["Cooking Tools", "Ingredients (1g)", "Flour Bag", "Mess Kit", "Iron Pan"], currency: "76s" },
   Courtesan: { gear: ["Perfume", "Dagger x2", "Makeup Kit", "Bottle of Common Wine"], currency: "1g 63s" },
   Devout: { gear: ["Trinket", "Incense x20", "Light Armor", "Holy Water", "Anointing Oil"], currency: "91s" },
   Entertainer: { gear: ["Shortsword", "Light Armor", "Costume", "Lute"], currency: "61s" },
   Envoy: { gear: ["Shortsword", "Light Armor", "Scroll Case", "Quill and Ink", "Parchment x10"], currency: "1g 45s" },
   FortuneTeller: { gear: ["Trinket", "Tarot Cards", "Dagger x2", "Light Armor"], currency: "1g 15s" },
   Gladiator: { gear: ["Shortsword", "Buckler", "Light Armor"], currency: "1g 65s" },
   Hermit: { gear: ["Staff", "Herbalism Tools", "Materials (50s)", "Hooded Lantern", "Tarot Cards"], currency: "1g 5s" },
   Highwayman: { gear: ["Sawed-Off Shotgun", "Box of Shells", "Light Armor", "Dagger x2"], currency: "45s" },
   Investigator: { gear: ["Handgun", "Box of Bullets", "Dagger x2", "Magnifying Glass", "Light Armor"], currency: "1g 15s" },
   Knight: { gear: ["Longsword", "Standard Shield", "Heavy Armor"], currency: "20s" },
   Mage: { gear: ["Trinket x2", "Robe", "Blank Book", "Scribe Tools"], currency: "31s" },
   Miner: { gear: ["Light Hammer x2", "Pickaxe", "Jeweler Tools", "Light Armor"], currency: "1g 55s" },
   Monk: { gear: ["Katar x2", "Staff", "Light Armor"], currency: "1g 85s" },
   Musician: { gear: ["Lute", "Sheet Music Book", "Shortsword", "Light Armor"], currency: "75s" },
   Noble: { gear: ["Shortsword", "Handgun", "Bullets", "Formal Clothes", "Mirror", "Signet Ring"], currency: "5s" },
   Nomad: { gear: ["Staff", "Dagger x2", "Shortbow", "Quiver"], currency: "1g 75s" },
   Occultist: { gear: ["Trinket", "Dagger x2", "Herbalism Tools", "Materials (1g)"], currency: "65s" },
   Physician: { gear: ["Med Kit", "Herbalism Tools", "Materials (50s)", "Antitoxin x2"], currency: "35s" },
   Scout: { gear: ["Longbow", "Quiver", "Light Armor", "Compass"], currency: "1g 25s" },
   Seaman: { gear: ["Handgun", "Box of Bullets", "Shortsword", "Light Armor", "Net"], currency: "1g 55s" },
   Sellsword: { gear: ["Longsword", "Buckler", "Medium Armor"], currency: "95s" },
   Sentinel: { gear: ["Greatshield", "Heavy Armor"], currency: "35s" },
   Spy: { gear: ["Dagger", "Garrote", "Makeup Kit", "Light Armor", "Formal Clothes"], currency: "1g 55s" },
   Trapper: { gear: ["Longbow", "Quiver", "Hunting Trap", "Leatherworking Tools", "Light Armor"], currency: "24s" },
   Tinker: { gear: ["Tinker Tools", "Materials (1g)", "Crossbow", "Bolt Case"], currency: "60s" },
   Warrior: { gear: ["Greataxe", "Javelin x2", "Light Armor"], currency: "74s" },
   Watchman: { gear: ["Club", "Light Crossbow", "Bolt Case", "Medium Armor", "Hooded Lantern", "Oil"], currency: "33s" }
};

/* ==========================
   CLASS → ARCHETYPE SUGGESTIONS
   ========================== */
const CLASS_SUGGESTIONS = {
   Rogue: ["Conman", "Charlatan", "Assassin", "Spy", "Scout", "Investigator", "Highwayman", "BountyHunter"],
   Warrior: ["Warrior", "Gladiator", "Knight", "Sellsword", "Brawler", "Sentinel", "Watchman"],
   Wizard: ["Mage", "Occultist", "Alchemist", "Astronomer", "Hermit", "FortuneTeller"],
   Luminary: ["Devout", "Envoy", "Entertainer", "Courtesan", "Noble", "Physician"]
};

/* ==========================
   CLASS STAT PRIORITY
   ========================== */
const CLASS_STAT_PRIORITY = {
   Rogue: ["Dexterity", "Luck", "Awareness", "Presence", "Reason", "Might"],
   Warrior: ["Might", "Dexterity", "Awareness", "Reason", "Presence", "Luck"],
   Wizard: ["Reason", "Awareness", "Dexterity", "Presence", "Luck", "Might"],
   Luminary: ["Presence", "Reason", "Dexterity", "Might", "Awareness", "Luck"],
   Default: ["Luck", "Might", "Awareness", "Reason", "Dexterity", "Presence"]
};

/* ==========================
   ABILITY ORDER
   ========================== */
const ABILITIES = ["Might", "Dexterity", "Awareness", "Reason", "Presence", "Luck"];


/* ==========================
   VALIDATION MAPPING
   ========================== */
 const GUIDED_FIELD_ID_MAP = {
   level: 'level-slider-error',
   ancestry: 'guided-ancestry-error',
   class: 'guided-class-error',
   archetype: 'guided-archetype-error',
   stats: 'guided-stats-error',
   perk: 'guided-perk-error',
   filename: 'file-error'
};

 const RANDOM_FIELD_ID_MAP = {
   level: 'random-level-error',
   perk: 'guided-perk-error',
   filename: 'file-error'
};

// ==========================
// ANCESTRY SOUND PROFILES
// ==========================
const NAME_STYLES = {
    human: {
        start: ["Al", "Bran", "Cor", "Dun", "Ed", "Gar", "Hal", "Jon", "Mar", "Tor"],
        mid: ["a", "e", "o", "u"],
        end: ["ric", "ton", "mund", "var", "den", "lan"]
    },

    elf: {
        start: ["Ae", "Ela", "Syl", "Lia", "Vael", "Tha"],
        mid: ["ra", "li", "na", "th", "sa"],
        end: ["riel", "thas", "nor", "wyn", "lith"]
    },

    dwarf: {
        start: ["Bar", "Dor", "Thra", "Kaz", "Mor", "Grim"],
        mid: ["a", "o", "u"],
        end: ["din", "rak", "grim", "tor", "drak"]
    },

    halfling: {
        start: ["Pip", "Fenn", "Tob", "Merr"],
        mid: ["a", "e", "i"],
        end: ["kin", "by", "wick", "foot"]
    },

    goblin: {
        start: ["Sn", "Gr", "Kr", "Z"],
        mid: ["i", "a", "o"],
        end: ["ik", "nak", "gob", "rat"]
    },

    orc: {
        start: ["Gor", "Ur", "Thok", "Brug"],
        mid: ["a", "u"],
        end: ["mak", "thar", "zug", "gor"]
    },

    drakin: {
        start: ["Va", "Zy", "Drak", "Ry"],
        mid: ["ae", "y", "ia"],
        end: ["thos", "ryx", "vyr", "zoth"]
    }
};

// ==========================
// CLASS TONES
// ==========================
const CLASS_TONES = {
    Rogue: ["the Knife", "Shadowhand", "Quickfingers", "the Unseen"],
    Warrior: ["the Bold", "Ironbreaker", "the Unyielding", "Blooded"],
    Wizard: ["the Veiled", "Spellbound", "the Arcane", "Star-Touched"],
    Luminary: ["the Radiant", "Lightbearer", "the Golden", "the Kindled"]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ARCHETYPES, CLASS_SUGGESTIONS, CLASS_STAT_PRIORITY, ABILITIES, NAME_STYLES, CLASS_TONES };
}

