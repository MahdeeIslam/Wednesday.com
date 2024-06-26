import React, { useEffect, useState } from "react";
import NavbarComponent from "../components/Navbar";
import { getProjects } from "../backend/database";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import { FadeLoader } from "react-spinners";
import ProjectModal from "../components/ProjectModal";
import { ToastContainer, toast } from "react-toastify";
import {
	addDocsToProjects,
	editProjectDocData,
	deleteProjectDoc,
} from "../backend/database";
import Joyride from "react-joyride";

const Projects = () => {
	const [user, setUser] = useState("");
	const [accessLevel, setAcessLevel] = useState(null);
	useEffect(() => {
		const userData = JSON.parse(localStorage.getItem("userData"));
		setUser(userData["username"]);
		setAcessLevel(userData["level"]);
	}, []);

	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [show, setShow] = useState(false);

	const emptyForm = {
		project_name: "",
	};

	const [formData, setFormData] = useState(emptyForm);
	const [selectedProject, setSelectedProject] = useState(null);
	const [hasChanged, setHasChanged] = useState(false);

	const handleClose = () => {
		setFormData(emptyForm);
		setSelectedProject(null);
		setShow(false);
	};

	const handleShow = (taskId = null) => {
		setShow(true);
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (formData.project_name) {
			if (selectedProject !== null) {
				editTaskDocData(selectedProject, formData);

				setHasChanged(!hasChanged);
			} else {
				addDocsToProjects(formData);
				setHasChanged(!hasChanged);
			}
			// close modal
			handleClose();
		} else {
			notify();
		}
	};

	// Delete a task
	const deleteTask = (id) => {
		deleteProjectDoc(id);

		handleClose();
		setHasChanged(!hasChanged);
	};

	const notify = () =>
		toast.error("Please enter all required project details", {
			position: "top-center",
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});

	useEffect(() => {
		async function fetchProjects() {
			try {
				const result = await getProjects();
				setProjects(result);
				setLoading(false);
			} catch (e) {
				console.log("Failed fetching projects", e);
				setLoading(false);
			}
		}

		fetchProjects();
	}, [hasChanged]);

	const override = {
		display: "block",
		margin: "0 auto",
		borderColor: "red",
	};

	const tourSteps = [
		{
			content: <h2>Let's begin our journey!</h2>,
			locale: { skip: <strong>SKIP</strong> },
			placement: "center",
			target: "body",
		},
		{
			content: <h2>Click here to add projects</h2>,
			placement: "bottom",
			target: "#step-1",
			title: "First step",
		},
		{
			content: <h2>Click here to view projects</h2>,
			placement: "bottom",
			target: "#step-2",
			title: "Second step",
		},
		{
			content: <h2>Enjoy</h2>,
			placement: "center",
			target: "body",
		},
	];

	const [run, setRun] = useState(false);

	if (loading) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<FadeLoader
					color="blue"
					loading={loading}
					cssOverride={override}
					size={150}
					aria-label="Loading Spinner"
					data-testid="loader"
				/>
			</div>
		);
	}

	return (
		<>
			<NavbarComponent />
			<ToastContainer />

			<Joyride
				steps={tourSteps}
				run={run}
				continuous={true}
				showSkipButton={true}
				callback={({ status }) => {
					if (status === "finished" || status === "skipped") {
						setRun(false); // Stop the tour when it's finished or skipped
					}
				}}
			/>

			<ProjectModal
				show={show}
				handleClose={handleClose}
				handleChange={handleChange}
				handleSubmit={handleSubmit}
				deleteAction={deleteTask}
				formData={formData}
			/>

			<Container>
				<div className="my-10 flex justify-between">
					<p className="my-1">Projects List</p>
					<div className="flex gap-4">
						<p
							className="border-2 border-red-500 rounded-lg px-3 py-1 cursor-pointer"
							onClick={() => {
								setRun(true);
							}}
						>
							Guide
						</p>
						<p
							className="border-2 border-blue-500 rounded-lg px-3 py-1 cursor-pointer"
							onClick={() => {
								handleShow();
							}}
							id="step-1"
						>
							Add Project
						</p>
					</div>
				</div>
				<div className="grid grid-cols-3 gap-4">
					{projects.map((project, index) => {
						const bool = project.members?.includes(user);
						// console.log(bool);
						// project.members.includes(user)
						// project.members.includes(user) || accessLevel === 0
						// bool || accessLevel === 0
						if (bool || accessLevel === 0) {
							return (
								<div
									key={index}
									className=" border shadow-md flex flex-col items-center justify-center"
									id="step-2"
								>
									<p className="mt-4">{project.project_name}</p>
									<Link
										to={`/backlogs/${project.id}`}
										className="text-white bg-blue-500 px-4 py-1 rounded-lg mt-3 mb-4"
									>
										View Project
									</Link>

									{/* <p
										className="text-white bg-blue-500 px-4 py-1 rounded-lg mt-3 mb-4"
										onClick={() => deleteTask(project.id)}
									>
										Delete Project
									</p> */}
								</div>
							);
						}
					})}
				</div>
			</Container>
		</>
	);
};

export default Projects;
