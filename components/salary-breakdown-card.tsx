"use client"

import { useState, type MouseEvent as ReactMouseEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, TrendingUp, Calendar, FileText } from "lucide-react"
import { formatCurrency, type SalaryCalculation, type SalaryInputs } from "@/lib/salary-calculator"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
// Custom 30-day month calendar system
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import CountUp from "@/components/count-up"

interface SalaryBreakdownCardProps {
  calculation: SalaryCalculation
  inputs: SalaryInputs
  isAmharic: boolean
}

export function SalaryBreakdownCard({ calculation, inputs, isAmharic }: SalaryBreakdownCardProps) {
  // Helper function to get deductible amount for each tax bracket
  const getDeductibleAmount = (bracket: { min: number; max: number | null; rate: number; label: string }): number => {
    if (bracket.min <= 2000) return 0
    if (bracket.min <= 4000) return 300
    if (bracket.min <= 7000) return 500
    if (bracket.min <= 10000) return 850
    if (bracket.min <= 14000) return 1350
    return 2050
  }
  const [isAnnualView, setIsAnnualView] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    allowances: true,
    deductions: false,
    taxBreakdown: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const multiplier = isAnnualView ? 12 : 1
  const periodLabel = isAnnualView ? (isAmharic ? "ዓመታዊ" : "Annual") : isAmharic ? "ወራዊ" : "Monthly"

  // Calculate savings rate (assuming some basic living expenses)
  const estimatedExpenses = Math.round((calculation.netSalary * 0.7) * 100) / 100 // Assume 70% for expenses
  const potentialSavings = Math.round((calculation.netSalary - estimatedExpenses) * 100) / 100
  const savingsRate = Math.round(((potentialSavings / calculation.netSalary) * 100) * 100) / 100
  const dailyGrossSalary = Math.round(((calculation.grossSalary + inputs.overtimePay) / 30) * 100) / 100
  const dailyTax = Math.round((calculation.incomeTax / 30) * 100) / 100
  const dailyNetIncome = Math.round((calculation.netSalary / 30) * 100) / 100

  // Values shown in the highlight metrics depend on Monthly vs Annual view
  const leftMetricValue = isAnnualView
    ? Math.round(((calculation.grossSalary + inputs.overtimePay) * 12) * 100) / 100
    : dailyGrossSalary
  const leftMetricLabel = isAnnualView
    ? (isAmharic ? "ዓመታዊ ጠቅላላ ክፍያ" : "Annual Gross Pay")
    : (isAmharic ? "የቀን ጠቅላላ ደመወዝ (÷30)" : "Daily Gross (÷30)")

  const middleMetricValue = isAnnualView ? Math.round((calculation.incomeTax * 12) * 100) / 100 : dailyTax
  const middleMetricLabel = isAnnualView
    ? (isAmharic ? "ዓመታዊ ታክስ" : "Annual Tax")
    : (isAmharic ? "የቀን ታክስ" : "Daily Tax")

  const rightMetricValue = isAnnualView ? Math.round(((calculation.netSalary * 12) / 30) * 100) / 100 : dailyNetIncome
  const rightMetricLabel = isAnnualView
    ? (isAmharic ? "ዓመታዊ የቀን የተጣራ ገቢ" : "Annual Net Daily Income")
    : (isAmharic ? "የቀን የተጣራ ደመወዝ (÷30)" : "Daily Net Income (÷30)")

  // Spotlight hover effect for top card
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  function handleMouseMove({ currentTarget, clientX, clientY }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }
  const background = useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(14, 165, 233, 0.15), transparent 80%)`

  // Custom 30-day month calendar system
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date(2018, 8, 4))
  
  // Set today as September 4th, 2018
  const today = new Date(2018, 8, 4) // Month is 0-indexed, so 8 = September
  
  // Calculate days left for salary (end of month = 30th)
  const currentDay = today.getDate()
  const daysLeftForSalary = Math.max(0, 30 - currentDay)
  
  // Get current month name
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const currentMonth = monthNames[today.getMonth()]

  return (
    <div className="space-y-6">
      {/* Period Toggle */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={!isAnnualView ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsAnnualView(false)}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            {isAmharic ? "ወራዊ" : "Monthly"}
          </Button>
          <Button
            variant={isAnnualView ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsAnnualView(true)}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            {isAmharic ? "ዓመታዊ" : "Annual"}
          </Button>
        </div>
      </div>

      {/* Current Date and Days Left for Salary */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {isAmharic 
              ? `ዛሬ: ${currentMonth} ${currentDay}, 2018 - ${daysLeftForSalary} ቀናት የተቀረው`
              : `Today: ${currentMonth} ${currentDay}, 2018 - ${daysLeftForSalary} days left for salary`
            }
          </span>
        </div>
      </div>

      {/* Net Salary Highlight with Spotlight hover */}
      <Card
        className="relative group overflow-hidden border-primary bg-gradient-to-r from-primary/5 to-secondary/5"
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-lg opacity-0 transition duration-300 group-hover:opacity-100"
          style={{ background }}
        />
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{periodLabel}</span>
          </div>
          <CardTitle className="text-4xl font-bold text-primary">
            <CountUp
              from={0}
              to={calculation.netSalary * multiplier}
              separator=","
              direction="up"
              duration={0.15}
              className="count-up-text"
            />
          </CardTitle>
          <p className="text-lg text-muted-foreground">{isAmharic ? "የተጣራ ደመወዝ" : "Net Take-Home Pay"}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-secondary">
                <CountUp
                  from={0}
                  to={leftMetricValue}
                  separator=","
                  direction="up"
                  duration={0.1}
                  delay={0.01}
                  className="count-up-text"
                />
              </p>
              <p className="text-xs text-muted-foreground">{leftMetricLabel}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-accent">
                <CountUp
                  from={0}
                  to={middleMetricValue}
                  separator=","
                  direction="up"
                  duration={0.1}
                  delay={0.02}
                  className="count-up-text"
                />
              </p>
              <p className="text-xs text-muted-foreground">{middleMetricLabel}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">
                <CountUp
                  from={0}
                  to={rightMetricValue}
                  separator=","
                  direction="up"
                  duration={0.1}
                  delay={0.03}
                  className="count-up-text"
                />
              </p>
              <p className="text-xs text-muted-foreground">{rightMetricLabel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {isAmharic ? "ዝርዝር የደመወዝ ስሌት" : "Detailed Salary Breakdown"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Gross Income Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-primary border-b pb-1">{isAmharic ? "ጠቅላላ ገቢ" : "Gross Income"}</h4>

            <div className="flex justify-between">
              <span>{isAmharic ? "መሰረታዊ ደመወዝ" : "Basic Salary"}</span>
              <span className="font-semibold">{formatCurrency(inputs.grossSalary * multiplier)}</span>
            </div>

            {/* Standard deduction is handled per-taxable allowance in the tax breakdown */}

            (
              <Collapsible open={expandedSections.allowances} onOpenChange={() => toggleSection("allowances")}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span>{isAmharic ? "ጠቅላላ አበሎች" : "Total Allowances"}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">
                        {formatCurrency(calculation.totalAllowances * multiplier)}
                      </span>
                      {expandedSections.allowances ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2 ml-4">
                  {inputs.transportAllowance > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {isAmharic ? "የትራንስፖርት አበል" : "Transport Allowance"}
                        {inputs.transportTaxable && (
                          <Badge variant="outline" className="text-xs">
                            {isAmharic ? "ታክስ" : "Taxable"}
                          </Badge>
                        )}
                      </span>
                      <span>{formatCurrency(inputs.transportAllowance * multiplier)}</span>
                    </div>
                  )}
                  {inputs.housingAllowance > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {isAmharic ? "የቤት አበል" : "Housing Allowance"}
                        {inputs.housingTaxable && (
                          <Badge variant="outline" className="text-xs">
                            {isAmharic ? "ታክስ" : "Taxable"}
                          </Badge>
                        )}
                      </span>
                      <span>{formatCurrency(inputs.housingAllowance * multiplier)}</span>
                    </div>
                  )}
                  {inputs.medicalAllowance > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {isAmharic ? "የህክምና አበል" : "Medical Allowance"}
                        {inputs.medicalTaxable && (
                          <Badge variant="outline" className="text-xs">
                            {isAmharic ? "ታክስ" : "Taxable"}
                          </Badge>
                        )}
                      </span>
                      <span>{formatCurrency(inputs.medicalAllowance * multiplier)}</span>
                    </div>
                  )}
                  {inputs.otherAllowances.map((allowance, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {allowance.name || `${isAmharic ? "ሌላ አበል" : "Other Allowance"} ${index + 1}`}
                        {allowance.taxable && (
                          <Badge variant="outline" className="text-xs">
                            {isAmharic ? "ታክስ" : "Taxable"}
                          </Badge>
                        )}
                      </span>
                      <span>{formatCurrency(allowance.amount * multiplier)}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )

            {inputs.overtimePay > 0 && (
              <div className="flex justify-between">
                <span>{isAmharic ? "ተጨማሪ ሰዓት ክፍያ" : "Overtime Pay"}</span>
                <span className="font-semibold text-secondary">{formatCurrency(inputs.overtimePay * multiplier)}</span>
              </div>
            )}

            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{isAmharic ? "ጠቅላላ ገቢ" : "Total Gross Income"}</span>
              <span>{formatCurrency(calculation.grossSalary * multiplier)}</span>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-destructive border-b pb-1">{isAmharic ? "ቅናሾች" : "Deductions"}</h4>

            {/* Tax Breakdown */}
            <Collapsible open={expandedSections.taxBreakdown} onOpenChange={() => toggleSection("taxBreakdown")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span>{isAmharic ? "የገቢ ታክስ" : "Income Tax"}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-destructive">
                      -{formatCurrency(calculation.incomeTax * multiplier)}
                    </span>
                    {expandedSections.taxBreakdown ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2 ml-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>{isAmharic ? "የታክስ ገቢ" : "Taxable Income"}:</span>
                    <span>{formatCurrency(calculation.taxableIncome * multiplier)}</span>
                  </div>
                  
                  <div className="space-y-1 pl-2 border-l-2 border-muted-foreground/20">
                    <p className="text-xs text-muted-foreground font-medium mb-2">
                      {isAmharic ? "የታክስ ስሌት ዝርዝር" : "Tax Calculation Breakdown"}
                    </p>
                    
                    {/* Step 1: Show taxable income calculation following the specific rules */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {isAmharic ? "1. መሰረታዊ ደመወዝ" : "1. Basic Salary"}: 
                        </span>
                        <span className="font-medium">{formatCurrency(inputs.grossSalary * multiplier)}</span>
                      </div>
                      
                      {/* House Allowance - With 600 ETB exemption if taxable toggle is ON */}
                      {inputs.housingAllowance > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground ml-2">
                            <span>
                              {isAmharic 
                                ? `+ የቤት አበል: ${formatCurrency(inputs.housingAllowance * multiplier)}` 
                                : `+ House Allowance: ${formatCurrency(inputs.housingAllowance * multiplier)}`
                              }
                            </span>
                            <span className="text-xs text-green-600">
                              {isAmharic ? "(ታክስ)" : "(taxable)"}
                            </span>
                          </div>
                          
                          {inputs.housingTaxable && (
                            <div className="flex justify-between text-xs text-muted-foreground ml-4">
                              <span>
                                {isAmharic 
                                  ? `- 600 ብር =` 
                                  : `- 600 ETB =`
                                }
                              </span>
                              <span className="font-medium">
                                {formatCurrency(Math.max(0, inputs.housingAllowance - 600) * multiplier)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Medical Allowance - With 600 ETB exemption if taxable toggle is ON */}
                      {inputs.medicalAllowance > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground ml-2">
                            <span>
                              {isAmharic 
                                ? `+ የህክምና አበል: ${formatCurrency(inputs.medicalAllowance * multiplier)}` 
                                : `+ Medical Allowance: ${formatCurrency(inputs.medicalAllowance * multiplier)}`
                              }
                            </span>
                            <span className="text-xs text-green-600">
                              {isAmharic ? "(ታክስ)" : "(taxable)"}
                            </span>
                          </div>
                          
                          {inputs.medicalTaxable && (
                            <div className="flex justify-between text-xs text-muted-foreground ml-4">
                              <span>
                                {isAmharic 
                                  ? `- 600 ብር =` 
                                  : `- 600 ETB =`
                                }
                              </span>
                              <span className="font-medium">
                                {formatCurrency(Math.max(0, inputs.medicalAllowance - 600) * multiplier)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Transportation Allowance - Always included with 600 Birr exemption */}
                      {inputs.transportAllowance > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground ml-2">
                            <span>
                              {isAmharic 
                                ? `+ የመጓጓዣ አበል: ${formatCurrency(inputs.transportAllowance * multiplier)}` 
                                : `+ Transportation Allowance: ${formatCurrency(inputs.transportAllowance * multiplier)}`
                              }
                            </span>
                            <span className="text-xs text-green-600">
                              {isAmharic ? "(ታክስ)" : "(taxable)"}
                            </span>
                          </div>
                          
                          {inputs.transportTaxable && (
                            <div className="flex justify-between text-xs text-muted-foreground ml-4">
                              <span>
                                {isAmharic 
                                  ? `- 600 ብር =` 
                                  : `- 600 ETB =`
                                }
                              </span>
                              <span className="font-medium">
                                {formatCurrency(Math.max(0, inputs.transportAllowance - 600) * multiplier)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Other Allowances - With 600 ETB exemption if taxable toggle is ON */}
                      {inputs.otherAllowances.map((allowance, index) => (
                        allowance.amount > 0 && (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground ml-2">
                              <span>
                                {isAmharic 
                                  ? `+ ${allowance.name}: ${formatCurrency(allowance.amount * multiplier)}` 
                                  : `+ ${allowance.name}: ${formatCurrency(allowance.amount * multiplier)}`
                                }
                              </span>
                              <span className="text-xs text-green-600">
                                {isAmharic ? "(ታክስ)" : "(taxable)"}
                              </span>
                            </div>
                            
                            {allowance.taxable && (
                              <div className="flex justify-between text-xs text-muted-foreground ml-4">
                                <span>
                                  {isAmharic 
                                    ? `- 600 ብር =` 
                                    : `- 600 ETB =`
                                  }
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(Math.max(0, allowance.amount - 600) * multiplier)}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      ))}
                      
                      <div className="flex justify-between text-xs font-medium">
                        <span>
                          {isAmharic ? "ጠቅላላ የታክስ የሚከፈልበት ገቢ" : "Total Taxable Income"}: 
                        </span>
                        <span>{formatCurrency(calculation.taxableIncome * multiplier)}</span>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground ml-2">
                        <span>
                          {isAmharic 
                            ? "= መሰረታዊ ደመወዝ + ሁሉም አበሎች - 600 ብር (ከታክስ የሚከፈሉ አበሎች)" 
                            : "= Basic Salary + All Allowances - 600 ETB (from each taxable allowance)"
                          }
                        </span>
                      </div>
                    </div>

                    {/* Step 2: Show tax calculation on remaining amount */}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium mt-2">
                        {isAmharic ? "2. በጠቅላላ የታክስ የሚከፈልበት ገቢ ላይ የታክስ ቅንጅት ስሌት" : "2. Tax bracket calculation on total taxable income"}
                      </p>
                      {calculation.taxBracketDetails.map((detail, index) => {
                        const taxableAmount = detail.taxableAmount * multiplier
                        const taxAmount = detail.taxAmount * multiplier
                        const rate = detail.bracket.rate
                        const ratePercent = (rate * 100).toFixed(0)
                        
                        // Skip the exempt bracket (0% rate)
                        if (rate === 0) return null
                        
                        // Get deductible amount for this bracket
                        const deductibleAmount = getDeductibleAmount(detail.bracket)
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{detail.bracket.label}:</span>
                              <span className="font-medium">{formatCurrency(taxableAmount)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground ml-2">
                              <span>
                                {isAmharic 
                                  ? `${formatCurrency(taxableAmount)} × ${ratePercent}% - ${formatCurrency(deductibleAmount * multiplier)} =` 
                                  : `${formatCurrency(taxableAmount)} × ${ratePercent}% - ${formatCurrency(deductibleAmount * multiplier)} =`
                                }
                              </span>
                              <span className="font-semibold text-destructive">
                                {formatCurrency(taxAmount)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="pt-2 border-t border-muted-foreground/20">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>{isAmharic ? "ጠቅላላ ታክስ" : "Total Tax"}:</span>
                        <span className="text-destructive">
                          {formatCurrency(calculation.incomeTax * multiplier)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-1">
            <div className="flex justify-between">
              <span>{isAmharic ? "የጡረታ አበል (7%)" : "Pension Contribution (7%)"}</span>
              <span className="font-semibold text-destructive">
                -{formatCurrency(calculation.pensionContribution * multiplier)}
              </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground ml-2">
                <span>
                  {isAmharic 
                    ? `${formatCurrency(inputs.grossSalary * multiplier)} × 7% =` 
                    : `${formatCurrency(inputs.grossSalary * multiplier)} × 7% =`
                  }
                </span>
                <span className="font-medium text-destructive">
                  {formatCurrency(calculation.pensionContribution * multiplier)}
                </span>
              </div>
            </div>

            {/* Other Deductions */}
            {(inputs.unionDues > 0 || inputs.loanDeductions.length > 0 || inputs.otherDeductions.length > 0) && (
              <Collapsible open={expandedSections.deductions} onOpenChange={() => toggleSection("deductions")}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span>{isAmharic ? "ሌሎች ቅናሾች" : "Other Deductions"}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-destructive">
                        -
                        {formatCurrency(
                          (inputs.unionDues +
                            inputs.loanDeductions.reduce((sum, loan) => sum + loan.amount, 0) +
                            inputs.otherDeductions.reduce((sum, deduction) => sum + deduction.amount, 0)) *
                            multiplier,
                        )}
                      </span>
                      {expandedSections.deductions ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2 ml-4">
                  {inputs.unionDues > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{isAmharic ? "የሰራተኛ ማህበር ክፍያ" : "Union Dues"}</span>
                      <span>{formatCurrency(inputs.unionDues * multiplier)}</span>
                    </div>
                  )}
                  {inputs.loanDeductions.map((loan, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{loan.name || `${isAmharic ? "ብድር" : "Loan"} ${index + 1}`}</span>
                      <span>{formatCurrency(loan.amount * multiplier)}</span>
                    </div>
                  ))}
                  {inputs.otherDeductions.map((deduction, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{deduction.name || `${isAmharic ? "ቅናሽ" : "Deduction"} ${index + 1}`}</span>
                      <span>{formatCurrency(deduction.amount * multiplier)}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{isAmharic ? "ጠቅላላ ቅናሾች" : "Total Deductions"}</span>
              <span className="text-destructive">-{formatCurrency(calculation.totalDeductions * multiplier)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Net Salary Calculation Breakdown */}
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-sm">{isAmharic ? "የተጣራ ደመወዝ ስሌት" : "Net Salary Calculation"}</h4>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isAmharic ? "ጠቅላላ ገቢ" : "Total Gross Income"}: 
                </span>
                <span>{formatCurrency(calculation.grossSalary * multiplier)}</span>
              </div>
              
              {inputs.overtimePay > 0 && (
                <div className="flex justify-between text-muted-foreground ml-2">
                  <span>
                    {isAmharic 
                      ? `+ ተጨማሪ ሰዓት ክፍያ: ${formatCurrency(inputs.overtimePay * multiplier)}` 
                      : `+ Overtime Pay: ${formatCurrency(inputs.overtimePay * multiplier)}`
                    }
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-muted-foreground ml-2">
                <span>
                  {isAmharic 
                    ? `- ጠቅላላ ቅናሾች: ${formatCurrency(calculation.totalDeductions * multiplier)}` 
                    : `- Total Deductions: ${formatCurrency(calculation.totalDeductions * multiplier)}`
                  }
                </span>
              </div>
              
              <div className="flex justify-between text-muted-foreground ml-2">
                <span>
                  {isAmharic 
                    ? "= የተጣራ ደመወዝ" 
                    : "= Net Salary"
                  }
                </span>
                <span className="font-semibold">
                  {formatCurrency(calculation.netSalary * multiplier)}
                </span>
              </div>
            </div>
          </div>

          {/* Final Net Salary */}
          <div className="flex justify-between text-xl font-bold bg-primary/10 p-4 rounded-lg">
            <span>{isAmharic ? "የተጣራ ደመወዝ" : "Net Salary"}</span>
            <span className="text-primary">{formatCurrency(calculation.netSalary * multiplier)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Financial Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {isAmharic ? "የገንዘብ ትንተና" : "Financial Insights"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tax Efficiency */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">{isAmharic ? "የታክስ ውጤታማነት" : "Tax Efficiency"}</span>
              <span className="text-sm font-semibold">{(100 - calculation.effectiveTaxRate * 100).toFixed(2)}%</span>
            </div>
            <Progress value={100 - calculation.effectiveTaxRate * 100} className="h-2" />
          </div>

          {/* Savings Potential */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">{isAmharic ? "የቁጠባ አቅም" : "Savings Potential"}</span>
              <span className="text-sm font-semibold">{savingsRate.toFixed(2)}%</span>
            </div>
            <Progress value={Math.max(0, savingsRate)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {isAmharic
                ? `በወር ${formatCurrency(potentialSavings)} ማቆየት ይችላሉ`
                : `Potential monthly savings: ${formatCurrency(potentialSavings)}`}
            </p>
          </div>

          {/* Take-home percentage */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">{isAmharic ? "የተጣራ ደመወዝ መቶኛ" : "Take-Home Percentage"}</span>
              <span className="text-sm font-semibold">
                {(
                  (calculation.netSalary / (calculation.grossSalary + inputs.overtimePay)) * 100
                ).toFixed(2)}
                %
              </span>
            </div>
            <Progress
              value={(calculation.netSalary / (calculation.grossSalary + inputs.overtimePay)) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
