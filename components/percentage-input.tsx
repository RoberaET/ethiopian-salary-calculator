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
    // Allow empty string to clear the input
    if (value === "") {
      onAmountChange(0)
      onPercentageChange(0)
      return
    }
    
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
              
              {/* Taxable Income After Exemption for Taxable Allowances */}
              {isTaxable && amount > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {isAmharic ? "የታክስ የሚከፈልበት ገቢ (ከ 600 ብር ነፃ ከሆነ በኋላ)" : "Taxable Income (after 600 ETB exempt)"}
                    </span>
                    <span className="font-medium text-primary">
                      {Math.max(0, amount - 600).toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                    </span>
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
            value={amount || ""}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={isAmharic ? "መጠን ያስገቡ" : "Enter amount"}
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
              
              {/* Taxable Income After Exemption for Taxable Allowances */}
              {isTaxable && amount > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {isAmharic ? "የታክስ የሚከፈልበት ገቢ (ከ 600 ብር ነፃ ከሆነ በኋላ)" : "Taxable Income (after 600 ETB exempt)"}
                    </span>
                    <span className="font-medium text-primary">
                      {Math.max(0, amount - 600).toLocaleString()} {isAmharic ? "ብር" : "ETB"}
                    </span>
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
