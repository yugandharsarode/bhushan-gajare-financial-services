import { Link } from 'react-router-dom'
import Container from './Container'
import { navLinks, siteInfo } from '../data/navigation'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hydro-gradient-dark relative text-brand-100">
      <Container className="py-12 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="text-xl font-semibold text-white transition-colors duration-500 hover:text-[#d4af37]"
            >
              {siteInfo.name}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              {siteInfo.tagline}. Professional demat, investment, and business
              services tailored for your financial goals.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm transition-colors duration-500 hover:text-[#d4af37]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>{siteInfo.email}</li>
              <li>{siteInfo.phone}</li>
              <li>{siteInfo.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm">
            &copy; {currentYear} {siteInfo.name}. All rights reserved.
          </p>
          <p className="text-sm">
            Rebuilding{' '}
            <a
              href="https://bhushangajare.com"
              className="font-medium text-white transition-colors duration-500 hover:text-[#d4af37]"
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
