"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { PercentageInput } from "@/components/percentage-input"

interface DynamicAllowance {
  id: string
  name: string
  amount: number
  taxable: boolean
  percentage?: number
}

interface DynamicLoan {
  id: string
  name: string
  amount: number
}

interface DynamicDeduction {
  id: string
  name: string
  amount: number
}

interface DynamicInputSectionProps {
  allowances: DynamicAllowance[]
  loans: DynamicLoan[]
  deductions: DynamicDeduction[]
  onAllowancesChange: (allowances: DynamicAllowance[]) => void
  onLoansChange: (loans: DynamicLoan[]) => void
  onDeductionsChange: (deductions: DynamicDeduction[]) => void
  isAmharic: boolean
  baseSalary: number
}

export function DynamicInputSection({
  allowances,
  loans,
  deductions,
  onAllowancesChange,
  onLoansChange,
  onDeductionsChange,
  isAmharic,
  baseSalary,
}: DynamicInputSectionProps) {
  const addAllowance = () => {
    const newAllowance: DynamicAllowance = {
      id: Date.now().toString(),
      name: "",
      amount: 0,
      taxable: false,
      percentage: 0,
    }
    onAllowancesChange([...allowances, newAllowance])
  }

  const updateAllowance = (id: string, field: keyof DynamicAllowance, value: any) => {
    onAllowancesChange(
      allowances.map((allowance) => (allowance.id === id ? { ...allowance, [field]: value } : allowance)),
    )
  }

  const removeAllowance = (id: string) => {
    onAllowancesChange(allowances.filter((allowance) => allowance.id !== id))
  }

  const addLoan = () => {
    const newLoan: DynamicLoan = {
      id: Date.now().toString(),
      name: "",
      amount: 0,
    }
    onLoansChange([...loans, newLoan])
  }

  const updateLoan = (id: string, field: keyof DynamicLoan, value: any) => {
    onLoansChange(loans.map((loan) => (loan.id === id ? { ...loan, [field]: value } : loan)))
  }

  const removeLoan = (id: string) => {
    onLoansChange(loans.filter((loan) => loan.id !== id))
  }

  const addDeduction = () => {
    const newDeduction: DynamicDeduction = {
      id: Date.now().toString(),
      name: "",
      amount: 0,
    }
    onDeductionsChange([...deductions, newDeduction])
  }

  const updateDeduction = (id: string, field: keyof DynamicDeduction, value: any) => {
    onDeductionsChange(
      deductions.map((deduction) => (deduction.id === id ? { ...deduction, [field]: value } : deduction)),
    )
  }

  const removeDeduction = (id: string) => {
    onDeductionsChange(deductions.filter((deduction) => deduction.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Custom Allowances */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isAmharic ? "ተጨማሪ አበሎች" : "Additional Allowances"}</CardTitle>
            <Button onClick={addAllowance} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {isAmharic ? "አክል" : "Add"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {allowances.map((allowance) => (
            <div key={allowance.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor={`allowance-name-${allowance.id}`}>{isAmharic ? "የአበል ስም" : "Allowance Name"}</Label>
                  <Input
                    id={`allowance-name-${allowance.id}`}
                    value={allowance.name}
                    onChange={(e) => updateAllowance(allowance.id, "name", e.target.value)}
                    placeholder={isAmharic ? "ለምሳሌ: የስልክ አበል" : "e.g., Phone Allowance"}
                    className="mt-1"
                  />
                </div>
                <Button onClick={() => removeAllowance(allowance.id)} size="sm" variant="destructive" className="ml-4">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <PercentageInput
                label=""
                amount={allowance.amount}
                percentage={allowance.percentage || 0}
                isTaxable={allowance.taxable}
                onAmountChange={(amount) => updateAllowance(allowance.id, "amount", amount)}
                onPercentageChange={(percentage) => updateAllowance(allowance.id, "percentage", percentage)}
                onTaxableChange={(taxable) => updateAllowance(allowance.id, "taxable", taxable)}
                baseSalary={baseSalary}
                isAmharic={isAmharic}
                placeholder="0"
              />
            </div>
          ))}
          {allowances.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              {isAmharic ? "ተጨማሪ አበሎች የሉም" : "No additional allowances added"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Loan Deductions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isAmharic ? "የብድር ቅናሾች" : "Loan Deductions"}</CardTitle>
            <Button onClick={addLoan} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {isAmharic ? "አክል" : "Add"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loans.map((loan) => (
            <div key={loan.id} className="flex items-end gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor={`loan-name-${loan.id}`} className="block mb-2">{isAmharic ? "የብድር ዓይነት" : "Loan Description"}</Label>
                <Input
                  id={`loan-name-${loan.id}`}
                  value={loan.name}
                  onChange={(e) => updateLoan(loan.id, "name", e.target.value)}
                  placeholder={isAmharic ? "ለምሳሌ: የቤት ብድር" : "e.g., Housing Loan"}
                  className="mt-0"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`loan-amount-${loan.id}`} className="block mb-2">{isAmharic ? "ወራዊ ክፍያ (ብር)" : "Monthly Payment (ETB)"}</Label>
                <Input
                  id={`loan-amount-${loan.id}`}
                  type="number"
                  value={loan.amount}
                  onChange={(e) => updateLoan(loan.id, "amount", Number(e.target.value))}
                  placeholder="0"
                  className="mt-0"
                />
              </div>
              <Button onClick={() => removeLoan(loan.id)} size="sm" variant="destructive" className="mb-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {loans.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              {isAmharic ? "የብድር ቅናሾች የሉም" : "No loan deductions added"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Other Deductions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isAmharic ? "ሌሎች ቅናሾች" : "Other Deductions"}</CardTitle>
            <Button onClick={addDeduction} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {isAmharic ? "አክል" : "Add"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {deductions.map((deduction) => (
            <div key={deduction.id} className="flex items-end gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor={`deduction-name-${deduction.id}`} className="block mb-2">
                  {isAmharic ? "የቅናሽ ዓይነት" : "Deduction Description"}
                </Label>
                <Input
                  id={`deduction-name-${deduction.id}`}
                  value={deduction.name}
                  onChange={(e) => updateDeduction(deduction.id, "name", e.target.value)}
                  placeholder={isAmharic ? "ለምሳሌ: የመድን ክፍያ" : "e.g., Insurance Premium"}
                  className="mt-0"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`deduction-amount-${deduction.id}`} className="block mb-2">{isAmharic ? "መጠን (ብር)" : "Amount (ETB)"}</Label>
                <Input
                  id={`deduction-amount-${deduction.id}`}
                  type="number"
                  value={deduction.amount === 0 ? "" : deduction.amount}
                  onChange={(e) => updateDeduction(deduction.id, "amount", Number(e.target.value === "" ? 0 : e.target.value))}
                  placeholder="0"
                  className="mt-0"
                />
              </div>
              <Button onClick={() => removeDeduction(deduction.id)} size="sm" variant="destructive" className="mb-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {deductions.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              {isAmharic ? "ሌሎች ቅናሾች የሉም" : "No other deductions added"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
