// Lit un fichier Excel (.xlsx) ou CSV et en extrait { matricule, fullName } pour chaque étudiant.
//
// Avec une ligne d'en-tête : colonne « Matricule » + une ou plusieurs colonnes de nom
// (« Nom », « Prénom », « Nom complet »…), assemblées dans l'ordre du fichier.
// Sans en-tête : 1re colonne = matricule, 2e colonne = nom.

const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

// CSV d'Excel français : parfois en Windows-1252 plutôt qu'en UTF-8
const decode = (buf) => {
  let text = new TextDecoder('utf-8').decode(buf)
  if (text.includes('\uFFFD')) text = new TextDecoder('windows-1252').decode(buf)
  return text.replace(/^\uFEFF/, '')
}

function parseCsv(text) {
  const first = text.split(/\r?\n/).find((l) => l.trim()) ?? ''
  const delim = [';', '\t', ','].map((d) => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0]

  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++ } else quoted = false
      } else cell += c
    } else if (c === '"') quoted = true
    else if (c === delim) { row.push(cell); cell = '' }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = '' }
    else if (c !== '\r') cell += c
  }
  row.push(cell)
  rows.push(row)
  return rows
}

async function readExcel(buf) {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buf)
  const ws = wb.worksheets[0]
  if (!ws) return []
  const rows = []
  ws.eachRow({ includeEmpty: false }, (row) => {
    const cells = []
    for (let i = 1; i <= row.cellCount; i++) cells.push(row.getCell(i).text)
    rows.push(cells)
  })
  return rows
}

export function extractStudents(table) {
  const rows = table.map((r) => r.map((c) => String(c ?? '').trim())).filter((r) => r.some(Boolean))
  if (!rows.length) return { students: [], ignored: 0, headerFound: false }

  const head = rows[0].map(norm)
  const mIdx = head.findIndex((h) => h.includes('matricule'))
  const nameIdx = head.map((h, i) => (i !== mIdx && /nom|name|prenom|etudiant/.test(h) ? i : -1)).filter((i) => i >= 0)
  const headerFound = mIdx !== -1 && nameIdx.length > 0

  const body = headerFound ? rows.slice(1) : rows
  const mCol = headerFound ? mIdx : 0
  const nCols = headerFound ? nameIdx : [1]

  const students = []
  let ignored = 0
  for (const r of body) {
    const matricule = r[mCol] ?? ''
    const fullName = nCols.map((i) => r[i] ?? '').join(' ').replace(/\s+/g, ' ').trim()
    if (!matricule || !fullName) { ignored++; continue }
    students.push({ matricule, fullName })
  }
  return { students, ignored, headerFound }
}

export async function readStudentFile(file) {
  const name = file.name.toLowerCase()
  const buf = await file.arrayBuffer()
  let table
  if (name.endsWith('.xlsx')) table = await readExcel(buf)
  else if (name.endsWith('.xls'))
    throw new Error('Le format .xls n\'est pas pris en charge : enregistrez le fichier en .xlsx ou en CSV.')
  else if (/\.(csv|txt|tsv)$/.test(name)) table = parseCsv(decode(buf))
  else throw new Error('Format non pris en charge. Utilisez un fichier Excel (.xlsx) ou CSV.')
  return extractStudents(table)
}