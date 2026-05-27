import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import ResponsiveTable from '../components/ResponsiveTable'
import { supabase } from '../lib/supabase'

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

const initialFilters = {
  search: '',
  tribe_id: '',
  participant_id: '',
  type: '',
  category: '',
}

export default function History() {
  const [events, setEvents] = useState([])
  const [tribes, setTribes] = useState([])
  const [participants, setParticipants] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      const { data: eventsData, error: eventsError } = await supabase
        .from('score_events')
        .select(
          `
          *,
          tribes (
            name,
            color,
            symbol
          ),
          participants (
            full_name
          )
        `
        )
        .order('created_at', { ascending: false })

      const { data: tribesData, error: tribesError } = await supabase
        .from('tribes')
        .select('*')
        .order('name')

      const { data: participantsData, error: participantsError } =
        await supabase.from('participants').select('*').order('full_name')

      if (eventsError || tribesError || participantsError) {
        console.error(eventsError || tribesError || participantsError)
        setLoading(false)
        return
      }

      setEvents(eventsData || [])
      setTribes(tribesData || [])
      setParticipants(participantsData || [])
      setLoading(false)
    }

    loadData()
  }, [])

  function handleFilterChange(event) {
    const { name, value } = event.target

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function clearFilters() {
    setFilters(initialFilters)
  }

  function formatDate(value) {
    return new Date(value).toLocaleString('pt-BR')
  }

  const filteredParticipants = filters.tribe_id
    ? participants.filter(
        (participant) => participant.tribe_id === filters.tribe_id
      )
    : participants

  const filterCategories = useMemo(() => {
    if (filters.type === 'POINT') return pointCategories
    if (filters.type === 'PENALTY') return penaltyCategories

    return [...new Set([...pointCategories, ...penaltyCategories])].sort()
  }, [filters.type])

  const filteredEvents = useMemo(() => {
    return events.filter((eventItem) => {
      const search = filters.search.trim().toLowerCase()

      const matchesSearch = search
        ? eventItem.reason?.toLowerCase().includes(search) ||
          eventItem.notes?.toLowerCase().includes(search) ||
          eventItem.category?.toLowerCase().includes(search) ||
          eventItem.tribes?.name?.toLowerCase().includes(search) ||
          eventItem.participants?.full_name?.toLowerCase().includes(search)
        : true

      const matchesTribe = filters.tribe_id
        ? eventItem.tribe_id === filters.tribe_id
        : true

      const matchesParticipant = filters.participant_id
        ? eventItem.participant_id === filters.participant_id
        : true

      const matchesType = filters.type ? eventItem.type === filters.type : true

      const matchesCategory = filters.category
        ? eventItem.category === filters.category
        : true

      return (
        matchesSearch &&
        matchesTribe &&
        matchesParticipant &&
        matchesType &&
        matchesCategory
      )
    })
  }, [events, filters])

  const columns = [
    {
      key: 'date',
      label: 'Data',
      render: (eventItem) => (
        <span className="text-zinc-400">
          {formatDate(eventItem.created_at)}
        </span>
      ),
    },
    {
      key: 'tribe',
      label: 'Tribo',
      render: (eventItem) => (
        <div className="flex items-center justify-end gap-3 md:justify-start">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
            style={{ backgroundColor: eventItem.tribes?.color }}
          >
            {eventItem.tribes?.symbol}
          </div>

          <span>{eventItem.tribes?.name || 'Sem tribo'}</span>
        </div>
      ),
    },
    {
      key: 'participant',
      label: 'Participante',
      render: (eventItem) => (
        <span className="text-zinc-400">
          {eventItem.participants?.full_name || 'Equipe inteira'}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (eventItem) => (
        <span>{eventItem.type === 'POINT' ? 'Ponto' : 'Penalidade'}</span>
      ),
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (eventItem) => (
        <span className="text-zinc-400">{eventItem.category}</span>
      ),
    },
    {
      key: 'points',
      label: 'Pontos',
      render: (eventItem) => (
        <strong
          className={eventItem.points >= 0 ? 'text-green-400' : 'text-red-400'}
        >
          {eventItem.points > 0 ? `+${eventItem.points}` : eventItem.points}
        </strong>
      ),
    },
    {
      key: 'reason',
      label: 'Motivo',
      render: (eventItem) => (
        <span className="text-zinc-400">{eventItem.reason || '-'}</span>
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        eyebrow="Histórico"
        title="Histórico de Lançamentos"
        description="Consulta completa de pontos e penalidades registrados."
      />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-xl font-bold">Filtros</h2>

            <p className="mt-2 text-sm text-zinc-400">
              {filteredEvents.length} de {events.length} lançamento(s)
              exibido(s).
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            Limpar filtros
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Buscar por motivo, tribo ou participante"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500 xl:col-span-2"
          />

          <select
            name="tribe_id"
            value={filters.tribe_id}
            onChange={(event) =>
              setFilters((currentFilters) => ({
                ...currentFilters,
                tribe_id: event.target.value,
                participant_id: '',
              }))
            }
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          >
            <option value="">Todas as tribos</option>

            {tribes.map((tribe) => (
              <option key={tribe.id} value={tribe.id}>
                {tribe.name}
              </option>
            ))}
          </select>

          <select
            name="participant_id"
            value={filters.participant_id}
            onChange={handleFilterChange}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          >
            <option value="">Todos os participantes</option>

            {filteredParticipants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.full_name}
              </option>
            ))}
          </select>

          <select
            name="type"
            value={filters.type}
            onChange={(event) =>
              setFilters((currentFilters) => ({
                ...currentFilters,
                type: event.target.value,
                category: '',
              }))
            }
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          >
            <option value="">Todos os tipos</option>
            <option value="POINT">Pontos</option>
            <option value="PENALTY">Penalidades</option>
          </select>

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          >
            <option value="">Todas as categorias</option>

            {filterCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-zinc-400">Carregando histórico...</p>
        ) : (
          <ResponsiveTable
            columns={columns}
            data={filteredEvents}
            emptyMessage="Nenhum lançamento encontrado."
          />
        )}
      </div>
    </section>
  )
}
