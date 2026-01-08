"use client"

import { useState, memo, useMemo, useCallback, type MouseEvent as ReactMouseEvent } from "react"
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
import { endOfMonth, differenceInCalendarDays } from "date-fns"
import CountUp from "@/components/count-up" // Custom animated counter

interface SalaryBreakdownCardProps {
  calculation: SalaryCalculation
  inputs: SalaryInputs
  isAmharic: boolean
  currency?: "ETB" | "USD"
  rate?: number
}

const SalaryBreakdownCard = memo(function SalaryBreakdownCard({ calculation, inputs, isAmharic, currency = "ETB", rate = 1 }: SalaryBreakdownCardProps) {
  // Helper to format currency based on selected currency
  const formatDisplayCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency === "ETB" ? "en-ET" : "en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount * rate)
  }

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

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const multiplier = isAnnualView ? 12 : 1
  const periodLabel = isAnnualView ? (isAmharic ? "ዓመታዊ" : "Annual") : isAmharic ? "ወራዊ" : "Monthly"

  // Memoize expensive calculations
  const financialMetrics = useMemo(() => {
    const estimatedExpenses = Math.round((calculation.netSalary * 0.7) * 100) / 100 // Assume 70% for expenses
    const potentialSavings = Math.round((calculation.netSalary - estimatedExpenses) * 100) / 100
    const savingsRate = Math.round(((potentialSavings / calculation.netSalary) * 100) * 100) / 100
    const dailyGrossSalary = Math.round(((calculation.grossSalary + inputs.overtimePay) / 30) * 100) / 100
    const dailyTax = Math.round((calculation.incomeTax / 30) * 100) / 100
    const dailyNetIncome = Math.round((calculation.netSalary / 30) * 100) / 100

    return { estimatedExpenses, potentialSavings, savingsRate, dailyGrossSalary, dailyTax, dailyNetIncome }
  }, [calculation.netSalary, calculation.grossSalary, calculation.incomeTax, inputs.overtimePay])

  const { estimatedExpenses, potentialSavings, savingsRate, dailyGrossSalary, dailyTax, dailyNetIncome } = financialMetrics

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

  // Use current date
  const today = new Date()

  // Calculate days left for salary (end of month = 30th)
  // In Ethiopia/General practice: if today is past 25th/30th, it might be for next month, but for simplicity:
  const lastDay = endOfMonth(today)
  const daysLeftForSalary = differenceInCalendarDays(lastDay, today)

  // Annual mode multiplier
  // If isAnnualView is true, we display annual values (x12)
  // But wait, the user asked to ONLY include currency conversion for:
  // "Net Take-Home Pay", "Daily Gross", "Daily Tax", "Daily Net Income"
  // "only inlcuding it for Annual card" -> This implies the user wants these specific stats to respect the currency toggle when in Annual mode?
  // Or implies that these stats are part of an "Annual card" or similar?
  // Let's look at the UI structure. The card has a toggle for Monthly/Annual.
  // When Annual is selected, `multiplier` becomes 12.
  // The user says "only inlcuding it for Annual card". This might mean they only want the currency conversion to apply when looking at the Annual view?
  // "the currency toggle doesnt convert the Net Take-Home Pay... sections only inlcuding it for Annual card"
  // This phrasing is tricky. "sections only inlcuding it for Annual card".
  // Maybe they mean "The sections Net Take-Home Pay, Daily Gross, etc. are NOT currently converting. Please make them convert."
  // And maybe "only inlcuding it for Annual card" means "Also make sure the Annual card specific stats convert"?
  // Actually, let's look at where these labels are.
  // "Net Take-Home Pay" corresponds to the big "Net Salary" display?
  // "Daily Gross", "Daily Tax" seem to be specific stats that might be in the "Financial Insights" or similar.
  // Let's look at `salary-breakdown-card.tsx` lines 700+ (Financial Insights).
  // I don't see "Daily Gross" in the previous view. I might need to scroll down or look for it.
  // Let's search for "Daily" in the file.

  // Get current month name
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Amharic month names
  const amharicMonthNames = [
    "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ",
    "ሐምሌ", "ነሐሴ", "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ"
  ]

  const currentMonth = monthNames[today.getMonth()]
  const currentAmharicMonth = amharicMonthNames[today.getMonth()]
  const currentYear = today.getFullYear()
  const displayDay = today.getDate()


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
              ? `ዛሬ: ${currentAmharicMonth} ${displayDay}, ${currentYear} - ${daysLeftForSalary} ቀናት የተቀረው`
              : `Today: ${currentMonth} ${displayDay}, ${currentYear} - ${daysLeftForSalary} days left for salary`
            }
          </span>
        </div>
      </div>

      {/* Net Salary Highlight with Spotlight hover */}
      <Card
        className="relative group overflow-hidden border-none bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 backdrop-blur-xl ring-1 ring-emerald-500/20"
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-lg opacity-0 transition duration-300 group-hover:opacity-100"
          style={{ background }}
        />
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-emerald-200/80 uppercase tracking-wider">{periodLabel}</span>
          </div>
          <CardTitle className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg py-2">
            {/* Display currency symbol separately if CountUp doesn't handle it, or just update the number */}
            {/* Since CountUp is numeric, we'll prefix the symbol if needed, but for now let's just convert the value */}
            <span className="text-2xl sm:text-3xl md:text-4xl mr-1 align-top relative top-2 opacity-80">
              {currency === "ETB" ? "ETB" : "$"}
            </span>
            <CountUp
              key={currency} // Force remount on currency change
              from={0}
              to={calculation.netSalary * multiplier * rate}
              separator=","
              decimals={2}
              direction="up"
              duration={0.15}
              className="count-up-text"
            />
          </CardTitle>
          <p className="text-lg text-emerald-100/70 font-medium">{isAmharic ? "የተጣራ ደመወዝ" : "Net Take-Home Pay"}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-secondary">
                <span className="text-sm mr-0.5 opacity-70">{currency === "ETB" ? "ETB" : "$"}</span>
                <CountUp
                  key={currency}
                  from={0}
                  to={leftMetricValue * rate}
                  separator=","
                  decimals={2}
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
                <span className="text-sm mr-0.5 opacity-70">{currency === "ETB" ? "ETB" : "$"}</span>
                <CountUp
                  key={currency}
                  from={0}
                  to={middleMetricValue * rate}
                  separator=","
                  decimals={2}
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
                <span className="text-sm mr-0.5 opacity-70">{currency === "ETB" ? "ETB" : "$"}</span>
                <CountUp
                  key={currency}
                  from={0}
                  to={rightMetricValue * rate}
                  separator=","
                  decimals={2}
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
      <Card className="border-white/10 bg-black/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-orange-500" />
            {isAmharic ? "ዝርዝር የደመወዝ ስሌት" : "Detailed Salary Breakdown"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-200">
          {/* Gross Income Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-primary border-b pb-1">{isAmharic ? "ጠቅላላ ገቢ" : "Gross Income"}</h4>

            <div className="flex justify-between">
              <span>{isAmharic ? "መሰረታዊ ደመወዝ" : "Basic Salary"}</span>
              <span className="font-semibold">{formatDisplayCurrency(inputs.grossSalary * multiplier)}</span>
            </div>

            {/* Standard deduction is handled per-taxable allowance in the tax breakdown */}

            (
            <Collapsible open={expandedSections.allowances} onOpenChange={() => toggleSection("allowances")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span>{isAmharic ? "ጠቅላላ አበሎች" : "Total Allowances"}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">
                      {formatDisplayCurrency(calculation.totalAllowances * multiplier)}
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
                    <span>{formatDisplayCurrency(inputs.transportAllowance * multiplier)}</span>
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
                    <span>{formatDisplayCurrency(inputs.housingAllowance * multiplier)}</span>
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
                    <span>{formatDisplayCurrency(inputs.medicalAllowance * multiplier)}</span>
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
                    <span>{formatDisplayCurrency(allowance.amount * multiplier)}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
            )

            {inputs.overtimePay > 0 && (
              <div className="flex justify-between">
                <span>{isAmharic ? "ተጨማሪ ሰዓት ክፍያ" : "Overtime Pay"}</span>
                <span className="font-semibold text-secondary">{formatDisplayCurrency(inputs.overtimePay * multiplier)}</span>
              </div>
            )}

            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{isAmharic ? "ጠቅላላ ገቢ" : "Total Gross Income"}</span>
              <span>{formatDisplayCurrency(calculation.grossSalary * multiplier)}</span>
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
                      -{formatDisplayCurrency(calculation.incomeTax * multiplier)}
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
                    <span>{formatDisplayCurrency(calculation.taxableIncome * multiplier)}</span>
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
                        <span className="font-medium">{formatDisplayCurrency(inputs.grossSalary * multiplier)}</span>
                      </div>

                      {/* House Allowance - Only show if taxable */}
                      {inputs.housingAllowance > 0 && inputs.housingTaxable && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground ml-2">
                            <span>
                              {isAmharic
                                ? `+ የቤት አበል: ${formatDisplayCurrency(inputs.housingAllowance * multiplier)}`
                                : `+ House Allowance: ${formatDisplayCurrency(inputs.housingAllowance * multiplier)}`
                              }
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
                                {formatDisplayCurrency(Math.max(0, inputs.housingAllowance - 600) * multiplier)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Medical Allowance - Only show if taxable */}
                      {inputs.medicalAllowance > 0 && inputs.medicalTaxable && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground ml-2">
                            <span>
                              {isAmharic
                                ? `+ የህክምና አበል: ${formatDisplayCurrency(inputs.medicalAllowance * multiplier)}`
                                : `+ Medical Allowance: ${formatDisplayCurrency(inputs.medicalAllowance * multiplier)}`
                              }
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
                                {formatDisplayCurrency(Math.max(0, inputs.medicalAllowance - 600) * multiplier)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Transportation Allowance - Only show if taxable */}
                      {inputs.transportAllowance > 0 && inputs.transportTaxable && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground ml-2">
                            <span>
                              {isAmharic
                                ? `+ የመጓጓዣ አበል: ${formatDisplayCurrency(inputs.transportAllowance * multiplier)}`
                                : `+ Transportation Allowance: ${formatDisplayCurrency(inputs.transportAllowance * multiplier)}`
                              }
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
                                {formatDisplayCurrency(Math.max(0, inputs.transportAllowance - 600) * multiplier)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Other Allowances - With 600 ETB exemption if taxable toggle is ON */}
                      {inputs.otherAllowances.map((allowance, index) => (
                        allowance.amount > 0 && allowance.taxable && (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground ml-2">
                              <span>
                                {isAmharic
                                  ? `+ ${allowance.name}: ${formatDisplayCurrency(allowance.amount * multiplier)}`
                                  : `+ ${allowance.name}: ${formatDisplayCurrency(allowance.amount * multiplier)}`
                                }
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
                                  {formatDisplayCurrency(Math.max(0, allowance.amount - 600) * multiplier)}
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
                        <span>{formatDisplayCurrency(calculation.taxableIncome * multiplier)}</span>
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
                              <span className="font-medium">{formatDisplayCurrency(taxableAmount)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground ml-2">
                              <span>
                                {isAmharic
                                  ? `${formatDisplayCurrency(taxableAmount)} × ${ratePercent}% - ${formatDisplayCurrency(deductibleAmount * multiplier)} =`
                                  : `${formatDisplayCurrency(taxableAmount)} × ${ratePercent}% - ${formatDisplayCurrency(deductibleAmount * multiplier)} =`
                                }
                              </span>
                              <span className="font-semibold text-destructive">
                                {formatDisplayCurrency(taxAmount)}
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
                          {formatDisplayCurrency(calculation.incomeTax * multiplier)}
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
                  -{formatDisplayCurrency(calculation.pensionContribution * multiplier)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground ml-2">
                <span>
                  {isAmharic
                    ? `${formatDisplayCurrency(inputs.grossSalary * multiplier)} × 7% =`
                    : `${formatDisplayCurrency(inputs.grossSalary * multiplier)} × 7% =`
                  }
                </span>
                <span className="font-medium text-destructive">
                  {formatDisplayCurrency(calculation.pensionContribution * multiplier)}
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
                      <span className="font-semibold text-red-400">
                        -
                        {formatDisplayCurrency(
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
                      <span>{formatDisplayCurrency(inputs.unionDues * multiplier)}</span>
                    </div>
                  )}
                  {inputs.loanDeductions.map((loan, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{loan.name || `${isAmharic ? "ብድር" : "Loan"} ${index + 1}`}</span>
                      <span>{formatDisplayCurrency(loan.amount * multiplier)}</span>
                    </div>
                  ))}
                  {inputs.otherDeductions.map((deduction, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{deduction.name || `${isAmharic ? "ቅናሽ" : "Deduction"} ${index + 1}`}</span>
                      <span>{formatDisplayCurrency(deduction.amount * multiplier)}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{isAmharic ? "ጠቅላላ ቅናሾች" : "Total Deductions"}</span>
              <span className="text-destructive">-{formatDisplayCurrency(calculation.totalDeductions * multiplier)}</span>
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
                <span>{formatDisplayCurrency(calculation.grossSalary * multiplier)}</span>
              </div>

              {inputs.overtimePay > 0 && (
                <div className="flex justify-between text-muted-foreground ml-2">
                  <span>
                    {isAmharic
                      ? `+ ተጨማሪ ሰዓት ክፍያ: ${formatDisplayCurrency(inputs.overtimePay * multiplier)}`
                      : `+ Overtime Pay: ${formatDisplayCurrency(inputs.overtimePay * multiplier)}`
                    }
                  </span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground ml-2">
                <span>
                  {isAmharic
                    ? `- ጠቅላላ ቅናሾች: ${formatDisplayCurrency(calculation.totalDeductions * multiplier)}`
                    : `- Total Deductions: ${formatDisplayCurrency(calculation.totalDeductions * multiplier)}`
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
                  {formatDisplayCurrency(calculation.netSalary * multiplier)}
                </span>
              </div>
            </div>
          </div>

          {/* Final Net Salary */}
          <div className="flex justify-between text-xl font-bold bg-primary/10 p-4 rounded-lg">
            <span>{isAmharic ? "የተጣራ ደመወዝ" : "Net Salary"}</span>
            <span className="text-primary">{formatDisplayCurrency(calculation.netSalary * multiplier)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Financial Insights */}
      <Card className="border-white/10 bg-black/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            {isAmharic ? "የገንዘብ ትንተና" : "Financial Insights"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-200">
          {/* Tax Efficiency */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">{isAmharic ? "የታክስ ውጤታማነት" : "Tax Efficiency"}</span>
              <span className="text-sm font-semibold text-emerald-400">{(100 - calculation.effectiveTaxRate * 100).toFixed(2)}%</span>
            </div>
            <Progress value={100 - calculation.effectiveTaxRate * 100} className="h-2 bg-white/10" indicatorClassName="bg-emerald-500" />
          </div>

          {/* Savings Potential */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">{isAmharic ? "የቁጠባ አቅም" : "Savings Potential"}</span>
              <span className="text-sm font-semibold text-emerald-400">{savingsRate.toFixed(2)}%</span>
            </div>
            <Progress value={Math.max(0, savingsRate)} className="h-2 bg-white/10" indicatorClassName="bg-emerald-500" />
            <p className="text-xs text-gray-500 mt-1">
              {isAmharic
                ? `በወር ${formatDisplayCurrency(potentialSavings)} ማቆየት ይችላሉ`
                : `Potential monthly savings: ${formatDisplayCurrency(potentialSavings)}`}
            </p>
          </div>
          {/* Daily Rates - shown when Annual View is active or just as extra info? User mentioned "Annual card" */}
          {/* I need to find where "Daily Gross" etc are defined. They might be missing or I need to add them? */}
          {/* Searching the file content for "Daily" */}
          {/* Take-home percentage */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">{isAmharic ? "የተጣራ ደመወዝ መቶኛ" : "Take-Home Percentage"}</span>
              <span className="text-sm font-semibold text-emerald-400">
                {(
                  (calculation.netSalary / (calculation.grossSalary + inputs.overtimePay)) * 100
                ).toFixed(2)}
                %
              </span>
            </div>
            <Progress
              value={(calculation.netSalary / (calculation.grossSalary + inputs.overtimePay)) * 100}
              className="h-2 bg-white/10"
              indicatorClassName="bg-emerald-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export { SalaryBreakdownCard }
