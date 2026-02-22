import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaWhatsapp } from "react-icons/fa"
import "../styles/sections/whatsapp.css"

const WhatsAppFloat = () => {

  const whatsappNumber = "263711626305" // Replace with real number
  const message = "Hello, I would like to inquire about your fish farming services."

  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setVisible(false) // scrolling down
      } else {
        setVisible(true) // scrolling up
      }
      setLastScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message)
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
      "_blank"
    )
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className="whatsapp-float"
          onClick={openWhatsApp}
          aria-label="Chat with us on WhatsApp"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3 }}
        >
          <FaWhatsapp size={28} />
          <span className="whatsapp-tooltip">Chat with us</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default WhatsAppFloat
