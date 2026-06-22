import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import DematServices from './pages/DematServices'
import Services from './pages/Services'
import About from './pages/About'
import Faq from './pages/Faq'
import Calculators from './pages/Calculators'
import Testimonials from './pages/Testimonials'
import Contact from './pages/Contact'
import { calculatorRegistry } from './config/calculatorRegistry'

function CalculatorRouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600">
      Loading calculator…
    </div>
  )
}

function App() {
  const activeCalculators = Object.values(calculatorRegistry).filter((c) => c.available)

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="demat-services" element={<DematServices />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<About />} />
        <Route path="faq" element={<Faq />} />
        <Route path="calculators" element={<Calculators />} />
        {activeCalculators.map((calc) => {
          const CalcComponent = calc.component
          return (
            <Route
              key={calc.id}
              path={`calculators/${calc.id}`}
              element={
                <Suspense fallback={<CalculatorRouteFallback />}>
                  <CalcComponent />
                </Suspense>
              }
            />
          )
        })}
        <Route path="tools" element={<Calculators />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  )
}

export default App
