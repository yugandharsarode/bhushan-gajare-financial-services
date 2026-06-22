function ServiceCard({ title, description, benefits, highlights = [], icon: Icon }) {
  return (
    <article className="premium-interactive-card group flex h-full flex-col p-6 sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/12 text-white transition-all duration-500 group-hover:bg-brand-900/8 group-hover:text-brand-900">
        <Icon
          className="h-6 w-6 transition-transform duration-500 group-hover:scale-110"
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white transition-colors duration-500 group-hover:text-brand-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-white/90 transition-colors duration-500 group-hover:text-brand-900">
        {description}
      </p>

      {benefits && (
        <p className="mt-3 text-sm font-medium leading-relaxed text-white transition-colors duration-500 group-hover:text-brand-900">
          {benefits}
        </p>
      )}

      {highlights.length > 0 && (
        <ul className="mt-4 flex-1 space-y-2">
          {highlights.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-sm leading-relaxed text-white/90 transition-colors duration-500 group-hover:text-brand-900"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white transition-colors duration-300 group-hover:bg-brand-900"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <span className="mt-5 block h-0.5 w-0 rounded-full bg-white/70 transition-all duration-500 group-hover:w-12 group-hover:bg-brand-900" />
    </article>
  )
}

export default ServiceCard
