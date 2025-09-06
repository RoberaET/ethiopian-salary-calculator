"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, DollarSign, Settings, FileText, BarChart3, Zap, Share2 } from "lucide-react"
import { calculateSalary, TAX_BRACKETS, type SalaryInputs } from "@/lib/salary-calculator"
import { DynamicInputSection } from "@/components/dynamic-input-section"
import { OvertimeCalculator } from "@/components/overtime-calculator"
import { SalaryBreakdownCard } from "@/components/salary-breakdown-card"
import { TaxBracketVisualization } from "@/components/tax-bracket-visualization"
import { SalaryNegotiationMode } from "@/components/salary-negotiation-mode"
import { CurrencyConverter } from "@/components/currency-converter"
import { WhatIfCalculator } from "@/components/what-if-calculator"
import { ExportShareOptions } from "@/components/export-share-options"
import { PercentageInput } from "@/components/percentage-input"

export default function EthiopianSalaryCalculator() {
  const [inputs, setInputs] = useState<SalaryInputs>({
    grossSalary: 0,
    transportAllowance: 0,
    transportTaxable: false,
    transportPercentage: 0,
    housingAllowance: 0,
    housingTaxable: false,
    housingPercentage: 0,
    medicalAllowance: 0,
    medicalTaxable: false,
    medicalPercentage: 0,
    otherAllowances: [],
    overtimePay: 0,
    unionDues: 0,
    loanDeductions: [],
    otherDeductions: [],
  })

  const [isAmharic, setIsAmharic] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const calculation = calculateSalary(inputs)

  const updateInput = (field: keyof SalaryInputs, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateInput = (field: keyof SalaryInputs, value: number) => {
    if (value < 0) {
      setErrors((prev) => ({
        ...prev,
        [field]: isAmharic ? "አሉታዊ ቁጥር አይፈቀድም" : "Negative values are not allowed",
      }))
      return false
    }
    return true
  }

  const handleNumberInput = (field: keyof SalaryInputs, value: string) => {
    const numValue = Number(value)
    if (validateInput(field, numValue)) {
      updateInput(field, numValue)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isAmharic ? "የኢትዮጵያ ደመወዝ ካልኩሌተር" : "Ethiopian Salary Calculator"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isAmharic ? "የተጣራ ደመወዝዎን ያስሉ" : "Calculate Your Take-Home Pay"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="language-toggle" className="text-sm">
                  {isAmharic ? "English" : "አማርኛ"}
                </Label>
                <Switch id="language-toggle" checked={isAmharic} onCheckedChange={setIsAmharic} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Salary Negotiation Mode */}
            <SalaryNegotiationMode
              inputs={inputs}
              onGrossSalaryChange={(grossSalary) => updateInput("grossSalary", grossSalary)}
              isAmharic={isAmharic}
            />

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {isAmharic ? "መሰረታዊ" : "Basic"}
                </TabsTrigger>
                <TabsTrigger value="allowances" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {isAmharic ? "አበሎች" : "Allowances"}
                </TabsTrigger>
                <TabsTrigger value="deductions" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {isAmharic ? "ቅናሾች" : "Deductions"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                {/* Basic Salary Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      {isAmharic ? "መሰረታዊ ደመወዝ" : "Basic Salary"}
                    </CardTitle>
                    <CardDescription>
                      {isAmharic ? "የወር ደመወዝዎን ያስገቡ" : "Enter your monthly gross salary"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="gross-salary">
                        {isAmharic ? "ጠቅላላ ወራዊ ደመወዝ (ብር)" : "Gross Monthly Salary (ETB)"}
                      </Label>
                      <Input
                        id="gross-salary"
                        type="number"
                        value={inputs.grossSalary}
                        onChange={(e) => handleNumberInput("grossSalary", e.target.value)}
                        className={`text-lg font-semibold ${errors.grossSalary ? "border-destructive" : ""}`}
                        placeholder="0"
                        min="0"
                      />
                      {errors.grossSalary && <p className="text-sm text-destructive mt-1">{errors.grossSalary}</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Standard Allowances */}
                <Card>
                  <CardHeader>
                    <CardTitle>{isAmharic ? "መደበኛ አበሎች" : "Standard Allowances"}</CardTitle>
                    <CardDescription>
                      {isAmharic ? "የተለያዩ አበሎችን ያስገቡ" : "Configure your standard allowances"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Transport Allowance */}
                    <PercentageInput
                      label={isAmharic ? "የትራንስፖርት አበል" : "Transport Allowance"}
                      amount={inputs.transportAllowance}
                      percentage={inputs.transportPercentage}
                      isTaxable={inputs.transportTaxable}
                      onAmountChange={(amount) => updateInput("transportAllowance", amount)}
                      onPercentageChange={(percentage) => updateInput("transportPercentage", percentage)}
                      onTaxableChange={(taxable) => updateInput("transportTaxable", taxable)}
                      baseSalary={inputs.grossSalary}
                      isAmharic={isAmharic}
                      placeholder="0"
                    />

                    {/* Housing Allowance */}
                    <PercentageInput
                      label={isAmharic ? "የቤት አበል" : "Housing Allowance"}
                      amount={inputs.housingAllowance}
                      percentage={inputs.housingPercentage}
                      isTaxable={inputs.housingTaxable}
                      onAmountChange={(amount) => updateInput("housingAllowance", amount)}
                      onPercentageChange={(percentage) => updateInput("housingPercentage", percentage)}
                      onTaxableChange={(taxable) => updateInput("housingTaxable", taxable)}
                      baseSalary={inputs.grossSalary}
                      isAmharic={isAmharic}
                      placeholder="0"
                    />

                    {/* Medical Allowance */}
                    <PercentageInput
                      label={isAmharic ? "የህክምና አበል" : "Medical Allowance"}
                      amount={inputs.medicalAllowance}
                      percentage={inputs.medicalPercentage}
                      isTaxable={inputs.medicalTaxable}
                      onAmountChange={(amount) => updateInput("medicalAllowance", amount)}
                      onPercentageChange={(percentage) => updateInput("medicalPercentage", percentage)}
                      onTaxableChange={(taxable) => updateInput("medicalTaxable", taxable)}
                      baseSalary={inputs.grossSalary}
                      isAmharic={isAmharic}
                      placeholder="0"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="allowances" className="space-y-6">
                {/* Overtime Calculator */}
                <OvertimeCalculator
                  baseSalary={inputs.grossSalary}
                  overtimePay={inputs.overtimePay}
                  onOvertimeChange={(amount) => updateInput("overtimePay", amount)}
                  isAmharic={isAmharic}
                />

                {/* Dynamic Allowances Section */}
                <DynamicInputSection
                  allowances={inputs.otherAllowances.map((allowance, index) => ({
                    id: index.toString(),
                    ...allowance,
                  }))}
                  loans={[]}
                  deductions={[]}
                  onAllowancesChange={(allowances) =>
                    updateInput(
                      "otherAllowances",
                      allowances.map(({ id, ...rest }) => rest),
                    )
                  }
                  onLoansChange={() => {}}
                  onDeductionsChange={() => {}}
                  isAmharic={isAmharic}
                  baseSalary={inputs.grossSalary}
                />
              </TabsContent>

              <TabsContent value="deductions" className="space-y-6">
                {/* Union Dues */}
                <Card>
                  <CardHeader>
                    <CardTitle>{isAmharic ? "መደበኛ ቅናሾች" : "Standard Deductions"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="union-dues">{isAmharic ? "የሰራተኛ ማህበር ክፍያ" : "Union Dues"}</Label>
                      <Input
                        id="union-dues"
                        type="number"
                        value={inputs.unionDues}
                        onChange={(e) => handleNumberInput("unionDues", e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Dynamic Loans and Deductions Sections */}
                <DynamicInputSection
                  allowances={[]}
                  loans={inputs.loanDeductions.map((loan, index) => ({
                    id: index.toString(),
                    ...loan,
                  }))}
                  deductions={inputs.otherDeductions.map((deduction, index) => ({
                    id: index.toString(),
                    ...deduction,
                  }))}
                  onAllowancesChange={() => {}}
                  onLoansChange={(loans) =>
                    updateInput(
                      "loanDeductions",
                      loans.map(({ id, ...rest }) => rest),
                    )
                  }
                  onDeductionsChange={(deductions) =>
                    updateInput(
                      "otherDeductions",
                      deductions.map(({ id, ...rest }) => rest),
                    )
                  }
                  isAmharic={isAmharic}
                  baseSalary={inputs.grossSalary}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Results Tabs */}
            <Tabs defaultValue="breakdown" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="breakdown" className="flex items-center gap-1 text-xs">
                  <FileText className="h-3 w-3" />
                  {isAmharic ? "ዝርዝር" : "Details"}
                </TabsTrigger>
                <TabsTrigger value="visualization" className="flex items-center gap-1 text-xs">
                  <BarChart3 className="h-3 w-3" />
                  {isAmharic ? "ምስላዊ" : "Visual"}
                </TabsTrigger>
                <TabsTrigger value="whatif" className="flex items-center gap-1 text-xs">
                  <Zap className="h-3 w-3" />
                  {isAmharic ? "ምን ቢሆን" : "What-If"}
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-1 text-xs">
                  <Share2 className="h-3 w-3" />
                  {isAmharic ? "ማጋራት" : "Share"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="breakdown" className="space-y-6">
                {/* Salary Breakdown Card */}
                <SalaryBreakdownCard calculation={calculation} inputs={inputs} isAmharic={isAmharic} />

                {/* Currency Converter */}
                <CurrencyConverter netSalary={calculation.netSalary} isAmharic={isAmharic} />

                {/* Tax Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>{isAmharic ? "የታክስ መረጃ" : "Tax Information"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-secondary">
                          {(calculation.effectiveTaxRate * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isAmharic ? "ውጤታማ ታክስ መጠን" : "Effective Tax Rate"}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-accent">
                          {(calculation.marginalTaxRate * 100).toFixed(0)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isAmharic ? "ወሳኝ ታክስ መጠን" : "Marginal Tax Rate"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">
                        {isAmharic ? "የታክስ ደረጃዎች" : "Tax Brackets (Proclamation No. 979/2016)"}
                      </h4>
                      <div className="space-y-2 text-sm">
                        {TAX_BRACKETS.map((bracket, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{bracket.label}</span>
                            <span>{(bracket.rate * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visualization" className="space-y-6">
                {/* Tax Bracket Visualization */}
                <TaxBracketVisualization calculation={calculation} isAmharic={isAmharic} />
              </TabsContent>

              <TabsContent value="whatif" className="space-y-6">
                {/* What-If Calculator */}
                <WhatIfCalculator baseInputs={inputs} baseCalculation={calculation} isAmharic={isAmharic} />
              </TabsContent>

              <TabsContent value="export" className="space-y-6">
                {/* Export & Share Options */}
                <ExportShareOptions calculation={calculation} inputs={inputs} isAmharic={isAmharic} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
