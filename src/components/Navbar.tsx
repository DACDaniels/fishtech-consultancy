import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import "../styles/sections/navbar.css"

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Detect scroll for navbar refinement
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-inner">

          <Link 
            to="/" 
            className="navbar-logo"
            onClick={()=> {
              closeMenu()
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
          >
            <img
              src="/logo.png"
              alt="FishTech Consultancy Logo"
            />
          </Link>


          <div className="navbar-links desktop">
            <a href="#services">Services</a>
            <a href="#projects">Projects</a>
            <a href="#why">Why Us</a>
            <a href="#contact" className="nav-cta">Contact</a>
          </div>

          <div className="mobile-toggle">
            <button onClick={() => setIsOpen(true)}>
              <Menu size={28} />
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />

            <motion.div
              className="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
            >

              <div className="mobile-header">
                <span>FishTech</span>
                <button onClick={closeMenu}>
                  <X size={26} />
                </button>
              </div>

              <div className="mobile-links">
                <a href="#services" onClick={closeMenu}>Services</a>
                <a href="#projects" onClick={closeMenu}>Projects</a>
                <a href="#why" onClick={closeMenu}>Why Us</a>
                <a href="#contact" className="mobile-cta" onClick={closeMenu}>
                  Contact Us
                </a>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
