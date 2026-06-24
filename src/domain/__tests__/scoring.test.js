import assert from 'node:assert/strict'
import test from 'node:test'
import {
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

test('scoring helpers expose the current categories and labels', () => {
  assert.deepEqual(getScoreCategories('POINT'), [
    'Pontualidade',
    'Organização do quarto',
    'Gincana',
    'Participação',
    'Espírito de equipe',
    'Outro',
  ])
  assert.equal(getScoreTypeLabel('POINT'), 'Ponto')
  assert.equal(getScoreTypeLabel('PENALTY'), 'Penalidade')
})

test('scoring helpers do not mutate received arrays', () => {
  const scores = [{ points: 10 }, { points: -2 }]
  const snapshot = structuredClone(scores)

  summarizeScores(scores)

  assert.deepEqual(scores, snapshot)
})
