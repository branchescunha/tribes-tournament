export default function PageHeader({ eyebrow, title, description }) {
  return (
    <header className="mb-8">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">
          {eyebrow}
        </p>
      )}

      <h1 className="mt-3 text-3xl font-bold md:text-4xl">{title}</h1>

      {description && (
        <p className="mt-3 max-w-3xl text-sm text-zinc-400 md:text-base">
          {description}
        </p>
      )}
    </header>
  )
}
