import { motion } from 'framer-motion'
import '../styles/sections/hero.css'

const HeroSection = () => {

  const whatsappNumber = "263711626305"

  const openWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}`, "_blank")
  }

  return (
    <section className="hero">

      <div className="hero-inner">

        <div className="hero-content">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1,ease: "easeOut" }}
          >
              Professional Fish Pond Construction & Aquaculture Solutions in Zimbabwe
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
              Pond construction, HDPE liner installation, bird net systems, fingerling and feed supply — built for farmers who want real production results.
          </motion.p>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <button
              className="hero-primary"
              onClick={openWhatsApp}
            >
              Start Your Fish Farm
            </button>

            <button
              className="hero-secondary"
              onClick={() => {
                document
                  .getElementById("services")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              View Our Services
            </button>
          </motion.div>

        </div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, y: 0.96 }}
          animate={{ opacity: 1, y: 1}}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <img
            src="/pond-hero.webp"
            alt="Fish pond construction Zimbabwe"
            width="900"
            height="600"
            fetchPriority="high"
            decoding="async"
          />
        </motion.div>

      </div>

    </section>
  )
}

export default HeroSection
