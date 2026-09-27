import "./index.css"

{/*ResourceCard is a reusable component that renders resource cards on the Dashboard. It takes in title, acailability, total, link and handleDropDown as props to ensure that each Resource card is unique */}
export default function ResourceCard({ title, availability, total, link, handleDropDown}) {

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

            <button className="book-button" onClick={handleDropDown}>
              Book Now
            </button>

          </div>
        </div>
    )
}