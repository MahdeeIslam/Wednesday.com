import { Container } from "react-bootstrap";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import Modal from "../components/Modal";
import { ToastContainer, toast } from "react-toastify";

const Home = () => {
	const [show, setShow] = useState(false);

	const emptyForm = {
		task_name: "",
		task_type: "",
		task_description: "",
	}
	// formData
	const [formData, setFormData] = useState(emptyForm);
	const [selectedTask, setSelectedTask] = useState(null)

	const handleClose = () => {
		setFormData(emptyForm);
		setShow(false);
	};

	const handleShow = (taskId = null) => {
		if (Number.isInteger(taskId)) {
			setSelectedTask(taskId)
			setFormData(tasks[taskId]);
		}
		setShow(true);
	};

	// firebase
	const [tasks, setTasks] = useState([]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// check
		if (formData.task_name && formData.task_type && formData.task_description) {
			if (selectedTask !== null) {
				console.log(selectedTask);
				tasks[selectedTask] = formData;
				setSelectedTask(null)
			} else {
				setTasks([...tasks, formData]);
			}

			if (formData.task_name && formData.task_description) {
				// set tasks
				setTasks([...tasks, formData]);

				// clear form data
				setFormData({ task_name: "", task_type: "", task_description: "" });

				// close modal
				handleClose();
			} else {
				notify();
			}
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

		return (
			<>
				<Navbar />
				<ToastContainer />
				<Container>
					{/* <Sidebar /> */}
					<div>
						<h1 className="my-5">Product Backlog</h1>
						<Table striped bordered hover>
							<thead>
								<tr>
									<th>#</th>
									<th>Task Name</th>
									<th>Task Type</th>
									<th>Task Description</th>
								</tr>
							</thead>
							<tbody>
								{tasks.map((task, index) => {
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
											<td>{task.task_description}</td>
										</tr>
									);
								})}
							</tbody>
						</Table>
						<Button
							variant="outline-primary"
							onClick={handleShow}
							className=" float-right"
						>
							Add Product Backlog
						</Button>

						{/* Add Task Modal */}
						<Modal
							show={show}
							handleClose={handleClose}
							handleChange={handleChange}
							handleSubmit={handleSubmit}
							formData={formData}
						/>
					</div>
				</Container>
			</>
		);
	};
}
export default Home;
