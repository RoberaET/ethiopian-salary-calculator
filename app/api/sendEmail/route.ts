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

    // If html not provided, load template from public and interpolate
    if (!html) {
      const templatePath = path.join(process.cwd(), 'public', 'email-templates', 'invoice-template.html')
      let template = await fs.readFile(templatePath, 'utf8')
      const defaults = {
        companyName: 'Ethiopian Salary Calculator',
        userName: 'Customer',
        amount: 'ETB 0.00',
        invoiceDate: new Date().toLocaleDateString(),
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


