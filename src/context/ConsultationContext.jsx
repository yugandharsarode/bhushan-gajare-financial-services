import { createContext, useContext, useState, useCallback } from 'react'

const ConsultationContext = createContext(null)

/**
 * Provides open/close state for the consultation modal
 * so any component (e.g. Navbar) can trigger it.
 */
export function ConsultationProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  return (
    <ConsultationContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ConsultationContext.Provider>
  )
}

export function useConsultation() {
  const context = useContext(ConsultationContext)
  if (!context) {
    throw new Error('useConsultation must be used within ConsultationProvider')
  }
  return context
}
