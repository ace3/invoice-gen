import { useState, useRef, useCallback, useEffect } from 'react'
import Form from './components/Form'
import Preview from './components/Preview'
import InvoiceList from './components/InvoiceList'
import { generateInvoiceNumber } from './utils'
import './App.css'

export const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp.', format: (n) => `Rp. ${Number(n).toLocaleString('id-ID')},-` },
  { code: 'USD', symbol: '$', format: (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
  { code: 'EUR', symbol: '€', format: (n) => `€${Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2 })}` },
  { code: 'SGD', symbol: 'S$', format: (n) => `S$${Number(n).toLocaleString('en-SG', { minimumFractionDigits: 2 })}` },
]

export const DEFAULT_FORM = {
  docType: 'Invoice',
  invoiceNumber: generateInvoiceNumber(),
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  projectTitle: '',
  fromName: '',
  fromPhone: '',
  fromEmail: '',
  billTo: '',
  currency: 'IDR',
  discount: 0,
  taxRate: 0,
  taxLabel: 'Tax',
  status: 'Draft',
  notes: 'Thank you for your business!',
  bankName: '',
  accountNumber: '',
  accountName: '',
  logo: null,
  items: [
    { id: 1, description: '', qty: 1, rate: 0 },
  ],
}

function getInitialAppState() {
  let senderProfile = { fromName: '', fromPhone: '', fromEmail: '', logo: null }
  try {
    const saved = localStorage.getItem('senderProfile')
    if (saved) senderProfile = JSON.parse(saved)
  } catch (e) { /* ignore */ }

  let invoices = []
  try {
    const saved = localStorage.getItem('invoiceHistory')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        invoices = parsed
          .filter(inv => inv && inv.id && inv.form && typeof inv.form === 'object')
          .map(inv => ({
            ...inv,
            form: { ...DEFAULT_FORM, ...inv.form, items: Array.isArray(inv.form.items) && inv.form.items.length > 0 ? inv.form.items : DEFAULT_FORM.items },
          }))
      }
    }
  } catch (e) {
    console.warn('Failed to load invoice history, clearing corrupted data:', e)
    localStorage.removeItem('invoiceHistory')
  }

  if (invoices.length === 0) {
    const newInvoice = {
      id: Date.now().toString(),
      form: {
        ...DEFAULT_FORM,
        invoiceNumber: generateInvoiceNumber(),
        fromName: senderProfile.fromName,
        fromPhone: senderProfile.fromPhone,
        fromEmail: senderProfile.fromEmail,
        logo: senderProfile.logo,
      },
    }
    return { invoices: [newInvoice], currentInvoiceId: newInvoice.id, form: newInvoice.form, senderProfile }
  }

  return { invoices, currentInvoiceId: invoices[0].id, form: invoices[0].form, senderProfile }
}

export default function App() {
  const [{ invoices: _invoices, currentInvoiceId: _currentId, form: _form, senderProfile: _profile }] = useState(getInitialAppState)
  const [invoices, setInvoices] = useState(_invoices)
  const [senderProfile, setSenderProfile] = useState(_profile)
  const [currentInvoiceId, setCurrentInvoiceId] = useState(_currentId)
  const [form, setForm] = useState(_form)

  const [saveStatus, setSaveStatus] = useState('')
  const [exporting, setExporting] = useState(false)

  // Save invoices to localStorage
  useEffect(() => {
    localStorage.setItem('invoiceHistory', JSON.stringify(invoices))
  }, [invoices])

  // Save sender profile to localStorage
  useEffect(() => {
    localStorage.setItem('senderProfile', JSON.stringify(senderProfile))
  }, [senderProfile])

  // Auto-update current invoice when form changes
  useEffect(() => {
    if (currentInvoiceId) {
      setInvoices(prev =>
        prev.map(inv =>
          inv.id === currentInvoiceId ? { ...inv, form } : inv
        )
      )
    }
  }, [form, currentInvoiceId])

  const handleNewInvoice = () => {
    const newInvoice = {
      id: Date.now().toString(),
      form: {
        ...DEFAULT_FORM,
        invoiceNumber: generateInvoiceNumber(),
        fromName: senderProfile.fromName,
        fromPhone: senderProfile.fromPhone,
        fromEmail: senderProfile.fromEmail,
        logo: senderProfile.logo,
      },
    }
    setInvoices(prev => [newInvoice, ...prev])
    setCurrentInvoiceId(newInvoice.id)
    setForm(newInvoice.form)
  }

  const handleSelectInvoice = (id) => {
    const inv = invoices.find(i => i.id === id)
    if (inv) {
      setCurrentInvoiceId(id)
      setForm(inv.form)
    }
  }

  const handleDeleteInvoice = (id) => {
    if (window.confirm('Delete this invoice? This cannot be undone.')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id))
      if (currentInvoiceId === id) {
        const remaining = invoices.filter(inv => inv.id !== id)
        if (remaining.length > 0) {
          setCurrentInvoiceId(remaining[0].id)
          setForm(remaining[0].form)
        } else {
          handleNewInvoice()
        }
      }
    }
  }

  const handleSave = () => {
    setSaveStatus('Saved!')
    setTimeout(() => setSaveStatus(''), 2000)
  }

  // Update sender profile when form changes
  useEffect(() => {
    setSenderProfile({
      fromName: form.fromName,
      fromPhone: form.fromPhone,
      fromEmail: form.fromEmail,
      logo: form.logo,
    })
  }, [form.fromName, form.fromPhone, form.fromEmail, form.logo])
  const previewRef = useRef(null)

  const currency = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0]
  const subtotal = form.items.reduce((sum, item) => sum + (item.qty * item.rate), 0)
  const discountAmount = Math.round(subtotal * (form.discount / 100))
  const afterDiscount = subtotal - discountAmount
  const taxAmount = Math.round(afterDiscount * (form.taxRate / 100))
  const total = afterDiscount + taxAmount

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
          <button className="btn-ghost" onClick={handleSave}>
            {saveStatus || '💾 Save'}
          </button>
          <button className="btn-ghost" onClick={() => window.print()}>Print</button>
          <button className="btn-primary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : '↓ Export PDF'}
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="list-panel">
          <InvoiceList
            invoices={invoices}
            currentId={currentInvoiceId}
            onSelect={handleSelectInvoice}
            onDelete={handleDeleteInvoice}
            onCreate={handleNewInvoice}
          />
        </aside>
        <aside className="form-panel">
          <Form
            form={form}
            setForm={setForm}
            currencies={CURRENCIES}
            subtotal={subtotal}
            discountAmount={discountAmount}
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
              discountAmount={discountAmount}
              taxAmount={taxAmount}
              total={total}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
