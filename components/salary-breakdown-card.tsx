"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, TrendingUp, Calendar, FileText } from "lucide-react"
import { formatCurrency, type SalaryCalculation, type SalaryInputs } from "@/lib/salary-calculator"

interface SalaryBreakdownCardProps {
  calculation: SalaryCalculation
  inputs: SalaryInputs
  isAmharic: boolean
}

export function SalaryBreakdownCard({ calculation, inputs, isAmharic }: SalaryBreakdownCardProps) {
  const [isAnnualView, setIsAnnualView] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    allowances: false,
    deductions: false,
    taxBreakdown: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const multiplier = isAnnualView ? 12 : 1
  const periodLabel = isAnnualView ? (isAmharic ? "ዓመታዊ" : "Annual") : isAmharic ? "ወራዊ" : "Monthly"

  // Calculate savings rate (assuming some basic living expenses)
  const estimatedExpenses = calculation.netSalary * 0.7 // Assume 70% for expenses
  const potentialSavings = calculation.netSalary - estimatedExpenses
  const savingsRate = (potentialSavings / calculation.netSalary) * 100

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

      {/* Net Salary Highlight */}
      <Card className="border-primary bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{periodLabel}</span>
          </div>
          <CardTitle className="text-4xl font-bold text-primary">
            {formatCurrency(calculation.netSalary * multiplier)}
          </CardTitle>
          <p className="text-lg text-muted-foreground">{isAmharic ? "የተጣራ ደመወዝ" : "Net Take-Home Pay"}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-secondary">
                {(calculation.effectiveTaxRate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">{isAmharic ? "ውጤታማ ታክስ" : "Effective Tax Rate"}</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-accent">{savingsRate.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">{isAmharic ? "የቁጠባ አቅም" : "Savings Potential"}</p>
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
              <span className="font-semibold">{formatCurrency(calculation.grossSalary * multiplier)}</span>
            </div>

            {calculation.totalAllowances > 0 && (
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
            )}

            {inputs.overtimePay > 0 && (
              <div className="flex justify-between">
                <span>{isAmharic ? "ተጨማሪ ሰዓት ክፍያ" : "Overtime Pay"}</span>
                <span className="font-semibold text-secondary">{formatCurrency(inputs.overtimePay * multiplier)}</span>
              </div>
            )}

            <Separator />
            <div className="flex justify-between font-semibold">
              <span>{isAmharic ? "ጠቅላላ ገቢ" : "Total Gross Income"}</span>
              <span>
                {formatCurrency(
                  (calculation.grossSalary + calculation.totalAllowances + inputs.overtimePay) * multiplier,
                )}
              </span>
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
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>{isAmharic ? "የታክስ ገቢ" : "Taxable Income"}:</span>
                    <span>{formatCurrency(calculation.taxableIncome * multiplier)}</span>
                  </div>
                  {calculation.taxBracketDetails.map((detail, index) => (
                    <div key={index} className="flex justify-between text-xs text-muted-foreground">
                      <span>{detail.bracket.label}:</span>
                      <span>{formatCurrency(detail.taxAmount * multiplier)}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-between">
              <span>{isAmharic ? "የጡረታ አበል (7%)" : "Pension Contribution (7%)"}</span>
              <span className="font-semibold text-destructive">
                -{formatCurrency(calculation.pensionContribution * multiplier)}
              </span>
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
              <span className="text-sm font-semibold">{(100 - calculation.effectiveTaxRate * 100).toFixed(1)}%</span>
            </div>
            <Progress value={100 - calculation.effectiveTaxRate * 100} className="h-2" />
          </div>

          {/* Savings Potential */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">{isAmharic ? "የቁጠባ አቅም" : "Savings Potential"}</span>
              <span className="text-sm font-semibold">{savingsRate.toFixed(0)}%</span>
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
                  (calculation.netSalary /
                    (calculation.grossSalary + calculation.totalAllowances + inputs.overtimePay)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <Progress
              value={
                (calculation.netSalary / (calculation.grossSalary + calculation.totalAllowances + inputs.overtimePay)) *
                100
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
