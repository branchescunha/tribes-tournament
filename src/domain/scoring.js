const pointCategories = [
  'Pontualidade',
  'Organização do quarto',
  'Gincana',
  'Participação',
  'Espírito de equipe',
  'Outro',
]

const penaltyCategories = [
  'Atraso',
  'Quarto desorganizado',
  'Ausência em atividade',
  'Ausência no culto',
  'Ausência no devocional',
  'Ausência na oração',
  'Barulho após horário de silêncio',
  'Desrespeito',
  'Briga/discussão',
  'Não cumprimento de tarefa',
  'Outro',
]

export function toScoreNumber(value) {
  return Number(value ?? 0)
}

export function getSignedScoreAmount(scoreEntry) {
  return toScoreNumber(scoreEntry?.points)
}

export function summarizeScores(scores = []) {
  return scores.reduce(
    (summary, scoreEntry) => {
      const amount = getSignedScoreAmount(scoreEntry)

      if (amount > 0) {
        summary.positivePoints += amount
      } else if (amount < 0) {
        summary.penaltyPoints += Math.abs(amount)
      }

      summary.total = summary.positivePoints - summary.penaltyPoints
      return summary
    },
    {
      positivePoints: 0,
      penaltyPoints: 0,
      total: 0,
    }
  )
}

export function getScoreCategories(type) {
  if (type === 'POINT') return [...pointCategories]
  if (type === 'PENALTY') return [...penaltyCategories]

  return [...new Set([...pointCategories, ...penaltyCategories])].sort()
}

export function getScoreTypeLabel(type) {
  return type === 'POINT' ? 'Ponto' : 'Penalidade'
}
