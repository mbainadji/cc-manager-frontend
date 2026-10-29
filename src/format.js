export const STATUS_LABEL = {
  draft: 'Brouillon',
  grading: 'Saisie en cours',
  ready: 'Prêt à publier',
  published: 'Publié',
}

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''