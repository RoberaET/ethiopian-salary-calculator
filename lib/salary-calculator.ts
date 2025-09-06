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

// Ethiopian tax brackets according to Proclamation No. 979/2016
export const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 600, rate: 0, label: "0 - 600 ETB (Exempt)" },
  { min: 601, max: 1650, rate: 0.1, label: "601 - 1,650 ETB (10%)" },
  { min: 1651, max: 3200, rate: 0.15, label: "1,651 - 3,200 ETB (15%)" },
  { min: 3201, max: 5250, rate: 0.2, label: "3,201 - 5,250 ETB (20%)" },
  { min: 5251, max: 7800, rate: 0.25, label: "5,251 - 7,800 ETB (25%)" },
  { min: 7801, max: 10900, rate: 0.3, label: "7,801 - 10,900 ETB (30%)" },
  { min: 10901, max: null, rate: 0.35, label: "Over 10,900 ETB (35%)" },
]

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
  let remainingIncome = taxableIncome
  const bracketDetails: Array<{
    bracket: TaxBracket
    taxableAmount: number
    taxAmount: number
  }> = []

  let marginalTaxRate = 0

  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome <= 0) break

    const bracketMax = bracket.max || Number.POSITIVE_INFINITY
    const bracketSize = bracketMax - bracket.min + 1
    const taxableInBracket = Math.min(remainingIncome, bracketSize)

    // Adjust for the bracket minimum
    const actualTaxableInBracket = Math.min(taxableInBracket, Math.max(0, taxableIncome - bracket.min + 1))

    if (actualTaxableInBracket > 0) {
      const taxInBracket = actualTaxableInBracket * bracket.rate
      totalTax += taxInBracket
      marginalTaxRate = bracket.rate

      bracketDetails.push({
        bracket,
        taxableAmount: actualTaxableInBracket,
        taxAmount: taxInBracket,
      })

      remainingIncome -= actualTaxableInBracket
    }
  }

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

  // Calculate taxable and non-taxable allowances
  const taxableAllowances =
    (inputs.transportTaxable ? inputs.transportAllowance : 0) +
    (inputs.housingTaxable ? inputs.housingAllowance : 0) +
    (inputs.medicalTaxable ? inputs.medicalAllowance : 0) +
    inputs.otherAllowances
      .filter((allowance) => allowance.taxable)
      .reduce((sum, allowance) => sum + allowance.amount, 0)

  const nonTaxableAllowances = totalAllowances - taxableAllowances

  // Calculate taxable income
  const taxableIncome = inputs.grossSalary + taxableAllowances + inputs.overtimePay

  // Calculate income tax
  const taxCalculation = calculateIncomeTax(taxableIncome)

  // Calculate pension contribution (7% of gross salary)
  const pensionContribution = inputs.grossSalary * PENSION_RATE

  // Calculate total deductions
  const totalOtherDeductions =
    inputs.unionDues +
    inputs.loanDeductions.reduce((sum, loan) => sum + loan.amount, 0) +
    inputs.otherDeductions.reduce((sum, deduction) => sum + deduction.amount, 0)

  const totalDeductions = taxCalculation.totalTax + pensionContribution + totalOtherDeductions

  // Calculate net salary
  const netSalary = inputs.grossSalary + totalAllowances + inputs.overtimePay - totalDeductions

  return {
    grossSalary: inputs.grossSalary,
    totalAllowances,
    taxableAllowances,
    nonTaxableAllowances,
    taxableIncome,
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
export function calculateRequiredGrossSalary(
  desiredNetSalary: number,
  allowances: Omit<SalaryInputs, "grossSalary">,
): number {
  let low = 0
  let high = desiredNetSalary * 3 // Start with a reasonable upper bound
  let iterations = 0
  const maxIterations = 50
  const tolerance = 1 // ETB tolerance

  while (low <= high && iterations < maxIterations) {
    const mid = Math.floor((low + high) / 2)
    const calculation = calculateSalary({ ...allowances, grossSalary: mid })

    if (Math.abs(calculation.netSalary - desiredNetSalary) <= tolerance) {
      return mid
    }

    if (calculation.netSalary < desiredNetSalary) {
      low = mid + 1
    } else {
      high = mid - 1
    }

    iterations++
  }

  return Math.floor((low + high) / 2)
}
