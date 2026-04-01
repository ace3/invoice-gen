import React from 'react'

function formatInvoiceDate(dateValue) {
  if (!dateValue) return '-'
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export default function InvoiceList({ invoices, currentId, onSelect, onDelete, onCreate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={onCreate}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: '#e8ff00',
          border: 'none',
          color: '#000',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          marginBottom: '8px',
        }}
      >
        + New Invoice
      </button>
      <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Recent Invoices
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto' }}>
        {invoices.length === 0 ? (
          <div style={{ fontSize: '11px', color: '#666', padding: '8px' }}>No invoices yet</div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              style={{
                padding: '8px',
                background: currentId === inv.id ? '#1f1f1f' : '#0d0d0d',
                border: `1px solid ${currentId === inv.id ? '#e8ff00' : '#2a2a2a'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.15s',
              }}
              onClick={() => onSelect(inv.id)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#f0f0f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inv.form.invoiceNumber}
                </div>
                <div style={{ fontSize: '9px', color: '#888', display: 'flex', gap: '4px', marginTop: '2px' }}>
                  <span>
                    {formatInvoiceDate(inv.form.date)}
                  </span>
                  {inv.form.status && (
                    <span style={{
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontSize: '8px',
                      fontWeight: '700',
                      background: inv.form.status === 'Draft' ? '#666' : inv.form.status === 'Sent' ? '#4a6fa5' : inv.form.status === 'Paid' ? '#4a7a4a' : '#a54a4a',
                      color: '#fff',
                    }}>
                      {inv.form.status}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(inv.id)
                }}
                style={{
                  padding: '4px 6px',
                  background: 'transparent',
                  border: '1px solid #e55',
                  color: '#e55',
                  borderRadius: '3px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
