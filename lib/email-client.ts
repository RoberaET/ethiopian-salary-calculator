export type SendInvoiceParams = {
  to: string
  subject: string
  companyName?: string
  userName?: string
  amount?: string
  invoiceDate?: string
}

export async function sendInvoiceEmail(params: SendInvoiceParams) {
  const res = await fetch('/api/sendEmail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: params.to,
      subject: params.subject,
      variables: {
        companyName: params.companyName,
        userName: params.userName,
        amount: params.amount,
        invoiceDate: params.invoiceDate,
      },
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to send email')
  }
  return res.json()
}


