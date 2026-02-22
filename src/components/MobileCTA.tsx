import "../styles/sections/mobile-cta.css"

const MobileCTA = () => {
  const whatsappNumber = "263711626305"

  const handleClick = () => {
    const message = "Hello FishTech, I would like to request a quotation."
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    )
  }

  return (
    <div className="mobile-cta-bar">
      <button onClick={handleClick}>
        Request Quote on WhatsApp
      </button>
    </div>
  )
}

export default MobileCTA
