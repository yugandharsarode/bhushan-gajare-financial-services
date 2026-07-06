import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Container from './Container'
import { useConsultation } from '../context/ConsultationContext'
import { navLinks, siteInfo, navCta } from '../data/navigation'

function HamburgerIcon({ open }) {
  return (
    <span className="relative flex h-5 w-6 flex-col justify-between" aria-hidden="true">
      <span
        className={`block h-0.5 w-full rounded-full bg-white transition-all duration-300 ease-out ${
          open ? 'translate-y-[9px] rotate-45' : ''
        }`}
      />
      <span
        className={`block h-0.5 w-full rounded-full bg-white transition-all duration-300 ease-out ${
          open ? 'scale-x-0 opacity-0' : ''
        }`}
      />
      <span
        className={`block h-0.5 w-full rounded-full bg-white transition-all duration-300 ease-out ${
          open ? '-translate-y-[9px] -rotate-45' : ''
        }`}
      />
    </span>
  )
}

function ConsultationCtaButton({ className = '', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border border-[#d4af37] bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#0b1f4d] shadow-[0_6px_18px_rgba(212,175,55,0.28)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_26px_rgba(212,175,55,0.4)] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/60 ${className}`}
    >
      {navCta.label}
    </button>
  )
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { openModal } = useConsultation()

  const handleConsultationClick = () => {
    setMenuOpen(false)
    openModal()
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const navLinkClass = ({ isActive }) =>
    `relative whitespace-nowrap px-5 py-2 text-sm font-medium tracking-tight transition-colors duration-500 ${
      isActive
        ? 'text-[#d4af37]'
        : 'text-white/90 hover:bg-transparent hover:text-[#d4af37]'
    }`

  const mobileNavLinkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-3 text-base font-medium transition-colors duration-500 ${
      isActive
        ? 'bg-white/10 text-[#d4af37]'
        : 'text-white/90 hover:bg-white/10 hover:text-[#d4af37]'
    }`

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-[#1b2f63] bg-brand-800 hydro-nav-shadow'
          : 'border-b border-transparent bg-brand-800'
      }`}
    >
      <Container>
        <div className="flex h-[4rem] items-center justify-between gap-4 sm:h-[4.25rem] lg:h-[5rem]">
          <Link
            to="/"
            className="inline-flex h-full shrink-0 items-center transition-transform duration-300 ease-out hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50"
            aria-label={`${siteInfo.name} home`}
          >
            <img
              src="/bg-logo-removebg-preview.png"
              alt={siteInfo.name}
              className="h-[3.5rem] w-auto object-contain sm:h-[3.75rem] lg:h-[4.5rem]"
              width={286}
              height={192}
            />
          </Link>

          <ul className="hidden flex-1 items-center justify-center lg:flex">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  end={link.path === '/'}
                  className={navLinkClass}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <ConsultationCtaButton onClick={handleConsultationClick} />
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2.5 text-white transition-colors duration-500 hover:text-[#d4af37] lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
            menuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!menuOpen}
        >
          <nav className="border-t border-white/15 bg-brand-800 pb-5 pt-3">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    end={link.path === '/'}
                    className={mobileNavLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-4 px-1">
              <ConsultationCtaButton
                className="w-full"
                onClick={handleConsultationClick}
              />
            </div>
          </nav>
        </div>
      </Container>
    </header>
  )
}

export default Navbar
