import { useState, useRef, useCallback } from 'react'
import Form from './components/Form'
import Preview from './components/Preview'
import './App.css'

export const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp.', format: (n) => `Rp. ${Number(n).toLocaleString('id-ID')},-` },
  { code: 'USD', symbol: '$', format: (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
  { code: 'EUR', symbol: '€', format: (n) => `€${Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2 })}` },
  { code: 'SGD', symbol: 'S$', format: (n) => `S$${Number(n).toLocaleString('en-SG', { minimumFractionDigits: 2 })}` },
]

function generateInvoiceNumber() {
  const now = new Date()
  const date = now.toISOString().split('T')[0].replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INV-${date}-${rand}`
}

export const DEFAULT_FORM = {
  docType: 'Invoice',
  invoiceNumber: generateInvoiceNumber(),
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  fromName: '',
  fromPhone: '',
  fromEmail: '',
  billTo: '',
  currency: 'IDR',
  taxRate: 0,
  notes: 'Thank you for your business!',
  bankName: '',
  accountNumber: '',
  accountName: '',
  logo: null,
  items: [
    { id: 1, description: '', qty: 1, rate: 0 },
  ],
}

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [exporting, setExporting] = useState(false)
  const previewRef = useRef(null)

  const currency = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0]
  const subtotal = form.items.reduce((sum, item) => sum + (item.qty * item.rate), 0)
  const taxAmount = Math.round(subtotal * (form.taxRate / 100))
  const total = subtotal + taxAmount

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = previewRef.current
      await html2pdf().set({
        margin: 0,
        filename: `${form.docType}_${form.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#111111' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(element).save()
    } finally {
      setExporting(false)
    }
  }, [form])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-mark">IF</div>
          <span className="brand-name">InvoiceForge</span>
        </div>
        <div className="header-actions">
          <button className="btn-ghost" onClick={() => window.print()}>Print</button>
          <button className="btn-primary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : '↓ Export PDF'}
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="form-panel">
          <Form
            form={form}
            setForm={setForm}
            currencies={CURRENCIES}
            subtotal={subtotal}
            taxAmount={taxAmount}
            total={total}
            currency={currency}
          />
        </aside>
        <main className="preview-panel">
          <div className="preview-scaler">
            <Preview
              ref={previewRef}
              form={form}
              currency={currency}
              subtotal={subtotal}
              taxAmount={taxAmount}
              total={total}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
