import { useParams } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

import "../styles/sections/projects.css"

const projects = [
  {
    slug: "pond-construction-nyatsime",
    title: "Pond Construction — Nyatsime",
    description:
      "Commercial pond excavation and lining for sustainable fish farming operations.",
    images: [
      "/projects/pond-construction-nyatsime-1.webp",
      "/projects/pond-construction-nyatsime-2.webp",
      "/projects/pond-construction-nyatsime-3.webp"
    ]
  },
  {
    slug: "pond-construction-harare",
    title: "Pond Construction — Harare",
    description:
      "Commercial pond excavation and lining for sustainable fish farming operations.",
    images: [
      "/projects/pond-construction-harare-1.webp",
      "/projects/pond-construction-harare-2.webp",
        "/projects/pond-construction-harare-3.webp"
    ]
  },
  {
    slug: "pond-construction-bulawayo-douglasdale",
    title: "Pond Construction — Bulawayo, Douglasdale",
    description:
      "Earthen ponds construction, dam liner installation and full bird net system.",
    images: [
      "/projects/pond-construction-bulawayo-douglasdale-1.webp",
      "/projects/pond-construction-bulawayo-douglasdale-2.webp",
        "/projects/pond-construction-bulawayo-douglasdale-3.webp"
    ]
  }
]

const ProjectDetailPage = () => {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)

  if (!project) {
    return (
      <section className="section">
        <div className="container">
          <h2>Project Not Found</h2>
        </div>
      </section>
    )
  }

  const whatsappNumber = "2637711626305"

  const handleWhatsApp = () => {
    const message = `Hello FishTech, I am interested in a project similar to: ${project.title}`
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    )
  }

  return (
    <section className="section project-detail">
      <div className="container">

        <div className="project-detail-header">
          <h1>{project.title}</h1>
          <p className="project-subtitle">{project.description}</p>
        </div>

                <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
                delay: 4000,
                disableOnInteraction: false
            }}
            loop={true}
            speed={900}                 // 🔥 smoother transition speed
            spaceBetween={30}
            slidesPerView={1}
            grabCursor={true}           // 🔥 feels smoother on drag
            className="project-swiper"
            >

          {project.images.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={img}
                alt={project.title}
                className="project-detail-image"
                width="1200"
                height="800"
                loading="lazy"
                decoding="async"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="project-cta">
          <button onClick={handleWhatsApp}>
            Request Similar Project
          </button>
        </div>

      </div>
    </section>
  )
}

export default ProjectDetailPage
