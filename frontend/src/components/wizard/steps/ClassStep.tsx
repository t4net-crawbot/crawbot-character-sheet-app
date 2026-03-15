import { TiltCard } from '../../ui/TiltCard'
import { RulesClass } from '../../../types/character'

interface Props {
  selectedClass: string
  classes: RulesClass[]
  onSelect: (id: string) => void
}

const CLASS_ICONS: Record<string, string> = {
  barbarian: '⚔️', bard: '🎵', cleric: '✝️', druid: '🌿', fighter: '🛡️',
  monk: '👊', paladin: '⚜️', ranger: '🏹', rogue: '🗡️', sorcerer: '✨',
  warlock: '👁️', wizard: '📖', vanguard: '🔰',
}

export function ClassStep({ selectedClass, classes, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-tov-text mb-1">Choose Your Class</h2>
      <p className="text-tov-textMuted text-sm mb-4">Your class defines your role in the party and the abilities that grow with you as you gain experience.</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {classes.map(cls => (
          <TiltCard key={cls.id} isSelected={selectedClass === cls.id} onClick={() => onSelect(cls.id)}>
            <div className="flex items-start gap-2">
              <span className="text-2xl">{CLASS_ICONS[cls.id] || '⚔️'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-tov-text text-sm">{cls.name}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-tov-teal/30 text-tov-tealLight rounded font-mono">d{cls.hitDie}</span>
                  {cls.spellcasting && (
                    <span className="text-xs px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded">Spells</span>
                  )}
                </div>
                <p className="text-tov-textMuted text-xs mt-1 line-clamp-2">{cls.description}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {cls.saves.map(s => (
                    <span key={s} className="text-xs px-1 py-0.5 bg-tov-surface border border-tov-border rounded text-tov-text/70">{s}</span>
                  ))}
                  <span className="text-xs text-tov-textMuted">saves</span>
                </div>
                <div className="mt-2 space-y-0.5">
                  {cls.level1Features.slice(0, 2).map((f, i) => (
                    <div key={i} className="text-xs text-tov-text/70 flex gap-1">
                      <span className="text-tov-gold">•</span>
                      <span className="line-clamp-1">{f.split('(')[0].trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}
