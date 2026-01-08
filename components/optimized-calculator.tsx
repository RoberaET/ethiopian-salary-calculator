"use client"

import { useState, useEffect, Suspense, lazy, useMemo, useCallback, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
// DarkVeil import removed
const SalaryNegotiationMode = lazy(() =>
  import("@/components/salary-negotiation-mode").then(module => ({ default: module.SalaryNegotiationMode }))
)
const CurrencyConverter = lazy(() =>
  import("@/components/currency-converter").then(module => ({ default: module.CurrencyConverter }))
)
const ImpactCalculator = lazy(() =>
  import("@/components/impact-calculator").then(module => ({ default: module.ImpactCalculator }))
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
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent rounded-[2.5rem] blur-xl z-0" />
        <Tabs defaultValue="basic" className="w-full relative z-10">
          <TabsList className="grid w-full grid-cols-3 gap-2 p-2 bg-black/40 backdrop-blur-md rounded-[1.5rem] border border-white/10 h-16 shadow-lg mb-8">
            <TabsTrigger
              value="basic"
              className="w-full h-full flex items-center justify-center gap-2 text-sm font-medium
                data-[state=active]:bg-orange-500 data-[state=active]:text-white 
                data-[state=active]:shadow-[0_4px_20px_rgba(249,115,22,0.4)]
                text-gray-400 hover:text-white hover:bg-white/5
                rounded-[1rem] transition-all duration-300 ease-out"
            >
              <Calculator className="h-4 w-4" />
              {isAmharic ? "መሰረታዊ" : "Basic"}
            </TabsTrigger>
            <TabsTrigger
              value="allowances"
              className="w-full h-full flex items-center justify-center gap-2 text-sm font-medium
                data-[state=active]:bg-orange-500 data-[state=active]:text-white 
                data-[state=active]:shadow-[0_4px_20px_rgba(249,115,22,0.4)]
                text-gray-400 hover:text-white hover:bg-white/5
                rounded-[1rem] transition-all duration-300 ease-out"
            >
              <DollarSign className="h-4 w-4" />
              {isAmharic ? "አበሎች" : "Allowances"}
            </TabsTrigger>
            <TabsTrigger
              value="deductions"
              className="w-full h-full flex items-center justify-center gap-2 text-sm font-medium
                data-[state=active]:bg-orange-500 data-[state=active]:text-white 
                data-[state=active]:shadow-[0_4px_20px_rgba(249,115,22,0.4)]
                text-gray-400 hover:text-white hover:bg-white/5
                rounded-[1rem] transition-all duration-300 ease-out"
            >
              <Settings className="h-4 w-4" />
              {isAmharic ? "ቅናሾች" : "Deductions"}
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="basic" className="space-y-6 focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-[2.5rem] bg-[#1a1b1e]/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div className="p-4 sm:p-8 md:p-10 space-y-6 md:space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
                        {isAmharic ? "መሰረታዊ ደመወዝ" : "Basic Salary"}
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/5">Required</span>
                      </h2>
                      <p className="text-sm md:text-base text-gray-400">
                        {isAmharic ? "የእርስዎን መሰረታዊ ደመወዝ ያስገቡ" : "Enter your gross monthly income before any deductions."}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="grossSalary" className="text-sm font-medium text-gray-300 uppercase tracking-wider ml-1">
                        {isAmharic ? "ጠቅላላ ደመወዝ (ETB)" : "Gross Salary Amount"}
                      </label>
                      <div className="relative group/input">
                        <Input
                          id="grossSalary"
                          type="number"
                          value={inputs.grossSalary || ""}
                          onChange={(e) => updateInput("grossSalary", Number(e.target.value) || 0)}
                          placeholder="e.g. 15000"
                          className={`h-14 md:h-16 pl-6 pr-4 text-xl md:text-2xl bg-black/40 border-white/10 rounded-[1.2rem]
                            focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 focus:bg-black/60
                            transition-all duration-300 placeholder:text-gray-600 text-white
                            ${errors.grossSalary ? "border-red-500 focus:ring-red-500/10" : "hover:border-white/20"}`}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
                          ETB
                        </div>
                      </div>
                      {errors.grossSalary && (
                        <p className="text-sm text-red-500 flex items-center gap-2 pl-1 animate-in slide-in-from-left-2">
                          <span className="w-1 h-1 rounded-full bg-red-500" />
                          {errors.grossSalary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="allowances" className="space-y-6 focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-[2.5rem] bg-[#1a1b1e]/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="p-4 sm:p-8 md:p-10 space-y-6 md:space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-white tracking-tight">
                        {isAmharic ? "አበሎች" : "Allowances & Benefits"}
                      </h2>
                      <p className="text-gray-400">
                        {isAmharic ? "የተለያዩ አበሎችን ያስገቡ" : "Add your monthly allowances. Taxable allowances will affect your final tax."}
                      </p>
                    </div>

                    <div className="grid gap-6">
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

                      <div className="pt-4 border-t border-white/5">
                        <OvertimeCalculator
                          baseSalary={inputs.grossSalary}
                          overtimePay={inputs.overtimePay}
                          onOvertimeChange={(amount) => updateInput("overtimePay", amount)}
                          isAmharic={isAmharic}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="deductions" className="space-y-6 focus-visible:outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-[2.5rem] bg-[#1a1b1e]/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="p-4 sm:p-8 md:p-10 space-y-6 md:space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-white tracking-tight">
                        {isAmharic ? "ቅናሾች" : "Monthly Deductions"}
                      </h2>
                      <p className="text-gray-400">
                        {isAmharic ? "የተለያዩ ቅናሾችን ያስገቡ" : "Enter any mandatory deductions from your salary."}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label htmlFor="unionDues" className="text-sm font-medium text-gray-300">
                          {isAmharic ? "የሰራተኛ ማህበር ቅናሽ (ETB)" : "Union Dues"}
                        </label>
                        <Input
                          id="unionDues"
                          type="number"
                          value={inputs.unionDues || ""}
                          onChange={(e) => updateInput("unionDues", Number(e.target.value) || 0)}
                          placeholder="e.g. 50"
                          className="h-12 bg-black/40 border-white/10 rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-white"
                        />
                      </div>

                      {/* Custom loan deductions */}
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-300">{isAmharic ? "የብድር ቅናሾች" : "Loans & Repayments"}</label>
                          <button
                            type="button"
                            onClick={addLoan}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors"
                          >
                            + {isAmharic ? "አክል" : "Add Loan"}
                          </button>
                        </div>
                        {inputs.loanDeductions.map((loan, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-start">
                            <Input
                              className="col-span-6 h-10 bg-black/40 border-white/10 rounded-lg text-sm text-white"
                              placeholder={isAmharic ? "ለምሳሌ: የብድር" : "Name (e.g. Car Loan)"}
                              value={loan.name}
                              onChange={(e) => updateLoan(index, "name", e.target.value)}
                            />
                            <div className="col-span-4 relative">
                              <Input
                                className="h-10 bg-black/40 border-white/10 rounded-lg text-sm text-white pr-8"
                                type="number"
                                placeholder="0"
                                value={loan.amount === 0 ? "" : loan.amount}
                                onChange={(e) => updateLoan(index, "amount", Number(e.target.value || 0))}
                              />
                              <span className="absolute right-2 top-2.5 text-xs text-gray-500">ETB</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLoan(index)}
                              className="col-span-2 h-10 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <span className="sr-only">Remove</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                          </div>
                        ))}
                        {inputs.loanDeductions.length === 0 && (
                          <div className="text-center py-4 rounded-xl border border-dashed border-white/10 bg-white/5">
                            <p className="text-xs text-gray-500">{isAmharic ? "የብድር ቅናሽ የለም" : "No active loans"}</p>
                          </div>
                        )}
                      </div>

                      {/* Custom other deductions */}
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-300">{isAmharic ? "ሌሎች ቅናሾች" : "Other Deductions"}</label>
                          <button
                            type="button"
                            onClick={addOtherDeduction}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors"
                          >
                            + {isAmharic ? "አክል" : "Add Item"}
                          </button>
                        </div>
                        {inputs.otherDeductions.map((d, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-start">
                            <Input
                              className="col-span-6 h-10 bg-black/40 border-white/10 rounded-lg text-sm text-white"
                              placeholder={isAmharic ? "ለምሳሌ: መድን" : "Name (e.g. Insurance)"}
                              value={d.name}
                              onChange={(e) => updateOtherDeduction(index, "name", e.target.value)}
                            />
                            <div className="col-span-4 relative">
                              <Input
                                className="h-10 bg-black/40 border-white/10 rounded-lg text-sm text-white pr-8"
                                type="number"
                                placeholder="0"
                                value={d.amount === 0 ? "" : d.amount}
                                onChange={(e) => updateOtherDeduction(index, "amount", Number(e.target.value || 0))}
                              />
                              <span className="absolute right-2 top-2.5 text-xs text-gray-500">ETB</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOtherDeduction(index)}
                              className="col-span-2 h-10 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <span className="sr-only">Remove</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                          </div>
                        ))}
                        {inputs.otherDeductions.length === 0 && (
                          <div className="text-center py-4 rounded-xl border border-dashed border-white/10 bg-white/5">
                            <p className="text-xs text-gray-500">{isAmharic ? "ሌሎች ቅናሾች የሉም" : "No other deductions"}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
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
            value="impact"
            className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
          >
            <Zap className="h-4 w-4" />
            {isAmharic ? "ተጽዕኖ" : "Impact"}
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

        <TabsContent value="impact" className="space-y-6">
          <Suspense fallback={<LoadingSpinner />}>
            <ImpactCalculator baseInputs={inputs} baseCalculation={calculation} isAmharic={isAmharic} />
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
