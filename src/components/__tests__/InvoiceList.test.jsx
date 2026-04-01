import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'
import InvoiceList from '../InvoiceList'

describe('InvoiceList', () => {
  it('renders invoice dates without throwing for valid input', () => {
    expect(() => {
      render(
        <InvoiceList
          invoices={[
            {
              id: '1',
              form: {
                invoiceNumber: 'INV-20260401-ABCD',
                date: '2026-04-01',
                status: 'Draft',
              },
            },
          ]}
          currentId="1"
          onSelect={() => {}}
          onDelete={() => {}}
          onCreate={() => {}}
        />,
      )
    }).not.toThrow()

    expect(screen.getByText('INV-20260401-ABCD')).toBeInTheDocument()
    expect(screen.getByText('01 Apr')).toBeInTheDocument()
  })

  it('falls back safely for invalid invoice dates', () => {
    render(
      <InvoiceList
        invoices={[
          {
            id: '2',
            form: {
              invoiceNumber: 'INV-INVALID-DATE',
              date: 'not-a-date',
              status: 'Sent',
            },
          },
        ]}
        currentId="2"
        onSelect={() => {}}
        onDelete={() => {}}
        onCreate={() => {}}
      />,
    )

    expect(screen.getByText('INV-INVALID-DATE')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})
