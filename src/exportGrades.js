import { fmtDate } from './format'

// Un nom ou une appréciation commençant par = + - @ serait exécuté comme une formule dans Excel.
// L'inscription étant ouverte, on neutralise ces débuts de cellule.
const guard = (v) => {
  const s = String(v ?? '')
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
}

const slug = (s) => String(s).replace(/[^\w-]+/g, '_')

const download = (blob, name) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

const header = (max) => ['Matricule', 'Nom', `Note / ${max}`, 'Appréciation']

export function exportCsv({ exam, grades, max }) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [header(max).map(esc).join(';')]
  grades.forEach((g) =>
    lines.push([guard(g.matricule), guard(g.fullName), g.score ?? '', guard(g.comment)].map(esc).join(';')))
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  download(blob, `${slug(exam.title)}_notes.csv`)
}

export async function exportExcel({ exam, grades, max, teacher }) {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Notes')

  ws.addRow([exam.title]).font = { bold: true, size: 14 }
  ws.addRow([`${exam.subject} · ${fmtDate(exam.date)} · ${teacher} · Barème sur ${max}`])
  ws.addRow([])
  const head = ws.addRow(header(max))
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  head.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } } })

  grades.forEach((g) => ws.addRow([guard(g.matricule), guard(g.fullName), g.score ?? '', guard(g.comment)]))
  ws.columns = [{ width: 18 }, { width: 32 }, { width: 12 }, { width: 50 }]

  const buf = await wb.xlsx.writeBuffer()
  download(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${slug(exam.title)}_notes.xlsx`,
  )
}

export async function exportPdf({ exam, grades, max, teacher }) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()

  doc.setFontSize(15)
  doc.text(exam.title, 14, 18)
  doc.setFontSize(10)
  doc.text(`${exam.subject} - ${fmtDate(exam.date)} - Barème sur ${max}`, 14, 25)
  doc.text(`${teacher} - ${grades.length} étudiants`, 14, 31)

  autoTable(doc, {
    startY: 38,
    head: [header(max)],
    body: grades.map((g) => [g.matricule, g.fullName, g.score ?? 'Non saisie', g.comment || '']),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  doc.save(`${slug(exam.title)}_notes.pdf`)
}