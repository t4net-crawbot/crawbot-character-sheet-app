import { WizardState } from '../reducer'

interface Props {
  state: WizardState
  onChange: (field: keyof Pick<WizardState, 'personalityTraits' | 'ideals' | 'bonds' | 'flaws' | 'backstory'>, value: string) => void
}

const PLACEHOLDERS = {
  backstory: "Describe your character's history — where they came from, what shaped them, and what drove them to adventure. Every scar has a story, and every dream a reason.",
  personalityTraits: "e.g., \"I always have a plan for what to do when things go wrong\" or \"I'm haunted by memories of war. I wake in cold sweats and can't get the images of violence out of my mind.\"",
  ideals: "e.g., \"Greater Good — It is each person's responsibility to make the most happiness for the whole tribe.\" or \"Independence — I must prove that I can handle myself without the coddling of my family.\"",
  bonds: "e.g., \"I will face any challenge to win the approval of my family.\" or \"My city, village, or island is the most important place in the world to me.\"",
  flaws: "e.g., \"I have a weakness for the vices of the city, especially gambling.\" or \"I have trouble keeping my true feelings hidden. My sharp tongue lands me in trouble.\"",
}

interface FieldProps {
  label: string
  field: keyof typeof PLACEHOLDERS
  value: string
  onChange: (v: string) => void
  tall?: boolean
}

function StoryField({ label, field, value, onChange, tall }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-tov-gold mb-2">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={PLACEHOLDERS[field]}
        rows={tall ? 5 : 3}
        className="w-full bg-tov-surface border border-tov-border rounded-xl px-4 py-3 text-tov-text text-sm placeholder-tov-textMuted/50 resize-none focus:outline-none focus:border-tov-gold transition-colors duration-200"
      />
    </div>
  )
}

export function StoryStep({ state, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-tov-text mb-1">Your Story</h2>
        <p className="text-tov-textMuted text-sm mb-4">
          Give your character life beyond the numbers. These details make your hero memorable and help guide their decisions at the table.
        </p>
      </div>

      <StoryField label="Backstory" field="backstory" value={state.backstory} onChange={v => onChange('backstory', v)} tall />

      <div>
        <label className="block text-sm font-semibold text-tov-gold mb-2">Name</label>
        <p className="text-tov-textMuted text-xs mb-2">What do they call you?</p>
        {/* Name field is in the parent wizard, just show a reminder */}
        <div className="text-tov-textMuted text-xs italic bg-tov-surface rounded-lg px-3 py-2 border border-tov-border">
          Tip: Your character's name can be set on the Review step if you haven't chosen one yet.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StoryField label="Personality Traits" field="personalityTraits" value={state.personalityTraits} onChange={v => onChange('personalityTraits', v)} />
        <StoryField label="Ideals" field="ideals" value={state.ideals} onChange={v => onChange('ideals', v)} />
        <StoryField label="Bonds" field="bonds" value={state.bonds} onChange={v => onChange('bonds', v)} />
        <StoryField label="Flaws" field="flaws" value={state.flaws} onChange={v => onChange('flaws', v)} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-tov-gold mb-2">Alignment</label>
        <div className="grid grid-cols-3 gap-2">
          {['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'].map(a => (
            <button
              key={a}
              onClick={() => onChange('alignment' as any, a)}
              className={`px-2 py-2 rounded-lg text-xs border transition-all duration-200
                ${(state as any).alignment === a
                  ? 'border-tov-gold bg-tov-gold/10 text-tov-gold'
                  : 'border-tov-border bg-tov-surface text-tov-textMuted hover:border-tov-gold/50'
                }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
