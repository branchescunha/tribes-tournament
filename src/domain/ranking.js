import { summarizeScores } from './scoring.js'

export function groupScoresByTeam(scores = []) {
  return scores.reduce((groups, scoreEntry) => {
    const teamId = scoreEntry.tribe_id
    const teamScores = groups.get(teamId) || []

    groups.set(teamId, [...teamScores, scoreEntry])
    return groups
  }, new Map())
}

export function groupActiveParticipantsByTeam(participants = []) {
  return participants.reduce((groups, participant) => {
    if (!participant.is_active) return groups

    const teamId = participant.tribe_id
    const teamParticipants = groups.get(teamId) || []

    groups.set(teamId, [...teamParticipants, participant])
    return groups
  }, new Map())
}

export function calculateTeamStanding(
  team,
  scores = [],
  activeParticipants = []
) {
  const scoreSummary = summarizeScores(scores)
  const participantsCount = activeParticipants.length

  return {
    ...team,
    ...scoreSummary,
    participantsCount,
    eventsCount: scores.length,
    isActive: participantsCount > 0,
  }
}

export function compareRankingEntries(a, b) {
  if (b.total !== a.total) return b.total - a.total
  if (a.penaltyPoints !== b.penaltyPoints)
    return a.penaltyPoints - b.penaltyPoints
  if (b.positivePoints !== a.positivePoints)
    return b.positivePoints - a.positivePoints
  return a.name.localeCompare(b.name, 'pt-BR')
}

export function calculateRanking(
  teams = [],
  scores = [],
  participants = [],
  { includeInactive = false } = {}
) {
  const scoresByTeam = groupScoresByTeam(scores)
  const participantsByTeam = groupActiveParticipantsByTeam(participants)

  return teams
    .map((team) =>
      calculateTeamStanding(
        team,
        scoresByTeam.get(team.id) || [],
        participantsByTeam.get(team.id) || []
      )
    )
    .filter((team) => includeInactive || team.isActive)
    .sort(compareRankingEntries)
}
