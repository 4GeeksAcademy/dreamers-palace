import { Link } from "react-router-dom";
import navbarlogo from "../assets/img/Isotipo Color (1).png"

export const Navbar = () => {

	return (
		<nav className="navbar navbar-expand-md glass" data-bs-theme="light">
			<div className="container-fluid">
				<a href="#" className="navbar-brand d-flex align-items-center">
					<img
						src={navbarlogo}
						alt="Logo"
						style={{height: "56px"}}/>
				</a>

				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#mainNav"
					aria-controls="mainNav"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="mainNav">
					<ul className="navbar-nav me-auto mb-2 mb-md-0"></ul>
					<div className="d-flex gap-2">
						<button className="btn btn-primary btn-sm">Languages</button>
						<button className="btn btn-primary btn-sm">Log In</button>
					</div>
				</div>
			</div>
		</nav>
	);
};