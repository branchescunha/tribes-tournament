import { useEffect, useState } from 'react'
import { calculateRanking } from '../domain/ranking'
import { supabase } from '../lib/supabase'

export default function Ranking() {
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRanking() {
      setLoading(true)

      const { data: tribesData, error: tribesError } = await supabase
        .from('tribes')
        .select('*')
        .order('name')

      const { data: eventsData, error: eventsError } = await supabase
        .from('score_events')
        .select('tribe_id, points')

      const { data: participantsData, error: participantsError } =
        await supabase
          .from('participants')
          .select('id, tribe_id, is_active')
          .eq('is_active', true)

      if (tribesError || eventsError || participantsError) {
        console.error(tribesError || eventsError || participantsError)
        setLoading(false)
        return
      }

      const rankingData = calculateRanking(
        tribesData || [],
        eventsData || [],
        participantsData || [],
        { includeInactive: false }
      )

      setRanking(rankingData)
      setLoading(false)
    }

    loadRanking()
  }, [])

  function getPointsColor(total, index) {
    if (total < 0) return 'text-red-400'
    if (index <= 2) return 'text-green-400'
    return 'text-yellow-500'
  }

  const topThree = ranking.slice(0, 3)

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:px-8 md:py-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-500 md:text-sm">
              TribeScore
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              Ranking das Tribos
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
              Ranking público do evento com critério de desempate por maior
              saldo, menor penalidade, maior pontuação positiva e ordem
              alfabética.
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-2xl border border-zinc-800 px-5 py-4 text-center text-sm transition hover:border-yellow-500 hover:text-yellow-500 md:text-base"
          >
            Área administrativa
          </a>
        </div>

        {loading ? (
          <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
            Carregando ranking...
          </div>
        ) : ranking.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <h2 className="text-2xl font-bold">Nenhuma tribo ativa ainda</h2>

            <p className="mt-3 text-zinc-400">
              Uma tribo aparece no ranking quando possuir pelo menos um
              participante ativo.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {topThree.map((tribe, index) => (
                <article
                  key={tribe.id}
                  className={`rounded-3xl border p-5 ${
                    index === 0
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-zinc-800 bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-4xl font-black text-yellow-500 md:text-5xl">
                      #{index + 1}
                    </span>

                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl md:h-16 md:w-16 md:text-3xl"
                      style={{ backgroundColor: tribe.color }}
                    >
                      {tribe.symbol}
                    </div>
                  </div>

                  <h2 className="mt-6 text-2xl font-bold md:text-4xl">
                    {tribe.name}
                  </h2>

                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 md:text-sm">
                      Saldo final
                    </p>

                    <p
                      className={`mt-2 text-5xl font-black md:text-6xl ${getPointsColor(tribe.total, index)}`}
                    >
                      {tribe.total}
                    </p>

                    <p className="mt-3 text-sm text-zinc-400">
                      +{tribe.positivePoints} / -{tribe.penaltyPoints}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 hidden overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 md:block">
              <table className="w-full border-collapse">
                <thead className="bg-zinc-950">
                  <tr className="text-left text-sm">
                    <th className="px-6 py-5">Posição</th>
                    <th className="px-6 py-5">Tribo</th>
                    <th className="px-6 py-5">Quarto</th>
                    <th className="px-6 py-5">Responsável</th>
                    <th className="px-6 py-5">Integrantes</th>
                    <th className="px-6 py-5">Pontos +</th>
                    <th className="px-6 py-5">Penalidades</th>
                    <th className="px-6 py-5 text-right">Saldo</th>
                  </tr>
                </thead>

                <tbody>
                  {ranking.map((tribe, index) => (
                    <tr
                      key={tribe.id}
                      className="border-t border-zinc-800 text-sm"
                    >
                      <td className="px-6 py-5 font-bold text-yellow-500">
                        #{index + 1}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl"
                            style={{ backgroundColor: tribe.color }}
                          >
                            {tribe.symbol}
                          </div>

                          <span className="font-semibold">{tribe.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {tribe.room_name || 'Não definido'}
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {tribe.leader_name || 'Não definido'}
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {tribe.participantsCount}
                      </td>

                      <td className="px-6 py-5 text-green-400">
                        +{tribe.positivePoints}
                      </td>

                      <td className="px-6 py-5 text-red-400">
                        -{tribe.penaltyPoints}
                      </td>

                      <td
                        className={`px-6 py-5 text-right text-2xl font-black ${getPointsColor(tribe.total, index)}`}
                      >
                        {tribe.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 space-y-3 md:hidden">
              {ranking.map((tribe, index) => (
                <article
                  key={tribe.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-yellow-500">
                        #{index + 1}
                      </span>

                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-lg"
                        style={{ backgroundColor: tribe.color }}
                      >
                        {tribe.symbol}
                      </div>

                      <h2 className="text-xl font-bold">{tribe.name}</h2>
                    </div>

                    <strong
                      className={`text-3xl font-black ${getPointsColor(tribe.total, index)}`}
                    >
                      {tribe.total}
                    </strong>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm">
                    <div className="flex justify-between gap-4 border-t border-zinc-800 pt-3">
                      <span className="text-zinc-500">Quarto</span>
                      <span className="text-right text-zinc-300">
                        {tribe.room_name || 'Não definido'}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 border-t border-zinc-800 pt-3">
                      <span className="text-zinc-500">Responsável</span>
                      <span className="text-right text-zinc-300">
                        {tribe.leader_name || 'Não definido'}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 border-t border-zinc-800 pt-3">
                      <span className="text-zinc-500">Pontos positivos</span>
                      <span className="text-right text-green-400">
                        +{tribe.positivePoints}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 border-t border-zinc-800 pt-3">
                      <span className="text-zinc-500">Penalidades</span>
                      <span className="text-right text-red-400">
                        -{tribe.penaltyPoints}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
