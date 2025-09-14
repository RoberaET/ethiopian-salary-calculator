"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Share2, Mail, FileText, Copy, Check } from "lucide-react"
import { formatCurrency, type SalaryCalculation, type SalaryInputs } from "@/lib/salary-calculator"

interface ExportShareOptionsProps {
  calculation: SalaryCalculation
  inputs: SalaryInputs
  isAmharic: boolean
}

export function ExportShareOptions({ calculation, inputs, isAmharic }: ExportShareOptionsProps) {
  const [copied, setCopied] = useState(false)
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sentOk, setSentOk] = useState(false)

  const generatePayslipText = () => {
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    return `
${isAmharic ? "የደመወዝ ደረሰኝ" : "SALARY SLIP"}
${isAmharic ? "ቀን" : "Date"}: ${date}

${isAmharic ? "ጠቅላላ ገቢ" : "GROSS INCOME"}:
${isAmharic ? "መሰረታዊ ደመወዝ" : "Basic Salary"}: ${formatCurrency(calculation.grossSalary)}
${isAmharic ? "ጠቅላላ አበሎች" : "Total Allowances"}: ${formatCurrency(calculation.totalAllowances)}
${inputs.overtimePay > 0 ? `${isAmharic ? "ተጨማሪ ሰዓት" : "Overtime Pay"}: ${formatCurrency(inputs.overtimePay)}` : ""}

${isAmharic ? "ቅናሾች" : "DEDUCTIONS"}:
${isAmharic ? "የገቢ ታክስ" : "Income Tax (PAYE)"}: ${formatCurrency(calculation.incomeTax)}
${isAmharic ? "የጡረታ አበል" : "Pension Contribution (7%)"}: ${formatCurrency(calculation.pensionContribution)}
${inputs.unionDues > 0 ? `${isAmharic ? "የሰራተኛ ማህበር ቅናሽ" : "Union Dues"}: ${formatCurrency(inputs.unionDues)}` : ""}

${isAmharic ? "የተጣራ ደመወዝ" : "NET SALARY"}: ${formatCurrency(calculation.netSalary)}

${isAmharic ? "የታክስ መረጃ" : "TAX INFORMATION"}:
${isAmharic ? "ውጤታማ ታክስ መጠን" : "Effective Tax Rate"}: ${(calculation.effectiveTaxRate * 100).toFixed(1)}%
${isAmharic ? "ወሳኝ ታክስ መጠን" : "Marginal Tax Rate"}: ${(calculation.marginalTaxRate * 100).toFixed(0)}%

${isAmharic ? "በ Robera Mekonnen የተሰላ" : "Calculated by Robera Mekonnen"}
    `.trim()
  }

  const handleEmail = () => {
    setSendError(null)
    setSentOk(false)
    setShowEmailPopup(true)
  }

  const handleSendNow = async () => {
    if (!recipient) {
      setSendError(isAmharic ? "ኢሜይል አስገባ" : "Please enter an email")
      return
    }
    try {
      setSending(true)
      setSendError(null)
      const subject = isAmharic ? "የደመወዝ ደረሰኝ" : "Salary Slip from Ethiopian Salary Calculator"
      const resp = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject,
          variables: {
            companyName: 'Ethiopian Salary Calculator',
            userName: isAmharic ? 'ደንበኛ' : 'Customer',
            invoiceDate: new Date().toLocaleDateString(),
            grossSalary: formatCurrency(calculation.grossSalary),
            totalAllowances: formatCurrency(calculation.totalAllowances),
            incomeTax: formatCurrency(calculation.incomeTax),
            pension: formatCurrency(calculation.pensionContribution),
            netSalary: formatCurrency(calculation.netSalary),
            effectiveTaxRate: `${(calculation.effectiveTaxRate * 100).toFixed(1)}%`,
            marginalTaxRate: `${(calculation.marginalTaxRate * 100).toFixed(0)}%`,
          },
        }),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({} as any))
        throw new Error(data.error || 'Failed to send')
      }
      setSentOk(true)
      setTimeout(() => {
        setShowEmailPopup(false)
        setRecipient("")
        setSentOk(false)
      }, 10000)
    } catch (e: any) {
      setSendError(e.message || 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatePayslipText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: isAmharic ? "የደመወዝ ስሌት" : "Salary Calculation",
      text: `${isAmharic ? "የተጣራ ደመወዝ" : "Net Salary"}: ${formatCurrency(calculation.netSalary)}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyToClipboard()
    }
  }

  const generatePDF = () => {
    // Build classic slip rows (like the provided template)
    const earnings: Array<{ label: string; amount: number }> = []
    earnings.push({ label: isAmharic ? "መሰረታዊ ደመወዝ" : "Basic Salary", amount: inputs.grossSalary })
    if (inputs.housingAllowance > 0) earnings.push({ label: isAmharic ? "የቤት አበል" : "HRA", amount: inputs.housingAllowance })
    if (inputs.transportAllowance > 0) earnings.push({ label: isAmharic ? "የመጓጓዣ አበል" : "Conveyance", amount: inputs.transportAllowance })
    if (inputs.medicalAllowance > 0) earnings.push({ label: isAmharic ? "የህክምና አበል" : "Medical", amount: inputs.medicalAllowance })
    inputs.otherAllowances.forEach((a) => {
      if (a.amount > 0) earnings.push({ label: a.name || (isAmharic ? "ሌላ አበል" : "Other Allowance"), amount: a.amount })
    })
    if (inputs.overtimePay > 0) earnings.push({ label: isAmharic ? "ተጨማሪ ሰዓት" : "Overtime", amount: inputs.overtimePay })

    const loansTotal = inputs.loanDeductions.reduce((s, l) => s + l.amount, 0)
    const otherDedTotal = inputs.otherDeductions.reduce((s, d) => s + d.amount, 0)
    const deductions: Array<{ label: string; amount: number }> = []
    deductions.push({ label: isAmharic ? "የጡረታ አበል" : "Pension Contribution (7%)", amount: calculation.pensionContribution })
    if (inputs.unionDues > 0) deductions.push({ label: isAmharic ? "የሰራተኛ ማህበር ቅናሽ" : "Union Dues", amount: inputs.unionDues })
    if (loansTotal > 0) deductions.push({ label: isAmharic ? "ብድር ቅናሽ" : "Loan Deduction", amount: loansTotal })
    if (otherDedTotal > 0) deductions.push({ label: isAmharic ? "ሌሎች ቅናሾች" : "Other Deductions", amount: otherDedTotal })
    deductions.push({ label: isAmharic ? "የገቢ ታክስ" : "Income Tax (PAYE)", amount: calculation.incomeTax })

    const earningsTotal = earnings.reduce((s, e) => s + e.amount, 0)
    const deductionsTotal = deductions.reduce((s, d) => s + d.amount, 0)

    const maxRows = Math.max(earnings.length, deductions.length)
    const rowsHtml = new Array(maxRows).fill(0).map((_, i) => {
      const e = earnings[i]
      const d = deductions[i]
      return `
        <tr>
          <td class="desc">${e ? e.label : "&nbsp;"}</td>
          <td class="amt">${e ? formatCurrency(e.amount) : "&nbsp;"}</td>
          <td class="desc">${d ? d.label : "&nbsp;"}</td>
          <td class="amt">${d ? formatCurrency(d.amount) : "&nbsp;"}</td>
        </tr>
      `
    }).join("")

    const printWindow = window.open("", "_blank")
    if (!printWindow) return
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
          <meta charset="utf-8" />
            <title>${isAmharic ? "የደመወዝ ደረሰኝ" : "Salary Slip"}</title>
            <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; color: #000; margin: 24px; }
            .center { text-align: center; }
            .company { font-size: 22px; font-weight: 700; }
            .subtitle { margin-top: 2px; font-size: 12px; }
            .line { border-bottom: 1px solid #000; height: 12px; display: inline-block; min-width: 240px; }
            .row { margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #000; padding: 6px 8px; font-size: 12px; }
            th { background: #f5f5f5; }
            .desc { width: 32%; }
            .amt { width: 18%; text-align: right; }
            .total-row td { font-weight: 700; }
            .net-row td { font-weight: 800; font-size: 14px; }
            .no-border { border: none; }
            .footer { margin-top: 16px; font-size: 12px; }
            .footer-bar { display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:6px; border-top:1px solid #000; font-size:11px; }
            .sign-row { display: flex; justify-content: space-between; margin-top: 28px; }
            .sign { width: 45%; }
            </style>
          </head>
          <body>
          <div class="center">
            <div class="company">${isAmharic ? "የኩባንያ ስም" : "Company Name"}</div>
            <div class="subtitle">${isAmharic ? "የደመወዝ ደረሰኝ" : "Salary Slip"}</div>
              </div>

          <div class="row"><strong>${isAmharic ? "የሰራተኛ ስም" : "Employee Name"}:</strong> <span class="line"></span></div>
          <div class="row"><strong>${isAmharic ? "ስራ መደብ" : "Designation"}:</strong> <span class="line"></span></div>
          <div class="row"><strong>${isAmharic ? "ወር እና ዓመት" : "Month & Year"}:</strong> <span class="line"></span></div>

          <table>
            <thead>
              <tr>
                <th colspan="2">${isAmharic ? "የገቢ ክፍል" : "Earnings"}</th>
                <th colspan="2">${isAmharic ? "የቅናሽ ክፍል" : "Deductions"}</th>
              </tr>
              <tr>
                <th class="desc">${isAmharic ? "መግለጫ" : "Particulars"}</th>
                <th class="amt">${isAmharic ? "መጠን" : "Amount"}</th>
                <th class="desc">${isAmharic ? "መግለጫ" : "Particulars"}</th>
                <th class="amt">${isAmharic ? "መጠን" : "Amount"}</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td>${isAmharic ? "ጠቅላላ ጨመራ" : "Total Addition"}</td>
                <td class="amt">${formatCurrency(earningsTotal)}</td>
                <td>${isAmharic ? "ጠቅላላ ቅናሽ" : "Total Deduction"}</td>
                <td class="amt">${formatCurrency(deductionsTotal)}</td>
              </tr>
              <tr class="net-row">
                <td colspan="3" style="text-align:right;">${isAmharic ? "የተጣራ ደመወዝ" : "NET Salary"}</td>
                <td class="amt">${formatCurrency(calculation.netSalary)}</td>
              </tr>
            </tbody>
          </table>

              <div class="footer">
            <div class="row"><strong>${isAmharic ? "በቃላት" : "In Words"}:</strong> ETB ${formatCurrency(calculation.netSalary)} ${isAmharic ? "ብቻ" : "Only"}</div>
            <div class="row"><strong>${isAmharic ? "የቼክ ቁ." : "Cheque No."}</strong> ____________ &nbsp;&nbsp; <strong>${isAmharic ? "የባንክ ስም" : "Name of Bank"}</strong> _________________________</div>
            <div class="row"><strong>${isAmharic ? "ቀን" : "Date"}:</strong> ${new Date().toLocaleDateString()}</div>
            <div class="sign-row">
              <div class="sign"><strong>${isAmharic ? "የሰራተኛ ፊርማ" : "Signature of the Employee"}</strong> ________________________</div>
              <div class="sign"><strong>${isAmharic ? "ዳይሬክተር" : "Director"}</strong> ________________________</div>
              </div>
            <div class="footer-bar">
              <div>${isAmharic ? "የሂሳብ ቀን" : "Calculated on"}: ${new Date().toLocaleDateString()}</div>
              <div>${isAmharic ? "ድህረ ገጽ" : "Site"}: https://ethiopiansalarycalculator.vercel.app/</div>
            </div>
          </div>

          <script>window.print()</script>
          </body>
        </html>
      `)
      printWindow.document.close()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          {isAmharic ? "ወደ ውጭ መላክ እና ማጋራት" : "Export & Share"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" onClick={handleEmail} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Mail className="h-4 w-4" />
            {isAmharic ? "ኢሜይል" : "Email"}
          </Button>
          <Button onClick={handleCopyToClipboard} variant="outline" className="flex items-center gap-2 bg-transparent">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? (isAmharic ? "ተቀድቷል" : "Copied") : isAmharic ? "ቅዳ" : "Copy"}
          </Button>
        </div>

        <Separator />

        {/* Export Options */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{isAmharic ? "የወደ ውጭ መላክ አማራጮች" : "Export Options"}</h4>

          <Button onClick={generatePDF} variant="outline" className="w-full justify-start bg-transparent">
            <FileText className="h-4 w-4 mr-2" />
            {isAmharic ? "PDF ማውረድ" : "Download PDF"}
          </Button>

          <Button onClick={handleShare} variant="outline" className="w-full justify-start bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            {isAmharic ? "ማጋራት" : "Share Results"}
          </Button>
        </div>

        <Separator />

        {/* Quick Summary for Sharing */}
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="font-semibold text-sm mb-2">{isAmharic ? "ፈጣን ማጠቃለያ" : "Quick Summary"}</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>{isAmharic ? "ጠቅላላ ደመወዝ" : "Gross Salary"}:</span>
              <span>{formatCurrency(calculation.grossSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span>{isAmharic ? "ታክስ" : "Tax"}:</span>
              <span>{formatCurrency(calculation.incomeTax)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{isAmharic ? "የተጣራ ደመወዝ" : "Net Salary"}:</span>
              <span>{formatCurrency(calculation.netSalary)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {isAmharic
            ? "ማስታወሻ: የተጋራ መረጃ የግል መረጃዎችን አያካትትም"
            : "Note: Shared information does not include personal details"}
        </p>
      </CardContent>
      {showEmailPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-md border bg-card p-4 shadow-lg">
            <h4 className="mb-3 text-sm font-semibold">{isAmharic ? "ኢሜይል ላክ" : "Send Invoice Email"}</h4>
            <div className="space-y-2">
              <Label htmlFor="recipient">{isAmharic ? "የተቀባዩ ኢሜይል" : "Recipient Email"}</Label>
              <Input
                id="recipient"
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={isAmharic ? "name@example.com" : "name@example.com"}
              />
              {sendError && <p className="text-xs text-destructive">{sendError}</p>}
              {sentOk && (
                <p className="text-xs text-green-600">
                  {isAmharic ? "ተልኳል" : "Sent"}
                  <span className="text-muted-foreground"> {isAmharic ? "— ካልታገኙ በSpam/Junk ይፈትሹ" : " — if not found, check your Spam/Junk folder"}</span>
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowEmailPopup(false)} disabled={sending}>{isAmharic ? "ይቅር" : "Cancel"}</Button>
              <Button type="button" onClick={handleSendNow} disabled={sending} className="min-w-24">{sending ? (isAmharic ? "በመላክ ላይ..." : "Sending...") : (isAmharic ? "ላክ" : "Send")}</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
