import { useEffect } from 'react'
import { useConsultation } from '../context/ConsultationContext'
import ConsultationForm from './ConsultationForm'

/**
 * Full-screen modal wrapper for the consultation form.
 * Closes on Escape key or backdrop click.
 */
function ConsultationModal() {
  const { isOpen, closeModal } = useConsultation()

  // Close modal when user presses Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeModal])

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 sm:p-6 ${
        isOpen
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        aria-label="Close consultation form"
        onClick={closeModal}
        tabIndex={isOpen ? 0 : -1}
      />

      {/* Modal panel — slides up on open */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
        className={`relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto transition-all duration-500 ease-out ${
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
        }`}
      >
        <ConsultationForm
          variant="modal"
          onSuccess={closeModal}
          showCloseButton
          onClose={closeModal}
        />
      </div>
    </div>
  )
}

export default ConsultationModal
