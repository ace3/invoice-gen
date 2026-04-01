import { forwardRef } from 'react'
import './Preview.css'

const fmt = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const Preview = forwardRef(function Preview({ form, currency, subtotal, discountAmount, taxAmount, total }, ref) {
  return (
    <div className="invoice" ref={ref}>
      {/* Header */}
      <div className="inv-header">
        <div className="inv-title-row">
          {form.logo && <img src={form.logo} className="inv-logo" alt="logo" />}
          <div style={{ flex: 1 }}>
            <h1 className="inv-title">
              {form.projectTitle || 'Project Invoice'}
            </h1>
            {form.status && (
              <div style={{
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '6px',
                background: form.status === 'Draft' ? '#666' : form.status === 'Sent' ? '#4a6fa5' : form.status === 'Paid' ? '#4a7a4a' : '#a54a4a',
                color: '#fff',
              }}>
                {form.status}
              </div>
            )}
          </div>
        </div>
        <h2 className="inv-doc-type">{form.docType.toUpperCase()}</h2>
      </div>

      {/* Meta 3-col */}
      <div className="inv-meta">
        <div className="inv-meta-col">
          <p className="meta-label">From:</p>
          <p className="meta-val">{form.fromName}</p>
          {form.fromPhone && <p className="meta-val">{form.fromPhone}</p>}
          {form.fromEmail && <p className="meta-val">{form.fromEmail}</p>}
        </div>
        <div className="inv-meta-col">
          <p className="meta-label">Bill To:</p>
          {form.billTo.split('\n').map((line, i) => (
            <p key={i} className="meta-val">{line}</p>
          ))}
        </div>
        <div className="inv-meta-col">
          <p className="meta-label">{form.docType} Details:</p>
          <p className="meta-val">{form.docType} #: {form.invoiceNumber}</p>
          <p className="meta-val">Date: {fmt(form.date)}</p>
          {form.dueDate && <p className="meta-val">Due: {fmt(form.dueDate)}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="inv-table">
        <thead>
          <tr>
            <th className="col-desc">Description</th>
            <th className="col-qty">Qty</th>
            <th className="col-rate">Rate</th>
            <th className="col-amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          {form.items.map(item => (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{item.qty}</td>
              <td>{currency.format(item.rate)}</td>
              <td className="td-right">{currency.format(item.qty * item.rate)}</td>
            </tr>
          ))}
          <tr className="summary-row">
            <td colSpan={2}></td>
            <td className="summary-label">Subtotal</td>
            <td className="summary-val">{currency.format(subtotal)}</td>
          </tr>
          {form.discount > 0 && (
            <tr className="summary-row">
              <td colSpan={2}></td>
              <td className="summary-label">Discount ({form.discount}%)</td>
              <td className="summary-val">-{currency.format(discountAmount)}</td>
            </tr>
          )}
          <tr className="summary-row">
            <td colSpan={2}></td>
            <td className="summary-label">{form.taxLabel} {form.taxRate > 0 ? `(${form.taxRate}%)` : ''}</td>
            <td className="summary-val">{currency.format(taxAmount)}</td>
          </tr>
          <tr className="summary-row total-row">
            <td colSpan={2}></td>
            <td className="summary-label">Total</td>
            <td className="summary-val total-val">{currency.format(total)}</td>
          </tr>
        </tbody>
      </table>

      {/* Payment */}
      {(form.bankName || form.accountNumber || form.accountName) && (
        <div className="inv-payment">
          <p className="payment-heading">Payment Instructions:</p>
          <p className="payment-line">Please make payment to:</p>
          {form.bankName && <p className="payment-line">Bank Name: {form.bankName}</p>}
          {form.accountNumber && <p className="payment-line">Account Number: {form.accountNumber}</p>}
          {form.accountName && <p className="payment-line">Account Name: {form.accountName}</p>}
        </div>
      )}

      {/* Notes */}
      {form.notes && (
        <p className="inv-notes">{form.notes}</p>
      )}
    </div>
  )
})

export default Preview
