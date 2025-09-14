"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from "recharts"
import { formatCurrency, type SalaryCalculation } from "@/lib/salary-calculator"

interface SalaryVisualizationProps {
  calculation: SalaryCalculation
  isAmharic: boolean
}

export function SalaryVisualization({ calculation, isAmharic }: SalaryVisualizationProps) {
  // Data for pie chart - salary breakdown
  const pieData = [
    {
      name: isAmharic ? "ተጣራ ደመወዝ" : "Net Salary",
      value: calculation.netSalary,
      color: "#10b981" // green-500
    },
    {
      name: isAmharic ? "የገቢ ታክስ" : "Income Tax",
      value: calculation.incomeTax,
      color: "#ef4444" // red-500
    },
    {
      name: isAmharic ? "የጡረታ አበል" : "Pension",
      value: calculation.pensionContribution,
      color: "#3b82f6" // blue-500
    }
  ]

  // Data for stacked bar chart - tax brackets breakdown
  const barData = calculation.taxBracketDetails.map((detail, index) => ({
    bracket: `${(detail.bracket.rate * 100).toFixed(0)}%`,
    taxableAmount: detail.taxableAmount,
    taxAmount: detail.taxAmount,
    netAmount: detail.taxableAmount - detail.taxAmount,
    rate: detail.bracket.rate * 100
  }))

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(data.value)} ({(data.value / calculation.grossSalary * 100).toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for stacked bar chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-gray-200">{isAmharic ? "የታክስ ደረጃ" : "Tax Bracket"}: {label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.name}: {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Pie Chart - Salary Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {isAmharic ? "የደመወዝ ክፍፍል" : "Salary Breakdown"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ color: 'currentColor' }}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary Stats - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="text-center p-3 sm:p-4 rounded-lg" style={{ backgroundColor: `${item.color}10` }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {item.name}
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold mb-1" style={{ color: item.color }}>
                  {formatCurrency(item.value)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {((item.value / calculation.grossSalary) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Tax Brackets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {isAmharic ? "የታክስ ደረጃዎች ክፍፍል" : "Tax Brackets Breakdown"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-30" />
                <XAxis 
                  dataKey="bracket" 
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  tickFormatter={(value) => formatCurrency(value)}
                  width={60}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar 
                  dataKey="netAmount" 
                  stackId="a"
                  fill="#10b981" 
                  name={isAmharic ? "ተጣራ ገቢ" : "Net Amount"}
                  radius={[0, 0, 4, 4]}
                />
                <Bar 
                  dataKey="taxAmount" 
                  stackId="a"
                  fill="#ef4444" 
                  name={isAmharic ? "ታክስ" : "Tax Amount"}
                  radius={[4, 4, 0, 0]}
                />
                <Legend 
                  wrapperStyle={{ color: 'currentColor', fontSize: '12px' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {isAmharic ? "ተጨማሪ መረጃዎች" : "Additional Insights"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-sm sm:text-base">
                {isAmharic ? "ውጤታማ ታክስ መጠን" : "Effective Tax Rate"}
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {(calculation.effectiveTaxRate * 100).toFixed(1)}%
              </p>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                {isAmharic ? "በጠቅላላ ገቢ ላይ" : "On total income"}
              </p>
            </div>
            
            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 text-sm sm:text-base">
                {isAmharic ? "የተጣራ ደመወዝ መቶኛ" : "Net Salary Percentage"}
              </h4>
              <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {((calculation.netSalary / calculation.grossSalary) * 100).toFixed(1)}%
              </p>
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                {isAmharic ? "ከጠቅላላ ደመወዝ" : "Of gross salary"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
