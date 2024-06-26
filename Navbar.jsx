import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "./Size.css";

function NavbarComponent() {
	const { project_id } = useParams();
	let navigate = useNavigate();

	const handleLink = (url) => {
		if (project_id === undefined) {
			notify();
		} else {
			navigate(url);
		}
	};

	const notify = () =>
		toast.error("Please select a project first", {
			position: "top-right",
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});

	const [textSize, setTextSize] = useState("normal");

	useEffect(() => {
		const htmlElement = document.documentElement;

		// Remove existing classes
		htmlElement.classList.remove("html-large", "html-small");

		// Add new class based on textSize
		if (textSize === "large") {
			htmlElement.classList.add("html-large");
		} else if (textSize === "small") {
			htmlElement.classList.add("html-small");
		}
	}, [textSize]);

	// Save to local storage whenever textSize changes
	useEffect(() => {
		localStorage.setItem("userTextSizePreference", textSize);
	}, [textSize]);

	// Retrieve from local storage and set the textSize on initial load
	useEffect(() => {
		const userPreference = localStorage.getItem("userTextSizePreference");
		if (userPreference) {
			setTextSize(userPreference);
		}
	}, []);

	return (
		<div className="text-size-controller">
			<Navbar expand="lg" className="bg-body-tertiary">
				<ToastContainer />
				<Container>
					<Navbar.Brand>Wednesday.com</Navbar.Brand>
					<Navbar.Toggle aria-controls="navbarScroll" />
					<Navbar.Collapse id="navbarScroll">
						<Nav
							className="me-auto my-2 my-lg-0"
							style={{ maxHeight: "100px" }}
							navbarScroll
						>
							<Link
								to="/dashboard"
								className="no-underline text-blue-500 hover:underline mr-4"
							>
								Dashboard
							</Link>

							<Link
								to="/projects"
								className="no-underline text-blue-500 hover:underline mr-4"
							>
								Projects
							</Link>

							<p
								className="no-underline text-blue-500 hover:underline mr-4 cursor-pointer"
								onClick={() => handleLink(`/backlogs/${project_id}`)}
							>
								Backlog
							</p>

							<p
								className="no-underline text-blue-500 hover:underline cursor-pointer"
								onClick={() => handleLink(`/sprintview/${project_id}`)}
								id="step-8"
							>
								Sprints View
							</p>

							<p
								className="no-underline text-blue-500 hover:underline cursor-pointer mr-3 mx-3"
								onClick={() => handleLink(`/burndown/${project_id}`)}
							>
								Burndown
							</p>
						</Nav>
						<NavDropdown
							title="Manage Account"
							id="basic-nav-dropdown"
							className="d-flex"
						>
							<NavDropdown.Item href="/">Sign out</NavDropdown.Item>
							<NavDropdown.Item href="/">Change password</NavDropdown.Item>
							<NavDropdown.Item href="/loginadmin">
								Create New User
							</NavDropdown.Item>
						</NavDropdown>
					</Navbar.Collapse>
				</Container>
			</Navbar>
		</div>
	);
}

export default NavbarComponent;
