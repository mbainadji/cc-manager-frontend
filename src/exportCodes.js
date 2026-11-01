// Télécharge les codes d'activation en CSV (séparateur « ; » pour Excel en français).
// Les cellules qui commencent par = + - @ sont neutralisées (injection de formules).
const safe = (v) => {
  const s = String(v ?? '')
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
}
const cell = (v) => `"${safe(v).replace(/"/g, '""')}"`

export function downloadCodes(rows) {
  const head = ['Matricule', 'Nom', 'Groupe', "Code d'activation"]
  const lines = [head, ...rows.map((r) => [r.matricule, r.fullName, r.group, r.code])]
  const csv = '\uFEFF' + lines.map((l) => l.map(cell).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `codes-activation-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
