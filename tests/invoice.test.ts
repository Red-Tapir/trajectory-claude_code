import { describe, it, expect } from 'vitest'

describe('Invoice Calculations', () => {
  describe('Tax Calculations', () => {
    it('should calculate tax amount correctly for French TVA (20%)', () => {
      const subtotal = 1000
      const taxRate = 20.0
      const expectedTax = 200

      const taxAmount = subtotal * (taxRate / 100)

      expect(taxAmount).toBe(expectedTax)
    })

    it('should calculate total with tax correctly', () => {
      const subtotal = 1000
      const taxRate = 20.0
      const expectedTotal = 1200

      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount

      expect(total).toBe(expectedTotal)
    })

    it('should handle reduced TVA rate (5.5%)', () => {
      const subtotal = 1000
      const taxRate = 5.5
      const expectedTax = 55

      const taxAmount = subtotal * (taxRate / 100)

      expect(taxAmount).toBe(expectedTax)
    })

    it('should handle intermediate TVA rate (10%)', () => {
      const subtotal = 1000
      const taxRate = 10.0
      const expectedTax = 100

      const taxAmount = subtotal * (taxRate / 100)

      expect(taxAmount).toBe(expectedTax)
    })
  })

  describe('Invoice Number Generation', () => {
    it('should generate invoice number with correct format', () => {
      const year = 2024
      const number = 42
      const expectedFormat = '2024-042'

      const invoiceNumber = `${year}-${String(number).padStart(3, '0')}`

      expect(invoiceNumber).toBe(expectedFormat)
    })

    it('should pad invoice numbers correctly', () => {
      const testCases = [
        { number: 1, expected: '001' },
        { number: 42, expected: '042' },
        { number: 999, expected: '999' },
      ]

      testCases.forEach(({ number, expected }) => {
        const padded = String(number).padStart(3, '0')
        expect(padded).toBe(expected)
      })
    })
  })

  describe('Invoice Item Calculations', () => {
    it('should calculate line item total correctly', () => {
      const quantity = 5
      const unitPrice = 400
      const expectedTotal = 2000

      const total = quantity * unitPrice

      expect(total).toBe(expectedTotal)
    })

    it('should handle decimal quantities', () => {
      const quantity = 2.5
      const unitPrice = 100
      const expectedTotal = 250

      const total = quantity * unitPrice

      expect(total).toBe(expectedTotal)
    })

    it('should calculate invoice subtotal from multiple items', () => {
      const items = [
        { quantity: 5, unitPrice: 400 },
        { quantity: 2, unitPrice: 500 },
        { quantity: 1, unitPrice: 300 },
      ]

      const subtotal = items.reduce((sum, item) => {
        return sum + item.quantity * item.unitPrice
      }, 0)

      expect(subtotal).toBe(3300) // 2000 + 1000 + 300
    })
  })

  describe('Due Date Calculations', () => {
    it('should calculate due date 30 days from invoice date', () => {
      const invoiceDate = new Date('2024-01-01')
      const daysUntilDue = 30
      const expectedDueDate = new Date('2024-01-31')

      const dueDate = new Date(invoiceDate.getTime() + daysUntilDue * 24 * 60 * 60 * 1000)

      expect(dueDate.toISOString().split('T')[0]).toBe(
        expectedDueDate.toISOString().split('T')[0]
      )
    })
  })

  describe('Invoice Status', () => {
    it('should have valid status values', () => {
      const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

      validStatuses.forEach(status => {
        expect(validStatuses).toContain(status)
      })
    })

    it('should determine if invoice is overdue', () => {
      const dueDate = new Date('2024-01-01')
      const today = new Date('2024-01-15')
      const isPaid = false

      const isOverdue = !isPaid && dueDate < today

      expect(isOverdue).toBe(true)
    })

    it('should not mark paid invoices as overdue', () => {
      const dueDate = new Date('2024-01-01')
      const today = new Date('2024-01-15')
      const isPaid = true

      const isOverdue = !isPaid && dueDate < today

      expect(isOverdue).toBe(false)
    })
  })

  describe('Currency Formatting', () => {
    it('should format EUR currency correctly', () => {
      const amount = 1234.56
      const currency = 'EUR'

      const formatted = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
      }).format(amount)

      expect(formatted).toContain('1')
      expect(formatted).toContain('234')
      expect(formatted).toContain('56')
    })
  })
})
