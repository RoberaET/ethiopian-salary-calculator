"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Share2, Printer, FileText, Copy, Check } from "lucide-react"
import { formatCurrency, type SalaryCalculation, type SalaryInputs } from "@/lib/salary-calculator"

interface ExportShareOptionsProps {
  calculation: SalaryCalculation
  inputs: SalaryInputs
  isAmharic: boolean
}

export function ExportShareOptions({ calculation, inputs, isAmharic }: ExportShareOptionsProps) {
  const [copied, setCopied] = useState(false)

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
${isAmharic ? "የገቢ ታክስ" : "Income Tax"}: ${formatCurrency(calculation.incomeTax)}
${isAmharic ? "የጡረታ አበል" : "Pension (7%)"}: ${formatCurrency(calculation.pensionContribution)}
${inputs.unionDues > 0 ? `${isAmharic ? "የሰራተኛ ማህበር" : "Union Dues"}: ${formatCurrency(inputs.unionDues)}` : ""}

${isAmharic ? "የተጣራ ደመወዝ" : "NET SALARY"}: ${formatCurrency(calculation.netSalary)}

${isAmharic ? "የታክስ መረጃ" : "TAX INFORMATION"}:
${isAmharic ? "ውጤታማ ታክስ መጠን" : "Effective Tax Rate"}: ${(calculation.effectiveTaxRate * 100).toFixed(1)}%
${isAmharic ? "ወሳኝ ታክስ መጠን" : "Marginal Tax Rate"}: ${(calculation.marginalTaxRate * 100).toFixed(0)}%

${isAmharic ? "በ Robera Mekonnen የተሰላ" : "Calculated by Robera Mekonnen"}
    `.trim()
  }

  const handlePrint = () => {
    const printContent = generatePayslipText()
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${isAmharic ? "የደመወዝ ደረሰኝ" : "Salary Slip"}</title>
            <style>
              body { font-family: monospace; padding: 20px; line-height: 1.6; }
              h1 { text-align: center; }
              .section { margin: 20px 0; }
            </style>
          </head>
          <body>
            <pre>${printContent}</pre>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
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
    const payslipContent = generatePayslipText()
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${isAmharic ? "የደመወዝ ደረሰኝ" : "Salary Slip"}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
                .page-break { page-break-before: always; }
              }
              
              * {
                box-sizing: border-box;
              }
              
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                padding: 0;
                margin: 0;
                line-height: 1.6; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
              }
              
              .container {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                min-height: 100vh;
                position: relative;
              }
              
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
              }
              
              .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.3;
              }
              
              .header-content {
                position: relative;
                z-index: 1;
              }
              
              .header h1 { 
                font-family: 'Playfair Display', serif;
                font-size: 42px; 
                margin: 0; 
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                letter-spacing: 2px;
              }
              
              .header .subtitle {
                font-size: 16px;
                margin: 10px 0 0 0;
                opacity: 0.9;
                font-weight: 300;
                letter-spacing: 1px;
              }
              
              .header .date { 
                font-size: 14px; 
                margin-top: 15px;
                opacity: 0.8;
                font-weight: 400;
              }
              
              .content {
                padding: 40px 30px;
              }
              
              .section { 
                margin: 30px 0; 
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0,0,0,0.08);
                border: 1px solid rgba(0,0,0,0.05);
              }
              
              .section-header {
                padding: 20px 25px;
                font-weight: 700;
                font-size: 20px;
                letter-spacing: 1px;
                text-transform: uppercase;
                position: relative;
                overflow: hidden;
              }
              
              .income-section .section-header {
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
              }
              
              .deduction-section .section-header {
                background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                color: white;
              }
              
              .tax-section .section-header {
                background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
                color: white;
              }
              
              .section-content {
                padding: 25px;
                background: #fafafa;
              }
              
              .item { 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
                margin: 12px 0; 
                padding: 15px 20px;
                border-radius: 12px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
              }
              
              .item::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: currentColor;
                opacity: 0.3;
              }
              
              .basic-salary {
                background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
                border-left: 4px solid #4CAF50;
              }
              
              .allowances {
                background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
                border-left: 4px solid #2196F3;
              }
              
              .overtime {
                background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%);
                border-left: 4px solid #FF9800;
              }
              
              .tax-deduction {
                background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%);
                border-left: 4px solid #f44336;
              }
              
              .pension-deduction {
                background: linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%);
                border-left: 4px solid #9C27B0;
              }
              
              .union-deduction {
                background: linear-gradient(135deg, #e0f2f1 0%, #e8f5e8 100%);
                border-left: 4px solid #009688;
              }
              
              .item:last-child { 
                border-bottom: none; 
                margin-bottom: 0;
              }
              
              .item-label { 
                font-weight: 600; 
                color: #2c3e50;
                font-size: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
              }
              
              .item-value { 
                font-weight: 700; 
                font-size: 16px;
                font-family: 'Inter', monospace;
                letter-spacing: 0.5px;
              }
              
              .income-value {
                color: #2e7d32;
              }
              
              .deduction-value {
                color: #c62828;
              }
              
              .total-section {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 30px 0;
                border-radius: 20px;
                padding: 30px;
                text-align: center;
                box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
                position: relative;
                overflow: hidden;
              }
              
              .total-section::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: shimmer 3s ease-in-out infinite;
              }
              
              @keyframes shimmer {
                0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
                50% { transform: translateX(100%) translateY(100%) rotate(30deg); }
              }
              
              .total-section .item {
                background: rgba(255,255,255,0.15);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                margin: 0;
                padding: 20px;
              }
              
              .total-section .item-label {
                color: white;
                font-size: 24px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              
              .total-section .item-value {
                color: white;
                font-size: 28px;
                font-weight: 800;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                font-family: 'Inter', monospace;
              }
              
              .tax-info { 
                background: linear-gradient(135deg, #fff8e1 0%, #fff3c4 100%);
                padding: 25px; 
                border-radius: 16px; 
                border-left: 6px solid #ff9800;
                box-shadow: 0 8px 32px rgba(255, 152, 0, 0.15);
              }
              
              .tax-info h3 {
                margin: 0 0 20px 0;
                color: #e65100;
                font-size: 20px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              
              .tax-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid rgba(230, 81, 0, 0.2);
              }
              
              .tax-item:last-child {
                border-bottom: none;
              }
              
              .tax-label {
                font-weight: 600;
                color: #e65100;
                font-size: 15px;
              }
              
              .tax-value {
                font-weight: 700;
                color: #e65100;
                font-size: 16px;
                font-family: 'Inter', monospace;
              }
              
              .footer { 
                background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
                text-align: center; 
                margin-top: 40px; 
                padding: 30px;
                border-top: 3px solid #667eea;
                color: #666;
                font-size: 13px;
                line-height: 1.8;
              }
              
              .footer p {
                margin: 8px 0;
              }
              
              .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                z-index: 1000;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              
              .print-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
              }
              
              .icon {
                display: inline-block;
                width: 20px;
                height: 20px;
                margin-right: 8px;
                vertical-align: middle;
              }
              
              .section-total {
                background: rgba(255,255,255,0.9);
                border-radius: 12px;
                padding: 15px 20px;
                margin-top: 15px;
                border: 2px solid currentColor;
                font-weight: 700;
                font-size: 18px;
              }
              
              .income-section .section-total {
                color: #2e7d32;
                border-color: #4CAF50;
              }
              
              .deduction-section .section-total {
                color: #c62828;
                border-color: #f44336;
              }
            </style>
          </head>
          <body>
            <button class="print-button no-print" onclick="window.print()">
              <span class="icon">📄</span>
              ${isAmharic ? "PDF ማውረድ" : "Download PDF"}
            </button>
            
            <div class="container">
              <div class="header">
                <div class="header-content">
                  <h1>${isAmharic ? "የደመወዝ ደረሰኝ" : "SALARY SLIP"}</h1>
                  <div class="subtitle">${isAmharic ? "የወር ደመወዝ ዝርዝር" : "Monthly Salary Breakdown"}</div>
                  <div class="date">${isAmharic ? "ቀን" : "Date"}: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>

              <div class="content">
                <div class="section income-section">
                  <div class="section-header">
                    <span class="icon">💰</span>
                    ${isAmharic ? "ጠቅላላ ገቢ" : "GROSS INCOME"}
                  </div>
                  <div class="section-content">
                    <div class="item basic-salary">
                      <span class="item-label">
                        <span class="icon">💼</span>
                        ${isAmharic ? "መሰረታዊ ደመወዝ" : "Basic Salary"}
                      </span>
                      <span class="item-value income-value">${formatCurrency(calculation.grossSalary)}</span>
                    </div>
                    <div class="item allowances">
                      <span class="item-label">
                        <span class="icon">🎁</span>
                        ${isAmharic ? "ጠቅላላ አበሎች" : "Total Allowances"}
                      </span>
                      <span class="item-value income-value">${formatCurrency(calculation.totalAllowances)}</span>
                    </div>
                    ${inputs.overtimePay > 0 ? `
                      <div class="item overtime">
                        <span class="item-label">
                          <span class="icon">⏰</span>
                          ${isAmharic ? "ተጨማሪ ሰዓት" : "Overtime Pay"}
                        </span>
                        <span class="item-value income-value">${formatCurrency(inputs.overtimePay)}</span>
                      </div>
                    ` : ""}
                    <div class="section-total">
                      <span>${isAmharic ? "ጠቅላላ ገቢ" : "Total Gross Income"}</span>
                      <span>${formatCurrency(calculation.grossSalary + calculation.totalAllowances + inputs.overtimePay)}</span>
                    </div>
                  </div>
                </div>

                <div class="section deduction-section">
                  <div class="section-header">
                    <span class="icon">📉</span>
                    ${isAmharic ? "ቅናሾች" : "DEDUCTIONS"}
                  </div>
                  <div class="section-content">
                    <div class="item tax-deduction">
                      <span class="item-label">
                        <span class="icon">🏛️</span>
                        ${isAmharic ? "የገቢ ታክስ" : "Income Tax"}
                      </span>
                      <span class="item-value deduction-value">-${formatCurrency(calculation.incomeTax)}</span>
                    </div>
                    <div class="item pension-deduction">
                      <span class="item-label">
                        <span class="icon">👴</span>
                        ${isAmharic ? "የጡረታ አበል (7%)" : "Pension Contribution (7%)"}
                      </span>
                      <span class="item-value deduction-value">-${formatCurrency(calculation.pensionContribution)}</span>
                    </div>
                    ${inputs.unionDues > 0 ? `
                      <div class="item union-deduction">
                        <span class="item-label">
                          <span class="icon">🤝</span>
                          ${isAmharic ? "የሰራተኛ ማህበር" : "Union Dues"}
                        </span>
                        <span class="item-value deduction-value">-${formatCurrency(inputs.unionDues)}</span>
                      </div>
                    ` : ""}
                    <div class="section-total">
                      <span>${isAmharic ? "ጠቅላላ ቅናሾች" : "Total Deductions"}</span>
                      <span>-${formatCurrency(calculation.totalDeductions)}</span>
                    </div>
                  </div>
                </div>

                <div class="total-section">
                  <div class="item">
                    <span class="item-label">
                      <span class="icon">💎</span>
                      ${isAmharic ? "የተጣራ ደመወዝ" : "NET SALARY"}
                    </span>
                    <span class="item-value">${formatCurrency(calculation.netSalary)}</span>
                  </div>
                </div>

                <div class="tax-info">
                  <h3>
                    <span class="icon">📊</span>
                    ${isAmharic ? "የታክስ መረጃ" : "TAX INFORMATION"}
                  </h3>
                  <div class="tax-item">
                    <span class="tax-label">${isAmharic ? "ውጤታማ ታክስ መጠን" : "Effective Tax Rate"}</span>
                    <span class="tax-value">${(calculation.effectiveTaxRate * 100).toFixed(1)}%</span>
                  </div>
                  <div class="tax-item">
                    <span class="tax-label">${isAmharic ? "ወሳኝ ታክስ መጠን" : "Marginal Tax Rate"}</span>
                    <span class="tax-value">${(calculation.marginalTaxRate * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div class="footer">
                <p><strong>${isAmharic ? "በ Robera Mekonnen የተሰላ" : "Calculated by Robera Mekonnen"}</strong></p>
                <p>${isAmharic ? "ማስታወሻ: ይህ የደመወዝ ደረሰኝ ለመረጃ አገልግሎት ብቻ ነው" : "Note: This salary slip is for informational purposes only"}</p>
                <p style="margin-top: 15px; font-size: 11px; opacity: 0.7;">
                  ${isAmharic ? "የተፈጠረው" : "Generated on"}: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      
      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindow.print()
      }, 1000)
    }
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
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Printer className="h-4 w-4" />
            {isAmharic ? "ህትመት" : "Print"}
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
    </Card>
  )
}
