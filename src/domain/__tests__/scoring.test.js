import assert from 'node:assert/strict'
import test from 'node:test'
import {
  SCORE_CATEGORIES,
  SCORE_TYPE_LABELS,
  getScoreCategories,
  getScoreTypeLabel,
  getSignedScoreAmount,
  summarizeScores,
  toScoreNumber,
} from '../scoring.js'

test('toScoreNumber converts score values without changing their sign', () => {
  assert.equal(toScoreNumber(15), 15)
  assert.equal(toScoreNumber(-8), -8)
  assert.equal(toScoreNumber(0), 0)
  assert.equal(toScoreNumber('12.5'), 12.5)
  assert.equal(toScoreNumber('-4'), -4)
})

test('toScoreNumber treats null and undefined as zero', () => {
  assert.equal(toScoreNumber(null), 0)
  assert.equal(toScoreNumber(undefined), 0)
})

test('getSignedScoreAmount uses the sign of points even when type contradicts it', () => {
  assert.equal(getSignedScoreAmount({ points: 10, type: 'PENALTY' }), 10)
  assert.equal(getSignedScoreAmount({ points: -6, type: 'POINT' }), -6)
})

test('summarizeScores calculates positive points, penalties and final total', () => {
  const scores = [
    { points: 20 },
    { points: '5' },
    { points: -7 },
    { points: '-3' },
    { points: 0 },
    { points: null },
    { points: undefined },
  ]

  assert.deepEqual(summarizeScores(scores), {
    positivePoints: 25,
    penaltyPoints: 10,
    total: 15,
  })
})

test('score categories preserve the current values and order', () => {
  assert.deepEqual(SCORE_CATEGORIES.POINT, [
    'Pontualidade',
    'Organização do quarto',
    'Gincana',
    'Participação',
    'Espírito de equipe',
    'Outro',
  ])
  assert.deepEqual(SCORE_CATEGORIES.PENALTY, [
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
  ])
})

test('getScoreCategories preserves category filtering and combined order', () => {
  assert.deepEqual(getScoreCategories('POINT'), SCORE_CATEGORIES.POINT)
  assert.deepEqual(getScoreCategories('PENALTY'), SCORE_CATEGORIES.PENALTY)
  assert.deepEqual(getScoreCategories(), [
    'Atraso',
    'Ausência em atividade',
    'Ausência na oração',
    'Ausência no culto',
    'Ausência no devocional',
    'Barulho após horário de silêncio',
    'Briga/discussão',
    'Desrespeito',
    'Espírito de equipe',
    'Gincana',
    'Não cumprimento de tarefa',
    'Organização do quarto',
    'Outro',
    'Participação',
    'Pontualidade',
    'Quarto desorganizado',
  ])
})

test('score type labels preserve values and the current fallback', () => {
  assert.deepEqual(SCORE_TYPE_LABELS, {
    POINT: 'Ponto',
    PENALTY: 'Penalidade',
  })
  assert.equal(getScoreTypeLabel('POINT'), 'Ponto')
  assert.equal(getScoreTypeLabel('PENALTY'), 'Penalidade')
  assert.equal(getScoreTypeLabel('UNKNOWN'), 'Penalidade')
})

test('scoring helpers do not mutate received arrays', () => {
  const scores = [{ points: 10 }, { points: -2 }]
  const snapshot = structuredClone(scores)

  summarizeScores(scores)

  assert.deepEqual(scores, snapshot)
})
