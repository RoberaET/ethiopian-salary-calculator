"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Target, Calculator } from "lucide-react"
import { calculateRequiredGrossSalary, formatCurrency, type SalaryInputs } from "@/lib/salary-calculator"

interface SalaryNegotiationModeProps {
  inputs: SalaryInputs
  onGrossSalaryChange: (grossSalary: number) => void
  isAmharic: boolean
}

export function SalaryNegotiationMode({ inputs, onGrossSalaryChange, isAmharic }: SalaryNegotiationModeProps) {
  const [isNegotiationMode, setIsNegotiationMode] = useState(false)
  const [desiredNetSalary, setDesiredNetSalary] = useState(20000)
  const [calculatedGrossSalary, setCalculatedGrossSalary] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    if (isNegotiationMode && desiredNetSalary > 0) {
      setIsCalculating(true)
      const timer = setTimeout(() => {
        const allowancesOnly = {
          ...inputs,
          grossSalary: 0, // Will be calculated
        }
        const requiredGross = calculateRequiredGrossSalary(desiredNetSalary, allowancesOnly)
        setCalculatedGrossSalary(requiredGross)
        setIsCalculating(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [desiredNetSalary, inputs, isNegotiationMode])

  const applyCalculatedSalary = () => {
    onGrossSalaryChange(calculatedGrossSalary)
    setIsNegotiationMode(false)
  }

  const difference = calculatedGrossSalary - inputs.grossSalary
  const percentageIncrease = inputs.grossSalary > 0 ? (difference / inputs.grossSalary) * 100 : 0

  return (
    <Card className="border-secondary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-secondary" />
            {isAmharic ? "የደመወዝ ድርድር ሁነታ" : "Salary Negotiation Mode"}
          </CardTitle>
          <Switch checked={isNegotiationMode} onCheckedChange={setIsNegotiationMode} />
        </div>
      </CardHeader>
      {isNegotiationMode && (
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="desired-net-salary">
              {isAmharic ? "የሚፈለግ የተጣራ ደመወዝ (ብር)" : "Desired Net Salary (ETB)"}
            </Label>
            <Input
              id="desired-net-salary"
              type="number"
              value={desiredNetSalary}
              onChange={(e) => setDesiredNetSalary(Number(e.target.value))}
              className="text-lg font-semibold"
              placeholder="20,000"
              min="0"
            />
          </div>

          {calculatedGrossSalary > 0 && !isCalculating && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {isAmharic ? "የሚያስፈልግ ጠቅላላ ደመወዝ" : "Required Gross Salary"}
                  </span>
                  <Badge variant="secondary">{formatCurrency(calculatedGrossSalary)}</Badge>
                </div>

                {difference !== 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{isAmharic ? "ከአሁኑ ደመወዝ ልዩነት" : "Difference from Current"}</span>
                      <span className={difference > 0 ? "text-green-600" : "text-red-600"}>
                        {difference > 0 ? "+" : ""}
                        {formatCurrency(difference)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{isAmharic ? "መቶኛ ለውጥ" : "Percentage Change"}</span>
                      <span className={percentageIncrease > 0 ? "text-green-600" : "text-red-600"}>
                        {percentageIncrease > 0 ? "+" : ""}
                        {percentageIncrease.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={applyCalculatedSalary} className="flex-1">
                  <Calculator className="h-4 w-4 mr-2" />
                  {isAmharic ? "ይህንን ደመወዝ ተጠቀም" : "Use This Salary"}
                </Button>
                <Button variant="outline" onClick={() => setIsNegotiationMode(false)}>
                  {isAmharic ? "ሰርዝ" : "Cancel"}
                </Button>
              </div>

              {percentageIncrease > 20 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {isAmharic
                      ? "ይህ ከ20% በላይ ጭማሪ ነው። በድርድር ጊዜ ተጨማሪ ጥቅሞችን ወይም ደረጃ ለደረጃ ጭማሪን ያስቡ።"
                      : "This is over 20% increase. Consider negotiating additional benefits or phased increases."}
                  </p>
                </div>
              )}
            </div>
          )}

          {isCalculating && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">{isAmharic ? "እያሰላ..." : "Calculating..."}</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
