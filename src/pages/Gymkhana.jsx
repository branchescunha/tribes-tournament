import { useCallback, useEffect, useMemo, useState } from 'react'
import ActiveCampNotice from '../components/ActiveCampNotice'
import PageHeader from '../components/PageHeader'
import ResponsiveTable from '../components/ResponsiveTable'
import { useActiveCamp } from '../hooks/useActiveCamp'
import { supabase } from '../lib/supabase'

const initialForm = {
  title: '',
  winning_team: '',
  points_per_member: '',
  notes: '',
}

const initialSettings = {
  team_a_name: 'Equipe A',
  team_b_name: 'Equipe B',
}

export default function Gymkhana() {
  const [participants, setParticipants] = useState([])
  const [history, setHistory] = useState([])
  const [settings, setSettings] = useState(initialSettings)
  const [settingsId, setSettingsId] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const { activeCampId } = useActiveCamp()

  const loadData = useCallback(async () => {
    setLoading(true)

    if (!activeCampId) {
      setParticipants([])
      setHistory([])
      setSettings(initialSettings)
      setSettingsId(null)
      setLoading(false)
      return
    }

    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select(
        `
        *,
        tribes (
          name,
          color,
          symbol
        )
      `
      )
      .eq('camp_id', activeCampId)
      .eq('is_active', true)
      .order('full_name')

    const { data: historyData, error: historyError } = await supabase
      .from('gymkhana_events')
      .select('*')
      .eq('camp_id', activeCampId)
      .order('created_at', { ascending: false })

    const { data: settingsRows, error: settingsError } = await supabase
      .from('gymkhana_settings')
      .select('*')
      .eq('camp_id', activeCampId)
      .limit(1)

    if (participantsError || historyError || settingsError) {
      console.error(participantsError || historyError || settingsError)
      setLoading(false)
      return
    }

    let settingsData = settingsRows?.[0]

    if (!settingsData) {
      const { data: createdSettings, error: createSettingsError } =
        await supabase
          .from('gymkhana_settings')
          .insert({
            ...initialSettings,
            camp_id: activeCampId,
          })
          .select()
          .single()

      if (createSettingsError) {
        console.error(createSettingsError)
        setLoading(false)
        return
      }

      settingsData = createdSettings
    }

    setParticipants(participantsData || [])
    setHistory(historyData || [])
    setSettingsId(settingsData?.id || null)
    setSettings({
      team_a_name: settingsData?.team_a_name || 'Equipe A',
      team_b_name: settingsData?.team_b_name || 'Equipe B',
    })
    setLoading(false)
  }, [activeCampId])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadData])

  function getTeamName(team) {
    if (team === 'A') return settings.team_a_name || 'Equipe A'
    if (team === 'B') return settings.team_b_name || 'Equipe B'
    return '-'
  }

  function getTeamStyles(team) {
    if (team === 'A') {
      return {
        card: 'border-cyan-500/30 bg-cyan-500/10',
        title: 'text-cyan-300',
        badge: 'border border-cyan-500/20 bg-cyan-500/20 text-cyan-300',
        focus: 'focus:border-cyan-500',
      }
    }

    return {
      card: 'border-violet-500/30 bg-violet-500/10',
      title: 'text-violet-300',
      badge: 'border border-violet-500/20 bg-violet-500/20 text-violet-300',
      focus: 'focus:border-violet-500',
    }
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function handleSettingsChange(event) {
    const { name, value } = event.target

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: value,
    }))
  }

  async function handleSaveSettings() {
    if (!activeCampId) {
      alert('Selecione um acampamento antes de configurar a gincana.')
      return
    }

    if (!settings.team_a_name.trim() || !settings.team_b_name.trim()) {
      alert('Informe o nome das duas equipes.')
      return
    }

    setSavingSettings(true)

    const payload = {
      team_a_name: settings.team_a_name.trim(),
      team_b_name: settings.team_b_name.trim(),
      updated_at: new Date().toISOString(),
      camp_id: activeCampId,
    }

    const request = settingsId
      ? supabase
          .from('gymkhana_settings')
          .update(payload)
          .eq('id', settingsId)
          .eq('camp_id', activeCampId)
      : supabase.from('gymkhana_settings').insert(payload)

    const { error } = await request

    if (error) {
      console.error(error)
      alert('Erro ao salvar nomes das equipes.')
      setSavingSettings(false)
      return
    }

    await loadData()
    setSavingSettings(false)
  }

  const teamA = useMemo(() => {
    return participants.filter(
      (participant) => participant.gymkhana_team === 'A'
    )
  }, [participants])

  const teamB = useMemo(() => {
    return participants.filter(
      (participant) => participant.gymkhana_team === 'B'
    )
  }, [participants])

  const selectedTeamMembers = form.winning_team === 'A' ? teamA : teamB

  async function createScoreEvents(gymkhanaEventId, points, winningTeamName) {
    const scoreEventsPayload = selectedTeamMembers.map((participant) => ({
      tribe_id: participant.tribe_id,
      participant_id: participant.id,
      type: 'POINT',
      category: 'Gincana',
      points,
      reason: form.title.trim(),
      notes: form.notes.trim()
        ? `${winningTeamName} | ${form.notes.trim()}`
        : winningTeamName,
      gymkhana_event_id: gymkhanaEventId,
      camp_id: activeCampId,
    }))

    const { error } = await supabase
      .from('score_events')
      .insert(scoreEventsPayload)

    if (error) throw error
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!activeCampId) {
      alert('Selecione um acampamento antes de lançar gincanas.')
      return
    }

    if (!form.title.trim()) {
      alert('Informe o nome da prova.')
      return
    }

    if (!form.winning_team) {
      alert('Selecione a equipe vencedora.')
      return
    }

    if (!form.points_per_member || Number(form.points_per_member) <= 0) {
      alert('Informe a pontuação por integrante.')
      return
    }

    if (selectedTeamMembers.length === 0) {
      alert('A equipe vencedora não possui integrantes cadastrados.')
      return
    }

    const membersWithoutTribe = selectedTeamMembers.filter(
      (participant) => !participant.tribe_id
    )

    if (membersWithoutTribe.length > 0) {
      alert(
        'Todos os integrantes da equipe vencedora precisam estar vinculados a uma equipe.'
      )
      return
    }

    setSaving(true)

    try {
      const points = Number(form.points_per_member)
      const winningTeamName = getTeamName(form.winning_team)
      const eventPayload = {
        title: form.title.trim(),
        winning_team: form.winning_team,
        points_per_member: points,
        notes: form.notes.trim() || null,
        camp_id: activeCampId,
      }

      if (editingId) {
        const { error: deleteScoresError } = await supabase
          .from('score_events')
          .delete()
          .eq('gymkhana_event_id', editingId)
          .eq('camp_id', activeCampId)

        if (deleteScoresError) throw deleteScoresError

        const { error: updateEventError } = await supabase
          .from('gymkhana_events')
          .update(eventPayload)
          .eq('id', editingId)
          .eq('camp_id', activeCampId)

        if (updateEventError) throw updateEventError

        await createScoreEvents(editingId, points, winningTeamName)
      } else {
        const { data: gymkhanaEvent, error: createEventError } = await supabase
          .from('gymkhana_events')
          .insert(eventPayload)
          .select()
          .single()

        if (createEventError) throw createEventError

        await createScoreEvents(gymkhanaEvent.id, points, winningTeamName)
      }

      setForm(initialForm)
      setEditingId(null)
      await loadData()
    } catch (error) {
      console.error(error)
      alert(`Erro ao salvar lançamento da gincana: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(eventItem) {
    setEditingId(eventItem.id)

    setForm({
      title: eventItem.title || '',
      winning_team: eventItem.winning_team || '',
      points_per_member: eventItem.points_per_member || '',
      notes: eventItem.notes || '',
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(initialForm)
  }

  async function handleDelete(eventItem) {
    const confirmDelete = confirm(
      'Tem certeza que deseja excluir este lançamento da gincana? As pontuações vinculadas também serão removidas.'
    )

    if (!confirmDelete) return

    setSaving(true)

    try {
      const { error: deleteScoresError } = await supabase
        .from('score_events')
        .delete()
        .eq('gymkhana_event_id', eventItem.id)
        .eq('camp_id', activeCampId)

      if (deleteScoresError) throw deleteScoresError

      const { error: deleteHistoryError } = await supabase
        .from('gymkhana_events')
        .delete()
        .eq('id', eventItem.id)
        .eq('camp_id', activeCampId)

      if (deleteHistoryError) throw deleteHistoryError

      if (editingId === eventItem.id) {
        setEditingId(null)
        setForm(initialForm)
      }

      await loadData()
    } catch (error) {
      console.error(error)
      alert(`Erro ao excluir lançamento da gincana: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  function handleDeleteEditing() {
    const currentEvent = history.find((eventItem) => eventItem.id === editingId)

    if (!currentEvent) {
      alert('Lançamento não encontrado.')
      return
    }

    handleDelete(currentEvent)
  }

  function renderParticipantCard(participant) {
    return (
      <div
        key={participant.id}
        className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <strong className="block truncate">{participant.full_name}</strong>

            <p className="mt-1 text-sm text-zinc-400">
              {participant.group_type || '-'} · {participant.gender || '-'}
            </p>

            <p className="mt-2 text-sm font-medium text-zinc-300">
              {participant.tribes?.name || 'Sem equipe'}
            </p>
          </div>

          {participant.tribes ? (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
              style={{ backgroundColor: participant.tribes.color }}
            >
              {participant.tribes.symbol}
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xs text-zinc-500">
              -
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderTeamCard(team, members) {
    const styles = getTeamStyles(team)

    return (
      <div className={`rounded-2xl border p-5 md:p-6 ${styles.card}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${styles.title}`}>
              {getTeamName(team)}
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              {members.length} integrante(s)
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${styles.badge}`}
          >
            {team}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Nenhum participante em {getTeamName(team)}.
            </p>
          ) : (
            members.map(renderParticipantCard)
          )}
        </div>
      </div>
    )
  }

  const columns = [
    {
      key: 'date',
      label: 'Data',
      render: (eventItem) => (
        <span className="text-zinc-400">
          {new Date(eventItem.created_at).toLocaleString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Prova',
      render: (eventItem) => (
        <span className="font-medium">{eventItem.title}</span>
      ),
    },
    {
      key: 'team',
      label: 'Equipe vencedora',
      render: (eventItem) => {
        const styles = getTeamStyles(eventItem.winning_team)

        return (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}
          >
            {getTeamName(eventItem.winning_team)}
          </span>
        )
      },
    },
    {
      key: 'points',
      label: 'Pontos por integrante',
      render: (eventItem) => (
        <strong className="text-green-400">
          +{eventItem.points_per_member}
        </strong>
      ),
    },
    {
      key: 'notes',
      label: 'Observações',
      render: (eventItem) => (
        <span className="text-zinc-400">{eventItem.notes || '-'}</span>
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

  const teamAStyles = getTeamStyles('A')
  const teamBStyles = getTeamStyles('B')

  return (
    <section>
      <PageHeader
        eyebrow="Gincana"
        title={`${settings.team_a_name} vs ${settings.team_b_name}`}
        description="Organize as equipes da gincana e lance pontos automaticamente para os integrantes vencedores."
      />

      {!activeCampId && (
        <div className="mb-6">
          <ActiveCampNotice message="Selecione um acampamento para configurar e lançar resultados da gincana." />
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
        <h2 className="text-xl font-bold">Configuração das equipes</h2>

        <p className="mt-2 text-sm text-zinc-400">
          Defina os nomes oficiais das equipes da gincana.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
          <input
            name="team_a_name"
            value={settings.team_a_name}
            onChange={handleSettingsChange}
            placeholder="Nome da Equipe A"
            className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none ${teamAStyles.focus}`}
          />

          <input
            name="team_b_name"
            value={settings.team_b_name}
            onChange={handleSettingsChange}
            placeholder="Nome da Equipe B"
            className={`w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none ${teamBStyles.focus}`}
          />

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savingSettings || !activeCampId}
            className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingSettings ? 'Salvando...' : 'Salvar equipes'}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        {renderTeamCard('A', teamA)}
        {renderTeamCard('B', teamB)}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-6"
      >
        <h2 className="text-xl font-bold">
          {editingId
            ? 'Editar resultado da gincana'
            : 'Lançar resultado da gincana'}
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Nome da prova"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500 xl:col-span-2"
          />

          <select
            name="winning_team"
            value={form.winning_team}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          >
            <option value="">Equipe vencedora</option>
            <option value="A">{settings.team_a_name}</option>
            <option value="B">{settings.team_b_name}</option>
          </select>

          <input
            name="points_per_member"
            value={form.points_per_member}
            onChange={handleChange}
            type="number"
            min="1"
            placeholder="Pontos por integrante"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
          />
        </div>

        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Observações"
          className="mt-4 min-h-24 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-yellow-500"
        />

        <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          {editingId && (
            <>
              <button
                type="button"
                onClick={handleDeleteEditing}
                disabled={saving || !activeCampId}
                className="rounded-xl border border-red-500/40 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Excluir
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar edição
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={saving || !activeCampId}
            className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? 'Salvando...'
              : editingId
                ? 'Salvar alterações'
                : 'Lançar pontos da gincana'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        {loading ? (
          <p className="text-zinc-400">Carregando gincana...</p>
        ) : (
          <ResponsiveTable
            columns={columns}
            data={history}
            emptyMessage="Nenhum resultado de gincana lançado."
          />
        )}
      </div>
    </section>
  )
}
