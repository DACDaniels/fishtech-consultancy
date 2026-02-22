import { motion } from 'framer-motion'
import AnimatedSection from '../components/AnimatedSection'
import '../styles/sections/cta.css'

const CTASection = () => {

  const whatsappNumber = "263711626305" // Replace with real number

  const openWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}`, "_blank")
  }

  return (
    <AnimatedSection id="contact" className="cta">

      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        Ready to Build Your Fish Farm?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        viewport={{ once: true }}
      >
        Let’s design, construct, and deliver a profitable aquaculture system for you.
        Professional execution. Structured support. Real results.
      </motion.p>

      <motion.div
        className="cta-button"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        viewport={{ once: true }}
      >
        <button onClick={openWhatsApp}>
          Start Your Project Today
        </button>
      </motion.div>

    </AnimatedSection>
  )
}

export default CTASection
