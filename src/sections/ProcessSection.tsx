import "../styles/sections/process.css"

const ProcessSection = () => {
  return (
    <section className="section process">
      <div className="container">

        <div className="process-header">
          <h2>How We Work</h2>
          <p>
            Clear process. Structured execution. Reliable results.
          </p>
        </div>

        <div className="process-grid">

          <div className="process-step">
            <span>01</span>
            <h3>Site Assessment</h3>
            <p>We evaluate land, water source and feasibility.</p>
          </div>

          <div className="process-step">
            <span>02</span>
            <h3>Design & Planning</h3>
            <p>We design pond layout and system structure.</p>
          </div>

          <div className="process-step">
            <span>03</span>
            <h3>Construction</h3>
            <p>Professional pond excavation and installation.</p>
          </div>

          <div className="process-step">
            <span>04</span>
            <h3>Stocking & Support</h3>
            <p>Fingerlings, feed supply and ongoing guidance.</p>
          </div>

        </div>

      </div>
    </section>
  )
}

export default ProcessSection
