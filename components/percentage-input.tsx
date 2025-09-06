"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, Percent } from "lucide-react"
import { calculateIncomeTax } from "@/lib/salary-calculator"

interface PercentageInputProps {
  label: string
  amount: number
  percentage: number
  isTaxable: boolean
  onAmountChange: (amount: number) => void
  onPercentageChange: (percentage: number) => void
  onTaxableChange: (taxable: boolean) => void
  baseSalary: number
  isAmharic: boolean
  placeholder?: string
  className?: string
}

export function PercentageInput({
  label,
  amount,
  percentage,
  isTaxable,
  onAmountChange,
  onPercentageChange,
  onTaxableChange,
  baseSalary,
  isAmharic,
  placeholder = "0",
  className = "",
}: PercentageInputProps) {
  const [isPercentageMode, setIsPercentageMode] = useState(false)
  const [customPercentage, setCustomPercentage] = useState("")

  const presetPercentages = [5, 10, 15]

  const handlePresetPercentage = (preset: number) => {
    const calculatedAmount = (baseSalary * preset) / 100
    onPercentageChange(preset)
    onAmountChange(calculatedAmount)
    setIsPercentageMode(true)
  }

  const handleCustomPercentage = () => {
    const customPercent = parseFloat(customPercentage)
    if (!isNaN(customPercent) && customPercent >= 0 && customPercent <= 100) {
      const calculatedAmount = (baseSalary * customPercent) / 100
      onPercentageChange(customPercent)
      onAmountChange(calculatedAmount)
      setIsPercentageMode(true)
    }
  }

  const handleAmountChange = (value: string) => {
    const numValue = Number(value)
    onAmountChange(numValue)
    
    // Calculate percentage based on amount
    if (baseSalary > 0) {
      const calculatedPercentage = (numValue / baseSalary) * 100
      onPercentageChange(calculatedPercentage)
    }
  }

  const toggleMode = () => {
    setIsPercentageMode(!isPercentageMode)
    if (!isPercentageMode) {
      // Switching to percentage mode - calculate percentage from current amount
      if (baseSalary > 0) {
        const calculatedPercentage = (amount / baseSalary) * 100
        onPercentageChange(calculatedPercentage)
      }
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <Label htmlFor={`${label.toLowerCase().replace(/\s+/g, '-')}-taxable`} className="text-xs text-muted-foreground">
            {isAmharic ? "ታክስ" : "Taxable"}
          </Label>
          <Switch
            id={`${label.toLowerCase().replace(/\s+/g, '-')}-taxable`}
            checked={isTaxable}
            onCheckedChange={onTaxableChange}
          />
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isPercentageMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsPercentageMode(true)}
          className="flex items-center gap-1"
        >
          <Percent className="h-3 w-3" />
          {isAmharic ? "በመቶኛ" : "Percentage"}
        </Button>
        <Button
          type="button"
          variant={!isPercentageMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsPercentageMode(false)}
          className="flex items-center gap-1"
        >
          <Calculator className="h-3 w-3" />
          {isAmharic ? "በመጠን" : "Amount"}
        </Button>
      </div>

      {isPercentageMode ? (
        <div className="space-y-3">
          {/* Preset Percentage Buttons */}
          <div className="flex gap-2 flex-wrap">
            {presetPercentages.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={percentage === preset ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetPercentage(preset)}
                className="flex-1 min-w-0"
              >
                {preset}%
              </Button>
            ))}
          </div>

          {/* Custom Percentage Input */}
          <div className="flex gap-2">
            <Input
              type="number"
              value={customPercentage}
              onChange={(e) => setCustomPercentage(e.target.value)}
              placeholder={isAmharic ? "ብጁ መቶኛ" : "Custom %"}
              min="0"
              max="100"
              step="0.1"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleCustomPercentage}
              disabled={!customPercentage || isNaN(parseFloat(customPercentage))}
              size="sm"
            >
              {isAmharic ? "አመልክት" : "Apply"}
            </Button>
          </div>

          {/* Calculated Amount Display */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAmharic ? "የተሰላ መጠን" : "Calculated Amount"}
                </span>
                <span className="font-semibold">
                  {amount.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>
                  {isAmharic ? "የመሰረታዊ ደመወዝ" : "Base Salary"}: {baseSalary.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                </span>
                <span>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              
              {/* Tax Calculation for Taxable Allowances */}
              {isTaxable && amount > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {isAmharic ? "የታክስ ስሌት" : "Tax Calculation"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isAmharic ? "በዚህ አበል ላይ" : "On this allowance"}
                      </span>
                    </div>
                    
                    {/* Taxable Income */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {isAmharic ? "የታክስ የሚከፈልበት ገቢ" : "Taxable Income"}
                      </span>
                      <span className="font-medium">
                        {amount.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                      </span>
                    </div>
                    
                    {/* Tax Amount */}
                    {(() => {
                      const taxCalculation = calculateIncomeTax(amount)
                      return (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {isAmharic ? "የታክስ መጠን" : "Tax Amount"}
                          </span>
                          <span className="font-semibold text-destructive">
                            -{taxCalculation.totalTax.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                          </span>
                        </div>
                      )
                    })()}
                    
                    {/* Net Allowance After Tax */}
                    {(() => {
                      const taxCalculation = calculateIncomeTax(amount)
                      const netAllowance = amount - taxCalculation.totalTax
                      return (
                        <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-border">
                          <span className="text-primary">
                            {isAmharic ? "ከታክስ በኋላ የተጣራ አበል" : "Net Allowance After Tax"}
                          </span>
                          <span className="text-primary">
                            {netAllowance.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                          </span>
                        </div>
                      )
                    })()}
                    
                    {/* Tax Rate */}
                    {(() => {
                      const taxCalculation = calculateIncomeTax(amount)
                      const effectiveTaxRate = amount > 0 ? (taxCalculation.totalTax / amount) * 100 : 0
                      return (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {isAmharic ? "ውጤታማ ታክስ መጠን" : "Effective Tax Rate"}
                          </span>
                          <span>
                            {effectiveTaxRate.toFixed(1)}%
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={placeholder}
            min="0"
          />
          
          {/* Calculated Amount Display for Amount Mode */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {isAmharic ? "የተሰላ መጠን" : "Calculated Amount"}
                </span>
                <span className="font-semibold">
                  {amount.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>
                  {isAmharic ? "የመሰረታዊ ደመወዝ" : "Base Salary"}: {baseSalary.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                </span>
                <span>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              
              {/* Tax Calculation for Taxable Allowances */}
              {isTaxable && amount > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {isAmharic ? "የታክስ ስሌት" : "Tax Calculation"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isAmharic ? "በዚህ አበል ላይ" : "On this allowance"}
                      </span>
                    </div>
                    
                    {/* Taxable Income */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {isAmharic ? "የታክስ የሚከፈልበት ገቢ" : "Taxable Income"}
                      </span>
                      <span className="font-medium">
                        {amount.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                      </span>
                    </div>
                    
                    {/* Tax Amount */}
                    {(() => {
                      const taxCalculation = calculateIncomeTax(amount)
                      return (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {isAmharic ? "የታክስ መጠን" : "Tax Amount"}
                          </span>
                          <span className="font-semibold text-destructive">
                            -{taxCalculation.totalTax.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                          </span>
                        </div>
                      )
                    })()}
                    
                    {/* Net Allowance After Tax */}
                    {(() => {
                      const taxCalculation = calculateIncomeTax(amount)
                      const netAllowance = amount - taxCalculation.totalTax
                      return (
                        <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-border">
                          <span className="text-primary">
                            {isAmharic ? "ከታክስ በኋላ የተጣራ አበል" : "Net Allowance After Tax"}
                          </span>
                          <span className="text-primary">
                            {netAllowance.toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                          </span>
                        </div>
                      )
                    })()}
                    
                    {/* Tax Rate */}
                    {(() => {
                      const taxCalculation = calculateIncomeTax(amount)
                      const effectiveTaxRate = amount > 0 ? (taxCalculation.totalTax / amount) * 100 : 0
                      return (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {isAmharic ? "ውጤታማ ታክስ መጠን" : "Effective Tax Rate"}
                          </span>
                          <span>
                            {effectiveTaxRate.toFixed(1)}%
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
