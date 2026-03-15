import { TiltCard } from '../../ui/TiltCard'
import { RulesBackground } from '../../../types/character'

interface Props {
  background: string
  selectedSkills: string[]
  backgrounds: RulesBackground[]
  onBackground: (id: string) => void
  onSkills: (skills: string[]) => void
}

export function BackgroundStep({ background, selectedSkills, backgrounds, onBackground, onSkills }: Props) {
  const selectedBg = backgrounds.find(b => b.id === background)

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onSkills(selectedSkills.filter(s => s !== skill))
    } else if (selectedBg && selectedSkills.length < selectedBg.numSkillChoices) {
      onSkills([...selectedSkills, skill])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-tov-text mb-1">Choose Your Background</h2>
        <p className="text-tov-textMuted text-sm mb-4">Your background reflects your life before adventure — the experiences that shaped your skills and perspective.</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {backgrounds.map(bg => (
            <TiltCard key={bg.id} isSelected={background === bg.id} onClick={() => onBackground(bg.id)}>
              <div className="font-bold text-tov-text text-sm mb-1">{bg.name}</div>
              <p className="text-tov-textMuted text-xs mb-2">{bg.description}</p>
              <div className="text-xs text-tov-text/70 flex flex-wrap gap-1 mb-2">
                {bg.skillChoices.map(s => (
                  <span key={s} className="px-1.5 py-0.5 bg-tov-surface border border-tov-border rounded">{s}</span>
                ))}
              </div>
              <div className="text-xs text-tov-textMuted">{bg.equipment}</div>
            </TiltCard>
          ))}
        </div>
      </div>

      {selectedBg && (
        <div className="bg-tov-surface rounded-xl border border-tov-border p-4">
          <h3 className="font-semibold text-tov-gold mb-3">
            Choose {selectedBg.numSkillChoices} Skill Proficiencies
            <span className="text-tov-textMuted font-normal ml-2 text-sm">
              ({selectedSkills.length}/{selectedBg.numSkillChoices} selected)
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {selectedBg.skillChoices.map(skill => {
              const isSelected = selectedSkills.includes(skill)
              const isDisabled = !isSelected && selectedSkills.length >= selectedBg.numSkillChoices
              return (
                <button
                  key={skill}
                  onClick={() => !isDisabled && toggleSkill(skill)}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border text-sm transition-all duration-200
                    ${isSelected
                      ? 'border-tov-gold bg-tov-gold/10 text-tov-gold'
                      : isDisabled
                        ? 'border-tov-border bg-tov-surface text-tov-textMuted opacity-40 cursor-not-allowed'
                        : 'border-tov-border bg-tov-surface text-tov-text hover:border-tov-gold/50'
                    }
                  `}
                >
                  <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs
                    ${isSelected ? 'bg-tov-gold border-tov-gold text-tov-bg' : 'border-tov-border'}`}>
                    {isSelected && '✓'}
                  </span>
                  {skill}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
