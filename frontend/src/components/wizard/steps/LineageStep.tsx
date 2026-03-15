import { TiltCard } from '../../ui/TiltCard'
import { RulesLineage, RulesHeritage } from '../../../types/character'

interface Props {
  lineage: string
  heritage: string
  lineages: RulesLineage[]
  heritages: RulesHeritage[]
  onLineage: (id: string) => void
  onHeritage: (id: string) => void
}

export function LineageStep({ lineage, heritage, lineages, heritages, onLineage, onHeritage }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-tov-text mb-1">Choose Your Lineage</h2>
        <p className="text-tov-textMuted text-sm mb-4">Your lineage represents your hereditary traits — the physical and innate qualities passed down through your bloodline.</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {lineages.map(l => (
            <TiltCard key={l.id} isSelected={lineage === l.id} onClick={() => onLineage(l.id)}>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="font-bold text-tov-text text-sm">{l.name}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <span className="text-xs px-1.5 py-0.5 bg-tov-teal/30 text-tov-tealLight rounded">{l.size}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-tov-interactive/30 text-tov-text/70 rounded">{l.speed}ft</span>
                    {l.darkvision && <span className="text-xs px-1.5 py-0.5 bg-indigo-900/50 text-indigo-300 rounded">Darkvision</span>}
                  </div>
                  <p className="text-tov-textMuted text-xs mt-2 line-clamp-2">{l.description}</p>
                  <ul className="mt-2 space-y-0.5">
                    {l.traits.slice(0, 2).map((t, i) => (
                      <li key={i} className="text-xs text-tov-text/70 flex gap-1">
                        <span className="text-tov-gold">•</span>{t.split('(')[0].trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      {lineage && (
        <div>
          <h2 className="text-xl font-bold text-tov-text mb-1">Choose Your Heritage</h2>
          <p className="text-tov-textMuted text-sm mb-4">Your heritage represents the cultural background and community that shaped who you are.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {heritages.map(h => (
              <TiltCard key={h.id} isSelected={heritage === h.id} onClick={() => onHeritage(h.id)}>
                <div className="font-bold text-tov-text text-sm mb-1">{h.name}</div>
                <p className="text-tov-textMuted text-xs mb-2 line-clamp-2">{h.description}</p>
                <div className="space-y-0.5">
                  {h.features.slice(0, 1).map((f, i) => (
                    <div key={i} className="text-xs text-tov-text/70 flex gap-1">
                      <span className="text-tov-gold">•</span>{f.split('(')[0].trim()}
                    </div>
                  ))}
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
