import AnimatedSection from '../components/AnimatedSection'
import { motion } from 'framer-motion'
import '../styles/sections/why.css'
import { BadgeCheck, Clock, MapPin, Users } from 'lucide-react'

const WhySection = () => {

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <AnimatedSection id="why" className="section why">

      <div className="container">

        <div className="why-header">
          <h2>Why Choose FishTech?</h2>
          <p>
            We don’t just consult. We execute.
            Structured systems. Reliable delivery.
          </p>
        </div>

        <motion.div
          className="why-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >

          <motion.div className="why-card" variants={cardVariants}>
            <BadgeCheck size={32} className="why-icon" />
            <h3>Proven Execution</h3>
            <p>We build functional, profitable fish farms.</p>
          </motion.div>

          <motion.div className="why-card" variants={cardVariants}>
            <Clock size={32} className="why-icon" />
            <h3>On-Time Delivery</h3>
            <p>Structured project timelines with discipline.</p>
          </motion.div>

          <motion.div className="why-card" variants={cardVariants}>
            <MapPin size={32} className="why-icon" />
            <h3>Zimbabwe Focused</h3>
            <p>Designed for local climate and conditions.</p>
          </motion.div>

          <motion.div className="why-card" variants={cardVariants}>
            <Users size={32} className="why-icon" />
            <h3>Farmer Support</h3>
            <p>Ongoing advisory support beyond installation.</p>
          </motion.div>

        </motion.div>

      </div>

    </AnimatedSection>
  )
}

export default WhySection
