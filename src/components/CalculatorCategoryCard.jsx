import { Link } from 'react-router-dom'
import { HiOutlineArrowRight } from 'react-icons/hi2'

function CalculatorCategoryCard({ title, icon: Icon, calculators }) {
  return (
    <article className="premium-interactive-card group flex h-full flex-col p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/12 text-white transition-all duration-500 group-hover:bg-brand-900/8 group-hover:text-brand-900">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="pt-1 text-lg font-semibold text-white transition-colors duration-500 group-hover:text-brand-900">
          {title}
        </h2>
      </div>

      <ul className="mt-5 flex flex-1 flex-col gap-2.5">
        {calculators.map((calc) => {
          const key = calc.slug || calc.name

          if (calc.available && calc.path) {
            return (
              <li key={key}>
                <Link
                  to={calc.path}
                  className="group/item flex w-full items-center justify-between gap-3 rounded-lg border border-white/20 bg-white/10 px-3 py-3 text-sm text-white transition-all duration-500 hover:border-brand-900/20 hover:bg-brand-900/10 hover:text-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <span className="font-medium">{calc.name}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white transition-all duration-500 group-hover/item:bg-brand-900/15 group-hover/item:text-brand-900">
                    Open
                    <HiOutlineArrowRight
                      className="h-3 w-3 transition-transform group-hover/item:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            )
          }

          return (
            <li
              key={key}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white/90 transition-colors duration-500 group-hover:border-brand-900/20 group-hover:bg-brand-900/8 group-hover:text-brand-900"
            >
              <span className="font-medium">{calc.name}</span>
              <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white transition-colors duration-500 group-hover:bg-brand-900/10 group-hover:text-brand-900">
                Coming Soon
              </span>
            </li>
          )
        })}
      </ul>

      <span className="mt-5 block h-0.5 w-0 rounded-full bg-white/70 transition-all duration-500 group-hover:w-12 group-hover:bg-brand-900" />
    </article>
  )
}

export default CalculatorCategoryCard
