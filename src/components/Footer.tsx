import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react"
import '../styles/sections/footer.css'

const Footer = () => {

  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">

      <div className="footer-inner">

        <div className="footer-grid">

          {/* ABOUT */}
          <div>
            <h3>FishTech & Consultancy</h3>
            <p>
              Professional aquaculture construction and consultancy
              services across Zimbabwe.
            </p>
          </div>

          {/* SERVICES */}
          <div>
            <h3>Services</h3>
            <p><a href="#services">Pond Construction</a></p>
            <p><a href="#services">Bird Net Installation</a></p>
            <p><a href="#services">Fingerling Supply</a></p>
            <p><a href="#services">Consultancy</a></p>
          </div>

          {/* CONTACT */}
          <div>
            <h3>Contact</h3>
            <p>Harare, Zimbabwe</p>

            <p>
              Phone:{" "}
              <a href="tel:+263780802880">
                +263 78 080 2880
              </a>
            </p>

            <p>
              WhatsApp:{" "}
              <a
                href="https://wa.me/263711626305"
                target="_blank"
                rel="noopener noreferrer"
              >
                0711 626 305
              </a>
            </p>

            <p>
              Email:{" "}
              <a href="mailto:info@fishtech.co.zw">
                info@fishtech.co.zw
              </a>
            </p>

            {/* SOCIAL ICONS */}
            <div className="footer-socials">

              <a
                href="https://www.facebook.com/profile.php?id=61586637987258"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page"
              >
                <Facebook size={18} />
              </a>

              <a
                href="https://www.instagram.com/fishtech_aquaculture/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Instagram page"
              >
                <Instagram size={18} />
              </a>

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our LinkedIn page"
              >
                <Linkedin size={18} />
              </a>

              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our YouTube channel"
              >
                <Youtube size={18} />
              </a>

            </div>
          </div>

        </div>
        <div className="footer-divider"></div>
        {/* BOTTOM */}
        <div className="footer-bottom">
          <p>
            © {currentYear} FishTech & Consultancy. All rights reserved.
          </p>
          <p className="footer-author">
            Daniel Chadambuka
          </p>
        </div>

      </div>

    </footer>
  )
}

export default Footer
