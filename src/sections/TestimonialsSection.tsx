import { motion } from 'framer-motion'
import AnimatedSection from '../components/AnimatedSection'
import '../styles/sections/testimonials.css'

const TestimonialsSection = () => {

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
    <AnimatedSection className="section testimonials">

      <div className="container">

        <div className="testimonials-header">
          <h2>What Our Clients Say</h2>
          <p>
            Trusted by farmers, agribusiness investors,
            and commercial fish producers.
          </p>
        </div>

        <motion.div
          className="testimonials-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >

          <motion.div className="testimonial-card" variants={cardVariants}>
            <p className="testimonial-text">
              “FishTech constructed our ponds professionally.
              The yield improved within the first production cycle.”
            </p>
            <div className="testimonial-author">
              Mr. Moyo
            </div>
            <div className="testimonial-role">
              Commercial Farmer — Mashonaland West
            </div>
          </motion.div>

          <motion.div className="testimonial-card" variants={cardVariants}>
            <p className="testimonial-text">
              “The bird net system reduced our fish losses significantly.
              Highly structured team.”
            </p>
            <div className="testimonial-author">
              Mrs. Dube
            </div>
            <div className="testimonial-role">
              Aquaculture Entrepreneur — Harare
            </div>
          </motion.div>

          <motion.div className="testimonial-card" variants={cardVariants}>
            <p className="testimonial-text">
              “Their consultancy helped us avoid costly mistakes.
              Professional and reliable.”
            </p>
            <div className="testimonial-author">
              T. Chikodzi
            </div>
            <div className="testimonial-role">
              Agribusiness Investor — Midlands
            </div>
          </motion.div>

        </motion.div>

      </div>

    </AnimatedSection>
  )
}

export default TestimonialsSection
