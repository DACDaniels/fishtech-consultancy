import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"

import ScrollToTop from "./components/ScrollToTop"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import WhatsAppFloat from "./components/WhatsAppFloat"
import MobileCTA from "./components/MobileCTA"

import HeroSection from "./sections/HeroSection"
import TrustSection from "./sections/TrustSection"
import ServicesSection from "./sections/ServicesSection"
import ProcessSection from "./sections/ProcessSection"
import ProjectsSection from "./sections/ProjectsSection"
import WhySection from "./sections/WhySection"
import TestimonialsSection from "./sections/TestimonialsSection"
import CTASection from "./sections/CTASection"

import ProjectsPage from "./pages/ProjectsPage"

const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"))

function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <ServicesSection />
      <ProcessSection />
      <ProjectsSection />
      <WhySection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}

function App() {
  return (
    <>
      <Navbar />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route
          path="/projects/:slug"
          element={
            <Suspense fallback={null}>
              <ProjectDetailPage />
            </Suspense>
          }
        />
      </Routes>

      <Footer />
      <WhatsAppFloat />
      <MobileCTA />
    </>
  )
}

export default App