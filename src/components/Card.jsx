function Card({
  title,
  description,
  children,
  className = '',
  accentHover = false,
}) {
  const accentClasses = accentHover
    ? 'premium-interactive-card group'
    : 'hover:-translate-y-0.5'

  return (
    <div
      className={`${
        accentHover ? '' : 'hydro-card rounded-xl'
      } p-6 transition-all duration-500 ${accentClasses} ${className}`}
    >
      {title && (
        <h3
          className={`text-lg font-semibold text-brand-800 ${
            accentHover
              ? '!text-white transition-colors duration-300 group-hover:!text-brand-900'
              : ''
          }`}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          className={`mt-2 text-sm leading-relaxed text-[#334155] ${
            accentHover
              ? '!text-white/90 transition-colors duration-300 group-hover:!text-brand-900'
              : ''
          }`}
        >
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export default Card
