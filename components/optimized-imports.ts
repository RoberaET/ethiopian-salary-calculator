// Optimized imports for better tree shaking
// Import only what we need from each library

// Date utilities - import only specific functions
export { endOfMonth, differenceInCalendarDays } from 'date-fns'

// React hooks - import individually
export { useState, useEffect, Suspense, lazy, useMemo, useCallback, memo } from 'react'

// Next.js components
export { default as Image } from 'next/image'

// UI Components - import only what we need
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
export { Input } from '@/components/ui/input'
export { Label } from '@/components/ui/label'
export { Switch } from '@/components/ui/switch'
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
export { Button } from '@/components/ui/button'
export { Badge } from '@/components/ui/badge'
export { Separator } from '@/components/ui/separator'
export { Progress } from '@/components/ui/progress'
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
export { Calendar as UiCalendar } from '@/components/ui/calendar'

// Icons - import only what we need
export { 
  Calculator, 
  DollarSign, 
  Settings, 
  FileText, 
  BarChart3, 
  Zap, 
  Share2, 
  Loader2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Download,
  Mail,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

// Framer Motion - import only what we need
export { motion, AnimatePresence } from 'framer-motion'

// Custom components
export { ThemeToggle } from '@/components/theme-toggle'
export { DynamicInputSection } from '@/components/dynamic-input-section'
export { OvertimeCalculator } from '@/components/overtime-calculator'
export { SalaryBreakdownCard } from '@/components/salary-breakdown-card'
export { PercentageInput } from '@/components/percentage-input'

// Utilities
export { calculateSalary, TAX_BRACKETS, type SalaryInputs } from '@/lib/salary-calculator'
export { sendInvoiceEmail } from '@/lib/email-client'
