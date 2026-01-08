"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { TrendingUp, Zap, ArrowRight, RotateCcw } from "lucide-react"
import { calculateSalary, formatCurrency, type SalaryInputs } from "@/lib/salary-calculator"

interface ImpactCalculatorProps {
    baseInputs: SalaryInputs
    baseCalculation: any
    isAmharic: boolean
    currency?: "ETB" | "USD"
    rate?: number
}

export function ImpactCalculator({ baseInputs, baseCalculation, isAmharic, currency = "ETB", rate = 1 }: ImpactCalculatorProps) {
    // Helper to format currency based on selected currency
    const formatDisplayCurrency = (amount: number) => {
        return new Intl.NumberFormat(currency === "ETB" ? "en-ET" : "en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
        }).format(amount * rate)
    }

    // State for the "New" values
    const [newGrossSalary, setNewGrossSalary] = useState(baseInputs.grossSalary)
    const [newTaxableAllowances, setNewTaxableAllowances] = useState(0)
    const [newNonTaxableAllowances, setNewNonTaxableAllowances] = useState(0)
    const [newDeductions, setNewDeductions] = useState(0)
    const [isAnnual, setIsAnnual] = useState(false)

    // Calculate initial totals from baseInputs to populate defaults
    const baseTaxableAllowances = useMemo(() => {
        let total = 0
        if (baseInputs.transportTaxable) total += baseInputs.transportAllowance
        if (baseInputs.housingTaxable) total += baseInputs.housingAllowance
        if (baseInputs.medicalTaxable) total += baseInputs.medicalAllowance
        baseInputs.otherAllowances.forEach(a => {
            if (a.taxable) total += a.amount
        })
        total += baseInputs.overtimePay // Overtime is generally taxable
        return total
    }, [baseInputs])

    const baseNonTaxableAllowances = useMemo(() => {
        let total = 0
        if (!baseInputs.transportTaxable) total += baseInputs.transportAllowance
        if (!baseInputs.housingTaxable) total += baseInputs.housingAllowance
        if (!baseInputs.medicalTaxable) total += baseInputs.medicalAllowance
        baseInputs.otherAllowances.forEach(a => {
            if (!a.taxable) total += a.amount
        })
        return total
    }, [baseInputs])

    const baseDeductions = useMemo(() => {
        let total = baseInputs.unionDues
        baseInputs.loanDeductions.forEach(d => total += d.amount)
        baseInputs.otherDeductions.forEach(d => total += d.amount)
        return total
    }, [baseInputs])

    // Initialize state with base values when they change (or on mount)
    useEffect(() => {
        setNewGrossSalary(baseInputs.grossSalary)
        setNewTaxableAllowances(baseTaxableAllowances)
        setNewNonTaxableAllowances(baseNonTaxableAllowances)
        setNewDeductions(baseDeductions)
    }, [baseInputs, baseTaxableAllowances, baseNonTaxableAllowances, baseDeductions])

    // Reset function
    const resetValues = () => {
        setNewGrossSalary(baseInputs.grossSalary)
        setNewTaxableAllowances(baseTaxableAllowances)
        setNewNonTaxableAllowances(baseNonTaxableAllowances)
        setNewDeductions(baseDeductions)
    }

    // Calculate the "New" scenario
    const newCalculation = useMemo(() => {
        // Clone base inputs
        const inputs: SalaryInputs = { ...baseInputs }

        // Update Gross Salary
        inputs.grossSalary = newGrossSalary

        // Handle Allowances Diff
        // We add the difference as a generic "Adjustment" allowance
        const taxableDiff = newTaxableAllowances - baseTaxableAllowances
        const nonTaxableDiff = newNonTaxableAllowances - baseNonTaxableAllowances

        // Remove any previous "Adjustment" allowances from our input clone to avoid stacking if we were persisting state differently
        // But here we reconstruct inputs from baseInputs each time, so it's clean.

        const newOtherAllowances = [...inputs.otherAllowances]

        if (taxableDiff !== 0) {
            newOtherAllowances.push({
                name: isAmharic ? "የተፅእኖ ማስተካከያ (ታክስ የሚከፈልበት)" : "Impact Adjustment (Taxable)",
                amount: taxableDiff,
                taxable: true
            })
        }

        if (nonTaxableDiff !== 0) {
            newOtherAllowances.push({
                name: isAmharic ? "የተፅእኖ ማስተካከያ (ታክስ የማይከፈልበት)" : "Impact Adjustment (Non-Taxable)",
                amount: nonTaxableDiff,
                taxable: false
            })
        }
        inputs.otherAllowances = newOtherAllowances

        // Handle Deductions Diff
        const deductionsDiff = newDeductions - baseDeductions
        const newOtherDeductions = [...inputs.otherDeductions]

        if (deductionsDiff !== 0) {
            newOtherDeductions.push({
                name: isAmharic ? "የተፅእኖ ማስተካከያ" : "Impact Adjustment",
                amount: deductionsDiff
            })
        }
        inputs.otherDeductions = newOtherDeductions

        return calculateSalary(inputs)
    }, [baseInputs, newGrossSalary, newTaxableAllowances, newNonTaxableAllowances, newDeductions, baseTaxableAllowances, baseNonTaxableAllowances, baseDeductions])

    // Calculate Differences
    const multiplier = isAnnual ? 12 : 1
    const netDiff = (newCalculation.netSalary - baseCalculation.netSalary) * multiplier
    const taxDiff = (newCalculation.incomeTax - baseCalculation.incomeTax) * multiplier
    const grossDiff = ((newGrossSalary + newTaxableAllowances + newNonTaxableAllowances) - (baseInputs.grossSalary + baseTaxableAllowances + baseNonTaxableAllowances)) * multiplier

    return (
        <Card className="bg-black/20 border-white/10 text-white">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        {isAmharic ? "ተጽዕኖ ካልኩሌተር" : "Impact Calculator"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="annual-mode" className="text-xs text-gray-400">
                            {isAmharic ? "ዓመታዊ" : "Yearly"}
                        </Label>
                        <Switch
                            id="annual-mode"
                            checked={isAnnual}
                            onCheckedChange={setIsAnnual}
                        />
                        <Button variant="ghost" size="icon" onClick={resetValues} className="h-8 w-8 ml-2 text-gray-400 hover:text-white">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Comparison Header */}
                <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-white/5">
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{isAmharic ? "አሁን" : "Current"}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{isAmharic ? "አዲስ" : "New Scenario"}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{isAmharic ? "ልዩነት" : "Impact"}</div>
                </div>

                {/* Highlight Result: Net Pay */}
                <div className="grid grid-cols-3 gap-2 items-center text-center p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                        <div className="text-xs text-gray-400 mb-1">{isAmharic ? "የተጣራ ደመወዝ" : "Net Pay"}</div>
                        <div className="font-semibold text-lg">{formatDisplayCurrency(baseCalculation.netSalary * multiplier)}</div>
                    </div>

                    <div className="flex justify-center text-gray-500">
                        <ArrowRight className="h-5 w-5" />
                    </div>

                    <div>
                        <div className="text-xs text-gray-400 mb-1">{isAmharic ? "አዲስ የተጣራ" : "New Net"}</div>
                        <div className="font-bold text-xl text-white">{formatDisplayCurrency(newCalculation.netSalary * multiplier)}</div>
                    </div>
                </div>

                {/* Impact Badge */}
                <div className="flex justify-center -mt-3">
                    <Badge className={`text-base px-4 py-1.5 ${netDiff > 0 ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : netDiff < 0 ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-gray-500/20 text-gray-400"}`}>
                        {netDiff > 0 ? "+" : ""}{formatDisplayCurrency(netDiff)}
                    </Badge>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300 border-l-2 border-yellow-500 pl-3">
                        {isAmharic ? "ግብዓቶችን ማስተካከል" : "Adjust Inputs"}
                    </h4>

                    {/* Controls */}
                    <div className="space-y-4">
                        {/* Gross Salary */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <Label className="text-gray-400">{isAmharic ? "መሰረታዊ ደመወዝ" : "Gross Salary"}</Label>
                                <span className="text-gray-500">{isAmharic ? "አሁን" : "Current"}: {formatDisplayCurrency(baseInputs.grossSalary)}</span>
                            </div>
                            <Input
                                type="number"
                                value={newGrossSalary || ""}
                                onChange={(e) => setNewGrossSalary(Number(e.target.value))}
                                className="bg-black/40 border-white/10 text-white"
                            />
                        </div>

                        {/* Taxable Allowances */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <Label className="text-gray-400">{isAmharic ? "ታክስ የሚከፈልባቸው አበሎች" : "Taxable Allowances"}</Label>
                                <span className="text-gray-500">{formatDisplayCurrency(baseTaxableAllowances)}</span>
                            </div>
                            <Input
                                type="number"
                                value={newTaxableAllowances || ""}
                                onChange={(e) => setNewTaxableAllowances(Number(e.target.value))}
                                className="bg-black/40 border-white/10 text-white"
                            />
                        </div>

                        {/* Non-Taxable Allowances */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <Label className="text-gray-400">{isAmharic ? "ታክስ የማይከፈልባቸው አበሎች" : "Non-Taxable Allowances"}</Label>
                                <span className="text-gray-500">{formatDisplayCurrency(baseNonTaxableAllowances)}</span>
                            </div>
                            <Input
                                type="number"
                                value={newNonTaxableAllowances || ""}
                                onChange={(e) => setNewNonTaxableAllowances(Number(e.target.value))}
                                className="bg-black/40 border-white/10 text-white"
                            />
                        </div>

                        {/* Deductions */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <Label className="text-gray-400">{isAmharic ? "ጠቅላላ ቅናሾች" : "Total Deductions"}</Label>
                                <span className="text-gray-500">{formatDisplayCurrency(baseDeductions)}</span>
                            </div>
                            <Input
                                type="number"
                                value={newDeductions || ""}
                                onChange={(e) => setNewDeductions(Number(e.target.value))}
                                className="bg-black/40 border-white/10 text-white"
                            />
                        </div>
                    </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Impact Breakdown */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-300 border-l-2 border-blue-500 pl-3">
                        {isAmharic ? "የለውጥ ምንጮች" : "Why it changed"}
                    </h4>

                    <div className="grid gap-2 text-sm">
                        {grossDiff !== 0 && (
                            <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                                <span className="text-gray-400">{isAmharic ? "ጠቅላላ ገቢ" : "Gross Income"}</span>
                                <span className={grossDiff > 0 ? "text-green-400" : "text-red-400"}>
                                    {grossDiff > 0 ? "+" : ""}{formatDisplayCurrency(grossDiff)}
                                </span>
                            </div>
                        )}

                        {taxDiff !== 0 && (
                            <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                                <span className="text-gray-400">{isAmharic ? "የገቢ ታክስ" : "Income Tax"}</span>
                                <span className={taxDiff > 0 ? "text-red-400" : "text-green-400"}>
                                    {taxDiff > 0 ? "+" : ""}{formatDisplayCurrency(taxDiff)}
                                </span>
                            </div>
                        )}

                        {/* Pension Diff */}
                        {(newCalculation.pensionContribution - baseCalculation.pensionContribution) !== 0 && (
                            <div className="flex justify-between items-center bg-white/5 p-2 rounded">
                                <span className="text-gray-400">{isAmharic ? "ጡረታ" : "Pension (7%)"}</span>
                                <span className="text-red-400">
                                    {newCalculation.pensionContribution > baseCalculation.pensionContribution ? "+" : ""}
                                    {formatDisplayCurrency((newCalculation.pensionContribution - baseCalculation.pensionContribution) * multiplier)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
