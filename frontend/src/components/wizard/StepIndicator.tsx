import { WIZARD_STEPS, STEP_LABELS, WizardStep } from './reducer'

interface Props {
  currentStep: WizardStep
}

export function StepIndicator({ currentStep }: Props) {
  const currentIdx = WIZARD_STEPS.indexOf(currentStep)

  return (
    <div className="flex items-center justify-between w-full mb-8">
      {WIZARD_STEPS.map((step, idx) => {
        const isDone = idx < currentIdx
        const isCurrent = idx === currentIdx

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                ${isCurrent
                  ? 'bg-tov-gold border-tov-gold text-tov-bg shadow-gold'
                  : isDone
                    ? 'bg-tov-gold/40 border-tov-gold/40 text-tov-gold'
                    : 'bg-transparent border-tov-border text-tov-textMuted'
                }
              `}>
                {isDone ? '✓' : idx + 1}
              </div>
              <span className={`
                mt-1 text-xs hidden sm:block transition-colors duration-300
                ${isCurrent ? 'text-tov-gold font-semibold' : isDone ? 'text-tov-gold/60' : 'text-tov-textMuted'}
              `}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-2 mt-[-16px] transition-all duration-300
                ${idx < currentIdx ? 'bg-tov-gold/40' : 'bg-tov-border'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}
