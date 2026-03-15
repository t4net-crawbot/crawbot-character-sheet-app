import { ABILITY_NAMES, POINT_BUY_COSTS, POINT_BUY_BUDGET, STANDARD_ARRAY, CLASS_HIT_DICE, getModifier, formatModifier, getHPAtLevel1 } from '../../../utils/dnd-math'
import { WizardState } from '../reducer'

interface Props {
  state: WizardState
  onStatMethod: (m: 'pointbuy' | 'standard') => void
  onScore: (ability: string, value: number) => void
  onAssign: (ability: string, value: number | null) => void
}

function getPointsSpent(scores: Record<string, number>): number {
  return ABILITY_NAMES.reduce((sum, a) => sum + (POINT_BUY_COSTS[scores[a]] ?? 0), 0)
}

function getEffectiveScores(state: WizardState): Record<string, number> {
  if (state.statMethod === 'pointbuy') return state.scores
  const result: Record<string, number> = {}
  for (const a of ABILITY_NAMES) {
    result[a] = state.standardArrayAssignments[a] ?? 10
  }
  return result
}

export function StatsStep({ state, onStatMethod, onScore, onAssign }: Props) {
  const scores = getEffectiveScores(state)
  const pointsSpent = getPointsSpent(state.scores)
  const pointsLeft = POINT_BUY_BUDGET - pointsSpent
  const hitDie = CLASS_HIT_DICE[state.className] ?? 8
  const hp = getHPAtLevel1(hitDie, scores.CON)
  const ac = 10 + getModifier(scores.DEX)
  const initiative = getModifier(scores.DEX)

  const usedValues = Object.values(state.standardArrayAssignments).filter(v => v !== null) as number[]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-tov-text mb-1">Assign Ability Scores</h2>
        <p className="text-tov-textMuted text-sm mb-4">Your six ability scores define your character's fundamental capabilities.</p>

        <div className="flex gap-2 mb-6">
          {(['pointbuy', 'standard'] as const).map(method => (
            <button
              key={method}
              onClick={() => onStatMethod(method)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
                ${state.statMethod === method
                  ? 'bg-tov-gold text-tov-bg border-tov-gold'
                  : 'bg-tov-surface text-tov-textMuted border-tov-border hover:border-tov-gold/50'
                }`}
            >
              {method === 'pointbuy' ? '⚖️ Point Buy' : '🎲 Standard Array'}
            </button>
          ))}
        </div>

        {state.statMethod === 'pointbuy' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-tov-textMuted text-sm">Points Budget</span>
              <span className={`font-mono font-bold text-lg ${pointsLeft < 0 ? 'text-tov-error' : pointsLeft === 0 ? 'text-tov-success' : 'text-tov-gold'}`}>
                {pointsLeft} / {POINT_BUY_BUDGET}
              </span>
            </div>
            <div className="space-y-3">
              {ABILITY_NAMES.map(ability => {
                const score = state.scores[ability]
                const cost = POINT_BUY_COSTS[score] ?? 0
                const nextCost = POINT_BUY_COSTS[score + 1] ?? 999
                const canIncrease = score < 18 && pointsLeft >= (nextCost - cost)
                const canDecrease = score > 8

                return (
                  <div key={ability} className="flex items-center gap-3 bg-tov-surface rounded-xl p-3 border border-tov-border">
                    <span className="text-tov-textMuted text-xs w-8 font-mono">{ability}</span>
                    <button
                      onClick={() => canDecrease && onScore(ability, score - 1)}
                      disabled={!canDecrease}
                      className="w-7 h-7 rounded-lg bg-tov-card border border-tov-border text-tov-text disabled:opacity-30 hover:border-tov-gold/50 font-bold text-lg leading-none"
                    >−</button>
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold font-mono text-tov-text">{score}</div>
                    </div>
                    <button
                      onClick={() => canIncrease && onScore(ability, score + 1)}
                      disabled={!canIncrease}
                      className="w-7 h-7 rounded-lg bg-tov-card border border-tov-border text-tov-text disabled:opacity-30 hover:border-tov-gold/50 font-bold text-lg leading-none"
                    >+</button>
                    <div className="w-10 text-right">
                      <span className={`font-bold font-mono text-sm ${getModifier(score) >= 0 ? 'text-tov-gold' : 'text-tov-error'}`}>
                        {formatModifier(getModifier(score))}
                      </span>
                    </div>
                    <div className="w-12 text-right text-xs text-tov-textMuted font-mono">
                      cost {cost}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {STANDARD_ARRAY.map((val, i) => {
                const used = usedValues.includes(val) && usedValues.indexOf(val) !== usedValues.lastIndexOf(val)
                  ? usedValues.filter(v => v === val).length > 0
                  : usedValues.includes(val)
                return (
                  <span key={i} className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm
                    ${usedValues.filter(v => v === val).length > STANDARD_ARRAY.filter(v => v === val).indexOf(val)
                      ? 'bg-tov-gold/20 border-tov-gold text-tov-gold'
                      : 'bg-tov-surface border-tov-border text-tov-text'
                    }`}>
                    {val}
                  </span>
                )
              })}
            </div>
            <div className="space-y-3">
              {ABILITY_NAMES.map(ability => {
                const assigned = state.standardArrayAssignments[ability]
                const availableValues = STANDARD_ARRAY.filter(v => {
                  const countInArray = STANDARD_ARRAY.filter(x => x === v).length
                  const countAssigned = Object.entries(state.standardArrayAssignments)
                    .filter(([a, val]) => a !== ability && val === v).length
                  return countAssigned < countInArray
                })

                return (
                  <div key={ability} className="flex items-center gap-3 bg-tov-surface rounded-xl p-3 border border-tov-border">
                    <span className="text-tov-textMuted text-xs w-8 font-mono">{ability}</span>
                    <select
                      value={assigned ?? ''}
                      onChange={e => onAssign(ability, e.target.value ? parseInt(e.target.value) : null)}
                      className="flex-1 bg-tov-card border border-tov-border rounded-lg px-3 py-1.5 text-tov-text text-sm focus:border-tov-gold focus:outline-none"
                    >
                      <option value="">— assign score —</option>
                      {[...new Set([...availableValues, ...(assigned ? [assigned] : [])])].sort((a, b) => b - a).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    <span className={`w-10 text-right font-bold font-mono text-sm ${assigned && getModifier(assigned) >= 0 ? 'text-tov-gold' : 'text-tov-error'}`}>
                      {assigned ? formatModifier(getModifier(assigned)) : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-tov-surface rounded-xl border border-tov-border p-4">
        <h3 className="text-sm font-semibold text-tov-gold mb-3">Live Preview</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Starting HP', value: `${hp}`, icon: '❤️' },
            { label: 'Base AC', value: `${ac}`, icon: '🛡️' },
            { label: 'Initiative', value: formatModifier(initiative), icon: '⚡' },
          ].map(s => (
            <div key={s.label} className="text-center bg-tov-card rounded-lg p-3 border border-tov-border">
              <div className="text-lg">{s.icon}</div>
              <div className="font-bold font-mono text-tov-gold text-xl">{s.value}</div>
              <div className="text-tov-textMuted text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
