import React, { useReducer, useEffect, useCallback, useMemo } from 'react';
import { Flame, Leaf, Gem, Zap, Star, Heart, Clock, Sparkles, Map, Hammer, Settings, Code } from 'lucide-react';

// ===== CONSTANTS (Ready for extraction) =====
const GAME_CONFIG = {
baseRates: {
emberShard: 0.8,
whisperingVine: 0.6,
dustleaf: 0.7,
ancientAlloy: 0.2
},
rarityChances: {
common: 65,
uncommon: 20,
rare: 10,
epic: 4,
legendary: 1
},
timers: {
resourceTick: 1000,
moodDecay: 150000,
petCooldown: 60000
}
};

const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
const RESOURCE_ICONS = {
emberShard: '🔥',
whisperingVine: '🌿',
dustleaf: '🍃',
ancientAlloy: '⚡'
};

// Item Definitions
const ITEMS = {
// COMMON - Basic materials and components
ashPowder: { name: "Ash Powder", rarity: "common", description: "Fine ash from burned embers", restoration: 3, theme: "ember", type: "material" },
driedVine: { name: "Dried Vine", rarity: "common", description: "Withered but still magical vines", restoration: 3, theme: "forest", type: "material" },
emberDust: { name: "Ember Dust", rarity: "common", description: "Glowing dust that sparkles faintly", restoration: 4, theme: "ember", type: "material" },
voidShard: { name: "Void Shard", rarity: "common", description: "Small fragments of dark energy", restoration: 3, theme: "void", type: "material" },
ironFilings: { name: "Iron Filings", rarity: "common", description: "Metal shavings with traces of magic", restoration: 3, theme: "forge", type: "material" },

// UNCOMMON - Refined materials
soulcord: { name: "Soulcord", rarity: "uncommon", description: "Mystical cord that binds spirit to matter", restoration: 8, theme: "forest", type: "material" },
ironShard: { name: "Iron Shard", rarity: "uncommon", description: "Refined metal with magical properties", restoration: 8, theme: "forge", type: "material" },
emberCrystal: { name: "Ember Crystal", rarity: "uncommon", description: "Crystallized fire energy", restoration: 9, theme: "ember", type: "material" },
shadowEssence: { name: "Shadow Essence", rarity: "uncommon", description: "Concentrated darkness in liquid form", restoration: 8, theme: "void", type: "material" },
livingWood: { name: "Living Wood", rarity: "uncommon", description: "Wood that still pulses with life", restoration: 9, theme: "forest", type: "material" },

// RARE - Specialized items and basic tools
fireglass: { name: "Fireglass", rarity: "rare", description: "Molten glass infused with ember energy", restoration: 15, theme: "ember", type: "material" },
mysticEssence: { name: "Mystic Essence", rarity: "rare", description: "Pure magical energy in crystalline form", restoration: 18, theme: "forest", type: "material" },
voidMetal: { name: "Void Metal", rarity: "rare", description: "Metal forged in the darkness between stars", restoration: 16, theme: "void", type: "material" },
restorationHammer: { name: "Restoration Hammer", rarity: "rare", description: "A tool that can rebuild anything", restoration: 20, theme: "forge", type: "tool" },
spiritLens: { name: "Spirit Lens", rarity: "rare", description: "Focuses magical energy into precise beams", restoration: 18, theme: "forge", type: "tool" },

// EPIC - Powerful tools and artifacts
phoenixFeather: { name: "Phoenix Feather", rarity: "epic", description: "A feather that burns without being consumed", restoration: 35, theme: "ember", type: "material" },
voidCrystal: { name: "Void Crystal", rarity: "epic", description: "A crystal that seems to absorb light itself", restoration: 30, theme: "void", type: "material" },
lifeSeed: { name: "Life Seed", rarity: "epic", description: "Contains the essence of an entire forest", restoration: 40, theme: "forest", type: "material" },
masterworkGear: { name: "Masterwork Gear", rarity: "epic", description: "Perfectly crafted mechanical component", restoration: 32, theme: "forge", type: "component" },
astralCompass: { name: "Astral Compass", rarity: "epic", description: "Points toward sources of magical energy", restoration: 35, theme: "void", type: "tool" },

// LEGENDARY - World-changing artifacts
phoenixCore: { name: "Phoenix Core", rarity: "legendary", description: "The beating heart of a phoenix, pulsing with life", restoration: 75, theme: "ember", type: "material" },
ancientRelic: { name: "Ancient Relic", rarity: "legendary", description: "An artifact from the world before the calamity", restoration: 60, theme: "forge", type: "material" },
worldSeed: { name: "World Seed", rarity: "legendary", description: "Can birth entire ecosystems", restoration: 90, theme: "forest", type: "material" },
voidHeart: { name: "Void Heart", rarity: "legendary", description: "The core of a collapsed star", restoration: 70, theme: "void", type: "material" },
creatorsHammer: { name: "Creator's Hammer", rarity: "legendary", description: "Used by the gods to forge the world", restoration: 100, theme: "forge", type: "tool" },

// ADVANCED TOOLS & COMPONENTS
advancedRestorationKit: { name: "Advanced Restoration Kit", rarity: "epic", description: "Professional-grade rebuilding equipment", restoration: 0, theme: "forge", type: "component" },
enchantedLens: { name: "Enchanted Lens", rarity: "epic", description: "Magnifies magical energy precisely", restoration: 0, theme: "forge", type: "component" },
buildersFocus: { name: "Builder's Focus", rarity: "rare", description: "Enhances construction abilities", restoration: 0, theme: "forest", type: "component" },
voidEngine: { name: "Void Engine", rarity: "legendary", description: "Harnesses dark energy for construction", restoration: 0, theme: "void", type: "component" },
magicAmplifier: { name: "Magic Amplifier", rarity: "epic", description: "Boosts all magical effects in an area", restoration: 0, theme: "ember", type: "component" },
terraformingDevice: { name: "Terraforming Device", rarity: "legendary", description: "Can reshape entire landscapes", restoration: 0, theme: "forge", type: "component" }
};

// Advanced Recipes
const ADVANCED_RECIPES = {
advancedRestorationKit: {
name: "Advanced Restoration Kit",
icon: "🛠️",
inputs: { restorationHammer: 1, ironShard: 3, mysticEssence: 1 },
experience: 50,
description: "Combine tools and materials for advanced construction",
output: 'advancedRestorationKit'
},
enchantedLens: {
name: "Enchanted Lens",
icon: "🔍",
inputs: { spiritLens: 1, fireglass: 2, emberCrystal: 2 },
experience: 45,
description: "Merge optics with magical energy",
output: 'enchantedLens'
},
buildersFocus: {
name: "Builder's Focus",
icon: "🌿",
inputs: { livingWood: 2, soulcord: 3, mysticEssence: 1 },
experience: 40,
description: "Enhance natural building capabilities",
output: 'buildersFocus'
},
voidEngine: {
name: "Void Engine",
icon: "⚫",
inputs: { voidCrystal: 1, voidMetal: 2, shadowEssence: 3, ancientRelic: 1 },
experience: 80,
description: "Harness the power of the void for construction",
output: 'voidEngine'
},
magicAmplifier: {
name: "Magic Amplifier",
icon: "🔆",
inputs: { phoenixFeather: 1, spiritLens: 1, emberCrystal: 3, mysticEssence: 2 },
experience: 70,
description: "Amplify magical energies across vast areas",
output: 'magicAmplifier'
},
terraformingDevice: {
name: "Terraforming Device",
icon: "🌍",
inputs: { creatorsHammer: 1, worldSeed: 1, voidHeart: 1, masterworkGear: 2 },
experience: 150,
description: "Reshape the very fabric of reality",
output: 'terraformingDevice'
}
};

// Zone Projects
const ZONE_PROJECTS = {
roadNetwork: {
name: "Road Network",
icon: "🛣️",
inputs: { advancedRestorationKit: 1, buildersFocus: 1 },
description: "Efficient transportation increases resource flow",
effect: "Resource generation +50%",
bonus: { resourceMultiplier: 1.5 }
},
defensiveWalls: {
name: "Defensive Walls",
icon: "🏰",
inputs: { voidEngine: 1, advancedRestorationKit: 1 },
description: "Fortifications allow safer expansion",
effect: "Unlock zones 25% faster",
bonus: { unlockSpeedBonus: 0.25 }
},
magicGarden: {
name: "Magic Garden",
icon: "🌺",
inputs: { enchantedLens: 1, buildersFocus: 2 },
description: "Cultivated magic enhances fortune",
effect: "Base luck +10",
bonus: { luckBonus: 10 }
},
arcaneWorkshop: {
name: "Arcane Workshop",
icon: "🔮",
inputs: { magicAmplifier: 1, enchantedLens: 1, masterworkGear: 1 },
description: "Advanced facilities improve crafting",
effect: "Crafting speed +30%",
bonus: { craftingSpeedBonus: 0.3 }
},
voidGate: {
name: "Void Gate",
icon: "🌀",
inputs: { voidEngine: 1, terraformingDevice: 1 },
description: "Portal to untapped realms",
effect: "Unlock Void Realm zone",
bonus: { unlockZone: 'voidRealm' }
},
worldTree: {
name: "World Tree",
icon: "🌳",
inputs: { terraformingDevice: 1, magicAmplifier: 1, buildersFocus: 3 },
description: "The heart of a new ecosystem",
effect: "All bonuses +25%",
bonus: { allBonusMultiplier: 1.25 }
}
};

const RECIPES = {
forestInfusion: {
name: "Forest Infusion",
icon: "🌿",
inputs: { whisperingVine: 3, emberShard: 2 },
experience: 15,
description: "Blend nature's essence with ember energy",
outputs: {
common: [
{ item: 'driedVine', baseChance: 30 },
{ item: 'ashPowder', baseChance: 25 }
],
uncommon: [
{ item: 'soulcord', baseChance: 20 },
{ item: 'livingWood', baseChance: 15 }
],
rare: [
{ item: 'mysticEssence', baseChance: 8 },
{ item: 'spiritLens', baseChance: 5 }
],
epic: [
{ item: 'lifeSeed', baseChance: 4 }
],
legendary: [
{ item: 'worldSeed', baseChance: 2 }
]
}
},
emberForge: {
name: "Ember Forge",
icon: "⚒️",
inputs: { emberShard: 4, dustleaf: 2, ancientAlloy: 1 },
experience: 25,
description: "Forge materials in the heat of ancient flames",
outputs: {
common: [
{ item: 'emberDust', baseChance: 25 },
{ item: 'ironFilings', baseChance: 25 }
],
uncommon: [
{ item: 'ironShard', baseChance: 20 },
{ item: 'emberCrystal', baseChance: 15 }
],
rare: [
{ item: 'fireglass', baseChance: 10 },
{ item: 'restorationHammer', baseChance: 8 }
],
epic: [
{ item: 'phoenixFeather', baseChance: 5 },
{ item: 'masterworkGear', baseChance: 3 }
],
legendary: [
{ item: 'phoenixCore', baseChance: 2 },
{ item: 'creatorsHammer', baseChance: 1 }
]
}
},
voidRitual: {
name: "Void Ritual",
icon: "🌑",
inputs: { whisperingVine: 5, dustleaf: 4, ancientAlloy: 2 },
experience: 40,
description: "Channel the darkness between worlds",
outputs: {
common: [
{ item: 'voidShard', baseChance: 30 }
],
uncommon: [
{ item: 'shadowEssence', baseChance: 25 },
{ item: 'soulcord', baseChance: 15 }
],
rare: [
{ item: 'voidMetal', baseChance: 15 },
{ item: 'mysticEssence', baseChance: 8 }
],
epic: [
{ item: 'voidCrystal', baseChance: 12 },
{ item: 'astralCompass', baseChance: 8 }
],
legendary: [
{ item: 'voidHeart', baseChance: 3 },
{ item: 'ancientRelic', baseChance: 2 }
]
}
}
};

// ===== HELPER FUNCTIONS (Ready for extraction) =====
const formatNumber = (num) => Math.floor(num * 10) / 10;

const getRarityColor = (rarity) => {
const colors = {
common: 'text-gray-300',
uncommon: 'text-green-400',
rare: 'text-blue-400',
epic: 'text-purple-400',
legendary: 'text-amber-400'
};
return colors[rarity] || 'text-gray-400';
};

const getRarityBg = (rarity) => {
const backgrounds = {
common: 'bg-gray-500/10 border-gray-500/30',
uncommon: 'bg-green-500/15 border-green-500/40',
rare: 'bg-blue-500/15 border-blue-500/40',
epic: 'bg-purple-500/15 border-purple-500/40',
legendary: 'bg-amber-500/15 border-amber-500/40 shadow-lg'
};
return backgrounds[rarity] || 'bg-gray-500/10 border-gray-500/20';
};

const getRarityGem = (rarity) => {
const gems = {
common: '💎',
uncommon: '🟢',
rare: '🔷',
epic: '🟣',
legendary: '⭐'
};
return gems[rarity] || '💎';
};

const rollForItem = (recipe, luck) => {
const luckBonus = (luck - 50) / 2;
const chances = {
common: Math.max(5, GAME_CONFIG.rarityChances.common + luckBonus * -0.8),
uncommon: Math.max(5, GAME_CONFIG.rarityChances.uncommon + luckBonus * -0.3),
rare: Math.max(5, GAME_CONFIG.rarityChances.rare + luckBonus * 0.5),
epic: Math.max(1, GAME_CONFIG.rarityChances.epic + luckBonus * 0.3),
legendary: Math.max(1, GAME_CONFIG.rarityChances.legendary + luckBonus * 0.3)
};

const totalChance = Object.values(chances).reduce((a, b) => a + b, 0);
let roll = Math.random() * totalChance;

for (const [rarity, chance] of Object.entries(chances)) {
roll -= chance;
if (roll <= 0 && recipe.outputs[rarity]) {
const possibleItems = recipe.outputs[rarity];
const totalItemChance = possibleItems.reduce((sum, item) => sum + item.baseChance, 0);
let itemRoll = Math.random() * totalItemChance;

  for (const itemData of possibleItems) {
    itemRoll -= itemData.baseChance;
    if (itemRoll <= 0) {
      return itemData.item;
    }
  }
  return possibleItems[0].item;
}

}
return recipe.outputs[Object.keys(recipe.outputs)[0]][0].item;
};

const canCraft = (resources, recipeKey, quantity = 1) => {
const recipe = RECIPES[recipeKey];
return Object.entries(recipe.inputs).every(([resource, amount]) =>
resources[resource] >= amount * quantity
);
};

const getMaxCrafts = (resources, recipeKey) => {
const recipe = RECIPES[recipeKey];
return Math.floor(Math.min(
...Object.entries(recipe.inputs).map(([resource, amount]) =>
Math.floor(resources[resource] / amount)
)
));
};

const canCraftAdvanced = (inventory, recipeKey) => {
const recipe = ADVANCED_RECIPES[recipeKey];
return Object.entries(recipe.inputs).every(([item, amount]) =>
inventory[item] >= amount
);
};

const canBuildProject = (inventory, projectKey) => {
const project = ZONE_PROJECTS[projectKey];
return Object.entries(project.inputs).every(([item, amount]) =>
inventory[item] >= amount
);
};

// ===== INITIAL STATE =====
const createInitialState = () => ({
resources: {
emberShard: 30,
whisperingVine: 25,
dustleaf: 28,
ancientAlloy: 12
},
inventory: Object.keys(ITEMS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
player: {
level: 1,
experience: 0,
experienceToNext: 100,
luck: 50,
baseLuck: 50
},
companion: {
name: "Spark",
mood: 85,
level: 1,
petCooldown: 0
},
zones: {
cinderGrove: {
name: "Cinder Grove",
restored: 0,
maxRestored: 100,
unlocked: true,
description: "A charred forest slowly coming back to life",
projects: [],
bonuses: { resourceMultiplier: 1.0 }
},
skyfallPlateau: {
name: "Skyfall Plateau",
restored: 0,
maxRestored: 150,
unlocked: false,
description: "Ancient ruins reaching toward the sky",
projects: [],
bonuses: { resourceMultiplier: 1.0 }
},
voidRealm: {
name: "Void Realm",
restored: 0,
maxRestored: 200,
unlocked: false,
description: "A dimension touched by dark energy",
projects: [],
bonuses: { resourceMultiplier: 1.0 }
}
},
ui: {
activeTab: 'crafting',
crafting: null,
craftResults: null,
advancedCrafting: null,
craftingLog: [],
showRarityInfo: null,
devMode: false,
activeRestorationRarity: 'legendary'
}
});

// ===== GAME REDUCER =====
const gameReducer = (state, action) => {
switch (action.type) {
case 'UPDATE_RESOURCES':
let totalResourceMultiplier = 1.0;
Object.values(state.zones).forEach(zone => {
if (zone.unlocked && zone.bonuses.resourceMultiplier) {
totalResourceMultiplier *= zone.bonuses.resourceMultiplier;
}
});

  const zoneBonus = 1 + (state.zones.cinderGrove.restored / 100) * 0.5;
  const companionBonus = 1 + (state.companion.mood / 100) * 0.2;
  const projectBonus = totalResourceMultiplier;

  return {
    ...state,
    resources: {
      emberShard: state.resources.emberShard + (GAME_CONFIG.baseRates.emberShard * zoneBonus * companionBonus * projectBonus),
      whisperingVine: state.resources.whisperingVine + (GAME_CONFIG.baseRates.whisperingVine * zoneBonus * companionBonus * projectBonus),
      dustleaf: state.resources.dustleaf + (GAME_CONFIG.baseRates.dustleaf * zoneBonus * companionBonus * projectBonus),
      ancientAlloy: state.resources.ancientAlloy + (GAME_CONFIG.baseRates.ancientAlloy * zoneBonus * companionBonus * projectBonus)
    }
  };

case 'START_CRAFT':
  const { recipeKey, quantity } = action.payload;
  const recipe = RECIPES[recipeKey];

  const newResources = { ...state.resources };
  Object.entries(recipe.inputs).forEach(([resource, amount]) => {
    newResources[resource] -= amount * quantity;
  });

  return {
    ...state,
    resources: newResources,
    ui: {
      ...state.ui,
      crafting: {
        recipeKey,
        quantity,
        progress: 0,
        startTime: Date.now(),
        duration: Math.min(2500, 800 + (quantity * 150))
      },
      craftResults: null
    }
  };

case 'UPDATE_CRAFT_PROGRESS':
  if (!state.ui.crafting) return state;

  const elapsed = Date.now() - state.ui.crafting.startTime;
  const progress = Math.min(100, (elapsed / state.ui.crafting.duration) * 100);

  return {
    ...state,
    ui: {
      ...state.ui,
      crafting: {
        ...state.ui.crafting,
        progress
      }
    }
  };

case 'COMPLETE_CRAFT':
  if (!state.ui.crafting) return state;

  const craftState = state.ui.crafting;
  const craftRecipe = RECIPES[craftState.recipeKey];
  const results = [];
  const itemCounts = {};

  for (let i = 0; i < craftState.quantity; i++) {
    const item = rollForItem(craftRecipe, state.player.luck);
    results.push(item);
    itemCounts[item] = (itemCounts[item] || 0) + 1;
  }

  const newInventory = { ...state.inventory };
  Object.entries(itemCounts).forEach(([item, count]) => {
    newInventory[item] += count;
  });

  const expGained = craftRecipe.experience * craftState.quantity;
  let newExp = state.player.experience + expGained;
  let newLevel = state.player.level;
  let newExpToNext = state.player.experienceToNext;

  while (newExp >= newExpToNext) {
    newExp -= newExpToNext;
    newLevel++;
    newExpToNext = Math.floor(newExpToNext * 1.2);
  }

  let baseLuckBonus = 0;
  Object.values(state.zones).forEach(zone => {
    if (zone.unlocked && zone.bonuses.luckBonus) {
      baseLuckBonus += zone.bonuses.luckBonus;
    }
  });

  const companionLuckBonus = state.companion.mood > 80 ? 15 : state.companion.mood > 60 ? 10 : state.companion.mood > 40 ? 5 : 0;
  const levelBonus = Math.floor(newLevel / 2) * 2;
  const newLuck = Math.min(100, 50 + baseLuckBonus + companionLuckBonus + levelBonus);

  const logEntry = {
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    recipeName: craftRecipe.name,
    quantity: craftState.quantity,
    items: Object.entries(itemCounts).map(([item, count]) => ({
      name: ITEMS[item].name,
      count,
      rarity: ITEMS[item].rarity
    }))
  };

  const newCraftingLog = [logEntry, ...state.ui.craftingLog].slice(0, 10);

  return {
    ...state,
    inventory: newInventory,
    player: {
      level: newLevel,
      experience: newExp,
      experienceToNext: newExpToNext,
      luck: newLuck,
      baseLuck: 50
    },
    companion: {
      ...state.companion,
      mood: Math.min(100, state.companion.mood + Math.min(10, craftState.quantity))
    },
    ui: {
      ...state.ui,
      crafting: null,
      craftingLog: newCraftingLog,
      craftResults: {
        recipeName: craftRecipe.name,
        quantity: craftState.quantity,
        items: Object.entries(itemCounts).map(([item, count]) => ({
          name: ITEMS[item].name,
          count,
          rarity: ITEMS[item].rarity
        }))
      }
    }
  };

case 'PET_COMPANION':
  if (state.companion.petCooldown > 0) return state;

  return {
    ...state,
    companion: {
      ...state.companion,
      mood: Math.min(100, state.companion.mood + 8),
      petCooldown: 60
    }
  };

case 'UPDATE_PET_COOLDOWN':
  return {
    ...state,
    companion: {
      ...state.companion,
      petCooldown: Math.max(0, state.companion.petCooldown - 1)
    }
  };

case 'DECAY_MOOD':
  return {
    ...state,
    companion: {
      ...state.companion,
      mood: Math.max(0, state.companion.mood - 1)
    }
  };

case 'RESTORE_ZONE':
  const { zoneKey, itemKey } = action.payload;
  const item = ITEMS[itemKey];
  if (!item || !item.restoration || state.inventory[itemKey] < 1) return state;

  const updatedZones = { ...state.zones };
  updatedZones[zoneKey] = {
    ...updatedZones[zoneKey],
    restored: Math.min(updatedZones[zoneKey].maxRestored, updatedZones[zoneKey].restored + item.restoration)
  };

  if (updatedZones.cinderGrove.restored >= 50) {
    updatedZones.skyfallPlateau.unlocked = true;
  }
  
  if (updatedZones.skyfallPlateau.restored >= 75) {
    updatedZones.voidRealm.unlocked = true;
  }

  return {
    ...state,
    inventory: {
      ...state.inventory,
      [itemKey]: state.inventory[itemKey] - 1
    },
    zones: updatedZones,
    player: {
      ...state.player,
      experience: state.player.experience + (item.restoration * 2)
    },
    companion: {
      ...state.companion,
      mood: Math.min(100, state.companion.mood + Math.min(10, Math.floor(item.restoration / 5)))
    }
  };

case 'SET_TAB':
  return {
    ...state,
    ui: {
      ...state.ui,
      activeTab: action.payload
    }
  };

case 'CLEAR_CRAFT_RESULTS':
  return {
    ...state,
    ui: {
      ...state.ui,
      craftResults: null
    }
  };

case 'START_ADVANCED_CRAFT':
  const { recipeKey: advRecipeKey } = action.payload;
  const advRecipe = ADVANCED_RECIPES[advRecipeKey];

  const newAdvInventory = { ...state.inventory };
  Object.entries(advRecipe.inputs).forEach(([item, amount]) => {
    newAdvInventory[item] -= amount;
  });

  return {
    ...state,
    inventory: newAdvInventory,
    ui: {
      ...state.ui,
      advancedCrafting: {
        recipeKey: advRecipeKey,
        progress: 0,
        startTime: Date.now(),
        duration: 3000
      }
    }
  };

case 'UPDATE_ADVANCED_CRAFT_PROGRESS':
  if (!state.ui.advancedCrafting) return state;

  const advElapsed = Date.now() - state.ui.advancedCrafting.startTime;
  const advProgress = Math.min(100, (advElapsed / state.ui.advancedCrafting.duration) * 100);

  return {
    ...state,
    ui: {
      ...state.ui,
      advancedCrafting: {
        ...state.ui.advancedCrafting,
        progress: advProgress
      }
    }
  };

case 'COMPLETE_ADVANCED_CRAFT':
  if (!state.ui.advancedCrafting) return state;

  const advCraftState = state.ui.advancedCrafting;
  const advCraftRecipe = ADVANCED_RECIPES[advCraftState.recipeKey];

  const advLogEntry = {
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    recipeName: advCraftRecipe.name,
    quantity: 1,
    items: [{
      name: ITEMS[advCraftRecipe.output].name,
      count: 1,
      rarity: ITEMS[advCraftRecipe.output].rarity
    }],
    isAdvanced: true
  };

  const newAdvCraftingLog = [advLogEntry, ...state.ui.craftingLog].slice(0, 10);

  return {
    ...state,
    inventory: {
      ...state.inventory,
      [advCraftRecipe.output]: state.inventory[advCraftRecipe.output] + 1
    },
    player: {
      ...state.player,
      experience: state.player.experience + advCraftRecipe.experience
    },
    ui: {
      ...state.ui,
      advancedCrafting: null,
      craftingLog: newAdvCraftingLog,
      craftResults: {
        recipeName: advCraftRecipe.name,
        quantity: 1,
        items: [{
          name: ITEMS[advCraftRecipe.output].name,
          count: 1,
          rarity: ITEMS[advCraftRecipe.output].rarity
        }]
      }
    }
  };

case 'BUILD_PROJECT':
  const { zoneKey: projectZoneKey, projectKey } = action.payload;
  const project = ZONE_PROJECTS[projectKey];

  const hasItems = Object.entries(project.inputs).every(([item, amount]) =>
    state.inventory[item] >= amount
  );
  if (!hasItems) return state;

  const newProjectInventory = { ...state.inventory };
  Object.entries(project.inputs).forEach(([item, amount]) => {
    newProjectInventory[item] -= amount;
  });

  const updatedProjectZones = { ...state.zones };
  const targetZone = updatedProjectZones[projectZoneKey];
  const newProjects = [...targetZone.projects, projectKey];
  const newBonuses = { ...targetZone.bonuses };

  if (project.bonus.resourceMultiplier) {
    newBonuses.resourceMultiplier *= project.bonus.resourceMultiplier;
  }
  if (project.bonus.luckBonus) {
    newBonuses.luckBonus = (newBonuses.luckBonus || 0) + project.bonus.luckBonus;
  }

  updatedProjectZones[projectZoneKey] = {
    ...targetZone,
    projects: newProjects,
    bonuses: newBonuses
  };

  if (project.bonus.unlockZone) {
    updatedProjectZones[project.bonus.unlockZone] = {
      ...updatedProjectZones[project.bonus.unlockZone],
      unlocked: true
    };
  }

  return {
    ...state,
    inventory: newProjectInventory,
    zones: updatedProjectZones,
    player: {
      ...state.player,
      experience: state.player.experience + 100
    },
    companion: {
      ...state.companion,
      mood: Math.min(100, state.companion.mood + 15)
    }
  };

case 'TOGGLE_RARITY_INFO':
  return {
    ...state,
    ui: {
      ...state.ui,
      showRarityInfo: state.ui.showRarityInfo === action.payload ? null : action.payload
    }
  };

case 'TOGGLE_DEV_MODE':
  return {
    ...state,
    ui: {
      ...state.ui,
      devMode: !state.ui.devMode
    }
  };

case 'DEV_ADD_ITEM':
  const { itemKey: devItemKey, amount } = action.payload;
  return {
    ...state,
    inventory: {
      ...state.inventory,
      [devItemKey]: state.inventory[devItemKey] + amount
    }
  };

case 'DEV_SET_RESOURCE':
  const { resource, value } = action.payload;
  return {
    ...state,
    resources: {
      ...state.resources,
      [resource]: value
    }
  };

case 'DEV_CLEAR_INVENTORY':
  return {
    ...state,
    inventory: Object.keys(ITEMS).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  };

case 'SET_RESTORATION_RARITY':
  return {
    ...state,
    ui: {
      ...state.ui,
      activeRestorationRarity: action.payload
    }
  };

default:
  return state;

}
};

// ===== COMPONENTS (Ready for extraction) =====
const RarityInfo = ({ rarity, onClose }) => {
const rarityData = {
common: { name: "Common", color: "text-gray-300", description: "Basic materials found frequently", chance: "65%" },
uncommon: { name: "Uncommon", color: "text-green-400", description: "Refined materials with modest power", chance: "20%" },
rare: { name: "Rare", color: "text-blue-400", description: "Specialized items and basic tools", chance: "10%" },
epic: { name: "Epic", color: "text-purple-400", description: "Powerful tools and artifacts", chance: "4%" },
legendary: { name: "Legendary", color: "text-amber-400", description: "World-changing artifacts of immense power", chance: "1%" }
};

const data = rarityData[rarity];
if (!data) return null;

return (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
<div className={`bg-gradient-to-br from-black/90 to-gray-900/90 rounded-xl p-6 border-2 ${getRarityBg(rarity)} max-w-sm w-full backdrop-blur-lg`}>
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<span className="text-3xl">{getRarityGem(rarity)}</span>
<h3 className={`text-xl font-bold ${data.color}`}>{data.name}</h3>
</div>
<button
onClick={onClose}
className="text-gray-400 hover:text-white text-2xl leading-none"
>
×
</button>
</div>

    <div className="space-y-3">
      <p className="text-gray-300 text-sm">{data.description}</p>

      <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/10">
        <span className="text-sm font-medium">Drop Chance</span>
        <span className={`font-bold ${data.color}`}>{data.chance}</span>
      </div>

      <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/10">
        <span className="text-sm font-medium">Affected by Luck</span>
        <span className="text-green-400 font-bold">✓ Yes</span>
      </div>
    </div>
  </div>
</div>

);
};

const TabButton = ({ id, icon: Icon, label, isActive, onClick, badge }) => (
<button
onClick={() => onClick(id)}
className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-semibold transition-all relative min-h-[50px] active:scale-95 ${ isActive ? 'bg-orange-500/20 text-orange-400 scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30' }`}

<Icon className="w-5 h-5 mb-1" />
<span className="text-xs leading-tight text-center">{label}</span>
{badge && (
  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
    {badge}
  </div>
)}

  </button>
);

// ===== MAIN COMPONENT =====
const AshEmberGame = () => {
const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

// Memoized computed values for performance
const totalInventoryItems = useMemo(() =>
Object.values(state.inventory).reduce((sum, count) => sum + (count > 0 ? 1 : 0), 0) || null
, [state.inventory]);

const resourceMaterials = useMemo(() => [
{ key: 'emberShard', name: 'Ember Shards', icon: Flame, color: 'orange' },
{ key: 'whisperingVine', name: 'Whispering Vines', icon: Leaf, color: 'green' },
{ key: 'dustleaf', name: 'Dustleaf', icon: Leaf, color: 'yellow' },
{ key: 'ancientAlloy', name: 'Ancient Alloy', icon: Zap, color: 'gray' }
], []);

// Game Timers
useEffect(() => {
const resourceTimer = setInterval(() => {
dispatch({ type: 'UPDATE_RESOURCES' });
}, GAME_CONFIG.timers.resourceTick);

const moodTimer = setInterval(() => {
  dispatch({ type: 'DECAY_MOOD' });
}, GAME_CONFIG.timers.moodDecay);

const petTimer = setInterval(() => {
  dispatch({ type: 'UPDATE_PET_COOLDOWN' });
}, 1000);

return () => {
  clearInterval(resourceTimer);
  clearInterval(moodTimer);
  clearInterval(petTimer);
};

}, []);

// Crafting Progress Timer
useEffect(() => {
if (!state.ui.crafting) return;

const progressTimer = setInterval(() => {
  dispatch({ type: 'UPDATE_CRAFT_PROGRESS' });
  const elapsed = Date.now() - state.ui.crafting.startTime;
  if (elapsed >= state.ui.crafting.duration) {
    clearInterval(progressTimer);
    dispatch({ type: 'COMPLETE_CRAFT' });
  }
}, 16);

return () => clearInterval(progressTimer);

}, [state.ui.crafting]);

// Advanced Crafting Progress Timer
useEffect(() => {
if (!state.ui.advancedCrafting) return;

const progressTimer = setInterval(() => {
  dispatch({ type: 'UPDATE_ADVANCED_CRAFT_PROGRESS' });
  const elapsed = Date.now() - state.ui.advancedCrafting.startTime;
  if (elapsed >= state.ui.advancedCrafting.duration) {
    clearInterval(progressTimer);
    dispatch({ type: 'COMPLETE_ADVANCED_CRAFT' });
  }
}, 16);

return () => clearInterval(progressTimer);

}, [state.ui.advancedCrafting]);

// Optimized action handlers with proper dependencies
const startCraft = useCallback((recipeKey, quantity) => {
if (state.ui.crafting || !canCraft(state.resources, recipeKey, quantity)) return;
dispatch({ type: 'START_CRAFT', payload: { recipeKey, quantity } });
}, [state.ui.crafting, state.resources]);

const startAdvancedCraft = useCallback((recipeKey) => {
if (state.ui.advancedCrafting || !canCraftAdvanced(state.inventory, recipeKey)) return;
dispatch({ type: 'START_ADVANCED_CRAFT', payload: { recipeKey } });
}, [state.ui.advancedCrafting, state.inventory]);

const buildProject = useCallback((zoneKey, projectKey) => {
if (!canBuildProject(state.inventory, projectKey)) return;
dispatch({ type: 'BUILD_PROJECT', payload: { zoneKey, projectKey } });
}, [state.inventory]);

const petCompanion = useCallback(() => {
dispatch({ type: 'PET_COMPANION' });
}, []);

const restoreZone = useCallback((zoneKey, itemKey) => {
dispatch({ type: 'RESTORE_ZONE', payload: { zoneKey, itemKey } });
}, []);

const setTab = useCallback((tab) => {
dispatch({ type: 'SET_TAB', payload: tab });
}, []);

const clearResults = useCallback(() => {
dispatch({ type: 'CLEAR_CRAFT_RESULTS' });
}, []);

const toggleRarityInfo = useCallback((rarity) => {
dispatch({ type: 'TOGGLE_RARITY_INFO', payload: rarity });
}, []);

const toggleDevMode = useCallback(() => {
dispatch({ type: 'TOGGLE_DEV_MODE' });
}, []);

const devAddItem = useCallback((itemKey, amount = 1) => {
dispatch({ type: 'DEV_ADD_ITEM', payload: { itemKey, amount } });
}, []);

const devSetResource = useCallback((resource, value) => {
dispatch({ type: 'DEV_SET_RESOURCE', payload: { resource, value } });
}, []);

const devClearInventory = useCallback(() => {
dispatch({ type: 'DEV_CLEAR_INVENTORY' });
}, []);

const setRestorationRarity = useCallback((rarity) => {
dispatch({ type: 'SET_RESTORATION_RARITY', payload: rarity });
}, []);

return (
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 text-white pb-20">
<div className="max-w-4xl mx-auto p-4">
{/* Header */}
<div className="text-center mb-6">
<div className="flex items-center justify-center gap-3 mb-3">
<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-amber-500 bg-clip-text text-transparent animate-pulse">
Ash & Ember
</h1>
<button
onClick={toggleDevMode}
className="text-xs px-2 py-1 bg-gray-800/50 rounded border border-gray-600 hover:bg-gray-700/50 transition-all"
>
<Code className="w-4 h-4" />
</button>
</div>
<p className="text-gray-300 text-sm opacity-90">Restore the world through ancient crafting</p>
</div>

    {/* Player Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-lg p-4 backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
        <div className="flex items-center gap-3">
          <Star className="w-7 h-7 text-yellow-400 flex-shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base">Level {state.player.level}</h3>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-500 shadow-yellow-500/50 shadow-sm"
                style={{ width: `${(state.player.experience / state.player.experienceToNext) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-300 mt-1">{state.player.experience}/{state.player.experienceToNext}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-lg p-4 backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
        <div className="flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-purple-400 flex-shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base">{state.player.luck}% Luck</h3>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500 shadow-purple-500/50 shadow-sm"
                style={{ width: `${state.player.luck}%` }}
              />
            </div>
            <p className="text-xs text-gray-300 mt-1">Better odds</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-lg p-4 backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
        <div className="flex items-center gap-3">
          <Heart className="w-7 h-7 text-pink-400 flex-shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base">{state.companion.name}</h3>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-pink-400 h-2 rounded-full transition-all duration-500 shadow-pink-500/50 shadow-sm"
                style={{ width: `${state.companion.mood}%` }}
              />
            </div>
            <button
              onClick={petCompanion}
              disabled={state.companion.petCooldown > 0}
              className={`text-xs px-3 py-2 rounded mt-2 transition-all font-semibold w-full ${
                state.companion.petCooldown > 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-pink-500/30 hover:bg-pink-500/50 text-pink-200 active:scale-95 hover:shadow-lg'
              }`}
            >
              {state.companion.petCooldown > 0 ? `${state.companion.petCooldown}s` : 'Pet (+8)'}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Developer Panel */}
    {state.ui.devMode && (
      <div className="bg-gray-900/90 border border-red-500/50 rounded-lg p-4 mb-6">
        <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
          <Code className="w-5 h-5" />
          Developer Panel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-3">Resources</h4>
            <div className="space-y-2">
              {Object.entries(state.resources).map(([resource, value]) => (
                <div key={resource} className="flex items-center gap-3">
                  <span className="text-sm w-24 truncate">{resource}</span>
                  <input
                    type="number"
                    value={Math.floor(value)}
                    onChange={(e) => devSetResource(resource, parseInt(e.target.value) || 0)}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={devClearInventory}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Clear Inventory
              </button>
              {RARITY_ORDER.map(rarity => {
                const itemsOfRarity = Object.keys(ITEMS).filter(key => ITEMS[key].rarity === rarity);
                if (itemsOfRarity.length === 0) return null;
                const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
                return (
                  <button
                    key={rarity}
                    onClick={() => devAddItem(randomItem, 5)}
                    className={`w-full px-4 py-2 rounded text-sm font-medium ${getRarityBg(rarity)} ${getRarityColor(rarity)} hover:scale-105 transition-all`}
                  >
                    +5 {rarity} items
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Tab Content */}
    <div className="bg-gradient-to-br from-black/40 to-black/20 rounded-lg backdrop-blur-sm border border-white/10 shadow-lg min-h-[60vh] overflow-hidden mb-20 hover:shadow-xl transition-shadow duration-300">
      {/* Crafting Tab */}
      {state.ui.activeTab === 'crafting' && (
        <div className="p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Arcweaver
          </h2>

          {/* Crafting Log */}
          {state.ui.craftingLog.length > 0 && (
            <div className="mb-6 bg-gradient-to-br from-slate-900/40 to-slate-800/40 rounded-lg p-4 border border-slate-600/50">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Recent Crafts
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {state.ui.craftingLog.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-black/30 rounded border border-white/10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-300">
                          {entry.isAdvanced ? '⚡' : '🔮'} {entry.recipeName}
                        </span>
                        <span className="text-xs text-gray-500">({entry.timestamp})</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {entry.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <button
                              onClick={() => toggleRarityInfo(item.rarity)}
                              className="hover:scale-110 transition-transform cursor-pointer text-sm"
                            >
                              {getRarityGem(item.rarity)}
                            </button>
                            <span className={`text-sm font-medium ${getRarityColor(item.rarity)}`}>
                              {item.count}x {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Recipes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.entries(RECIPES).map(([key, recipe]) => {
              const maxCrafts = getMaxCrafts(state.resources, key);
              const isThisCardCrafting = state.ui.crafting?.recipeKey === key;
              const hasResultsForThisCard = state.ui.craftResults &&
                Object.keys(RECIPES).find(recipeKey => RECIPES[recipeKey].name === state.ui.craftResults.recipeName) === key;

              return (
                <div key={key} className={`bg-gradient-to-br from-black/60 to-black/40 rounded-lg p-4 border border-gray-600/50 shadow-lg hover:border-gray-500/70 transition-all ${isThisCardCrafting ? 'border-orange-500/50' : ''}`}>
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">{recipe.icon}</div>
                    <h3 className="font-bold text-base text-orange-300">{recipe.name}</h3>
                    <p className="text-sm text-gray-400 mt-2">{recipe.description}</p>
                  </div>

                  {/* Crafting Animation */}
                  {isThisCardCrafting && (
                    <div className="mb-4 p-4 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-lg text-center border border-orange-500/30">
                      <div className="relative w-16 h-16 mx-auto mb-3">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                          <circle
                            cx="32" cy="32" r="26" fill="none"
                            stroke="url(#craftingGradient)" strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 26}`}
                            strokeDashoffset={`${2 * Math.PI * 26 * (1 - state.ui.crafting.progress / 100)}`}
                            className="transition-all duration-100 ease-linear"
                          />
                          <defs>
                            <linearGradient id="craftingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#f97316" />
                              <stop offset="50%" stopColor="#eab308" />
                              <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-orange-400 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-orange-200 font-bold text-sm">Crafting...</p>
                      <p className="text-orange-300 text-sm">{Math.round(state.ui.crafting.progress)}%</p>
                    </div>
                  )}

                  {/* Results */}
                  {hasResultsForThisCard && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg border border-green-500/40">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-green-300 text-sm">
                          ✅ Crafted {state.ui.craftResults.quantity}x!
                        </h4>
                        <button onClick={clearResults} className="text-green-300 hover:text-white text-xl leading-none">×</button>
                      </div>
                      <div className="space-y-2">
                        {state.ui.craftResults.items.map((item, index) => (
                          <div key={index} className={`flex items-center justify-between bg-black/20 rounded px-3 py-2 border ${getRarityBg(item.rarity)}`}>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRarityInfo(item.rarity)}
                                className="hover:scale-110 transition-transform cursor-pointer"
                              >
                                {getRarityGem(item.rarity)}
                              </button>
                              <span className={`text-sm font-semibold ${getRarityColor(item.rarity)}`}>{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-white bg-green-500/30 px-2 py-1 rounded">+{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center gap-3 mb-4">
                    {Object.entries(recipe.inputs).map(([resource, amount]) => {
                      const hasEnough = state.resources[resource] >= amount;
                      const icon = RESOURCE_ICONS[resource] || '⚡';
                      return (
                        <div key={resource} className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${hasEnough ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                          <span className="text-base">{icon}</span>
                          <span className="font-bold">{amount}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => startCraft(key, 1)}
                      disabled={!canCraft(state.resources, key, 1) || state.ui.crafting || state.ui.advancedCrafting}
                      className={`py-3 px-3 rounded text-sm font-bold transition-all ${
                        canCraft(state.resources, key, 1) && !state.ui.crafting && !state.ui.advancedCrafting
                          ? 'bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      1x
                    </button>
                    <button
                      onClick={() => startCraft(key, 5)}
                      disabled={!canCraft(state.resources, key, 5) || state.ui.crafting || state.ui.advancedCrafting}
                      className={`py-3 px-3 rounded text-sm font-bold transition-all ${
                        canCraft(state.resources, key, 5) && !state.ui.crafting && !state.ui.advancedCrafting
                          ? 'bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      5x
                    </button>
                    <button
                      onClick={() => startCraft(key, maxCrafts)}
                      disabled={maxCrafts === 0 || state.ui.crafting || state.ui.advancedCrafting}
                      className={`py-3 px-3 rounded text-sm font-bold transition-all ${
                        maxCrafts > 0 && !state.ui.crafting && !state.ui.advancedCrafting
                          ? 'bg-orange-600 hover:bg-orange-700 text-white transform hover:scale-105'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Max
                    </button>
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-2">Max: {maxCrafts}</p>
                </div>
              );
            })}
          </div>

          {/* Advanced Crafting Section */}
          <div className="border-t border-gray-600 pt-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Settings className="w-6 h-6 text-cyan-400" />
              Advanced Crafting
            </h3>
            <p className="text-gray-400 text-sm mb-6">Combine crafted items to create powerful tools and components</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(ADVANCED_RECIPES).map(([key, recipe]) => {
                const canCraftThis = canCraftAdvanced(state.inventory, key);
                const isThisCardCrafting = state.ui.advancedCrafting?.recipeKey === key;
                const hasResultsForThisCard = state.ui.craftResults &&
                  ADVANCED_RECIPES[key].name === state.ui.craftResults.recipeName;

                return (
                  <div key={key} className={`bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg p-4 border border-cyan-600/50 shadow-lg hover:border-cyan-500/70 transition-all ${isThisCardCrafting ? 'border-cyan-400/70' : ''}`}>
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">{recipe.icon}</div>
                      <h4 className="font-bold text-base text-cyan-300">{recipe.name}</h4>
                      <p className="text-sm text-gray-400 mt-2">{recipe.description}</p>
                    </div>

                    {/* Advanced Crafting Animation */}
                    {isThisCardCrafting && (
                      <div className="mb-4 p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-lg text-center border border-cyan-500/30">
                        <div className="relative w-16 h-16 mx-auto mb-3">
                          <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                            <circle
                              cx="32" cy="32" r="26" fill="none"
                              stroke="url(#advancedCraftingGradient)" strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 26}`}
                              strokeDashoffset={`${2 * Math.PI * 26 * (1 - state.ui.advancedCrafting.progress / 100)}`}
                              className="transition-all duration-100 ease-linear"
                            />
                            <defs>
                              <linearGradient id="advancedCraftingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0891b2" />
                                <stop offset="50%" stopColor="#0284c7" />
                                <stop offset="100%" stopColor="#0369a1" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Settings className="w-6 h-6 text-cyan-400 animate-spin" />
                          </div>
                        </div>
                        <p className="text-cyan-200 font-bold text-sm">Advanced Crafting...</p>
                        <p className="text-cyan-300 text-sm">{Math.round(state.ui.advancedCrafting.progress)}%</p>
                      </div>
                    )}

                    {/* Advanced Results */}
                    {hasResultsForThisCard && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg border border-green-500/40">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-green-300 text-sm">
                            ✅ Created Advanced Item!
                          </h4>
                          <button onClick={clearResults} className="text-green-300 hover:text-white text-xl leading-none">×</button>
                        </div>
                        <div className="space-y-2">
                          {state.ui.craftResults.items.map((item, index) => (
                            <div key={index} className={`flex items-center justify-between bg-black/20 rounded px-3 py-2 border ${getRarityBg(item.rarity)}`}>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleRarityInfo(item.rarity)}
                                  className="hover:scale-110 transition-transform cursor-pointer"
                                >
                                  {getRarityGem(item.rarity)}
                                </button>
                                <span className={`text-sm font-semibold ${getRarityColor(item.rarity)}`}>{item.name}</span>
                              </div>
                              <span className="text-sm font-bold text-white bg-green-500/30 px-2 py-1 rounded">+{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center gap-2 mb-4 flex-wrap">
                      {Object.entries(recipe.inputs).map(([item, amount]) => {
                        const hasEnough = state.inventory[item] >= amount;
                        const itemDef = ITEMS[item];
                        return (
                          <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded text-sm border ${hasEnough ? 'bg-green-900/30 text-green-300 border-green-500/30' : 'bg-red-900/30 text-red-300 border-red-500/30'}`}>
                            <button
                              onClick={() => toggleRarityInfo(itemDef.rarity)}
                              className="hover:scale-110 transition-transform cursor-pointer"
                            >
                              {getRarityGem(itemDef.rarity)}
                            </button>
                            <span className="font-bold">{amount}</span>
                            <span className="text-sm opacity-75">{itemDef.name}</span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => startAdvancedCraft(key)}
                      disabled={!canCraftThis || state.ui.crafting || state.ui.advancedCrafting}
                      className={`w-full py-3 px-4 rounded text-sm font-bold transition-all ${
                        canCraftThis && !state.ui.crafting && !state.ui.advancedCrafting
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white transform hover:scale-105'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Create Advanced Item
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {state.ui.activeTab === 'resources' && (
        <div className="p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
            <Gem className="w-6 h-6 text-orange-400" />
            Resources & Inventory
          </h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Raw Materials</h3>
            <div className="grid grid-cols-2 gap-4">
              {resourceMaterials.map(({ key, name, icon: Icon, color }) => (
                <div key={key} className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg p-4 border border-orange-500/30 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-orange-400/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-6 h-6 text-orange-400 flex-shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{name}</p>
                      <p className="text-orange-300 text-xl font-bold">{formatNumber(state.resources[key])}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">+{GAME_CONFIG.baseRates[key]}/sec</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Crafted Items</h3>
            {RARITY_ORDER.map(rarity => {
              const itemsOfRarity = Object.entries(state.inventory).filter(([itemKey, count]) =>
                ITEMS[itemKey] && ITEMS[itemKey].rarity === rarity && count > 0
              );
              if (itemsOfRarity.length === 0) return null;

              return (
                <div key={rarity} className="mb-6">
                  <h4 className={`text-base font-bold mb-3 ${getRarityColor(rarity)} uppercase tracking-wide`}>
                    {rarity} Items
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {itemsOfRarity.map(([itemKey, count]) => {
                      const item = ITEMS[itemKey];
                      if (!item) return null;
                      return (
                        <div key={itemKey} className={`bg-gradient-to-br from-black/60 to-black/40 rounded-lg p-4 border shadow-lg ${getRarityBg(rarity)} ${rarity === 'legendary' ? 'animate-pulse' : ''}`}>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleRarityInfo(rarity)}
                              className="text-2xl hover:scale-110 transition-transform cursor-pointer flex-shrink-0"
                            >
                              {getRarityGem(rarity)}
                            </button>
                            <div className="flex-1 min-w-0">
                              <h5 className={`font-bold text-base ${getRarityColor(rarity)} truncate`}>
                                {item.name}
                              </h5>
                              <p className={`text-xl font-bold ${getRarityColor(rarity)}`}>{count}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <p className="text-sm text-gray-400 truncate">{item.description}</p>
                                {item.restoration && item.restoration > 0 && (
                                  <span className={`text-sm font-bold px-2 py-1 rounded ${getRarityBg(rarity)}`}>
                                    +{item.restoration} 🏗️
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zones Tab */}
      {state.ui.activeTab === 'zones' && (
        <div className="p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
            <Map className="w-6 h-6 text-green-400" />
            Zone Restoration & Projects
          </h2>

          <div className="space-y-6">
            {Object.entries(state.zones).map(([key, zone]) => (
              <div key={key} className={`rounded-lg p-6 border-2 shadow-lg ${zone.unlocked ? 'border-green-500/50 bg-gradient-to-br from-green-900/20 to-green-800/10' : 'border-gray-600/50 bg-gradient-to-br from-gray-900/20 to-gray-800/10'}`}>
                <h3 className="font-bold text-lg md:text-xl mb-3 flex items-center gap-3">
                  {zone.unlocked ? <Star className="w-6 h-6 text-green-400" /> : <Clock className="w-6 h-6 text-gray-400" />}
                  {zone.name}
                </h3>
                <p className="text-gray-300 mb-4 text-sm">{zone.description}</p>

                {zone.unlocked ? (
                  <>
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold">Restoration Progress</span>
                        <span className="text-green-400 font-bold">{zone.restored}/{zone.maxRestored}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-green-600 to-green-400 h-4 rounded-full transition-all duration-500 shadow-lg"
                          style={{ width: `${(zone.restored / zone.maxRestored) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        {Math.round((zone.restored / zone.maxRestored) * 100)}% complete
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-300 text-base">Use Items for Restoration:</h5>
                      
                      {/* Rarity Tabs */}
                      <div className="flex border-b mb-4 overflow-x-auto">
                        {RARITY_ORDER.map(rarity => {
                          const itemsOfRarity = Object.entries(state.inventory).filter(([itemKey, count]) =>
                            count > 0 && ITEMS[itemKey] && ITEMS[itemKey].rarity === rarity && ITEMS[itemKey].restoration && ITEMS[itemKey].restoration > 0
                          );
                          
                          return (
                            <button 
                              key={rarity}
                              onClick={() => setRestorationRarity(rarity)}
                              className={`px-4 py-2 text-sm whitespace-nowrap ${
                                state.ui.activeRestorationRarity === rarity 
                                  ? `border-b-2 ${getRarityColor(rarity)} font-bold` 
                                  : 'text-gray-400 hover:text-gray-200'
                              }`}
                            >
                              {getRarityGem(rarity)} {rarity} ({itemsOfRarity.length})
                            </button>
                          );
                        })}
                      </div>

                      {/* Filtered Items Display */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto bg-black/20 rounded-lg p-4">
                        {Object.entries(state.inventory)
                          .filter(([itemKey, count]) => {
                            const item = ITEMS[itemKey];
                            return count > 0 && item && item.rarity === state.ui.activeRestorationRarity && item.restoration && item.restoration > 0;
                          })
                          .sort(([,a], [,b]) => (ITEMS[b]?.restoration || 0) - (ITEMS[a]?.restoration || 0))
                          .map(([itemKey, count]) => {
                            const item = ITEMS[itemKey];
                            if (!item || !item.restoration) return null;
                            return (
                              <button
                                key={itemKey}
                                onClick={() => restoreZone(key, itemKey)}
                                className={`p-4 rounded-lg border ${getRarityBg(item.rarity)} hover:scale-105 transition-all text-left`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleRarityInfo(item.rarity);
                                      }}
                                      className="text-xl flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                                    >
                                      {getRarityGem(item.rarity)}
                                    </button>
                                    <div className="min-w-0 flex-1">
                                      <div className={`font-semibold text-sm ${getRarityColor(item.rarity)} truncate`}>
                                        {item.name}
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        x{count} available
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="text-green-400 font-bold text-base">+{item.restoration}</div>
                                    <div className="text-sm text-gray-400">restore</div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        {Object.entries(state.inventory).filter(([itemKey, count]) => {
                          const item = ITEMS[itemKey];
                          return count > 0 && item && item.rarity === state.ui.activeRestorationRarity && item.restoration && item.restoration > 0;
                        }).length === 0 && (
                          <div className="col-span-full text-center text-gray-500 py-8 text-sm">
                            No {state.ui.activeRestorationRarity} items available for restoration
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    {key === 'skyfallPlateau' ? (
                      <div>
                        <p className="text-gray-400 font-semibold mb-2">Unlock Requirements:</p>
                        <p className="text-gray-500 italic text-sm">Restore Cinder Grove to 50% ({state.zones.cinderGrove.restored}/50)</p>
                        {state.zones.cinderGrove.restored >= 50 && (
                          <p className="text-green-400 font-bold mt-2">✅ Requirements Met! Zone Unlocked!</p>
                        )}
                      </div>
                    ) : key === 'voidRealm' ? (
                      <div>
                        <p className="text-gray-400 font-semibold mb-2">Unlock Requirements:</p>
                        <p className="text-gray-500 italic text-sm">Restore Skyfall Plateau to 75% ({state.zones.skyfallPlateau.restored}/75)</p>
                        {!state.zones.skyfallPlateau.unlocked && (
                          <p className="text-red-400 text-sm mt-1">First unlock Skyfall Plateau</p>
                        )}
                        {state.zones.skyfallPlateau.unlocked && state.zones.skyfallPlateau.restored >= 75 && (
                          <p className="text-green-400 font-bold mt-2">✅ Requirements Met! Zone Unlocked!</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Requirements unknown</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Companion Tab */}
      {state.ui.activeTab === 'companion' && (
        <div className="p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-400" />
            Companion
          </h2>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center relative overflow-hidden shadow-xl">
                <Flame className="w-12 h-12 md:w-16 md:h-16 text-white animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 animate-pulse"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-pink-300 mb-3">{state.companion.name}</h3>
              <p className="text-gray-300 mb-4 text-base">A small ember spirit that dances around you</p>
              <p className="text-base md:text-lg font-semibold text-purple-300">Level {state.companion.level} • Luck Boost</p>
            </div>

            <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-lg p-6 mb-6 border border-pink-500/20 shadow-lg">
              <h4 className="text-lg font-semibold mb-4">Mood</h4>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-pink-600 to-pink-400 h-4 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${state.companion.mood}%` }}
                />
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-pink-300 font-bold text-lg">{state.companion.mood}%</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  state.companion.mood > 80 ? 'bg-green-900/50 text-green-300' :
                  state.companion.mood > 60 ? 'bg-yellow-900/50 text-yellow-300' :
                  state.companion.mood > 40 ? 'bg-orange-900/50 text-orange-300' :
                  'bg-red-900/50 text-red-300'
                }`}>
                  {state.companion.mood > 80 ? 'Ecstatic' :
                   state.companion.mood > 60 ? 'Happy' :
                   state.companion.mood > 40 ? 'Content' :
                   state.companion.mood > 20 ? 'Sad' : 'Depressed'}
                </span>
              </div>
              <button
                onClick={petCompanion}
                disabled={state.companion.petCooldown > 0}
                className={`w-full py-4 px-6 rounded-lg font-bold transition-all active:scale-95 ${
                  state.companion.petCooldown > 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg transform hover:scale-105'
                }`}
              >
                {state.companion.petCooldown > 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pet available in {state.companion.petCooldown}s
                  </div>
                ) : (
                  `Pet ${state.companion.name} (+8 mood)`
                )}
              </button>
            </div>

            <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-lg p-6 border border-purple-500/20 shadow-lg">
              <h4 className="text-lg font-semibold mb-4">Effects</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <span className="font-semibold">Luck Bonus</span>
                  <span className="text-purple-300 font-bold text-lg">
                    +{state.companion.mood > 80 ? 15 : state.companion.mood > 60 ? 10 : state.companion.mood > 40 ? 5 : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                  <span className="font-semibold">Resource Generation</span>
                  <span className="text-green-300 font-bold text-lg">
                    +{Math.round((state.companion.mood / 100) * 20)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Bottom Navigation */}
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-lg border-t border-white/10 shadow-2xl">
      <div className="max-w-4xl mx-auto px-2 py-2">
        <div className="grid grid-cols-4 gap-1">
          <TabButton
            id="crafting"
            icon={Hammer}
            label="Craft"
            isActive={state.ui.activeTab === 'crafting'}
            onClick={setTab}
          />
          <TabButton
            id="resources"
            icon={Gem}
            label="Items"
            isActive={state.ui.activeTab === 'resources'}
            onClick={setTab}
            badge={totalInventoryItems}
          />
          <TabButton
            id="zones"
            icon={Map}
            label="Zones"
            isActive={state.ui.activeTab === 'zones'}
            onClick={setTab}
          />
          <TabButton
            id="companion"
            icon={Heart}
            label="Spark"
            isActive={state.ui.activeTab === 'companion'}
            onClick={setTab}
          />
        </div>
      </div>
    </div>

    <div className="text-center text-gray-400 text-xs mt-6 pb-3 animate-pulse">
      <p className="flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3" />
        Resources generate automatically • Each recipe guarantees items • Luck determines rarity
        <Sparkles className="w-3 h-3" />
      </p>
    </div>
  </div>

  {/* Rarity Info Modal */}
  {state.ui.showRarityInfo && (
    <RarityInfo
      rarity={state.ui.showRarityInfo}
      onClose={() => toggleRarityInfo(null)}
    />
  )}
</div>

);
};

export default AshEmberGame;