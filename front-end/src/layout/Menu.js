import React from "react";
import { Link } from "react-router-dom";

/**
 * @returns {JSX.Element}
 */
function Menu() {
	return (
		<nav className="navbar navbar-dark bg-dark p-0 m-0">
		<Link to="/">
			<div className="sidebar-brand-text">
				<span>Periodic Tables</span>
			</div>
		</Link>
		<Link className="nav-link" to="/dashboard">
			<span className="oi oi-dashboard" />
			Dashboard
		</Link>
		<Link className="nav-link" to="/search">
			<span className="oi oi-magnifying-glass" />
			Search
		</Link>
		<Link className="nav-link" to="/reservations/new">
			<span className="oi oi-plus" />
			New Reservation
		</Link>
		<Link className="nav-link" to="/tables/new">
			<span className="oi oi-layers" />
			New Table
		</Link>
	</nav>
		
	);
}

export default Menu;