import { motion } from "framer-motion"
import { MapPin, Building2, HardHat, ClipboardCheck } from "lucide-react"
import "../styles/sections/trust.css"

const TrustSection = () => {

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <section className="trust">

      {/* ✅ NEW INTRO CONTENT */}
      <div className="trust-intro">
        <h2>Zimbabwean Aquaculture Expertise</h2>
        <p>
          FishTech Consultants is a Zimbabwe-based aquaculture and AgriTech consultancy 
          focused on building productive, efficient, and profitable fish farming systems. 
          We combine practical fish farming experience with modern digital innovation 
          to solve real challenges faced by small-scale and commercial farmers.
        </p>
      </div>

      {/* TRUST BADGES */}
      <motion.div
        className="trust-inner"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >

        <motion.div className="trust-item" variants={item}>
          <MapPin size={26} />
          <span>Zimbabwe & Southern Africa</span>
        </motion.div>

        <motion.div className="trust-item" variants={item}>
          <Building2 size={26} />
          <span>Commercial & Small-Scale Systems</span>
        </motion.div>

        <motion.div className="trust-item" variants={item}>
          <HardHat size={26} />
          <span>Professional On-Site Infrastructure Execution</span>
        </motion.div>

        <motion.div className="trust-item" variants={item}>
          <ClipboardCheck size={26} />
          <span>Structured Aquaculture Consultancy</span>
        </motion.div>

      </motion.div>

    </section>
  )
}

export default TrustSection
