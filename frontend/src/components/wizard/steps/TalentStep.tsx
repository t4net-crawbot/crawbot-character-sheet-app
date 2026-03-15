import { TiltCard } from '../../ui/TiltCard'
import { RulesBackground } from '../../../types/character'

interface Props {
  background: string
  talent: string
  backgrounds: RulesBackground[]
  onTalent: (t: string) => void
}

const TALENT_DESCRIPTIONS: Record<string, { category: string; description: string }> = {
  'Covert': { category: 'Technical', description: 'You trained in the art of espionage. You can hide in three-quarter cover, remain hidden from darkvision, and make reaction Stealth checks when spotted.' },
  'Scrutinous': { category: 'Technical', description: 'You have a keen eye for detail. +5 to passive Perception and Investigation, can lip-read, and can mimic voices after hearing them for 1 minute.' },
  'Touch of Luck': { category: 'Technical', description: 'Fortune favors you. When you would gain 1 Luck from failure, gain 2 instead. If at 5 Luck and gain more, reset to 1d4+1 instead of rolling d4.' },
  'Polyglot': { category: 'Technical', description: 'You have studied language extensively. Learn 3 additional languages, gain advantage on CHA checks made in a shared non-Common language once per long rest.' },
  'Ritualist': { category: 'Magic', description: 'You unlock the mysteries of ritual spells. Gain a ritual book, add rituals equal to current spell circles known. Add more rituals as you gain spell circles.' },
  'School Specialization': { category: 'Magic', description: 'Choose a school of magic. +1 to spell attack and DC for that school, halved costs for scribing spells of that school, recover sorcery points when spending 2+.' },
  'Combat Casting': { category: 'Magic', description: 'Battlefield experience sharpens your focus. Treat concentration saves of 7 or less as 8. Use your reaction to cast a cantrip instead of opportunity attack.' },
  'Combat Conditioning': { category: 'Martial', description: 'You endured extensive training. Your hit point maximum increases by 2 per level (past and future), and treat hit dice rolls below your PB as equal to your PB.' },
  'Field Medic': { category: 'Technical', description: 'You trained in emergency medical assistance. When treating a creature, they regain PB + CON modifier HP. Treat Medicine rolls of 9 or less as 10.' },
  'Vanguard': { category: 'Martial', description: 'You capitalize on every opening. React to make attacks when enemies attack others near you. When readying an attack, gain +PB to hit and damage, reduce target speed to 0 on hit.' },
  'Athletic': { category: 'Martial', description: 'You honed your athletic capabilities. Double PB for Athletics. Enhanced carrying capacity, jump distance, and can stand from prone using only 5ft of movement.' },
  'Far Traveler': { category: 'Technical', description: 'You have traveled the world extensively. Travel 10 hours/day without forced march saves. Fast pace no longer penalizes Perception. Ignore one level of exhaustion.' },
  'Aware': { category: 'Technical', description: 'You have exceptional situational awareness. Treat initiative rolls of 9 or less as 10. You cannot be surprised while conscious. Hidden targets have no advantage against you.' },
  'Quick': { category: 'Technical', description: 'You are uncommonly agile. +10ft speed when unarmored. Dash lets you run on walls. Reduce fall distance by 5× PB feet. Move 5ft as a bonus action without provoking.' },
}

export function TalentStep({ background, talent, backgrounds, onTalent }: Props) {
  const selectedBg = backgrounds.find(b => b.id === background)
  const talents = selectedBg?.talents ?? []

  return (
    <div>
      <h2 className="text-xl font-bold text-tov-text mb-1">Choose Your Talent</h2>
      <p className="text-tov-textMuted text-sm mb-4">
        Your {selectedBg?.name ?? 'background'} grants you a talent — a special ability reflecting your past experiences.
        Talents are like feats and provide unique capabilities.
      </p>
      <div className="grid grid-cols-1 gap-4">
        {talents.map(t => {
          const info = TALENT_DESCRIPTIONS[t]
          return (
            <TiltCard key={t} isSelected={talent === t} onClick={() => onTalent(t)}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-tov-text">{t}</span>
                    {info && (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium
                        ${info.category === 'Magic' ? 'bg-purple-900/50 text-purple-300' :
                          info.category === 'Martial' ? 'bg-red-900/50 text-red-300' :
                          'bg-tov-teal/30 text-tov-tealLight'}`}>
                        {info.category}
                      </span>
                    )}
                  </div>
                  <p className="text-tov-textMuted text-sm leading-relaxed">
                    {info?.description ?? 'A powerful talent from your background.'}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center
                  ${talent === t ? 'bg-tov-gold border-tov-gold' : 'border-tov-border'}`}>
                  {talent === t && <span className="text-tov-bg text-xs">✓</span>}
                </div>
              </div>
            </TiltCard>
          )
        })}
      </div>
    </div>
  )
}
