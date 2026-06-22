import { Link } from 'react-router-dom'

function Button({
  children,
  to,
  href,
  variant = 'primary',
  className = '',
  type = 'button',
  onClick,
  disabled = false,
}) {
  const base = 'inline-flex items-center justify-center text-sm font-medium transition-all duration-500 focus:outline-none'

  const variants = {
    primary: 'hydro-btn',
    secondary: 'hydro-btn-secondary',
    accent: 'hydro-btn',
    outline: 'hydro-btn-outline',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
