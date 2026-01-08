"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Zap } from "lucide-react"
import { calculateSalary, formatCurrency, type SalaryInputs } from "@/lib/salary-calculator"

interface WhatIfCalculatorProps {
  baseInputs: SalaryInputs
  baseCalculation: any
  isAmharic: boolean
}

export function WhatIfCalculator({ baseInputs, baseCalculation, isAmharic }: WhatIfCalculatorProps) {
  const [salaryMultiplier, setSalaryMultiplier] = useState([100])
  const [allowanceMultiplier, setAllowanceMultiplier] = useState([100])
  const [overtimeHours, setOvertimeHours] = useState([0])

  // Memoize what-if calculations to prevent excessive re-computations
  const whatIfInputs = useMemo((): SalaryInputs => ({
    ...baseInputs,
    grossSalary: (baseInputs.grossSalary * salaryMultiplier[0]) / 100,
    transportAllowance: (baseInputs.transportAllowance * allowanceMultiplier[0]) / 100,
    housingAllowance: (baseInputs.housingAllowance * allowanceMultiplier[0]) / 100,
    medicalAllowance: (baseInputs.medicalAllowance * allowanceMultiplier[0]) / 100,
    overtimePay: (baseInputs.grossSalary / (30 * 8)) * overtimeHours[0] * 1.5, // Assuming 1.5x rate
  }), [baseInputs, salaryMultiplier, allowanceMultiplier, overtimeHours])

  const whatIfCalculation = useMemo(() => calculateSalary(whatIfInputs), [whatIfInputs])

  // Memoize difference calculations
  const differences = useMemo(() => {
    const netSalaryDiff = whatIfCalculation.netSalary - baseCalculation.netSalary
    const netSalaryPercent = baseCalculation.netSalary > 0 ? (netSalaryDiff / baseCalculation.netSalary) * 100 : 0
    const taxDiff = whatIfCalculation.incomeTax - baseCalculation.incomeTax
    const taxPercent = baseCalculation.incomeTax > 0 ? (taxDiff / baseCalculation.incomeTax) * 100 : 0
    
    return { netSalaryDiff, netSalaryPercent, taxDiff, taxPercent }
  }, [whatIfCalculation, baseCalculation])

  const { netSalaryDiff, netSalaryPercent, taxDiff, taxPercent } = differences

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {isAmharic ? "ምን ቢሆን ካልኩሌተር" : "What-If Calculator"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Salary Adjustment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{isAmharic ? "የደመወዝ ለውጥ" : "Salary Adjustment"}</Label>
            <Badge variant="outline">{salaryMultiplier[0]}%</Badge>
          </div>
          <Slider
            value={salaryMultiplier}
            onValueChange={setSalaryMultiplier}
            min={50}
            max={200}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50%</span>
            <span>100% ({isAmharic ? "አሁን" : "Current"})</span>
            <span>200%</span>
          </div>
        </div>

        {/* Allowance Adjustment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{isAmharic ? "የአበል ለውጥ" : "Allowance Adjustment"}</Label>
            <Badge variant="outline">{allowanceMultiplier[0]}%</Badge>
          </div>
          <Slider
            value={allowanceMultiplier}
            onValueChange={setAllowanceMultiplier}
            min={0}
            max={200}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100% ({isAmharic ? "አሁን" : "Current"})</span>
            <span>200%</span>
          </div>
        </div>

        {/* Overtime Hours */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{isAmharic ? "ተጨማሪ ሰዓቶች (በወር)" : "Overtime Hours (Monthly)"}</Label>
            <Badge variant="outline">{overtimeHours[0]}h</Badge>
          </div>
          <Slider value={overtimeHours} onValueChange={setOvertimeHours} min={0} max={80} step={4} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0h</span>
            <span>40h</span>
            <span>80h</span>
          </div>
        </div>

        <Separator />

        {/* Results Comparison */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {isAmharic ? "የተጽዕኖ ትንተና" : "Impact Analysis"}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Current vs What-If Net Salary */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{isAmharic ? "አሁን" : "Current"}</p>
              <p className="font-semibold">{formatCurrency(baseCalculation.netSalary)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{isAmharic ? "ምን ቢሆን" : "What-If"}</p>
              <p className="font-semibold text-primary">{formatCurrency(whatIfCalculation.netSalary)}</p>
            </div>
          </div>

          {/* Net Salary Change */}
          <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
            <span className="text-sm font-medium">{isAmharic ? "የተጣራ ደመወዝ ለውጥ" : "Net Salary Change"}</span>
            <div className="text-right">
              <p className={`font-semibold ${netSalaryDiff >= 0 ? "text-green-600" : "text-red-600"}`}>
                {netSalaryDiff >= 0 ? "+" : ""}
                {formatCurrency(netSalaryDiff)}
              </p>
              <p className={`text-xs ${netSalaryPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                {netSalaryPercent >= 0 ? "+" : ""}
                {netSalaryPercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Tax Change */}
          <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
            <span className="text-sm font-medium">{isAmharic ? "የታክስ ለውጥ" : "Tax Change"}</span>
            <div className="text-right">
              <p className={`font-semibold ${taxDiff >= 0 ? "text-red-600" : "text-green-600"}`}>
                {taxDiff >= 0 ? "+" : ""}
                {formatCurrency(taxDiff)}
              </p>
              <p className={`text-xs ${taxPercent >= 0 ? "text-red-600" : "text-green-600"}`}>
                {taxPercent >= 0 ? "+" : ""}
                {taxPercent.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Annual Impact */}
          <div className="p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
            <p className="text-sm font-medium mb-1">{isAmharic ? "ዓመታዊ ተጽዕኖ" : "Annual Impact"}</p>
            <p className="text-lg font-bold text-primary">
              {netSalaryDiff >= 0 ? "+" : ""}
              {formatCurrency(netSalaryDiff * 12)}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAmharic ? "በዓመት ተጨማሪ/ቅናሽ" : "Additional/Reduction per year"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
