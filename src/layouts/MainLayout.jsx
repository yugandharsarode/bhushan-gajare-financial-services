import { Outlet } from 'react-router-dom'
import { ConsultationProvider } from '../context/ConsultationContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ConsultationModal from '../components/ConsultationModal'

function MainLayout() {
  return (
    <ConsultationProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <ConsultationModal />
      </div>
    </ConsultationProvider>
  )
}

export default MainLayout
