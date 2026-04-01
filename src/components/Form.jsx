import { useRef, useState } from 'react'

export default function Form({ form, setForm, currencies, subtotal, taxAmount, total, currency }) {
  const logoInputRef = useRef(null)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleAuth = () => {
    if (password === 'password') {
      setIsAuthenticated(true)
    } else {
      alert('Invalid password')
      setPassword('')
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', minHeight: '100%' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Authentication Required</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
          placeholder="Enter password"
          style={{
            width: '100%',
            padding: '8px 10px',
            background: '#1f1f1f',
            border: '1px solid #2a2a2a',
            color: '#f0f0f0',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
        <button
          onClick={handleAuth}
          style={{
            padding: '8px',
            background: '#e8ff00',
            border: 'none',
            color: '#000',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Unlock
        </button>
      </div>
    )
  }

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const setItem = (id, key, value) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [key]: value } : item)
    }))
  }

  const addItem = () => {
    const newId = Math.max(0, ...form.items.map(i => i.id)) + 1
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { id: newId, description: '', qty: 1, rate: 0 }]
    }))
  }

  const removeItem = (id) => {
    setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }))
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => set('logo', ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {/* Document Type */}
      <div className="form-section">
        <div className="section-label">Document Type</div>
        <div className="doc-toggle">
          {['Invoice', 'Quotation'].map(t => (
            <button
              key={t}
              className={form.docType === t ? 'active' : ''}
              onClick={() => set('docType', t)}
            >{t}</button>
          ))}
        </div>

        <div className="field-row">
          <div className="field">
            <label>{form.docType} #</label>
            <input value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} />
          </div>
          <div className="field">
            <label>Currency</label>
            <select value={form.currency} onChange={e => set('currency', e.target.value)}>
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="field">
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </div>
        </div>
      </div>

      {/* From */}
      <div className="form-section">
        <div className="section-label">From</div>

        <div className="field">
          <label>Logo</label>
          <div className="logo-upload">
            {form.logo
              ? <img src={form.logo} className="logo-preview" alt="logo" />
              : <div className="logo-placeholder" onClick={() => logoInputRef.current?.click()}>+</div>
            }
            <div>
              <div className="logo-btn" onClick={() => logoInputRef.current?.click()}>
                {form.logo ? 'Change Logo' : 'Upload Logo'}
              </div>
              {form.logo && (
                <div
                  className="logo-btn"
                  style={{ marginTop: 4, color: '#e55' }}
                  onClick={() => set('logo', null)}
                >Remove</div>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
          </div>
        </div>

        <div className="field">
          <label>Name</label>
          <input value={form.fromName} onChange={e => set('fromName', e.target.value)} />
        </div>
        <div className="field">
          <label>Phone</label>
          <input value={form.fromPhone} onChange={e => set('fromPhone', e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={form.fromEmail} onChange={e => set('fromEmail', e.target.value)} />
        </div>
      </div>

      {/* Bill To */}
      <div className="form-section">
        <div className="section-label">Bill To</div>
        <div className="field">
          <textarea
            value={form.billTo}
            onChange={e => set('billTo', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="form-section">
        <div className="section-label">Line Items</div>
        <div className="items-list">
          {form.items.map((item, idx) => (
            <div key={item.id} className="item-card">
              <div className="item-card-header">
                <span className="item-num">Item {idx + 1}</span>
                {form.items.length > 1 && (
                  <button className="btn-remove" onClick={() => removeItem(item.id)}>×</button>
                )}
              </div>
              <div className="field">
                <label>Description</label>
                <input value={item.description} onChange={e => setItem(item.id, 'description', e.target.value)} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Qty</label>
                  <input type="number" min="0" value={item.qty} onChange={e => setItem(item.id, 'qty', +e.target.value)} />
                </div>
                <div className="field">
                  <label>Rate ({currency.symbol})</label>
                  <input type="number" min="0" value={item.rate} onChange={e => setItem(item.id, 'rate', +e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-add-item" onClick={addItem}>+ Add Item</button>

        <div className="totals-summary" style={{ marginTop: 12 }}>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Tax Rate (%)</label>
            <input
              type="number" min="0" max="100" step="0.5"
              value={form.taxRate}
              onChange={e => set('taxRate', +e.target.value)}
            />
          </div>
          <div className="totals-row"><span>Subtotal</span><span>{currency.format(subtotal)}</span></div>
          <div className="totals-row"><span>Tax ({form.taxRate}%)</span><span>{currency.format(taxAmount)}</span></div>
          <div className="totals-row total-row"><span>Total</span><span>{currency.format(total)}</span></div>
        </div>
      </div>

      {/* Payment */}
      <div className="form-section">
        <div className="section-label">Payment Instructions</div>
        <div className="field">
          <label>Bank Name</label>
          <input value={form.bankName} onChange={e => set('bankName', e.target.value)} />
        </div>
        <div className="field">
          <label>Account Number</label>
          <input value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} />
        </div>
        <div className="field">
          <label>Account Name</label>
          <input value={form.accountName} onChange={e => set('accountName', e.target.value)} />
        </div>
      </div>

      {/* Notes */}
      <div className="form-section">
        <div className="section-label">Footer Note</div>
        <div className="field">
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
        </div>
      </div>
    </div>
  )
}
