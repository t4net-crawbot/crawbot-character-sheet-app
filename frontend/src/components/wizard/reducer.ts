import { ABILITY_NAMES } from '../../utils/dnd-math'

export type WizardStep = 'LINEAGE' | 'CLASS' | 'BACKGROUND' | 'STATS' | 'TALENT' | 'STORY' | 'REVIEW'

export const WIZARD_STEPS: WizardStep[] = ['LINEAGE', 'CLASS', 'BACKGROUND', 'STATS', 'TALENT', 'STORY', 'REVIEW']

export const STEP_LABELS: Record<WizardStep, string> = {
  LINEAGE: 'Lineage',
  CLASS: 'Class',
  BACKGROUND: 'Background',
  STATS: 'Stats',
  TALENT: 'Talent',
  STORY: 'Story',
  REVIEW: 'Review',
}

export interface WizardState {
  step: WizardStep
  name: string
  lineage: string
  heritage: string
  className: string
  background: string
  alignment: string
  selectedSkills: string[]
  talent: string
  statMethod: 'pointbuy' | 'standard'
  scores: Record<string, number>
  standardArrayAssignments: Record<string, number | null>
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string
  backstory: string
}

const defaultScores: Record<string, number> = Object.fromEntries(ABILITY_NAMES.map(a => [a, 10]))
const defaultAssignments: Record<string, number | null> = Object.fromEntries(ABILITY_NAMES.map(a => [a, null]))

export const INITIAL_STATE: WizardState = {
  step: 'LINEAGE',
  name: '',
  lineage: '',
  heritage: '',
  className: '',
  background: '',
  alignment: '',
  selectedSkills: [],
  talent: '',
  statMethod: 'pointbuy',
  scores: defaultScores,
  standardArrayAssignments: defaultAssignments,
  personalityTraits: '',
  ideals: '',
  bonds: '',
  flaws: '',
  backstory: '',
}

export type WizardAction =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_LINEAGE'; payload: string }
  | { type: 'SET_HERITAGE'; payload: string }
  | { type: 'SET_CLASS'; payload: string }
  | { type: 'SET_BACKGROUND'; payload: string }
  | { type: 'SET_ALIGNMENT'; payload: string }
  | { type: 'SET_SKILLS'; payload: string[] }
  | { type: 'SET_TALENT'; payload: string }
  | { type: 'SET_STAT_METHOD'; payload: 'pointbuy' | 'standard' }
  | { type: 'SET_SCORE'; payload: { ability: string; value: number } }
  | { type: 'ASSIGN_STANDARD'; payload: { ability: string; value: number | null } }
  | { type: 'SET_STORY'; payload: Partial<Pick<WizardState, 'personalityTraits' | 'ideals' | 'bonds' | 'flaws' | 'backstory'>> }

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  const stepIdx = WIZARD_STEPS.indexOf(state.step)
  switch (action.type) {
    case 'NEXT':
      return { ...state, step: WIZARD_STEPS[Math.min(stepIdx + 1, WIZARD_STEPS.length - 1)] }
    case 'PREV':
      return { ...state, step: WIZARD_STEPS[Math.max(stepIdx - 1, 0)] }
    case 'SET_NAME':
      return { ...state, name: action.payload }
    case 'SET_LINEAGE':
      return { ...state, lineage: action.payload }
    case 'SET_HERITAGE':
      return { ...state, heritage: action.payload }
    case 'SET_CLASS':
      return { ...state, className: action.payload }
    case 'SET_BACKGROUND':
      return { ...state, background: action.payload, selectedSkills: [], talent: '' }
    case 'SET_ALIGNMENT':
      return { ...state, alignment: action.payload }
    case 'SET_SKILLS':
      return { ...state, selectedSkills: action.payload }
    case 'SET_TALENT':
      return { ...state, talent: action.payload }
    case 'SET_STAT_METHOD':
      return {
        ...state, statMethod: action.payload,
        scores: defaultScores,
        standardArrayAssignments: defaultAssignments,
      }
    case 'SET_SCORE':
      return { ...state, scores: { ...state.scores, [action.payload.ability]: action.payload.value } }
    case 'ASSIGN_STANDARD':
      return {
        ...state,
        standardArrayAssignments: { ...state.standardArrayAssignments, [action.payload.ability]: action.payload.value },
      }
    case 'SET_STORY':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function getEffectiveScores(state: WizardState): Record<string, number> {
  if (state.statMethod === 'pointbuy') return state.scores
  const result: Record<string, number> = {}
  for (const ability of ABILITY_NAMES) {
    result[ability] = state.standardArrayAssignments[ability] ?? 10
  }
  return result
}
