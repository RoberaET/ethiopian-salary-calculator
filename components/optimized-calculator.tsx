"use client"

import { useState, useEffect, Suspense, lazy, useMemo, useCallback, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, DollarSign, Settings, FileText, BarChart3, Zap, Share2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { calculateSalary, TAX_BRACKETS, type SalaryInputs } from "@/lib/salary-calculator"
import { DynamicInputSection } from "@/components/dynamic-input-section"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { endOfMonth, differenceInCalendarDays } from "date-fns"
import { OvertimeCalculator } from "@/components/overtime-calculator"
import { SalaryBreakdownCard } from "@/components/salary-breakdown-card"
import { sendInvoiceEmail } from "@/lib/email-client"
import { PercentageInput } from "@/components/percentage-input"

// Lazy load heavy components with better error boundaries
const SalaryVisualization = lazy(() => 
  import("@/components/salary-visualization").then(module => ({ default: module.SalaryVisualization }))
)
const DarkVeil = lazy(() => import("@/components/dark-veil"))
const SalaryNegotiationMode = lazy(() => 
  import("@/components/salary-negotiation-mode").then(module => ({ default: module.SalaryNegotiationMode }))
)
const CurrencyConverter = lazy(() => 
  import("@/components/currency-converter").then(module => ({ default: module.CurrencyConverter }))
)
const WhatIfCalculator = lazy(() => 
  import("@/components/what-if-calculator").then(module => ({ default: module.WhatIfCalculator }))
)
const ExportShareOptions = lazy(() => 
  import("@/components/export-share-options").then(module => ({ default: module.ExportShareOptions }))
)

// Optimized loading components
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
  </div>
))

const ChartLoading = memo(() => (
  <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading charts...</p>
    </div>
  </div>
))

// Memoized input section component
const InputSection = memo(function InputSection({ 
  inputs, 
  updateInput, 
  isAmharic, 
  date, 
  setDate, 
  daysLeftForSalary,
  errors 
}: {
  inputs: SalaryInputs
  updateInput: (field: keyof SalaryInputs, value: any) => void
  isAmharic: boolean
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  daysLeftForSalary: number
  errors: Record<string, string>
}) {
  const addLoan = () => {
    const next = [...inputs.loanDeductions, { name: "", amount: 0 }]
    updateInput("loanDeductions", next)
  }

  const updateLoan = (index: number, field: "name" | "amount", value: any) => {
    const next = inputs.loanDeductions.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    updateInput("loanDeductions", next)
  }

  const removeLoan = (index: number) => {
    const next = inputs.loanDeductions.filter((_, i) => i !== index)
    updateInput("loanDeductions", next)
  }

  const addOtherDeduction = () => {
    const next = [...inputs.otherDeductions, { name: "", amount: 0 }]
    updateInput("otherDeductions", next)
  }

  const updateOtherDeduction = (index: number, field: "name" | "amount", value: any) => {
    const next = inputs.otherDeductions.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    updateInput("otherDeductions", next)
  }

  const removeOtherDeduction = (index: number) => {
    const next = inputs.otherDeductions.filter((_, i) => i !== index)
    updateInput("otherDeductions", next)
  }
  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1 p-1 bg-muted rounded-lg h-12 [&>[data-state=active]]:bg-orange-500 [&>[data-state=active]]:text-white">
          <TabsTrigger 
            value="basic" 
            className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
          >
            <Calculator className="h-4 w-4" />
            {isAmharic ? "መሰረታዊ" : "Basic"}
          </TabsTrigger>
          <TabsTrigger 
            value="allowances" 
            className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
          >
            <DollarSign className="h-4 w-4" />
            {isAmharic ? "አበሎች" : "Allowances"}
          </TabsTrigger>
          <TabsTrigger 
            value="deductions" 
            className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
          >
            <Settings className="h-4 w-4" />
            {isAmharic ? "ቅናሾች" : "Deductions"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isAmharic ? "መሰረታዊ ደመወዝ" : "Basic Salary"}</CardTitle>
              <CardDescription>
                {isAmharic ? "የእርስዎን መሰረታዊ ደመወዝ ያስገቡ" : "Enter your basic salary amount"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="grossSalary">
                  {isAmharic ? "ጠቅላላ ደመወዝ (ETB)" : "Gross Salary (ETB)"}
                </Label>
                <Input
                  id="grossSalary"
                  type="number"
                  value={inputs.grossSalary || ""}
                  onChange={(e) => updateInput("grossSalary", Number(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.grossSalary ? "border-red-500" : ""}
                />
                {errors.grossSalary && (
                  <p className="text-sm text-red-500">{errors.grossSalary}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allowances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isAmharic ? "አበሎች" : "Allowances"}</CardTitle>
              <CardDescription>
                {isAmharic ? "የተለያዩ አበሎችን ያስገቡ" : "Enter various allowances"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PercentageInput
                label={isAmharic ? "የመጓጓዣ አበል" : "Transport Allowance"}
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

              <OvertimeCalculator
                baseSalary={inputs.grossSalary}
                overtimePay={inputs.overtimePay}
                onOvertimeChange={(amount) => updateInput("overtimePay", amount)}
                isAmharic={isAmharic}
              />

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

        <TabsContent value="deductions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isAmharic ? "ቅናሾች" : "Deductions"}</CardTitle>
              <CardDescription>
                {isAmharic ? "የተለያዩ ቅናሾችን ያስገቡ" : "Enter various deductions"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unionDues">
                  {isAmharic ? "የሰራተኛ ማህበር ቅናሽ (ETB)" : "Union Dues (ETB)"}
                </Label>
                <Input
                  id="unionDues"
                  type="number"
                  value={inputs.unionDues || ""}
                  onChange={(e) => updateInput("unionDues", Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              {/* Custom loan deductions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{isAmharic ? "የብድር ቅናሾች" : "Loan deductions"}</Label>
                  <button type="button" onClick={addLoan} className="text-sm text-blue-600 hover:underline">{isAmharic ? "አክል" : "Add"}</button>
                </div>
                {inputs.loanDeductions.map((loan, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2">
                    <Input
                      className="col-span-3"
                      placeholder={isAmharic ? "ለምሳሌ: የብድር" : "Description"}
                      value={loan.name}
                      onChange={(e) => updateLoan(index, "name", e.target.value)}
                    />
                    <Input
                      className="col-span-1"
                      type="number"
                      placeholder="0"
                      value={loan.amount === 0 ? "" : loan.amount}
                      onChange={(e) => updateLoan(index, "amount", Number(e.target.value || 0))}
                    />
                    <button type="button" onClick={() => removeLoan(index)} className="col-span-1 text-red-600 text-sm">{isAmharic ? "አስወግድ" : "Remove"}</button>
                  </div>
                ))}
                {inputs.loanDeductions.length === 0 && (
                  <p className="text-xs text-muted-foreground">{isAmharic ? "የብድር ቅናሽ የለም" : "No loan deductions added"}</p>
                )}
              </div>

              {/* Custom other deductions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{isAmharic ? "ሌሎች ቅናሾች" : "Other deductions"}</Label>
                  <button type="button" onClick={addOtherDeduction} className="text-sm text-blue-600 hover:underline">{isAmharic ? "አክል" : "Add"}</button>
                </div>
                {inputs.otherDeductions.map((d, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2">
                    <Input
                      className="col-span-3"
                      placeholder={isAmharic ? "ለምሳሌ: መድን" : "Description"}
                      value={d.name}
                      onChange={(e) => updateOtherDeduction(index, "name", e.target.value)}
                    />
                    <Input
                      className="col-span-1"
                      type="number"
                      placeholder="0"
                      value={d.amount === 0 ? "" : d.amount}
                      onChange={(e) => updateOtherDeduction(index, "amount", Number(e.target.value || 0))}
                    />
                    <button type="button" onClick={() => removeOtherDeduction(index)} className="col-span-1 text-red-600 text-sm">{isAmharic ? "አስወግድ" : "Remove"}</button>
                  </div>
                ))}
                {inputs.otherDeductions.length === 0 && (
                  <p className="text-xs text-muted-foreground">{isAmharic ? "ሌሎች ቅናሾች የሉም" : "No other deductions added"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
})

// Memoized results section component
const ResultsSection = memo(function ResultsSection({ 
  calculation, 
  inputs, 
  isAmharic, 
  activeResultsTab, 
  setActiveResultsTab 
}: {
  calculation: any
  inputs: SalaryInputs
  isAmharic: boolean
  activeResultsTab: string
  setActiveResultsTab: (tab: string) => void
}) {
  return (
    <div className="space-y-6">
      <Tabs value={activeResultsTab} onValueChange={setActiveResultsTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-muted rounded-lg h-12 [&>[data-state=active]]:bg-orange-500 [&>[data-state=active]]:text-white">
          <TabsTrigger 
            value="breakdown" 
            className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
          >
            <FileText className="h-4 w-4" />
            {isAmharic ? "ዝርዝር" : "Details"}
          </TabsTrigger>
          <TabsTrigger 
            value="visualization" 
            className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
          >
            <BarChart3 className="h-4 w-4" />
            {isAmharic ? "ምስል" : "Visual"}
          </TabsTrigger>
          <TabsTrigger 
            value="whatif" 
            className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
          >
            <Zap className="h-4 w-4" />
            {isAmharic ? "ምን ቢሆን" : "What-If"}
          </TabsTrigger>
          <TabsTrigger 
            value="share" 
            className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
          >
            <Share2 className="h-4 w-4" />
            {isAmharic ? "አጋራ" : "Share"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-6">
          <SalaryBreakdownCard 
            calculation={calculation} 
            inputs={inputs} 
            isAmharic={isAmharic} 
          />
          <Suspense fallback={<LoadingSpinner />}>
            <CurrencyConverter netSalary={calculation.netSalary} isAmharic={isAmharic} />
          </Suspense>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-6">
          <Suspense fallback={<ChartLoading />}>
            <SalaryVisualization calculation={calculation} isAmharic={isAmharic} />
          </Suspense>
        </TabsContent>

        <TabsContent value="whatif" className="space-y-6">
          <Suspense fallback={<LoadingSpinner />}>
            <WhatIfCalculator baseInputs={inputs} baseCalculation={calculation} isAmharic={isAmharic} />
          </Suspense>
        </TabsContent>

        <TabsContent value="share" className="space-y-6">
          <Suspense fallback={<LoadingSpinner />}>
            <ExportShareOptions calculation={calculation} inputs={inputs} isAmharic={isAmharic} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
})

export { InputSection, ResultsSection, LoadingSpinner, ChartLoading, CurrencyConverter }
