import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface PDFExportOptions {
  title: string
  headers: string[]
  data: any[][]
  fileName: string
  additionalInfo?: { label: string; value: string | number }[]
  includeSignature?: boolean
}

export const exportToExcel = (data: any[], fileName: string, includeSignature = true) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results")
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

export const exportToPDF = (options: PDFExportOptions) => {
  const doc = new jsPDF('l') // Landscape orientation for better fit
  
  // Add title
  doc.setFontSize(18)
  doc.text(options.title, 14, 22)
  
  // Add date
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
  
  // Add additional info if provided
  if (options.additionalInfo) {
    let yPos = 40
    doc.setFontSize(12)
    options.additionalInfo.forEach(info => {
      doc.text(`${info.label}: ${info.value}`, 14, yPos)
      yPos += 7
    })
    yPos += 10
  }

  // Calculate column widths
  const colWidths = new Array(options.headers.length).fill('auto')
  if (options.includeSignature) {
    colWidths[colWidths.length - 1] = 30 // Fixed width for signature column
  }

  // Add table
  autoTable(doc, {
    head: [options.headers],
    body: options.data,
    startY: options.additionalInfo ? 60 : 40,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 8 // Smaller font for headers
    },
    bodyStyles: {
      fontSize: 8 // Smaller font for body
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Judge name column
      [options.headers.length - 2]: { cellWidth: 20 }, // Average score column
      [options.headers.length - 1]: { cellWidth: 30 } // Signature column
    },
    margin: { horizontal: 5 }, // Smaller margins
    tableWidth: 'wrap', // Allow table to use full width
    // Add signature space if needed
    didDrawCell: (data) => {
      if (options.includeSignature && data.column.index === data.table.columns.length - 1) {
        doc.setDrawColor(200, 200, 200)
        doc.line(
          data.cell.x + 5,
          data.cell.y + data.cell.height - 5,
          data.cell.x + data.cell.width - 5,
          data.cell.y + data.cell.height - 5
        )
      }
    }
  })

  doc.save(`${options.fileName}.pdf`)
}