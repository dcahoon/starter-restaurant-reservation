import React from "react";
import { Link } from "react-router-dom";

/**
 * Defines the menu for this application.
 *
 * @returns {JSX.Element}
 */

function Menu() {
	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
			<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
				<span className="navbar-toggler-icon"></span>
			</button>
			<div className="collapse navbar-collapse" id="navbarToggler">
				<ul className="navbar-nav mr-auto mt-2 mt-lg-0">
					<li className="nav-item active">
						<Link className="nav-link" to="/dashboard">
							<span className="oi oi-dashboard" /> Dashboard
						</Link>
					</li>
					<li class="nav-item">
						<Link className="nav-link" to="/search">
							<span className="oi oi-magnifying-glass" /> Search
						</Link>
					</li>
					<li class="nav-item">
						<Link className="nav-link" to="/reservations/new">
							<span className="oi oi-plus" /> New Reservation
						</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="/tables/new">
							<span className="oi oi-layers" /> New Table
						</Link>
					</li>
				</ul>
			</div>
		</nav>
		
	);
}

export default Menu;

/**
 *       <div className="container-fluid d-flex flex-column p-0">
				<Link
					className="navbar-brand d-flex justify-content-center align-items-center sidebar-brand m-0"
					to="/"
				>
					<div className="sidebar-brand-text mx-3">
						<span>Periodic Tables</span>
					</div>
				</Link>
				<hr className="sidebar-divider my-0" />
				<ul className="nav navbar-nav text-light" id="accordionSidebar">
					<li className="nav-item">
						<Link className="nav-link" to="/dashboard">
							<span className="oi oi-dashboard" />
							Dashboard
						</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="/search">
							<span className="oi oi-magnifying-glass" />
							Search
						</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="/reservations/new">
							<span className="oi oi-plus" />
							New Reservation
						</Link>
					</li>
					<li className="nav-item">
						<Link className="nav-link" to="/tables/new">
							<span className="oi oi-layers" />
							New Table
						</Link>
					</li>
				</ul>
				<div className="text-center d-none d-md-inline">
					<button
						className="btn rounded-circle border-0"
						id="sidebarToggle"
						type="button"
					/>
				</div>
			</div>
 */

			/**  <nav className="navbar navbarbg-dark p-0 m-0">
			<Link to="/">
				<div className="sidebar-brand-text">
					<span>Periodic Tables</span>
				</div>
			</Link>
			<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarTogglerDemo01">
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
			</div>
		</nav> */