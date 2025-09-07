"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, DollarSign, Settings, FileText, BarChart3, Zap, Share2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { calculateSalary, TAX_BRACKETS, type SalaryInputs } from "@/lib/salary-calculator"
import { DynamicInputSection } from "@/components/dynamic-input-section"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { endOfMonth, differenceInCalendarDays } from "date-fns"
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
  const [date, setDate] = useState<Date | undefined>(new Date())
  const today = new Date()
  const salaryDay = endOfMonth(today)
  const daysLeftForSalary = Math.max(0, differenceInCalendarDays(salaryDay, today))

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
    // Allow empty string to clear the input
    if (value === "") {
      updateInput(field, 0)
      return
    }
    
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
              <img
                src="/images/et.svg"
                alt={isAmharic ? "የኢትዮጵያ ባንዲራ" : "Ethiopian flag"}
                width={44}
                height={44}
                className="rounded-sm"
                loading="eager"
                decoding="async"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isAmharic ? "የኢትዮጵያ ደመወዝ ካልኩሌተር 2024 - የተጣራ ደመወዝ እና የገቢ ታክስ ካልኩሌተር" : "Ethiopian Salary Calculator 2024 - Calculate Your Net Pay & Income Tax"}
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
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* SEO Content Section - Before Calculator */}
        <section className="seo-content mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isAmharic ? "ነፃ የኢትዮጵያ ደመወዝ ካልኩሌተር 2024" : "Free Ethiopian Salary Calculator 2024 - Calculate Your Net Pay & Income Tax"}
          </h2>
          <p className="text-gray-700 mb-4">
            {isAmharic 
              ? <>የእኛ <strong>የኢትዮጵያ ደመወዝ ካልኩሌተር</strong> የቅርብ ጊዜ <strong>የኢትዮጵያ ታክስ ቅንጅቶች 2024</strong> በመጠቀም ትክክለኛውን የተጣራ ደመወዝዎን ለማስላት ይረዳዎታል። ይህ ነፃ <strong>የኢትዮጵያ የገቢ ታክስ ካልኩሌተር</strong> የአሁኑን PAYE ተመኖች በመተግበር ከገቢ ታክስ እና የጡረታ አበል በኋላ የተጣራ ደመወዝዎን ይወስናል።</>
              : <>Our <strong>Ethiopian salary calculator</strong> helps you calculate your exact take-home pay using the latest <strong>Ethiopia tax brackets 2024</strong>. This free <strong>Ethiopian income tax calculator</strong> applies current PAYE rates to determine your net salary after income tax and pension contributions.</>
            }
          </p>
          <p className="text-gray-700">
            {isAmharic 
              ? <>የደመወዝ ድርድር እና የገንዘብ አያያዝ እቅድ ብትዘጋጁም፣ የእኛ <strong>የኢትዮጵያ ታክስ ካልኩሌተር</strong> ከሕግ ቁጥር 979/2016 ታክስ ተመኖች በመመስረት ትክክለኛ ውጤቶችን ይሰጣል።</>
              : <>Whether you're planning salary negotiations or budgeting your finances, our <strong>Ethiopia tax calculator</strong> provides accurate results based on Proclamation No. 979/2016 tax rates.</>
            }
          </p>
        </section>

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
                      <Label htmlFor="gross-salary" className="mb-2">
                        {isAmharic ? "ጠቅላላ ወራዊ ደመወዝ (ብር)" : "Gross Monthly Salary (ETB)"}
                      </Label>
                      <Input
                        id="gross-salary"
                        type="number"
                        value={inputs.grossSalary || ""}
                        onChange={(e) => handleNumberInput("grossSalary", e.target.value)}
                        className={`text-lg font-semibold ${errors.grossSalary ? "border-destructive" : ""}`}
                        placeholder={isAmharic ? "ደመወዝዎን ያስገቡ" : "Enter your salary"}
                        min="0"
                        aria-label={isAmharic ? "ጠቅላላ ወራዊ ደመወዝ በኢትዮጵያ ብር" : "Enter your gross salary in Ethiopian Birr"}
                        aria-describedby="gross-salary-help"
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

                    {/* Calendar under allowances, left-aligned */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <UiCalendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          showOutsideDays={false}
                          className="w-full rounded-md border shadow [--cell-size:--spacing(6)] p-2"
                          classNames={{ root: "w-full" }}
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                          {isAmharic ? "እስከ ደመወዝ ቀን የቀሩ ቀናት:" : "Days left until salary day:"} {daysLeftForSalary}
                        </p>
                      </div>
                    </div>
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
                        value={inputs.unionDues || ""}
                        onChange={(e) => handleNumberInput("unionDues", e.target.value)}
                        placeholder={isAmharic ? "ክፍያ ያስገቡ" : "Enter amount"}
                        min="0"
                        aria-label={isAmharic ? "የሰራተኛ ማህበር ክፍያ በኢትዮጵያ ብር" : "Enter union dues in Ethiopian Birr"}
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
                <SalaryBreakdownCard 
                  key={`${inputs.transportTaxable}-${inputs.housingTaxable}-${inputs.medicalTaxable}`}
                  calculation={calculation} 
                  inputs={inputs} 
                  isAmharic={isAmharic} 
                />

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

        {/* SEO Content Section - After Calculator */}
        <section className="tax-info mt-12 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isAmharic ? "የኢትዮጵያ ታክስ ስሌት መረዳት" : "Understanding Ethiopian Tax Calculation"}
          </h2>
          <p className="text-gray-700 mb-4">
            {isAmharic 
              ? <>የ<strong>ኢትዮጵያ ደመወዝ ካልኩሌተር</strong> ከፍተኛ ገቢ ያላቸው ሰዎች ተጨማሪ ታክስ የሚከፍሉበት የተለያዩ የታክስ ቅንጅቶችን ይጠቀማል። የእኛ <strong>የኢትዮጵያ PAYE ካልኩሌተር</strong> እነዚህን ተመኖች በራስ-ሰር ይተገብራል።</>
              : <>The <strong>Ethiopian salary calculator</strong> uses progressive tax brackets where higher earners pay more tax. Our <strong>Ethiopia PAYE calculator</strong> automatically applies these rates:</>
            }
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-white rounded border">
                <span>0-600 ETB:</span>
                <span className="font-semibold text-green-600">0% tax</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded border">
                <span>601-1,650 ETB:</span>
                <span className="font-semibold text-blue-600">10% tax</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded border">
                <span>1,651-3,200 ETB:</span>
                <span className="font-semibold text-orange-600">15% tax</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-white rounded border">
                <span>3,201-5,250 ETB:</span>
                <span className="font-semibold text-red-600">20% tax</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded border">
                <span>5,251-7,800 ETB:</span>
                <span className="font-semibold text-purple-600">25% tax</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded border">
                <span>7,801+ ETB:</span>
                <span className="font-semibold text-red-800">30% tax</span>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Benefits Section */}
        <section className="calculator-benefits mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isAmharic ? "የእኛን የኢትዮጵያ ደመወዝ ካልኩሌተር ለምን እንጠቀም?" : "Why Use Our Ethiopian Salary Calculator?"}
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              {isAmharic ? <>በ2024 <strong>የኢትዮጵያ ታክስ ቅንጅቶች</strong> የተዘመነ</> : <>✓ Updated with 2024 <strong>Ethiopia tax brackets</strong></>}
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              {isAmharic ? <>ትክክለኛ <strong>PAYE ታክስ ስሌት</strong></> : <>✓ Accurate <strong>PAYE tax calculation</strong></>}
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              {isAmharic ? "የጡረታ አበል (7%) ያካተተ" : "✓ Includes pension contribution (7%)"}
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              {isAmharic ? <>ነፃ <strong>የኢትዮጵያ የተጣራ ደመወዝ ካልኩሌተር</strong></> : <>✓ Free <strong>Ethiopian net salary calculator</strong></>}
            </li>
          </ul>
        </section>

        {/* FAQ Section */}
        <section className="faq-section mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {isAmharic ? "ተደጋግሞ የሚጠየቁ ጥያቄዎች - የኢትዮጵያ ደመወዝ ካልኩሌተር" : "Frequently Asked Questions - Ethiopian Salary Calculator"}
          </h2>
          
          <div className="space-y-6">
            <div className="faq-item p-4 bg-white rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {isAmharic ? "ይህ የኢትዮጵያ ደመወዝ ካልኩሌተር ምን ያህል ትክክለኛ ነው?" : "How accurate is this Ethiopian salary calculator?"}
              </h3>
              <p className="text-gray-700">
                {isAmharic 
                  ? <>የእኛ <strong>የኢትዮጵያ የገቢ ታክስ ካልኩሌተር</strong> ከሕግ ቁጥር 979/2016 አገር አቋራጭ PAYE ተመኖችን ይጠቀማል። ይህ የታክስ ካልኩሌተር በኢትዮጵያ ውስጥ ለሚሰሩ ሁሉም ሰራተኞች ትክክለኛ ውጤቶችን ይሰጣል።</>
                  : <>Our <strong>Ethiopian income tax calculator</strong> uses the official PAYE rates from Proclamation No. 979/2016. This tax calculator provides accurate results for all employees working in Ethiopia.</>
                }
              </p>
            </div>

            <div className="faq-item p-4 bg-white rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {isAmharic ? "ኢትዮጵያ በ2024 ምን ዓይነት የታክስ ቅንጅቶች እንደሚጠቀም?" : "What tax brackets does Ethiopia use in 2024?"}
              </h3>
              <p className="text-gray-700">
                {isAmharic 
                  ? <>የ<strong>ኢትዮጵያ ታክስ ካልኩሌተር</strong> እነዚህን የተለያዩ ተመኖች ይተገብራል፡ 0-600 ETB (0%)፣ 601-1,650 ETB (10%)፣ 1,651-3,200 ETB (15%)፣ 3,201-5,250 ETB (20%)፣ 5,251-7,800 ETB (25%)፣ እና 7,801+ ETB (30%)።</>
                  : <>The <strong>Ethiopia tax calculator</strong> applies these progressive rates: 0-600 ETB (0%), 601-1,650 ETB (10%), 1,651-3,200 ETB (15%), 3,201-5,250 ETB (20%), 5,251-7,800 ETB (25%), and 7,801+ ETB (30%).</>
                }
              </p>
            </div>

            <div className="faq-item p-4 bg-white rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {isAmharic ? "የጡረታ አበል እንዴት ይሰላል?" : "How is pension contribution calculated?"}
              </h3>
              <p className="text-gray-700">
                {isAmharic 
                  ? "የጡረታ አበል ከጠቅላላ ደመወዝ 7% በሆነ መጠን ይሰላል። ይህ በኢትዮጵያ የሰራተኛ ሕግ መሰረት የሚያስፈልግ የጡረታ አበል ነው።"
                  : "Pension contribution is calculated as 7% of your gross salary. This is a mandatory pension contribution required by Ethiopian labor law."
                }
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {isAmharic ? "የኢትዮጵያ ደመወዝ ካልኩሌተር" : "Ethiopian Salary Calculator"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAmharic ? "በ Robera Mekonnen የተሰላ" : "Developed by Robera Mekonnen"}
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>
                {isAmharic 
                  ? "© 2024 የኢትዮጵያ ደመወዝ ካልኩሌተር - በ Robera Mekonnen የተሰላ" 
                  : "© 2024 Ethiopian Salary Calculator - Developed by Robera Mekonnen"
                }
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
