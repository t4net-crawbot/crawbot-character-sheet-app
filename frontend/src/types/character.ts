export interface Attack {
  name: string
  attackBonus: number
  damageDice: string
  damageType: string
  notes?: string
}

export interface SpellSlots {
  [level: string]: { max: number; used: number }
}

export interface SpellData {
  castingAbility?: string
  saveDC?: number
  attackBonus?: number
  slots: SpellSlots
  known: string[]
  prepared: string[]
}

export interface Character {
  id: string
  user_id: string
  name: string
  lineage: string
  heritage: string
  class: string
  level: number
  background: string
  alignment: string
  xp: number
  luck_points: number
  str_score: number
  dex_score: number
  con_score: number
  int_score: number
  wis_score: number
  cha_score: number
  hp_max: number
  hp_current: number
  hp_temp: number
  saving_throw_profs: string[]
  skill_profs: string[]
  skill_expertise: string[]
  personality_traits: string
  ideals: string
  bonds: string
  flaws: string
  backstory: string
  equipment: unknown[]
  attacks: Attack[]
  spells: SpellData
  talents: unknown[]
  features: string[]
  cp: number
  sp: number
  ep: number
  gp: number
  pp: number
  created_at: string
  updated_at: string
}

export interface RulesClass {
  id: string
  name: string
  hitDie: number
  saves: string[]
  spellcasting: boolean
  spellcastingAbility?: string
  description: string
  level1Features: string[]
}

export interface RulesLineage {
  id: string
  name: string
  size: string
  speed: number
  darkvision: boolean
  darkvisionRange?: number
  description: string
  traits: string[]
}

export interface RulesHeritage {
  id: string
  name: string
  description: string
  features: string[]
}

export interface RulesBackground {
  id: string
  name: string
  description: string
  skillChoices: string[]
  numSkillChoices: number
  talents: string[]
  equipment: string
}

export interface WizardData {
  name: string
  lineage: string
  heritage: string
  class: string
  background: string
  alignment: string
  skills: string[]
  talent: string
  scores: Record<string, number>
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string
  backstory: string
}
