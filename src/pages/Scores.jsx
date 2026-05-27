import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import ResponsiveTable from '../components/ResponsiveTable'
import { supabase } from '../lib/supabase'

const initialForm = {
  tribe_id: '',
  participant_id: '',
  type: 'POINT',
  category: '',
  points: '',
  reason: '',
  notes: '',
}

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

export default function Scores() {
  const [tribes, setTribes] = useState([])
  const [participants, setParticipants] = useState([])
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(initialForm)
  const [filters, setFilters] = useState(initialFilters)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      const { data: tribesData, error: tribesError } = await supabase
        .from('tribes')
        .select('*')
        .order('name')

      const { data: participantsData, error: participantsError } =
        await supabase
          .from('participants')
          .select('*')
          .eq('is_active', true)
          .order('full_name')

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

    loadData()
  }, [])

  async function reloadEvents() {
    const { data, error } = await supabase
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

    if (error) {
      console.error(error)
      return
    }

    setEvents(data || [])
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function handleParticipantChange(event) {
    const participantId = event.target.value
    const selectedParticipant = participants.find(
      (participant) => participant.id === participantId
    )

    setForm((currentForm) => ({
      ...currentForm,
      participant_id: participantId,
      tribe_id: selectedParticipant?.tribe_id || currentForm.tribe_id,
    }))
  }

  function handleTribeChange(event) {
    setForm((currentForm) => ({
      ...currentForm,
      tribe_id: event.target.value,
      participant_id: '',
    }))
  }

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

  function handleEdit(eventItem) {
    setEditingId(eventItem.id)

    setForm({
      tribe_id: eventItem.tribe_id || '',
      participant_id: eventItem.participant_id || '',
      type: eventItem.type,
      category: eventItem.category || '',
      points: Math.abs(eventItem.points).toString(),
      reason: eventItem.reason || '',
      notes: eventItem.notes || '',
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(initialForm)
  }

  async function handleDelete() {
    const confirmDelete = confirm(
      'Tem certeza que deseja excluir este lançamento? Essa ação não pode ser desfeita.'
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from('score_events')
      .delete()
      .eq('id', editingId)

    if (error) {
      console.error(error)
      alert('Erro ao excluir lançamento.')
      return
    }

    setEditingId(null)
    setForm(initialForm)
    await reloadEvents()
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.tribe_id) {
      alert('Selecione uma tribo ou um participante.')
      return
    }

    if (!form.category) {
      alert('Selecione uma categoria.')
      return
    }

    if (!form.points || Number(form.points) <= 0) {
      alert('Informe uma pontuação válida.')
      return
    }

    setSaving(true)

    const value = Number(form.points)

    const payload = {
      tribe_id: form.tribe_id,
      participant_id: form.participant_id || null,
      type: form.type,
      category: form.category,
      points: form.type === 'PENALTY' ? value * -1 : value,
      reason: form.reason.trim() || null,
      notes: form.notes.trim() || null,
    }

    const request = editingId
      ? supabase.from('score_events').update(payload).eq('id', editingId)
      : supabase.from('score_events').insert(payload)

    const { error } = await request

    if (error) {
      console.error(error)
      alert('Erro ao salvar lançamento.')
      setSaving(false)
      return
    }

    setForm(initialForm)
    setEditingId(null)
    await reloadEvents()
    setSaving(false)
  }

  const formParticipants = form.tribe_id
    ? participants.filter(
        (participant) => participant.tribe_id === form.tribe_id
      )
    : participants

  const filterParticipants = filters.tribe_id
    ? participants.filter(
        (participant) => participant.tribe_id === filters.tribe_id
      )
    : participants

  const formCategories =
    form.type === 'POINT' ? pointCategories : penaltyCategories

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
          <span>{eventItem.tribes?.name}</span>
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
    {
      key: 'actions',
      label: 'Ações',
      render: (eventItem) => (
        <button
          type="button"
          onClick={() => handleEdit(eventItem)}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-800"
        >
          Editar
        </button>
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        eyebrow="Pontuação"
        title="Lançar Pontos"
        description="Registro de pontos, penalidades e histórico das tribos."
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-6"
      >
        <h2 className="text-xl font-bold">
          {editingId ? 'Editar lançamento' : 'Novo lançamento'}
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <select
            name="tribe_id"
            value={form.tribe_id}
            onChange={handleTribeChange}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          >
            <option value="">Selecione a tribo</option>
            {tribes.map((tribe) => (
              <option key={tribe.id} value={tribe.id}>
                {tribe.name}
              </option>
            ))}
          </select>

          <select
            name="participant_id"
            value={form.participant_id}
            onChange={handleParticipantChange}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          >
            <option value="">Equipe inteira / participante</option>
            {formParticipants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.full_name}
              </option>
            ))}
          </select>

          <select
            name="type"
            value={form.type}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                type: event.target.value,
                category: '',
              }))
            }
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          >
            <option value="POINT">Ponto</option>
            <option value="PENALTY">Penalidade</option>
          </select>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          >
            <option value="">Categoria</option>
            {formCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            name="points"
            value={form.points}
            onChange={handleChange}
            type="number"
            min="1"
            placeholder="Pontos"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          />

          <input
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Motivo"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500 md:col-span-2 xl:col-span-3"
          />
        </div>

        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Observações"
          className="mt-4 min-h-24 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
        />

        <div className="mt-4 flex flex-col justify-end gap-3 sm:flex-row">
          {editingId && (
            <>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl border border-red-500/40 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-500/10"
              >
                Excluir
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                Cancelar
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? 'Salvando...'
              : editingId
                ? 'Salvar alterações'
                : 'Lançar pontuação'}
          </button>
        </div>
      </form>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
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
            {filterParticipants.map((participant) => (
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
          <p className="text-zinc-400">Carregando pontuações...</p>
        ) : (
          <ResponsiveTable
            columns={columns}
            data={filteredEvents}
            emptyMessage="Nenhuma pontuação encontrada."
          />
        )}
      </div>
    </section>
  )
}
