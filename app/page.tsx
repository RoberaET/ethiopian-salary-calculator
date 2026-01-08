"use client"

/**
 * Ethiopian Salary Calculator 2025
 * Original Author: ROBERA MEKONNEN
 * Year: 2026
 * 
 * This calculator helps users calculate their Ethiopian salary with 2026 tax brackets.
 * If you use this code, please provide proper attribution to the original author.
 */

import { useState, useEffect, Suspense, lazy, useMemo, useCallback } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
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
import { ResultsSection, LoadingSpinner, ChartLoading, CurrencyConverter, InputSection } from "@/components/optimized-calculator"
import ClientOnly from "@/components/ClientOnly"

// Lazy load heavy components
const FloatingLines = dynamic(() => import("@/components/FloatingLines"), { ssr: false })
const ColorBends = dynamic(() => import("@/components/ColorBends"), { ssr: false })

const SalaryVisualization = lazy(() =>
  import("@/components/salary-visualization").then(module => ({ default: module.SalaryVisualization }))
)
const ImpactCalculator = lazy(() =>
  import("@/components/impact-calculator").then(module => ({ default: module.ImpactCalculator }))
)
const ExportShareOptions = lazy(() =>
  import("@/components/export-share-options").then(module => ({ default: module.ExportShareOptions }))
)

// Main component state and logic

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

  // Currency State
  const [currency, setCurrency] = useState<"ETB" | "USD">("ETB")
  const [exchangeRate, setExchangeRate] = useState<number>(153) // Default fallback: ~153 ETB = 1 USD

  useEffect(() => {
    // Fetch Exchange Rate
    const fetchRate = async () => {
      try {
        const res = await fetch("https://v6.exchangerate-api.com/v6/5e3a6345c77e6a156bd9613d/latest/USD")
        const data = await res.json()
        if (data && data.conversion_rates && data.conversion_rates.ETB) {
          // data.conversion_rates.ETB is how many ETB for 1 USD
          // We want to know how many USD for 1 ETB (to multiply ETB amounts by)
          // Actually, let's keep the raw rate (ETB per USD) and handle conversion logic carefully
          // If 1 USD = 120 ETB.
          // To convert ETB to USD: Amount / 120
          // To convert USD to ETB: Amount * 120
          setExchangeRate(data.conversion_rates.ETB)
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate, using fallback", error)
        // Keep default rate
      }
    }
    fetchRate()
  }, [])

  const currentRate = currency === "ETB" ? 1 : (1 / exchangeRate)

  const [activeTab, setActiveTab] = useState("basic")
  const [activeResultsTab, setActiveResultsTab] = useState("breakdown")
  // Removed mounting check to fix loading issue
  const today = new Date()
  const salaryDay = endOfMonth(today)
  const daysLeftForSalary = Math.max(0, differenceInCalendarDays(salaryDay, today))

  // Memoize expensive calculation to prevent unnecessary re-computations
  const calculation = useMemo(() => calculateSalary(inputs), [inputs])

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

  // Memoize input update function to prevent unnecessary re-renders
  const updateInput = useCallback((field: keyof SalaryInputs, value: any) => {
    setInputs((prev) => {
      // Only update if value actually changed
      if (prev[field] === value) return prev
      return { ...prev, [field]: value }
    })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }, [errors])

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

  // Removed loading state check to fix infinite loading issue

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        {isAmharic ? "ወደ ዋና ይዘት ይሂዱ" : "Skip to main content"}
      </a>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0a]/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 ring-1 ring-white/5 shadow-sm">
              <Image
                src="/images/et.svg"
                alt="Ethiopian Flag"
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:inline-block tracking-tight">
              {isAmharic ? "የኢትዮጵያ ደመወዝ ካልኩሌተር 2026" : "Ethiopian Salary Calculator 2026"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Toggles Container */}
            <div className="flex items-center gap-2 bg-white/5 p-1.5 px-3 rounded-full border border-white/5 hover:border-white/10 transition-colors" suppressHydrationWarning>
              {/* Language Toggle */}
              <div className="flex items-center gap-2 border-r border-white/10 pr-3 mr-1">
                <label htmlFor="language-toggle" className="text-xs font-medium cursor-pointer text-gray-400 hover:text-gray-200 transition-colors">
                  {isAmharic ? "አማርኛ" : "English"}
                </label>
                <Switch id="language-toggle" checked={isAmharic} onCheckedChange={setIsAmharic} className="scale-75 data-[state=checked]:bg-emerald-500" />
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center gap-2 pl-1">
                <label htmlFor="currency-toggle" className="text-xs font-medium cursor-pointer text-gray-400 hover:text-gray-200 transition-colors">
                  {currency}
                </label>
                <Switch
                  id="currency-toggle"
                  checked={currency === "USD"}
                  onCheckedChange={(c) => setCurrency(c ? "USD" : "ETB")}
                  className="scale-75 data-[state=checked]:bg-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for Fixed Navbar */}
      {/* Spacer for Fixed Navbar */}
      <div className="h-20" />

      {/* Skip Navigation for Accessibility */}
      <a
        href="#calculator"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        {isAmharic ? "ወደ ካልኩሌተር ይሂዱ" : "Skip to Calculator"}
      </a>
      {/* Dark Veil Background Section */}
      {/* Hero Section - Card Style */}
      <div className="container mx-auto px-4 mb-12">
        <section className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/20" style={{ width: '100%', height: 'auto', minHeight: '500px' }}>
          {/* Background Layer - use className for responsive height control if possible, or keep style but make it flexible */}
          <div className="absolute inset-0 z-0 h-full w-full">
            <ColorBends
              colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
              rotation={30}
              speed={0.3}
              scale={1.2}
              frequency={1.4}
              warpStrength={1.2}
              mouseInfluence={0.8}
              parallax={0.6}
              noise={0.08}
              transparent
            />
          </div>

          {/* Glass Overlay for Depth */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-0 pointer-events-none" />

          {/* Floating Badges */}
          <div className="absolute top-8 left-8 z-10 hidden md:block animate-float-slow">
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {isAmharic ? "የ2026 የታክስ ተመኖች ተካተዋል" : "Tax Rates Updated for 2026"}
            </div>
          </div>

          <div className="absolute bottom-12 right-12 z-10 hidden md:block animate-float-delayed">
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium flex items-center gap-2 shadow-lg">
              <Zap className="w-4 h-4 text-yellow-400" />
              {isAmharic ? "ፈጣን ስሌት" : "Instant Calculation"}
            </div>
          </div>

          {/* Content Layer */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl space-y-8"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-thin tracking-tighter text-white drop-shadow-2xl font-playfair uppercase">
                <span className="block mb-2">{isAmharic ? "ነፃ የኢትዮጵያ ደመወዝ ካልኩሌተር" : "Free Ethiopian Salary Calculator"}</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 font-normal font-playfair animate-gradient-x">
                  {isAmharic ? "2026 ዕትም" : "2026 Edition"}
                </span>
              </h1>

              <div className="flex flex-col items-center gap-6">
                <p className="text-lg md:text-2xl text-blue-50 font-light tracking-wide max-w-2xl leading-relaxed drop-shadow-md">
                  {isAmharic ? "ትክክለኛ የተጣራ ደመወዝዎን በወቅታዊው" : "Calculate your exact take-home pay with the absolute latest"}
                  <span className="font-medium text-white"> {isAmharic ? "2026 የታክስ ደረጃዎች ያግኙ" : "2026 Tax Brackets"}</span>.
                </p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4"
                >
                  <a
                    href="#calculator"
                    className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
                  >
                    {isAmharic ? "ማስላት ይጀምሩ" : "Start Calculating"}
                    <DollarSign className="w-4 h-4" />
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <main id="main-content" className="container mx-auto px-4 py-8" role="main">
        <div id="calculator" className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <InputSection
            inputs={inputs}
            errors={errors}
            updateInput={updateInput}
            isAmharic={isAmharic}
            date={date}
            setDate={setDate}
            daysLeftForSalary={daysLeftForSalary}
          />

          {/* Divider for mobile */}
          <div className="lg:hidden border-t border-border my-8"></div>

          {/* Results Section */}
          <div className="rounded-[2.5rem] bg-[#1a1b1e]/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden p-8 sm:p-10 space-y-8">
            {/* This part was likely refactored into ResultsSection but maybe I need to check where ResultsSection is actually used or if it was just defined in optimized-calculator.tsx but not used here yet? */}
            {/* Wait, looking at lines 299-505 in the original file view, it seems `app/page.tsx` was manually rendering the tabs content. */}
            {/* I need to see if `ResultsSection` component was actually imported and used or if I should replace the manual rendering with it. */}
            {/* The view_file output for `app/page.tsx` (Step 14) shows explicit rendering of Tabs on line 310. */}
            {/* I should follow the plan: "Pass currency and convertedRate down to ResultsSection". */}
            {/* But wait, `ResultsSection` IS used in `app/page.tsx`? Let me double check Step 14. */}
            {/* Line 31 calls `import { ResultsSection ... }`. */}
            {/* But the JSX starting at line 300 seems to manually implement the tabs. It doesn't use `<ResultsSection />`. */}
            {/* Ah, I see. I should probably REPLACE the manual implementation with `<ResultsSection />` OR just pass props to the children if I keep it. */}
            {/* Ideally I should use the `ResultsSection` component if it duplicates this logic. */}
            {/* Let's verify if I should replacing lines 300-505 with <ResultsSection ... />. */}
            {/* For now, to be safe and incremental, I will just update the props passed to the children components (SalaryBreakdownCard etc) inside the existing JSX, */}
            {/* OR check if I can swap it out. The `ResultsSection` in `optimized-calculator.tsx` (Step 21) seems to have the same structure. */}
            {/* Let's assume I should update the existing JSX to pass down props, as swapping 200 lines might be risky without verify. */}
            {/* Actually, looking at `optimized-calculator.tsx`, `ResultsSection` wraps `SalaryBreakdownCard` etc. */}
            {/* I will add `currency` and `rate` to the state/render logic and pass it to `SalaryBreakdownCard`. */}
            {/* So instead of replacing the whole block with `ResultsSection`, I will just update the `SalaryBreakdownCard` usage. */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isAmharic ? "የደመወዝ ውጤት" : "Salary Results"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isAmharic ? "የእርስዎን የተጣራ ደመወዝ ይመልከቱ" : "View your take-home pay breakdown"}
              </p>
            </div>
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
                      value="impact"
                      className="w-full flex items-center justify-center gap-1 text-xs sm:text-sm data-[state=active]:!bg-orange-500 data-[state=active]:!text-white rounded-md transition-all duration-200 h-10 px-2 hover:bg-muted-foreground/10 data-[state=inactive]:hover:bg-muted-foreground/5"
                    >
                      <Zap className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{isAmharic ? "ተጽዕኖ" : "Impact"}</span>
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
                        currency={currency}
                        rate={currentRate}
                      />

                      {/* Currency Converter */}
                      <Suspense fallback={<LoadingSpinner />}>
                        <CurrencyConverter netSalary={calculation.netSalary} isAmharic={isAmharic} />
                      </Suspense>

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
                              {isAmharic ? "የታክስ ደረጃዎች" : "Tax Brackets (Proclamation No. 1395/2026)"}
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
                      <Suspense fallback={<ChartLoading />}>
                        <SalaryVisualization calculation={calculation} isAmharic={isAmharic} currency={currency} rate={currentRate} />
                      </Suspense>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="impact" className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeResultsTab === "impact" && (
                    <motion.div
                      key="impact"
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6 motion-safe"
                    >
                      {/* Impact Calculator */}
                      <Suspense fallback={<LoadingSpinner />}>
                        <ImpactCalculator baseInputs={inputs} baseCalculation={calculation} isAmharic={isAmharic} currency={currency} rate={currentRate} />
                      </Suspense>
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
                      <Suspense fallback={<LoadingSpinner />}>
                        <ExportShareOptions calculation={calculation} inputs={inputs} isAmharic={isAmharic} />
                      </Suspense>
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
        <section className="calculator-benefits mt-8 rounded-lg overflow-hidden relative" style={{ width: '100%', height: 'min(400px, 80vh)' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-800" />
            </div>
          </div>
          <div className="absolute inset-0 p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
              {isAmharic ? "የእኛን የኢትዮጵያ ደመወዝ ካልኩሌተር ለምን እንጠቀም?" : "Why Use Our Ethiopian Salary Calculator?"}
            </h2>
            <ul className="space-y-3 text-white">
              <li className="flex items-center gap-3">
                <span className="text-green-400 font-bold">✓</span>
                {isAmharic ? <>በ2026 <strong>የኢትዮጵያ ታክስ ቅንጅቶች</strong> የተዘመነ</> : <>✓ Updated with 2026 <strong>Ethiopia tax brackets</strong></>}
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
        <section id="faq-section" className="faq-section mt-12 rounded-lg overflow-hidden relative" style={{ width: '100%', height: 'min(600px, 90vh)' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-cyan-800" />
            </div>
          </div>
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
                    : <>Our <strong>Ethiopian income tax calculator</strong> uses the official PAYE rates from Proclamation No. 1395/2026. This tax calculator provides accurate results for all employees working in Ethiopia.</>
                  }
                </p>
              </div>

              <div className="faq-item p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {isAmharic ? "ኢትዮጵያ በ2026 ምን ዓይነት የታክስ ቅንጅቶች እንደሚጠቀም?" : "What tax brackets does Ethiopia use in 2026?"}
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
        <section className="related-tools mt-12 rounded-lg overflow-hidden relative" style={{ width: '100%', height: 'min(400px, 80vh)' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-800" />
            </div>
          </div>
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
      </main >

      {/* Footer */}
      < footer className="border-t bg-card mt-16" >
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
                  ? "© 2026 የኢትዮጵያ ደመወዝ ካልኩሌተር - በ Robera Mekonnen የተሰላ"
                  : "© 2026 Ethiopian Salary Calculator - Developed by Robera Mekonnen"
                }
              </p>
            </div>
          </div>
        </div>
      </footer >
    </div >
  )
}
