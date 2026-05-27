import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [tribes, setTribes] = useState([])
  const [participants, setParticipants] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)

      const { data: tribesData, error: tribesError } = await supabase
        .from('tribes')
        .select('*')
        .order('name')

      const { data: participantsData, error: participantsError } =
        await supabase.from('participants').select('*').eq('is_active', true)

      const { data: eventsData, error: eventsError } = await supabase
        .from('score_events')
        .select(
          `
          *,
          tribes (
            name,
            symbol,
            color
          ),
          participants (
            full_name
          )
        `
        )
        .order('created_at', { ascending: false })

      if (tribesError || participantsError || eventsError) {
        console.error(tribesError || participantsError || eventsError)
        setLoading(false)
        return
      }

      setTribes(tribesData || [])
      setParticipants(participantsData || [])
      setEvents(eventsData || [])
      setLoading(false)
    }

    loadDashboard()
  }, [])

  const ranking = useMemo(() => {
    return tribes
      .map((tribe) => {
        const tribeEvents = events.filter(
          (eventItem) => eventItem.tribe_id === tribe.id
        )

        const positivePoints = tribeEvents
          .filter((eventItem) => Number(eventItem.points || 0) > 0)
          .reduce((sum, eventItem) => sum + Number(eventItem.points || 0), 0)

        const penaltyPoints = Math.abs(
          tribeEvents
            .filter((eventItem) => Number(eventItem.points || 0) < 0)
            .reduce((sum, eventItem) => sum + Number(eventItem.points || 0), 0)
        )

        const membersCount = participants.filter(
          (participant) => participant.tribe_id === tribe.id
        ).length

        return {
          ...tribe,
          positivePoints,
          penaltyPoints,
          total: positivePoints - penaltyPoints,
          membersCount,
          isActiveByMembers: membersCount > 0,
        }
      })
      .filter((tribe) => tribe.isActiveByMembers)
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total
        if (a.penaltyPoints !== b.penaltyPoints)
          return a.penaltyPoints - b.penaltyPoints
        if (b.positivePoints !== a.positivePoints)
          return b.positivePoints - a.positivePoints
        return a.name.localeCompare(b.name, 'pt-BR')
      })
  }, [tribes, participants, events])

  const activeTribes = ranking.length
  const activeParticipants = participants.length

  const totalPoints = events.reduce(
    (sum, eventItem) => sum + Number(eventItem.points || 0),
    0
  )

  const leader = ranking[0]
  const latestEvents = events.slice(0, 5)

  function formatPoints(value) {
    if (value > 0) return `+${value}`
    return value
  }

  if (loading) {
    return (
      <section>
        <PageHeader
          eyebrow="Painel Administrativo"
          title="Dashboard"
          description="Visão geral do Torneio das Tribos."
        />
        <p className="text-zinc-400">Carregando dashboard...</p>
      </section>
    )
  }

  return (
    <section>
      <PageHeader
        eyebrow="Painel Administrativo"
        title="Dashboard"
        description="Visão geral do Torneio das Tribos."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">Tribos ativas</p>
          <strong className="mt-4 block text-3xl">{activeTribes}</strong>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">Participantes ativos</p>
          <strong className="mt-4 block text-3xl">{activeParticipants}</strong>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">Saldo geral de pontos</p>
          <strong
            className={`mt-4 block text-3xl ${
              totalPoints < 0 ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {totalPoints}
          </strong>
        </div>

        <div className="rounded-2xl border border-yellow-500/60 bg-yellow-500/10 p-6">
          <p className="text-zinc-400">Tribo líder</p>

          {leader ? (
            <div className="mt-4 flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: leader.color }}
              >
                {leader.symbol}
              </div>

              <div>
                <strong className="block text-xl">{leader.name}</strong>
                <span className="text-sm text-yellow-400">
                  {leader.total} pontos
                </span>
                <span className="block text-xs text-zinc-400">
                  +{leader.positivePoints} / -{leader.penaltyPoints}
                </span>
              </div>
            </div>
          ) : (
            <strong className="mt-4 block text-xl">Sem líder</strong>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-bold">Últimos lançamentos</h2>

        {latestEvents.length === 0 ? (
          <p className="mt-6 text-zinc-400">Nenhuma pontuação lançada.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {latestEvents.map((eventItem) => (
              <div
                key={eventItem.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: eventItem.tribes?.color }}
                  >
                    {eventItem.tribes?.symbol}
                  </div>

                  <div>
                    <strong>{eventItem.tribes?.name || 'Sem tribo'}</strong>

                    <p className="text-sm text-zinc-400">
                      {eventItem.participants?.full_name || 'Equipe inteira'} ·{' '}
                      {eventItem.category}
                    </p>
                  </div>
                </div>

                <strong
                  className={
                    eventItem.points < 0 ? 'text-red-400' : 'text-green-400'
                  }
                >
                  {formatPoints(eventItem.points)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
