interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex justify-center mt-4">
      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-8 rounded-full ${index + 1 <= currentStep ? "bg-purple-600" : "bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  )
}
