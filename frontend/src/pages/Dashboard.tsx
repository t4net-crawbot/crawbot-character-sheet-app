import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { listCharacters } from '../api/client'
import { Character } from '../types/character'
import { GoldButton } from '../components/ui/GoldButton'
import { getProficiencyBonus, getModifier } from '../utils/dnd-math'

function LuckCoins({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-sm ${i < count ? 'text-tov-gold' : 'text-tov-border'}`}>
          {i < count ? '⚜' : '○'}
        </span>
      ))}
    </div>
  )
}

function CharacterCard({ char, onClick }: { char: Character; onClick: () => void }) {
  const hpPct = Math.max(0, Math.min(100, (char.hp_current / char.hp_max) * 100))
  const hpColor = hpPct > 60 ? 'bg-tov-success' : hpPct > 30 ? 'bg-yellow-500' : 'bg-tov-error'

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-tov-surface border border-tov-border rounded-2xl p-5 cursor-pointer hover:border-tov-gold/50 hover:shadow-gold transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-tov-text text-lg group-hover:text-tov-gold transition-colors">{char.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-tov-teal/30 text-tov-tealLight text-xs rounded-full font-medium capitalize">
              {char.class}
            </span>
            <span className="text-tov-textMuted text-xs">Level {char.level}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-tov-textMuted text-xs capitalize">{char.lineage}</div>
          <div className="text-tov-textMuted text-xs capitalize">{char.heritage}</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-tov-textMuted mb-1">
          <span>HP</span>
          <span className="font-mono">{char.hp_current} / {char.hp_max}</span>
        </div>
        <div className="h-1.5 bg-tov-border rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${hpColor}`} style={{ width: `${hpPct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <LuckCoins count={char.luck_points} />
        <div className="flex gap-3 text-xs text-tov-textMuted">
          <span>AC {10 + getModifier(char.dex_score)}</span>
          <span>PB +{getProficiencyBonus(char.level)}</span>
        </div>
      </div>
    </motion.div>
  )
}

export function Dashboard() {
  const [chars, setChars] = useState<Character[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    listCharacters()
      .then(setChars)
      .catch(e => setError(e.message))
  }, [])

  return (
    <div className="min-h-screen bg-tov-bg">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold gold-text leading-tight">
              ⚔ Tales of the Valiant
            </h1>
            <p className="text-tov-textMuted mt-1 text-lg">Character Compendium</p>
          </div>
          <GoldButton size="lg" onClick={() => navigate('/create')}>
            + Create Character
          </GoldButton>
        </div>

        {error && (
          <div className="bg-tov-error/10 border border-tov-error rounded-xl p-4 mb-6 text-tov-error text-sm">
            ⚠️ Could not connect to backend: {error}. Make sure the server is running.
          </div>
        )}

        {chars === null && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-tov-surface border border-tov-border rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-tov-card rounded w-3/4 mb-3" />
                <div className="h-3 bg-tov-card rounded w-1/2 mb-4" />
                <div className="h-2 bg-tov-card rounded w-full mb-1" />
                <div className="h-2 bg-tov-card rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {chars && chars.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-4">⚜️</div>
            <h2 className="text-2xl font-bold text-tov-text mb-2">No adventurers yet</h2>
            <p className="text-tov-textMuted mb-8 max-w-md mx-auto">
              The tavern is quiet. The quest board is empty. Your legend awaits — forge your first character and begin your tale.
            </p>
            <GoldButton size="lg" onClick={() => navigate('/create')}>
              ⚔ Begin Your Tale
            </GoldButton>
          </motion.div>
        )}

        {chars && chars.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chars.map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CharacterCard char={char} onClick={() => navigate(`/characters/${char.id}`)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
