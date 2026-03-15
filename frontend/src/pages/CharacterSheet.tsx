import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Character } from '../types/character'
import { getCharacter, patchCharacter } from '../api/client'
import { GoldButton } from '../components/ui/GoldButton'
import {
  getModifier, formatModifier, getProficiencyBonus, getSkillBonus,
  getPassivePerception, getSpellSaveDC, getSpellAttackBonus,
  ABILITY_NAMES, SKILLS, SPELLCASTING_CLASSES, SPELLCASTING_ABILITY,
} from '../utils/dnd-math'

function AbilityBlock({ name, score, onClick }: { name: string; score: number; onClick?: () => void }) {
  const mod = getModifier(score)
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center justify-between bg-tov-surface border border-tov-border rounded-xl p-3 text-center ${onClick ? 'cursor-pointer hover:border-tov-gold/50' : ''}`}
    >
      <span className="text-xs font-semibold text-tov-textMuted uppercase tracking-wider">{name}</span>
      <span className="text-2xl font-bold text-tov-text font-mono my-1">{score}</span>
      <span className={`text-lg font-bold font-mono ${mod >= 0 ? 'text-tov-gold' : 'text-tov-error'}`}>
        {formatModifier(mod)}
      </span>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-tov-surface border border-tov-border rounded-xl p-3 text-center flex-1">
      <div className="text-lg">{icon}</div>
      <div className="font-bold font-mono text-tov-gold text-xl">{value}</div>
      <div className="text-tov-textMuted text-xs">{label}</div>
    </div>
  )
}

function LuckCoin({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={filled ? 'Spend Luck' : 'No Luck here'}
      className={`text-xl transition-all duration-200 hover:scale-110 ${filled ? 'text-tov-gold' : 'text-tov-border hover:text-tov-gold/50'}`}
    >
      {filled ? '⚜' : '○'}
    </button>
  )
}

export function CharacterSheet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [char, setChar] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingHP, setEditingHP] = useState(false)
  const [hpInput, setHpInput] = useState('')

  useEffect(() => {
    if (!id) return
    getCharacter(id)
      .then(c => { setChar(c); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id])

  const patch = async (data: Partial<Character>) => {
    if (!id || !char) return
    const updated = await patchCharacter(id, data)
    setChar(updated)
  }

  const setLuck = async (n: number) => {
    if (!char) return
    await patch({ luck_points: Math.max(0, Math.min(5, n)) } as any)
  }

  if (loading) return (
    <div className="min-h-screen bg-tov-bg flex items-center justify-center">
      <div className="text-tov-gold text-lg animate-pulse">Loading character...</div>
    </div>
  )

  if (error || !char) return (
    <div className="min-h-screen bg-tov-bg flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-tov-error text-xl mb-2">Character not found</div>
        <GoldButton onClick={() => navigate('/')}>← Back to Dashboard</GoldButton>
      </div>
    </div>
  )

  const profBonus = getProficiencyBonus(char.level)
  const scores: Record<string, number> = {
    STR: char.str_score, DEX: char.dex_score, CON: char.con_score,
    INT: char.int_score, WIS: char.wis_score, CHA: char.cha_score,
  }
  const isSpellcaster = SPELLCASTING_CLASSES.has(char.class.toLowerCase())
  const spellAbility = SPELLCASTING_ABILITY[char.class.toLowerCase()]
  const spellScore = spellAbility ? scores[spellAbility] : 10

  return (
    <div className="min-h-screen bg-tov-bg">
      {/* Header */}
      <div className="bg-tov-surface border-b border-tov-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <GoldButton variant="ghost" size="sm" onClick={() => navigate('/')}>← Back</GoldButton>
          <div className="flex-1">
            <h1 className="text-2xl font-bold gold-text leading-tight">{char.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-tov-teal/30 text-tov-tealLight text-xs rounded-full capitalize">{char.class}</span>
              <span className="text-tov-textMuted text-xs">Level {char.level}</span>
              <span className="text-tov-textMuted text-xs capitalize">·  {char.lineage} ({char.heritage})</span>
              {char.background && <span className="text-tov-textMuted text-xs capitalize">· {char.background}</span>}
            </div>
          </div>
          {/* XP bar */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-tov-textMuted text-xs">XP {char.xp}</span>
            <div className="w-20 h-1.5 bg-tov-border rounded-full">
              <div className="h-full bg-tov-gold rounded-full" style={{ width: `${Math.min(100, (char.xp / 300) * 100)}%` }} />
            </div>
          </div>
          {/* Luck */}
          <div className="flex items-center gap-1">
            <span className="text-tov-textMuted text-xs mr-1">Luck</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <LuckCoin
                key={i}
                filled={i < char.luck_points}
                onClick={() => setLuck(i < char.luck_points ? i : i + 1)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Abilities, Saves, Skills */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-3">Ability Scores</h2>
              <div className="grid grid-cols-3 gap-2">
                {ABILITY_NAMES.map(a => (
                  <AbilityBlock key={a} name={a} score={scores[a]} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-3">Saving Throws</h2>
              <div className="bg-tov-surface border border-tov-border rounded-xl p-3 space-y-1.5">
                {ABILITY_NAMES.map(a => {
                  const proficient = char.saving_throw_profs.includes(a)
                  const bonus = getModifier(scores[a]) + (proficient ? profBonus : 0)
                  return (
                    <div key={a} className="flex items-center gap-2 text-sm">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${proficient ? 'bg-tov-gold' : 'border border-tov-border'}`} />
                      <span className="text-tov-textMuted flex-1 text-xs">{a}</span>
                      <span className={`font-mono font-bold text-xs ${bonus >= 0 ? 'text-tov-text' : 'text-tov-error'}`}>
                        {formatModifier(bonus)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-3">Skills</h2>
              <div className="bg-tov-surface border border-tov-border rounded-xl p-3 space-y-1">
                {SKILLS.map(s => {
                  const prof = char.skill_profs.includes(s.name)
                  const exp = char.skill_expertise.includes(s.name)
                  const bonus = getSkillBonus(scores[s.ability], prof, exp, profBonus)
                  return (
                    <div key={s.name} className="flex items-center gap-2 text-xs">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0
                        ${exp ? 'bg-tov-goldLight' : prof ? 'bg-tov-gold' : 'border border-tov-border'}`} />
                      <span className="text-tov-textMuted flex-1">{s.name}</span>
                      <span className="text-tov-textMuted text-[10px]">{s.ability}</span>
                      <span className={`font-mono font-bold w-6 text-right ${bonus >= 0 ? 'text-tov-text' : 'text-tov-error'}`}>
                        {formatModifier(bonus)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* CENTER: Core stats, HP, Attacks, Money */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-3">Core Stats</h2>
              <div className="flex gap-2">
                <StatCard icon="🛡️" label="AC" value={10 + getModifier(char.dex_score)} />
                <StatCard icon="⚡" label="Initiative" value={formatModifier(getModifier(char.dex_score))} />
                <StatCard icon="👟" label="Speed" value="30ft" />
                <StatCard icon="👁️" label="Passive Perc." value={getPassivePerception(char.wis_score, char.skill_profs.includes('Perception'), profBonus)} />
              </div>
            </div>

            <div className="bg-tov-surface border border-tov-border rounded-xl p-4">
              <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-3">Hit Points</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 text-center">
                  {editingHP ? (
                    <input
                      type="number"
                      value={hpInput}
                      onChange={e => setHpInput(e.target.value)}
                      onBlur={() => {
                        const v = parseInt(hpInput)
                        if (!isNaN(v)) patch({ hp_current: Math.min(char.hp_max, Math.max(0, v)) } as any)
                        setEditingHP(false)
                      }}
                      onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      autoFocus
                      className="w-20 bg-tov-card border border-tov-gold rounded-lg px-2 py-1 text-center text-2xl font-bold font-mono text-tov-text focus:outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => { setHpInput(String(char.hp_current)); setEditingHP(true) }}
                      className="text-3xl font-bold font-mono text-tov-gold hover:text-tov-goldLight transition-colors"
                    >
                      {char.hp_current}
                    </button>
                  )}
                  <span className="text-tov-textMuted text-lg font-mono"> / {char.hp_max}</span>
                  <div className="text-tov-textMuted text-xs mt-1">HP (click to edit)</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => patch({ hp_current: Math.min(char.hp_max, char.hp_current + 5) } as any)} className="px-3 py-1 bg-tov-success/20 text-tov-success rounded text-xs hover:bg-tov-success/30">+5</button>
                  <button onClick={() => patch({ hp_current: Math.max(0, char.hp_current - 5) } as any)} className="px-3 py-1 bg-tov-error/20 text-tov-error rounded text-xs hover:bg-tov-error/30">−5</button>
                </div>
              </div>
              <div className="h-2 bg-tov-border rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    char.hp_current / char.hp_max > 0.6 ? 'bg-tov-success' :
                    char.hp_current / char.hp_max > 0.3 ? 'bg-yellow-500' : 'bg-tov-error'
                  }`}
                  style={{ width: `${(char.hp_current / char.hp_max) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-tov-textMuted">
                <span>Temp HP: {char.hp_temp}</span>
                <span>Hit Die: d{char.class ? (char.class === 'barbarian' ? 12 : ['fighter','paladin','ranger','vanguard'].includes(char.class) ? 10 : [
                  'sorcerer','wizard'].includes(char.class) ? 6 : 8) : 8}</span>
              </div>
            </div>

            <div className="bg-tov-surface border border-tov-border rounded-xl p-4">
              <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-3">Death Saves</h2>
              <div className="flex gap-4">
                <div>
                  <div className="text-xs text-tov-success mb-1">Successes</div>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-tov-success" />)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-tov-error mb-1">Failures</div>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-tov-error" />)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-tov-surface border border-tov-border rounded-xl p-4">
              <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-3">Attacks</h2>
              {char.attacks && (char.attacks as any[]).length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-tov-textMuted">
                      <th className="text-left pb-1">Weapon</th>
                      <th className="text-center pb-1">Atk</th>
                      <th className="text-right pb-1">Damage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(char.attacks as any[]).map((a: any, i: number) => (
                      <tr key={i} className="border-t border-tov-border">
                        <td className="py-1 text-tov-text">{a.name}</td>
                        <td className="py-1 text-center text-tov-gold font-mono font-bold">{formatModifier(a.attackBonus)}</td>
                        <td className="py-1 text-right text-tov-textMuted font-mono">{a.damageDice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-tov-textMuted text-xs italic">No weapons added yet.</p>
              )}
            </div>

            <div className="bg-tov-surface border border-tov-border rounded-xl p-4">
              <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-3">Treasure</h2>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { label: 'CP', value: char.cp, color: 'text-orange-400' },
                  { label: 'SP', value: char.sp, color: 'text-gray-300' },
                  { label: 'EP', value: char.ep, color: 'text-blue-300' },
                  { label: 'GP', value: char.gp, color: 'text-tov-gold' },
                  { label: 'PP', value: char.pp, color: 'text-purple-300' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className={`font-bold font-mono text-sm ${color}`}>{value}</div>
                    <div className="text-tov-textMuted text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Personality, Features, Spellcasting */}
          <div className="space-y-4">
            <div className="bg-tov-surface border border-tov-border rounded-xl p-4 space-y-3">
              <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider">Personality</h2>
              {[
                { label: 'Traits', value: char.personality_traits },
                { label: 'Ideals', value: char.ideals },
                { label: 'Bonds', value: char.bonds },
                { label: 'Flaws', value: char.flaws },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs font-semibold text-tov-textMuted mb-1">{label}</div>
                  <div className="text-tov-text text-xs leading-relaxed min-h-[32px] bg-tov-card rounded-lg px-3 py-2">
                    {value || <span className="italic text-tov-textMuted/50">Not set</span>}
                  </div>
                </div>
              ))}
            </div>

            {char.backstory && (
              <div className="bg-tov-surface border border-tov-border rounded-xl p-4">
                <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-2">Backstory</h2>
                <p className="text-tov-text text-xs leading-relaxed">{char.backstory}</p>
              </div>
            )}

            <div className="bg-tov-surface border border-tov-border rounded-xl p-4">
              <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-3">Features & Traits</h2>
              {(char.features as any[] || []).length > 0 ? (
                <ul className="space-y-1">
                  {(char.features as any[]).map((f: any, i: number) => (
                    <li key={i} className="text-tov-text text-xs flex gap-2">
                      <span className="text-tov-gold">•</span>{typeof f === 'string' ? f : JSON.stringify(f)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-tov-textMuted text-xs italic">Class features will appear here.</p>
              )}
            </div>

            {isSpellcaster && (
              <div className="bg-tov-surface border border-tov-border rounded-xl p-4">
                <h2 className="text-xs font-semibold text-tov-gold uppercase tracking-wider mb-3">Spellcasting</h2>
                <div className="flex gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-tov-textMuted text-xs">Ability</div>
                    <div className="text-tov-gold font-bold font-mono">{spellAbility}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-tov-textMuted text-xs">Save DC</div>
                    <div className="text-tov-gold font-bold font-mono">{getSpellSaveDC(spellScore, profBonus)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-tov-textMuted text-xs">Atk Bonus</div>
                    <div className="text-tov-gold font-bold font-mono">{formatModifier(getSpellAttackBonus(spellScore, profBonus))}</div>
                  </div>
                </div>
                <p className="text-tov-textMuted text-xs italic">Spells can be added in edit mode.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
