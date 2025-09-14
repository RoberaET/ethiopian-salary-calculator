"use client"

/**
 * Ethiopian Salary Calculator 2025
 * Original Author: ROBERA MEKONNEN
 * Year: 2025
 * 
 * This calculator helps users calculate their Ethiopian salary with 2025 tax brackets.
 * If you use this code, please provide proper attribution to the original author.
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, DollarSign, Settings, FileText, BarChart3, Zap, Share2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { calculateSalary, TAX_BRACKETS, type SalaryInputs } from "@/lib/salary-calculator"
import { DynamicInputSection } from "@/components/dynamic-input-section"
import { Calendar as UiCalendar } from "@/components/ui/calendar"
import { endOfMonth, differenceInCalendarDays } from "date-fns"
import { OvertimeCalculator } from "@/components/overtime-calculator"
import { SalaryBreakdownCard } from "@/components/salary-breakdown-card"
import { SalaryVisualization } from "@/components/salary-visualization"
import DarkVeil from "@/components/dark-veil"
import { SalaryNegotiationMode } from "@/components/salary-negotiation-mode"
import { CurrencyConverter } from "@/components/currency-converter"
import { WhatIfCalculator } from "@/components/what-if-calculator"
import { ExportShareOptions } from "@/components/export-share-options"
import { sendInvoiceEmail } from "@/lib/email-client"
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
  const [activeTab, setActiveTab] = useState("basic")
  const [activeResultsTab, setActiveResultsTab] = useState("breakdown")
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted on client side to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])
  const today = new Date()
  const salaryDay = endOfMonth(today)
  const daysLeftForSalary = Math.max(0, differenceInCalendarDays(salaryDay, today))

  const calculation = calculateSalary(inputs)

  // Optimized animation variants for better performance
  const tabVariants = {
    hidden: { 
      opacity: 0, 
      y: 10
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  }

  // Simplified tab trigger variants for better performance
  const tabTriggerVariants = {
    hover: { 
      scale: 1.01,
      transition: { duration: 0.15, ease: "easeOut" }
    },
    tap: { 
      scale: 0.99,
      transition: { duration: 0.1, ease: "easeIn" }
    }
  }

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

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading calculator...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/images/ReactorTech.png"
                alt={isAmharic ? "የኢትዮጵያ ደመወዝ ካልኩሌተር ሎጎ" : "Ethiopian Salary Calculator Logo - Free Tax Calculator Tool"}
                width={48}
                height={48}
                className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg object-contain"
                loading="eager"
                decoding="async"
              />
              <img
                src="/images/et.svg"
                alt={isAmharic ? "የኢትዮጵያ ባንዲራ - የኢትዮጵያ ደመወዝ ካልኩሌተር" : "Ethiopian Flag - Ethiopian Salary Calculator 2025"}
                width={44}
                height={44}
                className="h-8 w-8 sm:h-11 sm:w-11 rounded-sm"
                loading="lazy"
                decoding="async"
              />
              <div className="min-w-0">
                <h1 className="text-base sm:text-2xl font-bold text-foreground leading-tight break-words">
                  {isAmharic ? "የኢትዮጵያ ደመወዝ ካልኩሌተር 2025 - የተጣራ ደመወዝ እና የገቢ ታክስ ካልኩሌተር" : "Ethiopian Salary Calculator 2025 - Calculate Your Net Pay & Income Tax"}
                </h1>
                <p className="hidden sm:block text-sm text-muted-foreground">
                  {isAmharic ? "የተጣራ ደመወዝዎን ያስሉ" : "Calculate Your Take-Home Pay"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
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
        {/* Skip Navigation for Accessibility */}
        <a 
          href="#calculator" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          {isAmharic ? "ወደ ካልኩሌተር ይሂዱ" : "Skip to Calculator"}
        </a>
        {/* Dark Veil Background Section */}
        <section className="mb-8 rounded-lg overflow-hidden relative dark-veil-container" style={{ width: '100%', height: '600px' }}>
          <DarkVeil 
            hueShift={45}
            noiseIntensity={0.02}
            scanlineIntensity={0.1}
            speed={0.3}
            scanlineFrequency={2.0}
            warpAmount={0.1}
            resolutionScale={1}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8 max-w-4xl">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                {isAmharic ? "ነፃ የኢትዮጵያ ደመወዝ ካልኩሌተር 2018" : "Free Ethiopian Salary Calculator 2025"}
              </h2>
              <p className="text-lg md:text-xl mb-6 drop-shadow-md opacity-90">
                {isAmharic 
                  ? "ትክክለኛውን የተጣራ ደመወዝዎን ያስሉ"
                  : "Calculate Your Net Pay & Income Tax"
                }
              </p>
              <p className="text-base md:text-lg drop-shadow-md opacity-80 max-w-3xl mx-auto">
                {isAmharic 
                  ? <>የእኛ <strong>የኢትዮጵያ ደመወዝ ካልኩሌተር</strong> የቅርብ ጊዜ <strong>የኢትዮጵያ ታክስ ቅንጅቶች 2025</strong> በመጠቀም ትክክለኛውን የተጣራ ደመወዝዎን ለማስላት ይረዳዎታል።</>
                  : <>Our <strong>Ethiopian salary calculator</strong> helps you calculate your exact take-home pay using the latest <strong>Ethiopia tax brackets 2025</strong>.</>
                }
              </p>
            </div>
          </div>
        </section>

        <div id="calculator" className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Salary Negotiation Mode */}
            <SalaryNegotiationMode
              inputs={inputs}
              onGrossSalaryChange={(grossSalary) => updateInput("grossSalary", grossSalary)}
              isAmharic={isAmharic}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <TabsList className="grid w-full grid-cols-3 gap-1 p-1 bg-muted rounded-lg h-12 [&>[data-state=active]]:bg-orange-500 [&>[data-state=active]]:text-white">
                <motion.div
                  variants={tabTriggerVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full motion-safe"
                >
                  <TabsTrigger 
                    value="basic" 
                    className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
                  >
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{isAmharic ? "መሰረታዊ" : "Basic"}</span>
                </TabsTrigger>
                </motion.div>
                <motion.div
                  variants={tabTriggerVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full motion-safe"
                >
                  <TabsTrigger 
                    value="allowances" 
                    className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
                  >
                    <Settings className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{isAmharic ? "አበሎች" : "Allowances"}</span>
                </TabsTrigger>
                </motion.div>
                <motion.div
                  variants={tabTriggerVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full motion-safe"
                >
                  <TabsTrigger 
                    value="deductions" 
                    className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-3 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{isAmharic ? "ቅናሾች" : "Deductions"}</span>
                </TabsTrigger>
                </motion.div>
              </TabsList>
              </motion.div>

              <TabsContent value="basic" className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeTab === "basic" && (
                    <motion.div
                      key="basic"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6 motion-safe"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="allowances" className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeTab === "allowances" && (
                    <motion.div
                      key="allowances"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6 motion-safe"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="deductions" className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeTab === "deductions" && (
                    <motion.div
                      key="deductions"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6 motion-safe"
                    >
                {/* Union Dues */}
                <Card>
                  <CardHeader>
                    <CardTitle>{isAmharic ? "መደበኛ ቅናሾች" : "Standard Deductions"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="union-dues" className="block mb-2">{isAmharic ? "የሰራተኛ ማህበር ክፍያ" : "Union Dues"}</Label>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Results Tabs */}
            <Tabs value={activeResultsTab} onValueChange={setActiveResultsTab} className="w-full">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-muted rounded-lg h-12 [&>[data-state=active]]:bg-orange-500 [&>[data-state=active]]:text-white">
                <motion.div
                  variants={tabTriggerVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full motion-safe"
                >
                  <TabsTrigger 
                    value="breakdown" 
                    className="w-full flex items-center justify-center gap-1 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-2 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
                  >
                    <FileText className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{isAmharic ? "ዝርዝር" : "Details"}</span>
                </TabsTrigger>
                </motion.div>
                <motion.div
                  variants={tabTriggerVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full motion-safe"
                >
                  <TabsTrigger 
                    value="visualization" 
                    className="w-full flex items-center justify-center gap-1 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-2 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
                  >
                    <BarChart3 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{isAmharic ? "ምስላዊ" : "Visual"}</span>
                </TabsTrigger>
                </motion.div>
                <motion.div
                  variants={tabTriggerVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full motion-safe"
                >
                  <TabsTrigger 
                    value="whatif" 
                    className="w-full flex items-center justify-center gap-1 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-2 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
                  >
                    <Zap className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{isAmharic ? "ምን ቢሆን" : "What-If"}</span>
                </TabsTrigger>
                </motion.div>
                <motion.div
                  variants={tabTriggerVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full motion-safe"
                >
                  <TabsTrigger 
                    value="export" 
                    className="w-full flex items-center justify-center gap-1 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-2 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
                  >
                    <Share2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{isAmharic ? "ማጋራት" : "Share"}</span>
                </TabsTrigger>
                </motion.div>
              </TabsList>
              </motion.div>

              <TabsContent value="breakdown" className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeResultsTab === "breakdown" && (
                    <motion.div
                      key="breakdown"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6 motion-safe"
                    >
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
                        {isAmharic ? "የታክስ ደረጃዎች" : "Tax Brackets (Proclamation No. 1395/2025)"}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="visualization" className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeResultsTab === "visualization" && (
                    <motion.div
                      key="visualization"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6 motion-safe"
                    >
                {/* Salary Visualization */}
                <SalaryVisualization calculation={calculation} isAmharic={isAmharic} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="whatif" className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeResultsTab === "whatif" && (
                    <motion.div
                      key="whatif"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6 motion-safe"
                    >
                {/* What-If Calculator */}
                <WhatIfCalculator baseInputs={inputs} baseCalculation={calculation} isAmharic={isAmharic} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="export" className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeResultsTab === "export" && (
                    <motion.div
                      key="export"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6 motion-safe"
                    >
                {/* Export & Share Options */}
                <ExportShareOptions calculation={calculation} inputs={inputs} isAmharic={isAmharic} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* SEO Content Section - After Calculator */}
        <section className="tax-info mt-12 p-6 rounded-lg border bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-zinc-900 dark:to-zinc-800 border-orange-200 dark:border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {isAmharic ? "የኢትዮጵያ ታክስ ስሌት መረዳት" : "Understanding Ethiopian Tax Calculation"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {isAmharic 
              ? <>የ<strong>ኢትዮጵያ ደመወዝ ካልኩሌተር</strong> ከፍተኛ ገቢ ያላቸው ሰዎች ተጨማሪ ታክስ የሚከፍሉበት የተለያዩ የታክስ ቅንጅቶችን ይጠቀማል። የእኛ <strong>የኢትዮጵያ PAYE ካልኩሌተር</strong> እነዚህን ተመኖች በራስ-ሰር ይተገብራል።</>
              : <>The <strong>Ethiopian salary calculator</strong> uses progressive tax brackets where higher earners pay more tax. Our <strong>Ethiopia PAYE calculator</strong> automatically applies these rates:</>
            }
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded border bg-white dark:bg-card border-gray-200 dark:border-border text-foreground">
                <span>0 - 2,000 ETB:</span>
                <span className="font-semibold text-green-600">0% tax</span>
              </div>
              <div className="flex justify-between p-2 rounded border bg-white dark:bg-card border-gray-200 dark:border-border text-foreground">
                <span>2,001 - 4,000 ETB:</span>
                <span className="font-semibold text-blue-600">15% tax</span>
              </div>
              <div className="flex justify-between p-2 rounded border bg-white dark:bg-card border-gray-200 dark:border-border text-foreground">
                <span>4,001 - 7,000 ETB:</span>
                <span className="font-semibold text-orange-600">20% tax</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded border bg-white dark:bg-card border-gray-200 dark:border-border text-foreground">
                <span>7,001 - 10,000 ETB:</span>
                <span className="font-semibold text-red-600">25% tax</span>
              </div>
              <div className="flex justify-between p-2 rounded border bg-white dark:bg-card border-gray-200 dark:border-border text-foreground">
                <span>10,001 - 14,000 ETB:</span>
                <span className="font-semibold text-purple-600">30% tax</span>
              </div>
              <div className="flex justify-between p-2 rounded border bg-white dark:bg-card border-gray-200 dark:border-border text-foreground">
                <span>14,001+ ETB:</span>
                <span className="font-semibold text-red-800">35% tax</span>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Benefits Section */}
        <section className="calculator-benefits mt-8 rounded-lg overflow-hidden relative dark-veil-container" style={{ width: '100%', height: 'min(400px, 80vh)' }}>
          <DarkVeil 
            hueShift={120}
            noiseIntensity={0.015}
            scanlineIntensity={0.08}
            speed={0.25}
            scanlineFrequency={1.8}
            warpAmount={0.08}
            resolutionScale={1}
          />
          <div className="absolute inset-0 p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
              {isAmharic ? "የእኛን የኢትዮጵያ ደመወዝ ካልኩሌተር ለምን እንጠቀም?" : "Why Use Our Ethiopian Salary Calculator?"}
            </h2>
            <ul className="space-y-3 text-white">
              <li className="flex items-center gap-3">
                <span className="text-green-400 font-bold">✓</span>
                {isAmharic ? <>በ2025 <strong>የኢትዮጵያ ታክስ ቅንጅቶች</strong> የተዘመነ</> : <>✓ Updated with 2025 <strong>Ethiopia tax brackets</strong></>}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400 font-bold">✓</span>
                {isAmharic ? <>ትክክለኛ <strong>PAYE ታክስ ስሌት</strong></> : <>✓ Accurate <strong>PAYE tax calculation</strong></>}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400 font-bold">✓</span>
                {isAmharic ? "የጡረታ አበል (7%) ያካተተ" : "✓ Includes pension contribution (7%)"}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400 font-bold">✓</span>
                {isAmharic ? <>ነፃ <strong>የኢትዮጵያ የተጣራ ደመወዝ ካልኩሌተር</strong></> : <>✓ Free <strong>Ethiopian net salary calculator</strong></>}
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq-section" className="faq-section mt-12 rounded-lg overflow-hidden relative dark-veil-container" style={{ width: '100%', height: 'min(600px, 90vh)' }}>
          <DarkVeil 
            hueShift={200}
            noiseIntensity={0.02}
            scanlineIntensity={0.1}
            speed={0.3}
            scanlineFrequency={2.0}
            warpAmount={0.1}
            resolutionScale={1}
          />
          <div className="absolute inset-0 p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">
              {isAmharic ? "ተደጋግሞ የሚጠየቁ ጥያቄዎች - የኢትዮጵያ ደመወዝ ካልኩሌተር" : "Frequently Asked Questions - Ethiopian Salary Calculator"}
            </h2>
          
          <div className="space-y-6">
            <div className="faq-item p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">
                {isAmharic ? "ይህ የኢትዮጵያ ደመወዝ ካልኩሌተር ምን ያህል ትክክለኛ ነው?" : "How accurate is this Ethiopian salary calculator?"}
              </h3>
              <p className="text-gray-200">
                {isAmharic 
                  ? <>የእኛ <strong>የኢትዮጵያ የገቢ ታክስ ካልኩሌተር</strong> ከሕግ ቁጥር 979/2016 አገር አቋራጭ PAYE ተመኖችን ይጠቀማል። ይህ የታክስ ካልኩሌተር በኢትዮጵያ ውስጥ ለሚሰሩ ሁሉም ሰራተኞች ትክክለኛ ውጤቶችን ይሰጣል።</>
                  : <>Our <strong>Ethiopian income tax calculator</strong> uses the official PAYE rates from Proclamation No. 1395/2025. This tax calculator provides accurate results for all employees working in Ethiopia.</>
                }
              </p>
            </div>

            <div className="faq-item p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">
                {isAmharic ? "ኢትዮጵያ በ2025 ምን ዓይነት የታክስ ቅንጅቶች እንደሚጠቀም?" : "What tax brackets does Ethiopia use in 2025?"}
              </h3>
              <p className="text-gray-200">
                {isAmharic 
                  ? <>የ<strong>ኢትዮጵያ ታክስ ካልኩሌተር</strong> እነዚህን የተለያዩ ተመኖች ይተገብራል፡ 0-2,000 ብር (0%)፣ 2,001-4,000 ብር (15%)፣ 4,001-7,000 ብር (20%)፣ 7,001-10,000 ብር (25%)፣ 10,001-14,000 ብር (30%)፣ እና 14,001+ ብር (35%)።</>
                  : <>The <strong>Ethiopia tax calculator</strong> applies these progressive rates: 0–2,000 ETB (0%), 2,001–4,000 ETB (15%), 4,001–7,000 ETB (20%), 7,001–10,000 ETB (25%), 10,001–14,000 ETB (30%), and 14,001+ ETB (35%).</>
                }
              </p>
            </div>

            <div className="faq-item p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">
                {isAmharic ? "የጡረታ አበል እንዴት ይሰላል?" : "How is pension contribution calculated?"}
              </h3>
              <p className="text-gray-200">
                {isAmharic 
                  ? "የጡረታ አበል ከጠቅላላ ደመወዝ 7% በሆነ መጠን ይሰላል። ይህ በኢትዮጵያ የሰራተኛ ሕግ መሰረት የሚያስፈልግ የጡረታ አበል ነው።"
                  : "Pension contribution is calculated as 7% of your gross salary. This is a mandatory pension contribution required by Ethiopian labor law."
                }
              </p>
            </div>

            <div className="faq-item p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">
                {isAmharic ? "በአዲስ አበባ የሚሰሩ ሰዎች ምን ያህል ታክስ ይከፍላሉ?" : "How much tax do people working in Addis Ababa pay?"}
              </h3>
              <p className="text-gray-200">
                {isAmharic 
                  ? "በአዲስ አበባ የሚሰሩ ሰዎች በኢትዮጵያ ውስጥ በማንኛውም ቦታ የሚሰሩ ሰዎች ተመሳሳይ የታክስ ተመኖች ይከፍላሉ። የእኛ ካልኩሌተር ለአዲስ አበባ እና ለሌሎች የኢትዮጵያ ከተሞች ትክክለኛ ውጤቶችን ይሰጣል።"
                  : "People working in Addis Ababa pay the same tax rates as employees anywhere in Ethiopia. Our calculator provides accurate results for Addis Ababa and other Ethiopian cities."
                }
              </p>
            </div>

            <div className="faq-item p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">
                {isAmharic ? "የኢትዮጵያ ደመወዝ ካልኩሌተር ለ HR ባለሙያዎች ይጠቅማል?" : "Is this Ethiopian salary calculator useful for HR professionals?"}
              </h3>
              <p className="text-gray-200">
                {isAmharic 
                  ? "አዎ፣ የእኛ ካልኩሌተር ለ HR ባለሙያዎች፣ አካውንታንቶች፣ እና የሰራተኛ አስተዳደር ባለሙያዎች በጣም ጠቃሚ ነው። ትክክለኛ የታክስ ስሌቶችን እና የደመወዝ አወቃቀሮችን ለማድረግ ይረዳል።"
                  : "Yes, our calculator is extremely useful for HR professionals, accountants, and payroll specialists. It helps with accurate tax calculations and salary structuring for Ethiopian employees."
                }
              </p>
            </div>
          </div>
          </div>
        </section>

        {/* Related Tools Section */}
        <section className="related-tools mt-12 rounded-lg overflow-hidden relative dark-veil-container" style={{ width: '100%', height: 'min(400px, 80vh)' }}>
          <DarkVeil 
            hueShift={280}
            noiseIntensity={0.018}
            scanlineIntensity={0.09}
            speed={0.28}
            scanlineFrequency={1.9}
            warpAmount={0.09}
            resolutionScale={1}
          />
          <div className="absolute inset-0 p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
              {isAmharic ? "ተዛማጅ የኢትዮጵያ የገንዘብ መሳሪያዎች" : "Related Ethiopian Financial Tools"}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20">
                <h3 className="font-semibold text-white mb-2">
                  {isAmharic ? "የኢትዮጵያ የገንዘብ አያያዝ ካልኩሌተር" : "Ethiopian Budget Calculator"}
                </h3>
                <p className="text-sm text-gray-200 mb-3">
                  {isAmharic ? "የወራዊ ወጪዎችዎን እና የገቢዎን አያያዝ ያስሉ" : "Calculate your monthly expenses and income management"}
                </p>
                <a href="#" className="text-blue-300 hover:text-blue-200 text-sm font-medium">
                  {isAmharic ? "ይጀምሩ" : "Get Started"} →
                </a>
              </div>
              <div className="p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20">
                <h3 className="font-semibold text-white mb-2">
                  {isAmharic ? "የኢትዮጵያ የጡረታ ካልኩሌተር" : "Ethiopian Pension Calculator"}
                </h3>
                <p className="text-sm text-gray-200 mb-3">
                  {isAmharic ? "የጡረታ አበልዎን እና የጡረታ ክፍያዎን ያስሉ" : "Calculate your pension contributions and retirement benefits"}
                </p>
                <a href="#" className="text-blue-300 hover:text-blue-200 text-sm font-medium">
                  {isAmharic ? "ይጀምሩ" : "Get Started"} →
                </a>
              </div>
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
                  ? "© 2025 የኢትዮጵያ ደመወዝ ካልኩሌተር - በ Robera Mekonnen የተሰላ" 
                  : "© 2025 Ethiopian Salary Calculator - Developed by Robera Mekonnen"
                }
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
