import { Container } from "react-bootstrap";
import Navbar from "../components/Navbar";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import Modal from "../components/Modal";
import { ToastContainer, toast } from "react-toastify";

const Backlogs = () => {
	const [show, setShow] = useState(false);

	const [taskFilter, setTaskFilter] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [tagFilter, setTagFilter] = useState("");

	// New state for filtering Sprint tasks
	const [sprintTaskFilter, setSprintTaskFilter] = useState("");
	const [sprintTypeFilter, setSprintTypeFilter] = useState("");
	const [sprintTagFilter, setSprintTagFilter] = useState("");

	const emptyForm = {
		task_name: "",
		task_type: "",
		task_status: "",
		development_stage: "",
		task_description: "",
		task_priority: "",
	};
	// formData
	const [formData, setFormData] = useState(emptyForm);
	const [selectedTask, setSelectedTask] = useState(null);

	const handleClose = () => {
		setFormData(emptyForm);
		setSelectedTask(null);
		setShow(false);
	};

	const handleShow = (taskId = null) => {
		if (Number.isInteger(taskId)) {
			setSelectedTask(taskId);
			setFormData(tasks[taskId]);
		}
		setShow(true);
	};

	// firebase
	const [tasks, setTasks] = useState([
		{
			task_name: "Task 1",
			task_type: "Backlog",
			task_status: "Backlog",
			development_stage: "Backlog",
			task_description: "Backlog",
			task_priority: "Backlog",
		},
		{
			task_name: "Task 2",
			task_type: "Backlog",
			task_status: "Backlog",
			development_stage: "Backlog",
			task_description: "Backlog",
			task_priority: "Backlog",
		},
	]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// check
		if (
			formData.task_name &&
			formData.task_type &&
			formData.task_status &&
			formData.task_description
		) {
			if (selectedTask !== null) {
				// Edit the selected task data
				tasks[selectedTask] = formData;
			} else {
				setTasks([...tasks, formData]);
			}
			// close modal
			handleClose();
		} else {
			notify();
		}
	};

	// Delete a task
	const deleteTask = (formData) => {
		if (tasks.indexOf(formData) !== -1) {
			console.log(formData.task_id);
			setTasks(
				tasks.filter((task) => {
					return tasks.indexOf(task) !== tasks.indexOf(formData);
				})
			);
		}
		handleClose();
	};

	const notify = () =>
		toast.error("Please enter all task details", {
			position: "top-center",
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});

	//New function to handle the button based filtering
	const filterTasks = () => {
		setTasks(
			tasks.filter(
				(task) =>
					(taskFilter ? task.task_name.includes(taskFilter) : true) &&
					(typeFilter ? task.task_type === typeFilter : true) &&
					(tagFilter ? task.tags && task.tags.includes(tagFilter) : true) // Assuming each task has an array of tags
			)
		);
	};

	// Filter function for Sprints
	const filterSprintTasks = () => {
		setTasks(
			tasks.filter(
				(task) =>
					(sprintTaskFilter
						? task.task_name.includes(sprintTaskFilter)
						: true) &&
					(sprintTypeFilter ? task.task_type === sprintTypeFilter : true) &&
					(sprintTagFilter
						? task.tags && task.tags.includes(sprintTagFilter)
						: true) &&
					task.task_type === "Sprint"
			)
		);
	};

	return (
		<>
			<Navbar />
			<ToastContainer />
			<Container>
				{/* <Sidebar /> */}
				<div>
					<h1 className="my-5">Product Backlog</h1>

					<div className="mb-3 d-flex justify-content-between">
						{/* Filter by task name */}
						<div>
							<label>Filter by Task name: </label>
							<input
								type="text"
								value={taskFilter}
								onChange={(e) => setTaskFilter(e.target.value)}
								placeholder="Filter by task name..."
							/>
						</div>
						{/* Filter by task type */}
						<div>
							<label>Filter by task Type: </label>
							<select
								value={typeFilter}
								onChange={(e) => setTypeFilter(e.target.value)}
							>
								<option value="">All types</option>
								{/* You can extend this list based on your task types */}
								<option value="bug">Bug</option>
								<option value="feature">Feature</option>
							</select>
						</div>
						{/* New filter by tags */}
						<div>
							<label>Filter by Tags: </label>
							<input
								type="text"
								value={tagFilter}
								onChange={(e) => setTagFilter(e.target.value)}
								placeholder="Filter by tags..."
							/>
						</div>
					</div>
					<Button
						variant="outline-secondary"
						onClick={filterTasks}
						className="mb-2"
						placeholder="Filter"
					>
						Filter Tasks
					</Button>
					<Table striped bordered hover>
						<thead>
							<tr>
								<th>#</th>
								<th>Task Name</th>
								<th>Task Type</th>
								{/* <th>Task Status</th>
                                <th>Development Stage</th> */}
								<th>Task Description</th>
							</tr>
						</thead>
						<tbody>
							{tasks
								.filter(
									(task) =>
										(taskFilter ? task.task_name.includes(taskFilter) : true) &&
										(typeFilter ? task.task_type === typeFilter : true)
								)
								.map((task, index) => {
									if (task.task_type == "Backlog") {
										return (
											<tr
												key={index}
												onClick={() => {
													handleShow(index);
												}}
											>
												<td>{index}</td>
												<td>{task.task_name}</td>
												<td>{task.task_type}</td>
												{/* <td>{task.task_status}</td>
                                            <td>{task.development_stage}</td> */}
												<td>{task.task_description}</td>
											</tr>
										);
									}
								})}
						</tbody>
					</Table>
					<Button
						variant="outline-primary"
						onClick={handleShow}
						className=" float-right"
					>
						Add Task
					</Button>

					{/* Add Task Modal */}
					<Modal
						show={show}
						handleClose={handleClose}
						handleChange={handleChange}
						handleSubmit={handleSubmit}
						deleteAction={deleteTask}
						formData={formData}
					/>
				</div>
				<div>
					<h1 className="my-5">Sprint Backlog</h1>

					{/* Filters for Sprint Backlog */}
					<div className="mb-3 d-flex justify-content-between">
						{/* Filter by task name */}
						<div>
							<label>Filter by Task name: </label>
							<input
								type="text"
								value={sprintTaskFilter}
								onChange={(e) => setSprintTaskFilter(e.target.value)}
								placeholder="Filter by task name..."
							/>
						</div>

						{/* Filter by task type */}
						<div>
							<label>Filter by task Type: </label>
							<select
								value={sprintTypeFilter}
								onChange={(e) => setSprintTypeFilter(e.target.value)}
							>
								<option value="">All types</option>
								{/* You can extend this list based on your task types */}
								<option value="bug">Bug</option>
								<option value="feature">Feature</option>
							</select>
						</div>

						{/* New filter by tags */}
						<div>
							<label>Filter by Tags: </label>
							<input
								type="text"
								value={sprintTagFilter}
								onChange={(e) => setSprintTagFilter(e.target.value)}
								placeholder="Filter by tags..."
							/>
						</div>
					</div>
					<Button
						variant="outline-secondary"
						onClick={filterSprintTasks}
						className="mb-2"
						placeholder="Filter"
					>
						Filter Tasks
					</Button>

					<Table striped bordered hover>
						<thead>
							<tr>
								<th>#</th>
								<th>Task Name</th>
								<th>Task Type</th>
								{/* <th>Task Status</th>
                                <th>Development Stage</th> */}
								<th>Task Description</th>
							</tr>
						</thead>
						<tbody>
							{tasks.map((task, index) => {
								if (task.task_type == "Sprint") {
									return (
										<tr
											key={index}
											onClick={() => {
												handleShow(index);
											}}
										>
											<td>{index}</td>
											<td>{task.task_name}</td>
											<td>{task.task_type}</td>
											{/* <td>{task.task_status}</td>
                                            <td>{task.development_stage}</td> */}
											<td>{task.task_description}</td>
										</tr>
									);
								}
							})}
						</tbody>
					</Table>
					{/* Add Task Modal */}
					<Modal
						show={show}
						handleClose={handleClose}
						handleChange={handleChange}
						handleSubmit={handleSubmit}
						deleteAction={deleteTask}
						formData={formData}
					/>
				</div>
			</Container>
		</>
	);
};
export default Backlogs;
