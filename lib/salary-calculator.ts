/**
 * Ethiopian Salary Calculator - Tax Calculation Logic
 * Original Author: ROBERA MEKONNEN
 * Year: 2025
 * 
 * This file contains the core tax calculation logic for Ethiopian salary calculations.
 * If you use this code, please provide proper attribution to the original author.
 */

export interface TaxBracket {
  min: number
  max: number | null
  rate: number
  label: string
}

export interface SalaryInputs {
  grossSalary: number
  transportAllowance: number
  transportTaxable: boolean
  transportPercentage: number
  housingAllowance: number
  housingTaxable: boolean
  housingPercentage: number
  medicalAllowance: number
  medicalTaxable: boolean
  medicalPercentage: number
  otherAllowances: Array<{
    name: string
    amount: number
    taxable: boolean
    percentage?: number
  }>
  overtimePay: number
  unionDues: number
  loanDeductions: Array<{
    name: string
    amount: number
  }>
  otherDeductions: Array<{
    name: string
    amount: number
  }>
}

export interface SalaryCalculation {
  grossSalary: number
  totalAllowances: number
  taxableAllowances: number
  nonTaxableAllowances: number
  taxableIncome: number
  incomeTax: number
  pensionContribution: number
  totalDeductions: number
  netSalary: number
  taxBracketDetails: Array<{
    bracket: TaxBracket
    taxableAmount: number
    taxAmount: number
  }>
  effectiveTaxRate: number
  marginalTaxRate: number
}

// Ethiopian Income Tax Brackets (Updated System)
export const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 2000, rate: 0, label: "0 - 2,000 ETB (Exempt)" },
  { min: 2001, max: 4000, rate: 0.15, label: "2,001 - 4,000 ETB (15%)" },
  { min: 4001, max: 7000, rate: 0.20, label: "4,001 - 7,000 ETB (20%)" },
  { min: 7001, max: 10000, rate: 0.25, label: "7,001 - 10,000 ETB (25%)" },
  { min: 10001, max: 14000, rate: 0.30, label: "10,001 - 14,000 ETB (30%)" },
  { min: 14001, max: null, rate: 0.35, label: "Over 14,000 ETB (35%)" },
]

// Deductible amounts for each bracket
const TAX_DEDUCTIBLES = {
  2000: 0,
  4000: 300,
  7000: 500,
  10000: 850,
  14000: 1350,
  infinity: 2050
}

export const PENSION_RATE = 0.07 // 7% pension contribution

export function calculateIncomeTax(taxableIncome: number): {
  totalTax: number
  bracketDetails: Array<{
    bracket: TaxBracket
    taxableAmount: number
    taxAmount: number
  }>
  effectiveTaxRate: number
  marginalTaxRate: number
} {
  let totalTax = 0
  const bracketDetails: Array<{
    bracket: TaxBracket
    taxableAmount: number
    taxAmount: number
  }> = []

  let marginalTaxRate = 0

  // New tax calculation system with deductible amounts
  if (taxableIncome <= 2000) {
    // <= 2000: Tax is 0
    totalTax = 0
    marginalTaxRate = 0
    bracketDetails.push({
      bracket: TAX_BRACKETS[0],
      taxableAmount: taxableIncome,
      taxAmount: 0,
    })
  } else if (taxableIncome <= 4000) {
    // > 2000 and <= 4000: Tax is (15% of income) minus 300
    totalTax = (taxableIncome * 0.15) - 300
    marginalTaxRate = 0.15
    bracketDetails.push({
      bracket: TAX_BRACKETS[1],
      taxableAmount: taxableIncome,
      taxAmount: totalTax,
    })
  } else if (taxableIncome <= 7000) {
    // > 4000 and <= 7000: Tax is (20% of income) minus 500
    totalTax = (taxableIncome * 0.20) - 500
    marginalTaxRate = 0.20
    bracketDetails.push({
      bracket: TAX_BRACKETS[2],
      taxableAmount: taxableIncome,
      taxAmount: totalTax,
    })
  } else if (taxableIncome <= 10000) {
    // > 7000 and <= 10000: Tax is (25% of income) minus 850
    totalTax = (taxableIncome * 0.25) - 850
    marginalTaxRate = 0.25
    bracketDetails.push({
      bracket: TAX_BRACKETS[3],
      taxableAmount: taxableIncome,
      taxAmount: totalTax,
    })
  } else if (taxableIncome <= 14000) {
    // > 10000 and <= 14000: Tax is (30% of income) minus 1350
    totalTax = (taxableIncome * 0.30) - 1350
    marginalTaxRate = 0.30
    bracketDetails.push({
      bracket: TAX_BRACKETS[4],
      taxableAmount: taxableIncome,
      taxAmount: totalTax,
    })
  } else {
    // > 14000: Tax is (35% of income) minus 2050
    totalTax = (taxableIncome * 0.35) - 2050
    marginalTaxRate = 0.35
    bracketDetails.push({
      bracket: TAX_BRACKETS[5],
      taxableAmount: taxableIncome,
      taxAmount: totalTax,
    })
  }

  // Ensure tax is not negative
  totalTax = Math.max(0, totalTax)

  const effectiveTaxRate = taxableIncome > 0 ? totalTax / taxableIncome : 0

  return {
    totalTax,
    bracketDetails,
    effectiveTaxRate,
    marginalTaxRate,
  }
}

export function calculateSalary(inputs: SalaryInputs): SalaryCalculation {
  // Calculate total allowances
  const totalAllowances =
    inputs.transportAllowance +
    inputs.housingAllowance +
    inputs.medicalAllowance +
    inputs.otherAllowances.reduce((sum, allowance) => sum + allowance.amount, 0)

  // GrossSalary = Basic + sum(Allowances)
  const grossSalary = inputs.grossSalary + totalAllowances

  // Calculate taxable and non-taxable allowances
  const taxableAllowances =
    (inputs.transportTaxable ? inputs.transportAllowance : 0) +
    (inputs.housingTaxable ? inputs.housingAllowance : 0) +
    (inputs.medicalTaxable ? inputs.medicalAllowance : 0) +
    inputs.otherAllowances
      .filter((allowance) => allowance.taxable)
      .reduce((sum, allowance) => sum + allowance.amount, 0)

  const nonTaxableAllowances = totalAllowances - taxableAllowances

  // Calculate taxable income according to the specific rules:
  // Total Taxable Income = Basic Salary + All Allowances - 600 Birr (from each taxable allowance)
  // The 600 Birr exemption is applied to each allowance that has its taxable toggle ON
  
  const taxableIncome = inputs.grossSalary + 
    (inputs.housingTaxable ? Math.max(0, inputs.housingAllowance - 600) : 0) +
    (inputs.medicalTaxable ? Math.max(0, inputs.medicalAllowance - 600) : 0) +
    (inputs.transportTaxable ? Math.max(0, inputs.transportAllowance - 600) : 0) +
    inputs.otherAllowances.reduce((sum, allowance) => 
      sum + (allowance.taxable ? Math.max(0, allowance.amount - 600) : 0), 0)

  // Calculate income tax on the remaining amount
  const taxCalculation = calculateIncomeTax(taxableIncome)

  // Calculate pension contribution (7% of gross salary)
  const pensionContribution = inputs.grossSalary * PENSION_RATE

  // Calculate total deductions
  const totalOtherDeductions =
    inputs.unionDues +
    inputs.loanDeductions.reduce((sum, loan) => sum + loan.amount, 0) +
    inputs.otherDeductions.reduce((sum, deduction) => sum + deduction.amount, 0)

  const totalDeductions = taxCalculation.totalTax + pensionContribution + totalOtherDeductions

  // Calculate net salary using the simple formula
  // NetSalary = Gross Income - Total Deductions
  const grossIncome = inputs.grossSalary + totalAllowances + inputs.overtimePay
  const netSalary = grossIncome - totalDeductions

  return {
    grossSalary: grossSalary, // Use calculated gross salary
    totalAllowances,
    taxableAllowances,
    nonTaxableAllowances,
    taxableIncome: taxableIncome, // Show the calculated taxable income
    incomeTax: taxCalculation.totalTax,
    pensionContribution,
    totalDeductions,
    netSalary,
    taxBracketDetails: taxCalculation.bracketDetails,
    effectiveTaxRate: taxCalculation.effectiveTaxRate,
    marginalTaxRate: taxCalculation.marginalTaxRate,
  }
}

// Utility functions for formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("en-ET").format(amount)
}

// Reverse calculation: find gross salary for desired net salary
// Optimized with early exit and reduced iterations
export function calculateRequiredGrossSalary(
  desiredNetSalary: number,
  allowances: Omit<SalaryInputs, "grossSalary">,
): number {
  // Early exit for edge cases
  if (desiredNetSalary <= 0) return 0
  
  let low = 0
  let high = Math.min(desiredNetSalary * 2, 100000) // Reduced upper bound
  let iterations = 0
  const maxIterations = 20 // Reduced from 50
  const tolerance = 5 // Increased tolerance for faster convergence

  // Use a more efficient binary search with early termination
  while (low <= high && iterations < maxIterations) {
    const mid = Math.floor((low + high) / 2)
    const calculation = calculateSalary({ ...allowances, grossSalary: mid })
    const difference = calculation.netSalary - desiredNetSalary

    if (Math.abs(difference) <= tolerance) {
      return mid
    }

    if (difference < 0) {
      low = mid + 1
    } else {
      high = mid - 1
    }

    iterations++
  }

  return Math.floor((low + high) / 2)
}
