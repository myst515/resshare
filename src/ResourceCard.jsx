import "./index.css"

export default function ResourceCard({ title, availability, total, link }) {

    return (
        <div className="resource-card">

          <img
            src={link}
            alt={title}
            className="resource-image"
          />

          <div className="resource-content">

            <div className="resource-header">

              <div className="resource-name">
                <h3>{title}</h3>
                <span className="available">{availability}/{total} Available</span>
              </div>
            </div>

            <button className="book-button">
              Book Now
            </button>

          </div>
        </div>
    )
}