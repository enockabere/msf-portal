import "./Notifications.css";

export default function Notifications() {
  return (
    <li className="dropdown topbar-item">
      <a
        className="nav-link dropdown-toggle arrow-none nav-icon"
        data-bs-toggle="dropdown"
        href="#"
        role="button"
        aria-haspopup="false"
        aria-expanded="false"
      >
        <i className="icofont-bell-alt"></i>
        <span className="alert-dot blink"></span>
      </a>
      <div className="dropdown-menu stop dropdown-menu-end dropdown-lg py-0">
        {/* You can add the full dropdown content here */}
      </div>
    </li>
  );
}
