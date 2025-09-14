"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react"
import { TAX_BRACKETS, formatCurrency, type SalaryCalculation } from "@/lib/salary-calculator"

interface TaxBracketVisualizationProps {
  calculation: SalaryCalculation
  isAmharic: boolean
}

export function TaxBracketVisualization({ calculation, isAmharic }: TaxBracketVisualizationProps) {
  const [hoveredBracket, setHoveredBracket] = useState<number | null>(null)

  // Find current tax bracket
  const currentBracketIndex = TAX_BRACKETS.findIndex((bracket) => {
    const bracketMax = bracket.max || Number.POSITIVE_INFINITY
    return calculation.taxableIncome >= bracket.min && calculation.taxableIncome <= bracketMax
  })

  // Calculate next bracket info
  const nextBracket = currentBracketIndex < TAX_BRACKETS.length - 1 ? TAX_BRACKETS[currentBracketIndex + 1] : null
  const distanceToNextBracket = nextBracket ? nextBracket.min - calculation.taxableIncome : 0

  // Calculate bracket widths for visualization (logarithmic scale for better display)
  const maxIncome = Math.max(calculation.taxableIncome, 50000) // Minimum scale
  const getBracketWidth = (bracket: (typeof TAX_BRACKETS)[0], index: number) => {
    if (index === TAX_BRACKETS.length - 1) return 15 // Last bracket gets fixed width
    const bracketSize = (bracket.max || maxIncome) - bracket.min + 1
    return Math.max(8, Math.min(25, (bracketSize / maxIncome) * 100))
  }

  // Color scheme for tax brackets
  const getBracketColor = (index: number, isActive: boolean, isHovered: boolean) => {
    const colors = [
      "bg-green-500", // 0% - Green (no tax)
      "bg-green-400", // 10% - Light green
      "bg-yellow-400", // 15% - Yellow
      "bg-orange-400", // 20% - Orange
      "bg-orange-500", // 25% - Dark orange
      "bg-red-400", // 30% - Light red
      "bg-red-600", // 35% - Dark red
    ]

    if (isHovered) return colors[index]?.replace("bg-", "bg-") + " opacity-80"
    if (isActive) return colors[index] + " ring-2 ring-primary"
    return colors[index] + " opacity-60"
  }

  const getTextColor = (index: number) => {
    return index === 0 ? "text-green-800" : index <= 2 ? "text-gray-800" : "text-white"
  }

  return (
    <div className="space-y-6">
      {/* Current Position Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {isAmharic ? "የታክስ ደረጃ ቦታ" : "Tax Bracket Position"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {currentBracketIndex >= 0 ? (TAX_BRACKETS[currentBracketIndex].rate * 100).toFixed(0) : "0"}%
              </p>
              <p className="text-sm text-muted-foreground">{isAmharic ? "የአሁን ደረጃ" : "Current Bracket"}</p>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <p className="text-2xl font-bold text-secondary">{formatCurrency(calculation.incomeTax)}</p>
              <p className="text-sm text-muted-foreground">{isAmharic ? "ጠቅላላ ታክስ" : "Total Tax"}</p>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <p className="text-2xl font-bold text-accent">
                {nextBracket ? formatCurrency(distanceToNextBracket) : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">{isAmharic ? "ወደ ቀጣይ ደረጃ" : "To Next Bracket"}</p>
            </div>
          </div>

          {/* Next Bracket Alert */}
          {nextBracket && distanceToNextBracket < 5000 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                {isAmharic
                  ? `${formatCurrency(distanceToNextBracket)} ብር ብቻ ወደ ${(nextBracket.rate * 100).toFixed(0)}% ታክስ ደረጃ`
                  : `Only ${formatCurrency(distanceToNextBracket)} away from ${(nextBracket.rate * 100).toFixed(0)}% tax bracket`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Tax Bracket Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {isAmharic ? "የታክስ ደረጃዎች ምስላዊ ማሳያ" : "Tax Brackets Visualization"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Horizontal Bar Visualization */}
          <div className="relative">
            <div className="flex items-center h-16 bg-gray-100 rounded-lg overflow-hidden">
              <TooltipProvider>
                {TAX_BRACKETS.map((bracket, index) => {
                  const width = getBracketWidth(bracket, index)
                  const isActive = index === currentBracketIndex
                  const isHovered = hoveredBracket === index
                  const taxDetail = calculation.taxBracketDetails.find((detail) => detail.bracket === bracket)

                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-full flex items-center justify-center cursor-pointer transition-all duration-200 ${getBracketColor(
                            index,
                            isActive,
                            isHovered,
                          )}`}
                          style={{ width: `${width}%` }}
                          onMouseEnter={() => setHoveredBracket(index)}
                          onMouseLeave={() => setHoveredBracket(null)}
                        >
                          <div className={`text-center ${getTextColor(index)}`}>
                            <div className="text-xs font-bold">{(bracket.rate * 100).toFixed(0)}%</div>
                            {isActive && <div className="text-xs">●</div>}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-semibold">{bracket.label}</p>
                          <p className="text-sm">
                            {isAmharic ? "ታክስ መጠን" : "Tax Rate"}: {(bracket.rate * 100).toFixed(0)}%
                          </p>
                          {taxDetail && (
                            <>
                              <p className="text-sm">
                                {isAmharic ? "የታክስ ገቢ" : "Taxable Amount"}: {formatCurrency(taxDetail.taxableAmount)}
                              </p>
                              <p className="text-sm">
                                {isAmharic ? "ታክስ" : "Tax"}: {formatCurrency(taxDetail.taxAmount)}
                              </p>
                            </>
                          )}
                          {isActive && (
                            <Badge variant="secondary" className="text-xs">
                              {isAmharic ? "የአሁን ደረጃ" : "Current Bracket"}
                            </Badge>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            </div>

            {/* Income Position Indicator */}
            <div className="mt-2 relative">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 ETB</span>
                <span>{formatCurrency(maxIncome)}+</span>
              </div>
              <div className="relative mt-1">
                <Progress value={(calculation.taxableIncome / maxIncome) * 100} className="h-2" />
                <div
                  className="absolute top-0 w-0.5 h-6 bg-primary transform -translate-x-0.5"
                  style={{ left: `${Math.min((calculation.taxableIncome / maxIncome) * 100, 100)}%` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                    {formatCurrency(calculation.taxableIncome)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Breakdown by Bracket */}
          <div className="space-y-3">
            <h4 className="font-semibold">{isAmharic ? "በደረጃ የታክስ ክፍፍል" : "Tax Breakdown by Bracket"}</h4>
            <div className="space-y-2">
              {calculation.taxBracketDetails.map((detail, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded ${getBracketColor(
                        TAX_BRACKETS.findIndex((b) => b === detail.bracket),
                        false,
                        false,
                      )}`}
                    />
                    <div>
                      <p className="text-sm font-medium">{detail.bracket.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAmharic ? "የታክስ ገቢ" : "Taxable"}: {formatCurrency(detail.taxableAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(detail.taxAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((detail.taxAmount / calculation.incomeTax) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Efficiency Insights */}
          <div className="space-y-3">
            <h4 className="font-semibold">{isAmharic ? "የታክስ ውጤታማነት ትንተና" : "Tax Efficiency Analysis"}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <p className="text-sm font-medium text-green-800">{isAmharic ? "ታክስ ነፃ ገቢ" : "Tax-Free Income"}</p>
                </div>
                <p className="text-lg font-bold text-green-700">{formatCurrency(600)}</p>
                <p className="text-xs text-green-600">{isAmharic ? "የመጀመሪያ 600 ብር" : "First 600 ETB"}</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <p className="text-sm font-medium text-blue-800">{isAmharic ? "አማካይ ታክስ መጠን" : "Average Tax Rate"}</p>
                </div>
                <p className="text-lg font-bold text-blue-700">{(calculation.effectiveTaxRate * 100).toFixed(1)}%</p>
                <p className="text-xs text-blue-600">{isAmharic ? "በጠቅላላ ገቢ ላይ" : "On total taxable income"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
