import jsPDF from "jspdf"
import { formatCurrency, formatDate } from "@/lib/utils"

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  total: number
}

interface InvoiceData {
  id: string
  number: string
  date: Date
  dueDate: Date
  status: string
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  currency: string
  notes?: string | null
  paymentTerms?: string | null
  items: InvoiceItem[]
  client: {
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    postalCode?: string | null
    country?: string | null
    siret?: string | null
  }
  organization: {
    name: string
    siret?: string | null
    address?: string | null
    city?: string | null
    postalCode?: string | null
    country?: string | null
    phone?: string | null
    email?: string | null
  }
}

export function generateInvoicePDF(invoice: InvoiceData): jsPDF {
  const doc = new jsPDF()

  // Colors
  const primaryColor = [0, 135, 108] // #00876c
  const grayColor = [107, 114, 128]
  const lightGrayColor = [243, 244, 246]

  let yPos = 20

  // Header - Organization Info
  doc.setFontSize(24)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text(invoice.organization.name || "Trajectory", 20, yPos)

  yPos += 10
  doc.setFontSize(10)
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
  if (invoice.organization.address) {
    doc.text(invoice.organization.address, 20, yPos)
    yPos += 5
  }
  if (invoice.organization.city) {
    doc.text(`${invoice.organization.postalCode || ""} ${invoice.organization.city}`, 20, yPos)
    yPos += 5
  }
  if (invoice.organization.siret) {
    doc.text(`SIRET: ${invoice.organization.siret}`, 20, yPos)
    yPos += 5
  }
  if (invoice.organization.email) {
    doc.text(invoice.organization.email, 20, yPos)
    yPos += 5
  }
  if (invoice.organization.phone) {
    doc.text(invoice.organization.phone, 20, yPos)
  }

  // Invoice Title and Number
  yPos = 20
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text("FACTURE", 140, yPos, { align: "right" })

  yPos += 8
  doc.setFontSize(12)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text(`N° ${invoice.number}`, 140, yPos, { align: "right" })

  yPos += 8
  doc.setFontSize(10)
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
  doc.text(`Date: ${formatDate(invoice.date)}`, 140, yPos, { align: "right" })

  yPos += 5
  doc.text(`Échéance: ${formatDate(invoice.dueDate)}`, 140, yPos, { align: "right" })

  // Client Info
  yPos = 70
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text("FACTURÉ À:", 20, yPos)

  yPos += 7
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text(invoice.client.name, 20, yPos)

  yPos += 5
  doc.setFont("helvetica", "normal")
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
  if (invoice.client.address) {
    doc.text(invoice.client.address, 20, yPos)
    yPos += 5
  }
  if (invoice.client.city) {
    doc.text(`${invoice.client.postalCode || ""} ${invoice.client.city}`, 20, yPos)
    yPos += 5
  }
  if (invoice.client.siret) {
    doc.text(`SIRET: ${invoice.client.siret}`, 20, yPos)
    yPos += 5
  }
  if (invoice.client.email) {
    doc.text(invoice.client.email, 20, yPos)
    yPos += 5
  }
  if (invoice.client.phone) {
    doc.text(invoice.client.phone, 20, yPos)
  }

  // Table Header
  yPos = 110
  doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2])
  doc.rect(20, yPos - 5, 170, 8, "F")

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
  doc.text("DESCRIPTION", 22, yPos)
  doc.text("QTÉ", 120, yPos, { align: "center" })
  doc.text("PRIX UNIT.", 145, yPos, { align: "right" })
  doc.text("TOTAL HT", 185, yPos, { align: "right" })

  // Table Items
  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.setTextColor(0, 0, 0)

  invoice.items.forEach((item) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.text(item.description, 22, yPos)
    doc.text(item.quantity.toString(), 120, yPos, { align: "center" })
    doc.text(formatCurrency(item.unitPrice), 145, yPos, { align: "right" })
    doc.text(formatCurrency(item.total), 185, yPos, { align: "right" })
    yPos += 7
  })

  // Totals
  yPos += 5
  doc.setDrawColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2])
  doc.line(20, yPos, 190, yPos)

  yPos += 8
  doc.setFontSize(10)
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
  doc.text("Sous-total HT:", 130, yPos)
  doc.text(formatCurrency(invoice.subtotal), 185, yPos, { align: "right" })

  yPos += 7
  doc.text(`TVA (${invoice.taxRate}%):`, 130, yPos)
  doc.text(formatCurrency(invoice.taxAmount), 185, yPos, { align: "right" })

  yPos += 10
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text("TOTAL TTC:", 130, yPos)
  doc.text(formatCurrency(invoice.total), 185, yPos, { align: "right" })

  // Payment Terms
  if (invoice.paymentTerms) {
    yPos += 15
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    doc.text("Conditions de paiement:", 20, yPos)
    yPos += 5
    doc.text(invoice.paymentTerms, 20, yPos)
  }

  // Notes
  if (invoice.notes) {
    yPos += 10
    doc.setFontSize(9)
    doc.text("Notes:", 20, yPos)
    yPos += 5
    const splitNotes = doc.splitTextToSize(invoice.notes, 170)
    doc.text(splitNotes, 20, yPos)
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    doc.text(
      `Page ${i} sur ${pageCount}`,
      105,
      290,
      { align: "center" }
    )
    doc.text(
      "Facture générée par Trajectory - www.trajectory.fr",
      105,
      285,
      { align: "center" }
    )
  }

  return doc
}
