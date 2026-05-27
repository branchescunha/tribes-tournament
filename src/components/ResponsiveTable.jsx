export default function ResponsiveTable({ columns, data, emptyMessage }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="bg-zinc-900">
            <tr className="text-left text-sm">
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-4">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="bg-zinc-950 px-6 py-10 text-center text-zinc-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-zinc-800 bg-zinc-950 text-sm"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {data.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">
            {emptyMessage}
          </p>
        ) : (
          data.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="space-y-3">
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-3 last:border-none last:pb-0"
                  >
                    <span className="text-xs uppercase tracking-[0.15em] text-zinc-500">
                      {column.label}
                    </span>

                    <div className="max-w-[65%] text-right text-sm leading-snug">
                      {column.render(item)}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
