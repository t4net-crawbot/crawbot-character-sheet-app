import { useReducer, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { wizardReducer, INITIAL_STATE, WIZARD_STEPS } from './reducer'
import { StepIndicator } from './StepIndicator'
import { GoldButton } from '../ui/GoldButton'
import { LineageStep } from './steps/LineageStep'
import { ClassStep } from './steps/ClassStep'
import { BackgroundStep } from './steps/BackgroundStep'
import { StatsStep } from './steps/StatsStep'
import { TalentStep } from './steps/TalentStep'
import { StoryStep } from './steps/StoryStep'
import { ReviewStep } from './steps/ReviewStep'
import { getRules } from '../../api/client'
import { RulesClass, RulesLineage, RulesHeritage, RulesBackground } from '../../types/character'

export function Wizard() {
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_STATE)
  const [direction, setDirection] = useState(1)
  const [rules, setRules] = useState<{
    classes: RulesClass[]
    lineages: RulesLineage[]
    heritages: RulesHeritage[]
    backgrounds: RulesBackground[]
  } | null>(null)
  const [rulesError, setRulesError] = useState<string | null>(null)

  useEffect(() => {
    getRules()
      .then(setRules)
      .catch(e => setRulesError(e.message))
  }, [])

  const stepIdx = WIZARD_STEPS.indexOf(state.step)

  const canAdvance = () => {
    switch (state.step) {
      case 'LINEAGE': return !!state.lineage && !!state.heritage
      case 'CLASS': return !!state.className
      case 'BACKGROUND': return !!state.background && state.selectedSkills.length === (rules?.backgrounds.find(b => b.id === state.background)?.numSkillChoices ?? 2)
      case 'STATS': return true
      case 'TALENT': return !!state.talent
      case 'STORY': return true
      case 'REVIEW': return false
    }
  }

  const handleNext = () => {
    setDirection(1)
    dispatch({ type: 'NEXT' })
  }

  const handlePrev = () => {
    setDirection(-1)
    dispatch({ type: 'PREV' })
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  }

  if (rulesError) {
    return (
      <div className="min-h-screen bg-tov-bg flex items-center justify-center p-6">
        <div className="bg-tov-error/10 border border-tov-error rounded-xl p-6 text-center max-w-md">
          <div className="text-tov-error text-lg mb-2">⚠️ Failed to load rules</div>
          <div className="text-tov-textMuted text-sm">{rulesError}</div>
          <div className="text-tov-textMuted text-xs mt-2">Make sure the backend is running at localhost:8080</div>
        </div>
      </div>
    )
  }

  if (!rules) {
    return (
      <div className="min-h-screen bg-tov-bg flex items-center justify-center">
        <div className="text-tov-gold text-lg animate-pulse">Loading rules...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tov-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gold-text mb-1">⚜ Create Your Character</h1>
          <p className="text-tov-textMuted">Tales of the Valiant — Black Flag Roleplaying</p>
        </div>

        <StepIndicator currentStep={state.step} />

        <div className="bg-tov-surface rounded-2xl border border-tov-border p-6 min-h-[500px] relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={state.step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {state.step === 'LINEAGE' && (
                <LineageStep
                  lineage={state.lineage}
                  heritage={state.heritage}
                  lineages={rules.lineages}
                  heritages={rules.heritages}
                  onLineage={id => dispatch({ type: 'SET_LINEAGE', payload: id })}
                  onHeritage={id => dispatch({ type: 'SET_HERITAGE', payload: id })}
                />
              )}
              {state.step === 'CLASS' && (
                <ClassStep
                  selectedClass={state.className}
                  classes={rules.classes}
                  onSelect={id => dispatch({ type: 'SET_CLASS', payload: id })}
                />
              )}
              {state.step === 'BACKGROUND' && (
                <BackgroundStep
                  background={state.background}
                  selectedSkills={state.selectedSkills}
                  backgrounds={rules.backgrounds}
                  onBackground={id => dispatch({ type: 'SET_BACKGROUND', payload: id })}
                  onSkills={skills => dispatch({ type: 'SET_SKILLS', payload: skills })}
                />
              )}
              {state.step === 'STATS' && (
                <StatsStep
                  state={state}
                  onStatMethod={m => dispatch({ type: 'SET_STAT_METHOD', payload: m })}
                  onScore={(a, v) => dispatch({ type: 'SET_SCORE', payload: { ability: a, value: v } })}
                  onAssign={(a, v) => dispatch({ type: 'ASSIGN_STANDARD', payload: { ability: a, value: v } })}
                />
              )}
              {state.step === 'TALENT' && (
                <TalentStep
                  background={state.background}
                  talent={state.talent}
                  backgrounds={rules.backgrounds}
                  onTalent={t => dispatch({ type: 'SET_TALENT', payload: t })}
                />
              )}
              {state.step === 'STORY' && (
                <StoryStep
                  state={state}
                  onChange={(field, value) => dispatch({ type: 'SET_STORY', payload: { [field]: value } })}
                />
              )}
              {state.step === 'REVIEW' && (
                <ReviewStep
                  state={state}
                  onNameChange={name => dispatch({ type: 'SET_NAME', payload: name })}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {state.step !== 'REVIEW' && (
          <div className="flex justify-between mt-6">
            <GoldButton
              variant="secondary"
              onClick={handlePrev}
              disabled={stepIdx === 0}
            >
              ← Back
            </GoldButton>
            <GoldButton
              onClick={handleNext}
              disabled={!canAdvance()}
            >
              Continue →
            </GoldButton>
          </div>
        )}

        {state.step === 'REVIEW' && (
          <div className="flex justify-start mt-6">
            <GoldButton variant="secondary" onClick={handlePrev}>
              ← Back
            </GoldButton>
          </div>
        )}
      </div>
    </div>
  )
}
