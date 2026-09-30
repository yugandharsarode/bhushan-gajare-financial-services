import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HiArrowUpRight,
  HiOutlineBuildingLibrary,
  HiOutlineChevronDown,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePhone,
} from 'react-icons/hi2'
import Container from './Container'
import { navLinks, siteInfo, navCta } from '../data/navigation'
import { amcs } from '../data/amcs'
import { calculatorRegistry } from '../config/calculatorRegistry'
import { useConsultation } from '../context/ConsultationContext'

const POPULAR_CALCULATORS = ['sip', 'step-up-sip', 'goal-planning', 'retirement', 'loan-emi']

/** AMCs shown on phones before "View all" is tapped */
const AMCS_VISIBLE_ON_PHONE = 12

function FooterHeading({ children }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wider !text-white">{children}</h2>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear()
  const { openModal } = useConsultation()
  const [showAllAmcs, setShowAllAmcs] = useState(false)

  const linkClass = 'text-sm text-brand-100/80 transition-colors duration-300 hover:text-[#d4af37]'

  return (
    <footer className="relative bg-[#0b1f4d] text-brand-100">
      <div
        className="h-1 bg-gradient-to-r from-[#b38f24] via-[#d4af37] to-[#b38f24]"
        aria-hidden="true"
      />

      <Container className="py-12 lg:py-16">
        {/* Brand, navigation and contact */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50"
              aria-label={`${siteInfo.name} home`}
            >
              <img
                src="/bg-logo-removebg-preview.png"
                alt=""
                className="h-14 w-auto object-contain"
                width={286}
                height={192}
              />
              <span className="text-xl font-semibold text-white">{siteInfo.name}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-100/80">
              {siteInfo.tagline}. Professional demat, investment and business services
              tailored for your financial goals.
            </p>
            <button type="button" onClick={openModal} className="hydro-btn mt-6 !px-6 !py-3">
              {navCta.label}
            </button>
          </div>

          <nav aria-label="Quick links" className="lg:col-span-2">
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Popular calculators" className="lg:col-span-3">
            <FooterHeading>Popular Calculators</FooterHeading>
            <ul className="mt-4 space-y-2.5">
              {POPULAR_CALCULATORS.map((id) => (
                <li key={id}>
                  <Link to={calculatorRegistry[id].path} className={linkClass}>
                    {calculatorRegistry[id].name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/calculators"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#d4af37] transition-colors duration-300 hover:text-white"
                >
                  View all calculators <span aria-hidden="true">→</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <FooterHeading>Contact</FooterHeading>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={`mailto:${siteInfo.email}`} className={`${linkClass} inline-flex items-center gap-3`}>
                  <HiOutlineEnvelope className="h-5 w-5 shrink-0 text-[#d4af37]" aria-hidden="true" />
                  {siteInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-brand-100/80">
                <HiOutlinePhone className="h-5 w-5 shrink-0 text-[#d4af37]" aria-hidden="true" />
                {siteInfo.phone}
              </li>
              <li className="flex items-center gap-3 text-brand-100/80">
                <HiOutlineMapPin className="h-5 w-5 shrink-0 text-[#d4af37]" aria-hidden="true" />
                {siteInfo.address}
              </li>
            </ul>
          </div>
        </div>

        {/* Mutual fund houses */}
        <section
          aria-labelledby="footer-amcs-heading"
          className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37] sm:flex">
                <HiOutlineBuildingLibrary className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                  Mutual Fund Houses
                </p>
                <h2 id="footer-amcs-heading" className="mt-1.5 text-xl font-semibold !text-white">
                  SEBI-Registered AMCs in India
                </h2>
                <p className="mt-1 text-sm text-brand-100/70">
                  Visit the official website of any asset management company. Links open in a new tab.
                </p>
              </div>
            </div>
            <span className="self-start rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs font-semibold text-[#d4af37] md:self-auto">
              {amcs.length} AMCs
            </span>
          </div>

          <ul
            id="footer-amc-list"
            className="mt-6 columns-1 gap-x-8 min-[420px]:columns-2 md:columns-3 lg:columns-4 xl:columns-5"
          >
            {amcs.map((amc, index) => (
              <li
                key={amc.name}
                className={`break-inside-avoid ${
                  index >= AMCS_VISIBLE_ON_PHONE && !showAllAmcs ? 'hidden md:block' : ''
                }`}
              >
                <a
                  href={amc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 py-1.5 text-[13px] leading-snug text-brand-100/80 transition-colors duration-300 hover:text-[#d4af37] focus-visible:text-[#d4af37] focus-visible:outline-none"
                >
                  <span>{amc.name}</span>
                  <HiArrowUpRight
                    className="h-3 w-3 shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>

          {!showAllAmcs && amcs.length > AMCS_VISIBLE_ON_PHONE && (
            <button
              type="button"
              onClick={() => setShowAllAmcs(true)}
              aria-expanded={showAllAmcs}
              aria-controls="footer-amc-list"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:border-[#d4af37] hover:text-[#d4af37] md:hidden"
            >
              View all {amcs.length} AMCs
              <HiOutlineChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          )}

          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-brand-100/60">
            Mutual fund investments are subject to market risks. Read all scheme-related
            documents carefully. AMC links lead to third-party websites.
          </p>
        </section>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-brand-100/80 sm:flex-row">
          <p>
            &copy; {currentYear} {siteInfo.name}. All rights reserved.
          </p>
          <p>
            Rebuilding{' '}
            <a
              href="https://bhushangajare.com"
              className="font-medium text-white transition-colors duration-300 hover:text-[#d4af37]"
              target="_blank"
              rel="noopener noreferrer"
            >
              bhushangajare.com
            </a>
          </p>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
