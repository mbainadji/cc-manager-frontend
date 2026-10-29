import { Badge } from './ui'

const tones = {
  'Brouillon': 'orange',
  'Saisie en cours': 'blue',
  'Prêt à publier': 'indigo',
  'Publié': 'green',
}

export default function StatusBadge({ status }) {
  return <Badge tone={tones[status] ?? 'slate'}>{status}</Badge>
}