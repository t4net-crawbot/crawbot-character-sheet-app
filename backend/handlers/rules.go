package handlers

import (
	"encoding/json"
	"net/http"
)

var classesData = []map[string]interface{}{
	{"id": "barbarian", "name": "Barbarian", "hitDie": 12, "saves": []string{"STR", "CON"}, "spellcasting": false, "description": "A fierce warrior of primal instinct who channels rage into devastating power.", "level1Features": []string{"Rage (2/long rest, +2 damage, resist B/P/S)", "Unarmored Defense (AC = 13 + CON)"}},
	{"id": "bard", "name": "Bard", "hitDie": 8, "saves": []string{"DEX", "CHA"}, "spellcasting": true, "spellcastingAbility": "CHA", "description": "A magical performer who weaves inspiration and arcane power through music and story.", "level1Features": []string{"Spellcasting (Arcane, CHA, 3 cantrips, 4 spells known)", "Bardic Inspiration (d6, bonus action)"}},
	{"id": "cleric", "name": "Cleric", "hitDie": 8, "saves": []string{"WIS", "CHA"}, "spellcasting": true, "spellcastingAbility": "WIS", "description": "A priestly champion who wields divine magic in service of a higher power.", "level1Features": []string{"Spellcasting (Divine, WIS, prepared)", "Manifestation of Faith (Might or Miracles)"}},
	{"id": "druid", "name": "Druid", "hitDie": 8, "saves": []string{"INT", "WIS"}, "spellcasting": true, "spellcastingAbility": "WIS", "description": "A guardian of the natural world who draws power from the primordial forces of nature.", "level1Features": []string{"Spellcasting (Primordial, WIS, prepared)", "Druidic", "Nature's Gift (heal PB×d4 HP)"}},
	{"id": "fighter", "name": "Fighter", "hitDie": 10, "saves": []string{"STR", "CON"}, "spellcasting": false, "description": "A master of martial combat, skilled with a variety of weapons and armor.", "level1Features": []string{"Last Stand (reaction: spend hit dice below half HP)", "Martial Action (bonus action: Aim/Guard/Quick Strike/Wind Up)"}},
	{"id": "monk", "name": "Monk", "hitDie": 8, "saves": []string{"STR", "DEX"}, "spellcasting": false, "description": "A master of martial arts who harnesses the power of body and mind.", "level1Features": []string{"Martial Arts (1d6 unarmed, bonus unarmed after Attack)", "Unarmored Defense (AC = 10 + DEX + WIS)"}},
	{"id": "paladin", "name": "Paladin", "hitDie": 10, "saves": []string{"WIS", "CHA"}, "spellcasting": true, "spellcastingAbility": "CHA", "description": "A holy warrior bound by an oath to uphold justice and smite evil.", "level1Features": []string{"Lay on Hands (HP pool = 5 × level)", "Divine Sense (detect fiends/undead/celestials within 60ft)"}},
	{"id": "ranger", "name": "Ranger", "hitDie": 10, "saves": []string{"STR", "DEX"}, "spellcasting": true, "spellcastingAbility": "WIS", "description": "A warrior of the wilderness who excels at tracking, survival, and hunting foes.", "level1Features": []string{"Favored Enemy (choose creature type, +PB damage)", "Natural Explorer (choose terrain type, exploration advantages)"}},
	{"id": "rogue", "name": "Rogue", "hitDie": 8, "saves": []string{"DEX", "INT"}, "spellcasting": false, "description": "A scoundrel who uses stealth, cunning, and precise strikes to overcome enemies.", "level1Features": []string{"Sneak Attack (1d6 extra damage with advantage or ally adjacent)", "Thieves' Cant (secret language)", "Cunning Action (bonus Dash/Disengage/Hide)"}},
	{"id": "sorcerer", "name": "Sorcerer", "hitDie": 6, "saves": []string{"CON", "CHA"}, "spellcasting": true, "spellcastingAbility": "CHA", "description": "A natural spellcaster who draws power from an innate magical origin.", "level1Features": []string{"Spellcasting (Arcane, CHA, 4 cantrips, 2 spells)", "Sorcery Points (2)", "Sorcerous Origin"}},
	{"id": "warlock", "name": "Warlock", "hitDie": 8, "saves": []string{"WIS", "CHA"}, "spellcasting": true, "spellcastingAbility": "CHA", "description": "A seeker of forbidden knowledge who forged a pact with an otherworldly patron.", "level1Features": []string{"Spellcasting (Wyrd, CHA, 2 cantrips, 2 spells, 1 pact slot)", "Eldritch Invocations", "Patron"}},
	{"id": "wizard", "name": "Wizard", "hitDie": 6, "saves": []string{"INT", "WIS"}, "spellcasting": true, "spellcastingAbility": "INT", "description": "A scholarly magic-user who studies the arcane arts to reshape reality.", "level1Features": []string{"Spellcasting (Arcane, INT, 3 cantrips, 6 spellbook spells)", "Arcane Recovery (recover slots on short rest)"}},
	{"id": "vanguard", "name": "Vanguard", "hitDie": 10, "saves": []string{"STR", "CON"}, "spellcasting": false, "description": "A frontline warrior who masters the art of holding the line and protecting allies.", "level1Features": []string{"Martial Resilience (reduce damage by PB when hit)", "Vanguard Stance (bonus action: offensive or defensive stance)"}},
}

var lineagesData = []map[string]interface{}{
	{"id": "beastkin", "name": "Beastkin", "size": "Medium or Small", "speed": 30, "darkvision": false, "description": "Humanoids with animalistic features descended from the merging of human and beast.", "traits": []string{"Animal Instinct (Perception or Survival proficiency)", "Natural Weapons (1d6+STR/DEX)", "Natural Adaptation (Avian: fly speed; Agile: climb speed; Aquatic: swim speed; Sturdy: AC 13+DEX, no armor)"}},
	{"id": "dwarf", "name": "Dwarf", "size": "Medium", "speed": 30, "darkvision": true, "darkvisionRange": 60, "description": "Stout and hardy folk known for their craftsmanship and unyielding resilience.", "traits": []string{"Darkvision (60ft)", "Dwarven Resilience (advantage vs poisoned, resist poison damage)", "Dwarven Toughness (+1 HP per level)"}},
	{"id": "elf", "name": "Elf", "size": "Medium", "speed": 30, "darkvision": false, "description": "Graceful, long-lived beings with a deep connection to magic and the natural world.", "traits": []string{"Heightened Senses (advantage on sight/hearing Perception)", "Magic Ancestry (advantage vs charmed, immune to magical sleep)", "Trance (4 hours meditation = 8 hours sleep)"}},
	{"id": "human", "name": "Human", "size": "Medium or Small", "speed": 30, "darkvision": false, "description": "Adaptable and ambitious, humans spread across every corner of the world.", "traits": []string{"Ambitious (proficiency in 1 skill of your choice + 1 talent from any list)"}},
	{"id": "orc", "name": "Orc", "size": "Medium", "speed": 30, "darkvision": false, "description": "Powerful and fierce warriors who remain in their prime for most of their lives.", "traits": []string{"Heightened Senses (advantage on sight/hearing Perception)", "Orcish Perseverance (stasis instead of death from exhaustion/suffocation)", "Stalwart (make end-of-turn saves at the start of your turn instead)"}},
	{"id": "smallfolk", "name": "Smallfolk", "size": "Small", "speed": 30, "darkvision": false, "description": "Small but courageous folk with outsized bravery and surprising luck.", "traits": []string{"Grounded (1/day reroll failed save, gain 1 Luck regardless of result)", "Small Stature (move through Medium+ spaces, hide behind Medium+ creatures)", "Natural Adaptation (Gnomish: darkvision 60ft + minor illusion; Halfling: advantage vs charmed/frightened)"}},
}

var heritagesData = []map[string]interface{}{
	{"id": "cosmopolitan", "name": "Cosmopolitan", "description": "Raised among many cultures in a diverse urban setting.", "features": []string{"Street Smarts (advantage navigate/find destinations in cities)", "Worldly Wisdom (History proficiency, +PB for unfamiliar culture checks)"}},
	{"id": "cottage", "name": "Cottage", "description": "Raised in a humble rural home with strong community bonds.", "features": []string{"Comforts of Home (long rest: give PB creatures temp HP = 2×PB)", "Homesteader (Animal Handling or Nature proficiency)"}},
	{"id": "diaspora", "name": "Diaspora", "description": "Part of a people scattered from their ancestral homeland.", "features": []string{"Preserved Traditions (History proficiency + 1 martial weapon proficiency)", "Timeless Resolve (advantage vs frightened for you and ally within 5ft)"}},
	{"id": "grove", "name": "Grove", "description": "Raised in deep woodlands, attuned to nature's rhythms.", "features": []string{"Canopy Walker (climb speed = walk speed)", "Nature's Camouflage (advantage Stealth in natural cover, can always Hide)"}},
	{"id": "nomadic", "name": "Nomadic", "description": "Raised travelling the world with no permanent home.", "features": []string{"Resilient (advantage vs extreme weather, reduce exhaustion 1/short rest)", "Traveler (Survival proficiency)"}},
	{"id": "slayer", "name": "Slayer", "description": "Raised in a tradition of hunting and tracking dangerous beasts.", "features": []string{"Natural Predator (Intimidation proficiency, advantage Intimidation vs Beasts)", "Tracker (+PB to locate/spot/track creatures, double if proficient)"}},
	{"id": "stone", "name": "Stone", "description": "Raised in the traditions of stonecraft and metal-working.", "features": []string{"Ancestral Arts (Construction tools proficiency + double PB, 1 martial weapon proficiency)", "Eye for Quality (+PB for metal/stone origin or purpose checks)"}},
	{"id": "wildlands", "name": "Wildlands", "description": "Raised on the frontier, living alongside wild beasts.", "features": []string{"Beast Affinity (communicate simple ideas with Beasts)", "Shepherd's Gift (Animal Handling proficiency, Beasts with CR ≤ PB must WIS-contest to attack you)"}},
}

var backgroundsData = []map[string]interface{}{
	{"id": "criminal", "name": "Criminal", "description": "You have eked out a living on the fringes of lawful society.", "skillChoices": []string{"Stealth", "Investigation", "Insight", "Deception"}, "numSkillChoices": 2, "talents": []string{"Covert", "Scrutinous", "Touch of Luck"}, "equipment": "Chalk ×5, grappling hook, dark traveler's clothes, 10 gp"},
	{"id": "scholar", "name": "Scholar", "description": "You spent years researching subjects at an institute of learning.", "skillChoices": []string{"Arcana", "History", "Nature", "Religion"}, "numSkillChoices": 2, "talents": []string{"Polyglot", "Ritualist", "School Specialization"}, "equipment": "Ink, quill, small knife, reference book, common clothes, 10 gp"},
	{"id": "soldier", "name": "Soldier", "description": "You received special military training and saw active service.", "skillChoices": []string{"Animal Handling", "Athletics", "Medicine", "Survival"}, "numSkillChoices": 2, "talents": []string{"Combat Casting", "Combat Conditioning", "Field Medic"}, "equipment": "Symbol of rank, mess kit, playing cards, common clothes, 10 gp"},
	{"id": "noble", "name": "Noble", "description": "You were born into wealth and privilege, trained in courtly arts.", "skillChoices": []string{"History", "Insight", "Persuasion", "Deception"}, "numSkillChoices": 2, "talents": []string{"Polyglot", "Scrutinous", "Vanguard"}, "equipment": "Fine clothes, signet ring, scroll of pedigree, 25 gp"},
	{"id": "outlander", "name": "Outlander", "description": "You grew up in the wilds, far from civilization's comforts.", "skillChoices": []string{"Athletics", "Nature", "Survival", "Perception"}, "numSkillChoices": 2, "talents": []string{"Athletic", "Far Traveler", "Aware"}, "equipment": "Staff, hunting trap, animal trophy, traveler's clothes, 10 gp"},
	{"id": "entertainer", "name": "Entertainer", "description": "You thrived in front of audiences, dazzling crowds with your talents.", "skillChoices": []string{"Acrobatics", "Performance", "Persuasion", "Deception"}, "numSkillChoices": 2, "talents": []string{"Quick", "Touch of Luck", "Scrutinous"}, "equipment": "Musical instrument, admirer's favor, costume, 15 gp"},
}

func GetClasses(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(classesData)
}

func GetLineages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lineagesData)
}

func GetHeritages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(heritagesData)
}

func GetBackgrounds(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(backgroundsData)
}
