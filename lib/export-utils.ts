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

interface PDFStyles {
  header?: {
    fillColor?: [number, number, number]
    textColor?: number | [number, number, number]
    fontSize?: number
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic'
  }
  body?: {
    textColor?: number | [number, number, number]
    fontSize?: number
  }
  alternateRow?: {
    fillColor?: [number, number, number]
  }
  rankColumn?: {
    fillColor?: [number, number, number]
    textColor?: number | [number, number, number]
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic'
  }
  averageColumn?: {
    fillColor?: [number, number, number]
    textColor?: number | [number, number, number]
  }
}

interface PDFExportOptions {
  title: string
  headers: string[]
  data: any[][]
  fileName: string
  additionalInfo?: { label: string; value: string | number }[]
  styles?: PDFStyles
}

export const exportToPDF = (options: PDFExportOptions) => {
  const doc = new jsPDF('l') // Landscape orientation
  
  // Set document properties
  doc.setProperties({
    title: options.title,
    subject: 'Competition Results',
    author: 'Judging System',
    creator: 'Judging System'
  })

  // Add title and logo
  doc.setFontSize(20)
  doc.setTextColor(44, 62, 80) // Dark blue
  doc.setFont('helvetica', 'bold')
  doc.text(options.title, 14, 22)
  
  // Add date
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
  
  // Add additional info if provided
  if (options.additionalInfo) {
    let yPos = 40
    doc.setFontSize(11)
    options.additionalInfo.forEach(info => {
      doc.setTextColor(44, 62, 80)
      doc.text(`${info.label}:`, 14, yPos)
      doc.setTextColor(100)
      doc.text(`${info.value}`, 14 + doc.getTextWidth(`${info.label}: `) + 2, yPos)
      yPos += 7
    })
    yPos += 10
  }

  // Prepare table data with styles
  const tableData = {
    head: [options.headers],
    body: options.data,
    styles: {
      overflow: 'linebreak',
      valign: 'middle',
      halign: 'center'
    },
    headStyles: {
      fillColor: options.styles?.header?.fillColor || [44, 62, 80],
      textColor: options.styles?.header?.textColor || 255,
      fontSize: options.styles?.header?.fontSize || 10,
      fontStyle: options.styles?.header?.fontStyle || 'bold',
      valign: 'middle'
    },
    bodyStyles: {
      textColor: options.styles?.body?.textColor || [51, 51, 51],
      fontSize: options.styles?.body?.fontSize || 9,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: options.styles?.alternateRow?.fillColor || [245, 245, 245]
    },
    columnStyles: {
      0: { // Rank column
        fillColor: options.styles?.rankColumn?.fillColor || [44, 62, 80],
        textColor: options.styles?.rankColumn?.textColor || 255,
        fontStyle: options.styles?.rankColumn?.fontStyle || 'bold',
        halign: 'center'
      },
      [options.headers.length - 2]: { // Average column
        fillColor: options.styles?.averageColumn?.fillColor || [241, 196, 15],
        textColor: options.styles?.averageColumn?.textColor || [51, 51, 51],
        fontStyle: 'bold',
        halign: 'center'
      },
      [options.headers.length - 1]: { // Percentage column
        halign: 'center'
      }
    }
  }

  // Add table
  autoTable(doc, {
    ...tableData,
    startY: options.additionalInfo ? 60 : 40,
    margin: { horizontal: 10 },
    theme: 'grid',
    didParseCell: (data) => {
      // Style signature row
      if (data.row.index === options.data.length - 1) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.textColor = [44, 62, 80]
      }
    }
  })

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    )
  }

  doc.save(`${options.fileName}.pdf`)
}