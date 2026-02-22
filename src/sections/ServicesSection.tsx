import { motion } from "framer-motion"
import AnimatedSection from "../components/AnimatedSection"
import "../styles/sections/services.css"

const services = [
  {
    title: "Fish Pond Construction",
    description:
      "Complete pond construction including site assessment, excavation, compaction, lining and finishing. Built for serious production.",
    image: "/services/pond-construction.webp" 
  },
  {
    title: "HDPE Dam / Pond Liner Installation",
    description:
      "Supply and installation of 300–500+ micron HDPE geomembrane liners for leak-proof, long-lasting ponds.",
    image: "/services/hdpe-liner.webp" 
  },
  {
    title: "Bird & Predator Net Systems",
    description:
      "Heavy-duty bird net supply and installation to reduce fish losses and protect your stock.",
    image: "/services/bird-net.webp" 
  },
  {
    title: "Fingerling Supply", 
    description:
      "We source healthy, fast-growing fingerlings from trusted hatcheries for your stocking requirements.",
    image: "/services/fingerlings.webp"
  },
  {
    title: "Fish Feed Supply", 
    description:
      "Reliable sourcing of quality fish feed including Starter, Juvenile and Grower formulations.",
    image: "/services/feed-supply.webp"
  },
  {
    title: "Drainage & Water Control Systems",
    description:
      "Installation of proper drainage outlets and controlled water inlets for efficient pond management.",
    image: "/services/drainage.webp" 
  },
  {
    title: "Smart Feed Management & Biomass Monitoring", 
    description:
      "Practical feed control system to prevent underfeeding and overfeeding, helping farmers improve growth and reduce feed waste.",
    image: "/services/feed-management.webp" 
  },
  {
    title: "Training & Farm Advisory Programs",
    description:
      "Hands-on aquaculture training and structured farm advisory support to improve production and profitability.",
    image: "/services/training.webp" 
  },
  {
    title: "AquaFarm Digital Record Systems",
    description:
      "Digital farm record management for tracking feed usage, fish growth, costs and overall farm performance.",
    image: "/services/digital-system.webp" 
  }
]

const ServicesSection = () => {
  return (
    <AnimatedSection id="services" className="section services">

      <div className="container">

        <div className="services-header">
          <h2>Our Core Aquaculture Services</h2>
          <p>
            Infrastructure-driven and technology-enabled solutions
            built for Zimbabwean aquaculture success.
          </p>
        </div>

        <div className="services-grid">

          {services.map((service, index) => (
            <motion.div
              key={index}
              className="service-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >

              <div className="service-image">
                <img src={service.image} alt={service.title} width ="400" height="300" loading="lazy" decoding="async" />
              </div>

              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>

            </motion.div>
          ))}

        </div>

      </div>

    </AnimatedSection>
  )
}

export default ServicesSection
