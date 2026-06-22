import { useId, useRef, useState } from 'react'
import { HiOutlineChevronDown } from 'react-icons/hi2'

function AccordionItem({ item, isOpen, onToggle }) {
  const contentId = useId()
  const contentRef = useRef(null)
  const contentHeight = isOpen ? contentRef.current?.scrollHeight ?? 0 : 0

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-300 ${
        isOpen
          ? 'border-[#d4af37] bg-[#d4af37] text-brand-900 shadow-[0_16px_32px_rgba(212,175,55,0.34)]'
          : 'border-brand-500 bg-brand-700 text-white shadow-[0_10px_24px_rgba(8,22,56,0.34)]'
      }`}
    >
      <button
        type="button"
        id={`${contentId}-trigger`}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={onToggle}
        className={`flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors duration-300 sm:px-6 sm:py-6 ${
          isOpen ? 'hover:bg-[#d4af37]' : 'hover:bg-brand-600'
        }`}
      >
        <span className={`text-base font-medium sm:text-lg ${isOpen ? 'text-brand-900' : 'text-white'}`}>
          {item.question}
        </span>
        <HiOutlineChevronDown
          className={`mt-0.5 h-5 w-5 shrink-0 transition-transform duration-300 ease-out ${
            isOpen ? 'rotate-180' : ''
          } ${isOpen ? 'text-brand-900' : 'text-white'}`}
          aria-hidden="true"
        />
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={`${contentId}-trigger`}
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: isOpen ? `${contentHeight}px` : '0px' }}
      >
        <div
          ref={contentRef}
          className={`border-t px-5 pb-5 pt-4 sm:px-6 sm:pb-6 ${
            isOpen ? 'border-brand-900/20' : 'border-white/20'
          }`}
        >
          <div className={`space-y-3 text-sm leading-relaxed sm:text-base ${isOpen ? 'text-brand-900' : 'text-white/90'}`}>
            {item.answer.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {item.bullets?.length > 0 && (
            <ul className="mt-4 space-y-2">
              {item.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className={`flex gap-2.5 text-sm leading-relaxed sm:text-base ${isOpen ? 'text-brand-900' : 'text-white/90'}`}
                >
                  <span
                    className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${isOpen ? 'bg-brand-900' : 'bg-white'}`}
                    aria-hidden="true"
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function Accordion({ items, defaultOpenId = null }) {
  const [openId, setOpenId] = useState(defaultOpenId)

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
        />
      ))}
    </div>
  )
}

export default Accordion
