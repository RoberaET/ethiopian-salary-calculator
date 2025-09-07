"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/salary-calculator"

interface CurrencyConverterProps {
  netSalary: number
  isAmharic: boolean
}

// Mock exchange rates - in a real app, you'd fetch from an API
const MOCK_EXCHANGE_RATES = {
  USD: 0.018, // 1 ETB = 0.018 USD (approximate)
  EUR: 0.017, // 1 ETB = 0.017 EUR (approximate)
  GBP: 0.014, // 1 ETB = 0.014 GBP (approximate)
}

export function CurrencyConverter({ netSalary, isAmharic }: CurrencyConverterProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [exchangeRates, setExchangeRates] = useState(MOCK_EXCHANGE_RATES)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initialize lastUpdated on client side only to avoid hydration mismatch
  useEffect(() => {
    setLastUpdated(new Date())
  }, [])

  const convertedAmount = netSalary * exchangeRates[selectedCurrency as keyof typeof exchangeRates]

  const refreshRates = async () => {
    setIsRefreshing(true)
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, you'd fetch actual rates here
      setExchangeRates({
        USD: MOCK_EXCHANGE_RATES.USD + (Math.random() - 0.5) * 0.002,
        EUR: MOCK_EXCHANGE_RATES.EUR + (Math.random() - 0.5) * 0.002,
        GBP: MOCK_EXCHANGE_RATES.GBP + (Math.random() - 0.5) * 0.002,
      })
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  const formatForeignCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            {isAmharic ? "የምንዛሪ መቀየሪያ" : "Currency Converter"}
          </CardTitle>
          <button onClick={refreshRates} disabled={isRefreshing} className="p-1 hover:bg-muted rounded">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{isAmharic ? "የተጣራ ደመወዝ" : "Net Salary"}</p>
            <p className="text-lg font-semibold">{formatCurrency(netSalary)}</p>
          </div>
          <div className="text-2xl text-muted-foreground">=</div>
          <div className="flex-1">
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-lg font-semibold mt-1">{formatForeignCurrency(convertedAmount, selectedCurrency)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {Object.entries(exchangeRates).map(([currency, rate]) => (
            <div key={currency} className="p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">{currency}</p>
              <p className="text-sm font-medium">{rate.toFixed(4)}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{isAmharic ? "የመጨረሻ ዝማኔ" : "Last updated"}</span>
          <Badge variant="outline" className="text-xs">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "..."}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          {isAmharic
            ? "ማስታወሻ: የምንዛሪ ተመኖች ግምታዊ ናቸው እና ለመረጃ ብቻ ናቸው።"
            : "Note: Exchange rates are approximate and for informational purposes only."}
        </p>
      </CardContent>
    </Card>
  )
}
