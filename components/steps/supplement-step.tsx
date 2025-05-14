import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface SupplementStepProps {
  selected?: string[]
  onChange: (selected: string[]) => void
}

const supplements = [
  { id: "whey", label: "Whey Isolado" },
  { id: "creatine", label: "Creatina" },
  { id: "collagen", label: "Colágeno Hidrolisado" },
]

export default function SupplementStep({ selected = [], onChange }: SupplementStepProps) {
  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">Which supplements do you consume?</h3>
        <p className="text-sm text-muted-foreground">Select all that apply</p>
      </div>

      <div className="space-y-4">
        {supplements.map((supplement) => (
          <div key={supplement.id} className="flex items-center space-x-2">
            <Checkbox
              id={supplement.id}
              checked={selected.includes(supplement.id)}
              onCheckedChange={() => handleToggle(supplement.id)}
            />
            <Label
              htmlFor={supplement.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {supplement.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
