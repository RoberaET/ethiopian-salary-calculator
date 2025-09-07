import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import fs from 'fs/promises'
import path from 'path'

// Ensure this route runs on the Node.js runtime (not edge) so Nodemailer works
export const runtime = 'nodejs'

type SendEmailBody = {
  to: string
  subject: string
  html?: string
  variables?: Record<string, string | number>
}

export async function GET() {
  // Diagnostics endpoint (safe booleans only). Remove or protect before production if undesired.
  return NextResponse.json({
    GMAIL_USER: Boolean(process.env.GMAIL_USER),
    GMAIL_PASS: Boolean(process.env.GMAIL_PASS),
    SMTP_USER: Boolean(process.env.SMTP_USER),
    SMTP_APP_PASSWORD: Boolean(process.env.SMTP_APP_PASSWORD),
    MAIL_FROM: Boolean(process.env.MAIL_FROM),
    runtime,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SendEmailBody
    const { to, subject } = body
    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields: to, subject' }, { status: 400 })
    }

    const userRaw = process.env.SMTP_USER || process.env.GMAIL_USER || ''
    const passRaw = process.env.SMTP_APP_PASSWORD || process.env.GMAIL_PASS || ''
    const user = userRaw.trim()
    // App Passwords sometimes get pasted with spaces—strip all whitespace
    const pass = passRaw.replace(/\s+/g, '')
    if (!user || !pass) {
      return NextResponse.json({ error: 'Email credentials are not configured' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    })

    let html = body.html

    // Helper to resolve absolute origin both locally and on Vercel
    const resolveOrigin = () => {
      const xfProto = request.headers.get('x-forwarded-proto') || 'https'
      const host = request.headers.get('host') || process.env.VERCEL_URL || ''
      if (host) {
        const url = host.startsWith('http') ? host : `${xfProto}://${host}`
        return url
      }
      return 'http://localhost:3000'
    }

    // If html not provided, load template from public and interpolate
    if (!html) {
      let template = ''
      // Prefer fetching the public asset (works reliably on Vercel)
      try {
        const origin = resolveOrigin()
        const res = await fetch(new URL('/email-templates/salary-slip.html', origin))
        if (!res.ok) throw new Error(`Template fetch failed: ${res.status}`)
        template = await res.text()
      } catch (e) {
        // Fallback to reading from filesystem (works locally)
        const templatePath = path.join(process.cwd(), 'public', 'email-templates', 'salary-slip.html')
        template = await fs.readFile(templatePath, 'utf8')
      }
      const defaults = {
        companyName: 'Ethiopian Salary Calculator',
        userName: 'Customer',
        invoiceDate: new Date().toLocaleDateString(),
        grossSalary: 'ETB 0.00',
        totalAllowances: 'ETB 0.00',
        incomeTax: 'ETB 0.00',
        pension: 'ETB 0.00',
        netSalary: 'ETB 0.00',
        effectiveTaxRate: '0.0%',
        marginalTaxRate: '0%'
      }
      const vars = { ...defaults, ...(body.variables || {}) }
      html = template.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => String(vars[key] ?? ''))
    }

    const fromEmail = process.env.MAIL_FROM || user

    const info = await transporter.sendMail({
      from: `Ethiopian Salary Calculator <${fromEmail}>`,
      to,
      subject,
      html,
    })

    return NextResponse.json({ ok: true, messageId: info.messageId })
  } catch (err: any) {
    console.error('sendEmail error', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}


