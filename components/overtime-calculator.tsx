"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock } from "lucide-react"

interface OvertimeCalculatorProps {
  baseSalary: number
  overtimePay: number
  onOvertimeChange: (amount: number) => void
  isAmharic: boolean
}

export function OvertimeCalculator({ baseSalary, overtimePay, onOvertimeChange, isAmharic }: OvertimeCalculatorProps) {
  const [overtimeHours, setOvertimeHours] = useState(0)
  const [overtimeRate, setOvertimeRate] = useState("1.5")

  const calculateOvertimePay = (hours: number, rate: string) => {
    const hourlyRate = baseSalary / (30 * 8) // Assuming 30 days, 8 hours per day
    const multiplier = Number.parseFloat(rate)
    return hours * hourlyRate * multiplier
  }

  const handleHoursChange = (hours: number) => {
    setOvertimeHours(hours)
    const calculatedPay = calculateOvertimePay(hours, overtimeRate)
    onOvertimeChange(calculatedPay)
  }

  const handleRateChange = (rate: string) => {
    setOvertimeRate(rate)
    const calculatedPay = calculateOvertimePay(overtimeHours, rate)
    onOvertimeChange(calculatedPay)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {isAmharic ? "ተጨማሪ ሰዓት ስሌት" : "Overtime Calculator"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="overtime-hours">{isAmharic ? "ተጨማሪ ሰዓቶች" : "Overtime Hours"}</Label>
            <Input
              id="overtime-hours"
              type="number"
              value={overtimeHours}
              onChange={(e) => handleHoursChange(Number(e.target.value))}
              placeholder="0"
              min="0"
              step="0.5"
            />
          </div>
          <div>
            <Label htmlFor="overtime-rate">{isAmharic ? "የተጨማሪ ሰዓት መጠን" : "Overtime Rate"}</Label>
            <Select value={overtimeRate} onValueChange={handleRateChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.5">1.5x {isAmharic ? "(መደበኛ)" : "(Standard)"}</SelectItem>
                <SelectItem value="2.0">2.0x {isAmharic ? "(በዓላት/ሌሊት)" : "(Holiday/Night)"}</SelectItem>
                <SelectItem value="2.5">2.5x {isAmharic ? "(ልዩ)" : "(Special)"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {overtimeHours > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span>{isAmharic ? "የሰዓት ክፍያ" : "Hourly Rate"}:</span>
              <span>{(baseSalary / (30 * 8)).toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{isAmharic ? "ተጨማሪ ሰዓት ክፍያ" : "Overtime Pay"}:</span>
              <span className="font-semibold text-primary">{overtimePay.toFixed(2)} ETB</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
