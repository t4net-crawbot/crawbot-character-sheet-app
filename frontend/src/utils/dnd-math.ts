export const getModifier = (score: number): number => Math.floor((score - 10) / 2)

export const formatModifier = (mod: number): string => mod >= 0 ? `+${mod}` : `${mod}`

export const getProficiencyBonus = (level: number): number => {
  if (level <= 4) return 2
  if (level <= 8) return 3
  if (level <= 12) return 4
  if (level <= 16) return 5
  return 6
}

export const getSkillBonus = (
  score: number,
  proficient: boolean,
  expertise: boolean,
  profBonus: number
): number => {
  const mod = getModifier(score)
  if (expertise) return mod + profBonus * 2
  if (proficient) return mod + profBonus
  return mod
}

export const getPassivePerception = (
  wis: number,
  proficient: boolean,
  profBonus: number
): number => 10 + getModifier(wis) + (proficient ? profBonus : 0)

export const getSpellSaveDC = (abilityScore: number, profBonus: number): number =>
  8 + profBonus + getModifier(abilityScore)

export const getSpellAttackBonus = (abilityScore: number, profBonus: number): number =>
  profBonus + getModifier(abilityScore)

export const getHPAtLevel1 = (hitDie: number, conScore: number): number =>
  hitDie + getModifier(conScore)

export const ABILITY_NAMES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const
export type AbilityName = typeof ABILITY_NAMES[number]

export const SKILLS: { name: string; ability: AbilityName }[] = [
  { name: 'Acrobatics', ability: 'DEX' },
  { name: 'Animal Handling', ability: 'WIS' },
  { name: 'Arcana', ability: 'INT' },
  { name: 'Athletics', ability: 'STR' },
  { name: 'Deception', ability: 'CHA' },
  { name: 'History', ability: 'INT' },
  { name: 'Insight', ability: 'WIS' },
  { name: 'Intimidation', ability: 'CHA' },
  { name: 'Investigation', ability: 'INT' },
  { name: 'Medicine', ability: 'WIS' },
  { name: 'Nature', ability: 'INT' },
  { name: 'Perception', ability: 'WIS' },
  { name: 'Performance', ability: 'CHA' },
  { name: 'Persuasion', ability: 'CHA' },
  { name: 'Religion', ability: 'INT' },
  { name: 'Sleight of Hand', ability: 'DEX' },
  { name: 'Stealth', ability: 'DEX' },
  { name: 'Survival', ability: 'WIS' },
]

// BFRD Point Buy costs (not standard 5e — uses 32 points, max 18)
export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9, 16: 11, 17: 13, 18: 16,
}
export const POINT_BUY_BUDGET = 32
export const STANDARD_ARRAY = [16, 14, 14, 13, 10, 8]

export const CLASS_HIT_DICE: Record<string, number> = {
  barbarian: 12, bard: 8, cleric: 8, druid: 8, fighter: 10,
  monk: 8, paladin: 10, ranger: 10, rogue: 8, sorcerer: 6,
  warlock: 8, wizard: 6, vanguard: 10,
}

export const SPELLCASTING_CLASSES = new Set([
  'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
])

export const SPELLCASTING_ABILITY: Record<string, AbilityName> = {
  bard: 'CHA', cleric: 'WIS', druid: 'WIS', paladin: 'CHA',
  ranger: 'WIS', sorcerer: 'CHA', warlock: 'CHA', wizard: 'INT',
}
