import { motion } from "framer-motion"
import AnimatedSection from "../components/AnimatedSection"
import "../styles/sections/projects.css"
import { useNavigate } from "react-router-dom"
import CountUp from "react-countup"

const projects = [
  {
    slug: "pond-construction-nyatsime",
    title: "Pond Construction, Bird Net Installation — Nyatsime",
    description: "Pond excavation, pond lining and bird net installation",
    image: "/projects/pond-construction-nyatsime-1.webp"
  },
  {
    slug: "pond-construction-harare",
    title: "Pond Construction — Harare",
    description: "Pond excavation, lining and bird net installation",
    image: "/projects/pond-construction-harare-1.webp"
  },
  {
    slug: "pond-construction-bulawayo-douglasdale",
    title: "Pond Construction — Bulawayo, Douglasdale",
    description:
      "Earthen ponds construction, dam liner installation and bird net installation",
    image: "/projects/pond-construction-bulawayo-douglasdale.webp"
  }
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 80,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
}

const ProjectsSection = () => {
  const navigate = useNavigate()

  return (
    <AnimatedSection id="projects" className="section projects">
      <div className="container">

        {/* STATS */}
        <div className="project-stats">
          <div>
            <h3>
              <CountUp end={25} duration={2.5} enableScrollSpy scrollSpyOnce />
              +
            </h3>
            <p>Projects Completed</p>
          </div>

          <div>
            <h3>
              <CountUp end={10} duration={2.5} enableScrollSpy scrollSpyOnce />
              +
            </h3>
            <p>Districts Covered</p>
          </div>

          <div>
            <h3>
              <CountUp end={5} duration={2.5} enableScrollSpy scrollSpyOnce />
              +
            </h3>
            <p>Years Experience</p>
          </div>
        </div>

        {/* HEADER */}
        <div className="projects-header">
          <h2>Our Recent Projects</h2>
          <p>
            Real aquaculture execution across Zimbabwe.
            Built professionally. Delivered properly.
          </p>
        </div>

        {/* PROJECT GRID WITH STAGGER */}
        <motion.div
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.25 }}
        >
          {projects.map((project) => (
            <motion.div
              key={project.slug}
              className="project-card"
              variants={cardVariants}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
              }}
              onClick={() => navigate(`/projects/${project.slug}`)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={project.image}
                alt={project.title}
                width="800"
                height="500"
                loading="lazy"
                decoding="async"
              />

              <div className="project-overlay">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="projects-cta">
          <button onClick={() => navigate("/projects")}>
            View All Projects
          </button>
        </div>

      </div>
    </AnimatedSection>
  )
}

export default ProjectsSection