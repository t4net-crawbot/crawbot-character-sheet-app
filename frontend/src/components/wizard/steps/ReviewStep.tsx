import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardState, getEffectiveScores } from '../reducer'
import { ABILITY_NAMES, CLASS_HIT_DICE, getModifier, formatModifier, getProficiencyBonus, getHPAtLevel1 } from '../../../utils/dnd-math'
import { GoldButton } from '../../ui/GoldButton'
import { createCharacter } from '../../../api/client'

interface Props {
  state: WizardState
  onNameChange: (name: string) => void
}

export function ReviewStep({ state, onNameChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const scores = getEffectiveScores(state)
  const profBonus = 2
  const hitDie = CLASS_HIT_DICE[state.className] ?? 8
  const hp = getHPAtLevel1(hitDie, scores.CON)

  const handleCreate = async () => {
    if (!state.name) {
      setError('Please enter a name for your character.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const char = await createCharacter({
        name: state.name,
        lineage: state.lineage,
        heritage: state.heritage,
        class: state.className,
        background: state.background,
        alignment: state.alignment,
        level: 1,
        str_score: scores.STR,
        dex_score: scores.DEX,
        con_score: scores.CON,
        int_score: scores.INT,
        wis_score: scores.WIS,
        cha_score: scores.CHA,
        hp_max: hp,
        hp_current: hp,
        skill_profs: state.selectedSkills,
        saving_throw_profs: [],
        personality_traits: state.personalityTraits,
        ideals: state.ideals,
        bonds: state.bonds,
        flaws: state.flaws,
        backstory: state.backstory,
        talents: [state.talent] as any,
        features: [] as any,
        attacks: [] as any,
        equipment: [] as any,
        spells: { slots: {}, known: [], prepared: [] } as any,
      })
      navigate(`/characters/${char.id}`)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-tov-text mb-1">Review Your Character</h2>
        <p className="text-tov-textMuted text-sm mb-4">Take a final look before forging your legend.</p>
      </div>

      <div className="bg-tov-surface rounded-xl border border-tov-border p-4">
        <h3 className="text-sm font-semibold text-tov-gold mb-3">Character Name</h3>
        <input
          type="text"
          value={state.name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Enter your hero's name..."
          className="w-full bg-tov-card border border-tov-border rounded-lg px-4 py-2.5 text-tov-text text-sm focus:outline-none focus:border-tov-gold transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Lineage', value: state.lineage },
          { label: 'Heritage', value: state.heritage },
          { label: 'Class', value: state.className },
          { label: 'Background', value: state.background },
          { label: 'Alignment', value: state.alignment || '—' },
          { label: 'Talent', value: state.talent || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-tov-surface rounded-xl border border-tov-border p-3">
            <div className="text-xs text-tov-textMuted mb-1">{label}</div>
            <div className="font-semibold text-tov-text capitalize">{value || '—'}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-tov-gold mb-3">Ability Scores</h3>
        <div className="grid grid-cols-6 gap-2">
          {ABILITY_NAMES.map(a => (
            <div key={a} className="bg-tov-surface rounded-xl border border-tov-border p-2 text-center">
              <div className="text-xs text-tov-textMuted mb-1">{a}</div>
              <div className="text-lg font-bold text-tov-text font-mono">{scores[a]}</div>
              <div className={`text-sm font-bold font-mono ${getModifier(scores[a]) >= 0 ? 'text-tov-gold' : 'text-tov-error'}`}>
                {formatModifier(getModifier(scores[a]))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Starting HP', value: `${hp}`, icon: '❤️' },
          { label: 'Base AC', value: `${10 + getModifier(scores.DEX)}`, icon: '🛡️' },
          { label: 'Proficiency', value: `+${profBonus}`, icon: '⭐' },
        ].map(s => (
          <div key={s.label} className="bg-tov-surface rounded-xl border border-tov-border p-3 text-center">
            <div className="text-lg">{s.icon}</div>
            <div className="font-bold font-mono text-tov-gold text-xl">{s.value}</div>
            <div className="text-tov-textMuted text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {state.selectedSkills.length > 0 && (
        <div className="bg-tov-surface rounded-xl border border-tov-border p-4">
          <h3 className="text-sm font-semibold text-tov-gold mb-2">Skill Proficiencies</h3>
          <div className="flex flex-wrap gap-2">
            {state.selectedSkills.map(s => (
              <span key={s} className="px-2 py-1 bg-tov-card rounded-lg text-xs text-tov-text border border-tov-border">{s}</span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-tov-error/10 border border-tov-error rounded-xl p-3 text-tov-error text-sm">{error}</div>
      )}

      <GoldButton onClick={handleCreate} disabled={loading} size="lg" className="w-full justify-center">
        {loading ? '⏳ Forging...' : '⚜️ Forge Your Legend'}
      </GoldButton>
    </div>
  )
}
