"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Clock, Plus, Trash2 } from "lucide-react"

interface OvertimeCalculatorProps {
  baseSalary: number
  overtimePay: number
  onOvertimeChange: (amount: number) => void
  isAmharic: boolean
}

// Define the rates with their descriptions
const OVERTIME_RATES = [
  { value: "1.5", label: "Normal Hrs (5:30 PM - 10 PM)", amharicLabel: "መደበኛ (11:30 - 4:00)" },
  { value: "1.75", label: "Night Hrs (10 PM - 6 AM)", amharicLabel: "የሌሊት (4:00 - 12:00)" },
  { value: "2.0", label: "Weekends", amharicLabel: "የሳምንት ቀናት" },
  { value: "2.5", label: "Public Holidays", amharicLabel: "የህዝብ በዓላት" },
]

interface OvertimeEntry {
  id: string
  hours: number
  rate: string
}

export function OvertimeCalculator({ baseSalary, overtimePay, onOvertimeChange, isAmharic }: OvertimeCalculatorProps) {
  const [entries, setEntries] = useState<OvertimeEntry[]>([
    { id: "1", hours: 0, rate: "1.5" }
  ])

  // Hourly rate calculation: Base Salary / 30 days / 8 hours
  const hourlyRate = baseSalary / (30 * 8)

  // Calculate total overtime pay whenever entries change
  useEffect(() => {
    const total = entries.reduce((sum, entry) => {
      const multiplier = Number.parseFloat(entry.rate)
      return sum + (entry.hours * hourlyRate * multiplier)
    }, 0)

    // Only trigger update if the value is different (to avoid infinite loops if not handled by parent)
    // But since parent likely just sets state, it's fine. 
    // Ideally we debounce or check against current prop, but this is simple enough.
    if (Math.abs(total - overtimePay) > 0.01) {
      onOvertimeChange(total)
    }
  }, [entries, hourlyRate, onOvertimeChange, overtimePay])

  const addEntry = () => {
    setEntries([...entries, { id: Math.random().toString(36).substr(2, 9), hours: 0, rate: "1.5" }])
  }

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id))
    } else {
      // If it's the last one, just reset it
      setEntries([{ ...entries[0], hours: 0 }])
    }
  }

  const updateEntry = (id: string, field: keyof OvertimeEntry, value: any) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ))
  }

  return (
    <Card className="bg-black/20 border-white/10 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            {isAmharic ? "ተጨማሪ ሰዓት ስሌት" : "Overtime Calculator"}
          </CardTitle>
          <Button
            onClick={addEntry}
            size="sm"
            variant="outline"
            className="h-8 border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            {isAmharic ? "አክል" : "Add"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={entry.id} className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-end animate-in fade-in slide-in-from-top-1 duration-200 border-b border-white/5 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0 sm:border-0 sm:pb-0 sm:mb-2">
              <div className="grid grid-cols-2 gap-2 sm:col-span-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs text-gray-400 mb-1.5 block sm:hidden">
                    {isAmharic ? "ሰዓት" : "Hours"}
                  </label>
                  <Label className="text-xs text-gray-400 mb-1.5 hidden sm:block">
                    {index === 0 ? (isAmharic ? "ሰዓት" : "Hours") : ""}
                  </Label>
                  <Input
                    type="number"
                    value={entry.hours || ""}
                    onChange={(e) => updateEntry(entry.id, "hours", Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.5"
                    className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 h-9"
                  />
                </div>
              </div>

              <div className="sm:col-span-8">
                <Label className="text-xs text-gray-400 mb-1.5 block sm:hidden">
                  {isAmharic ? "መጠን" : "Rate Type"}
                </Label>
                <Label className="text-xs text-gray-400 mb-1.5 hidden sm:block">
                  {index === 0 ? (isAmharic ? "መጠን" : "Rate Type") : ""}
                </Label>
                <Select
                  value={entry.rate}
                  onValueChange={(val) => updateEntry(entry.id, "rate", val)}
                >
                  <SelectTrigger className="bg-black/40 border-white/10 text-white h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OVERTIME_RATES.map((rate) => (
                      <SelectItem key={rate.value} value={rate.value}>
                        <span className="font-medium mr-2">{rate.value}x</span>
                        <span className="text-muted-foreground text-xs">
                          {isAmharic ? rate.amharicLabel : rate.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end sm:col-span-1">
                <Button
                  onClick={() => removeEntry(entry.id)}
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                  disabled={entries.length === 1 && entries[0].hours === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {overtimePay > 0 && (
          <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{isAmharic ? "የሰዓት ክፍያ" : "Hourly Rate"}:</span>
              <span>{hourlyRate.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between items-center bg-primary/10 p-2.5 rounded-lg border border-primary/20">
              <span className="text-sm font-medium text-primary/80">
                {isAmharic ? "ጠቅላላ የምርፍ ሰዓት ክፍያ" : "Total Overtime Pay"}
              </span>
              <span className="text-lg font-bold text-primary">
                {overtimePay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal opacity-70">ETB</span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
