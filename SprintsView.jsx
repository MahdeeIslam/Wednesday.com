import React, { useEffect, useState } from "react";
import NavbarComponent from "../components/Navbar";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Container, Button, DropdownButton } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { ToastContainer, toast } from "react-toastify";
import SprintModalComponent from "../components/SprintModal";
import {
	getDocsFromTasks,
	addDocsToTasks,
	editTaskDocData,
	addDocsToLoggedTimeData,
} from "../backend/database";
import { useParams } from "react-router-dom";


const SprintsView = () => {
	const { project_id } = useParams();
	const [sprintInfo, setSprintInfo] = useState(null);
	const [tasks, setTasks] = useState([]);
	const [hasChanged, setHasChanged] = useState(false);
	const [dateCompleted , setDateCompleted] = useState(null);

	const [user, setUser] = useState("");
	const [accessLevel, setAcessLevel] = useState(null);
	useEffect(() => {
		const userData = JSON.parse(localStorage.getItem("userData"));
		setUser(userData["username"]);
		setAcessLevel(userData["level"]);
	}, []);

	useEffect(() => {
		getDocsFromTasks(project_id)
			.then((arr) => {
				const array = [];
				arr.forEach((task) => {
					if (task.task_type === "Active Sprint") {
						array.push(task);
					}
				});
				setTasks(array);
			})
			.catch((e) => {
				console.log("Failed to fetch tasks", e);
			});

		const data = JSON.parse(localStorage.getItem("data"));
		setSprintInfo(data);
	}, [hasChanged]);

	const itemsFromBackend = [
		{ id: "1", content: "First task", status: "Todo" },
		{ id: "2", content: "Second task", status: "Todo" },
		{ id: "3", content: "Third task", status: "Assigned" },
		{ id: "4", content: "Fourth task", status: "In Progress" },
		{ id: "5", content: "Fifth task", status: "Done" },
	];

	const columnsFromTasks = {
		"To-do": {
			name: "To-do",
			items: tasks.filter((item) => item.task_status === "To-do"),
		},
		Assigned: {
			name: "Assigned",
			items: tasks.filter((item) => item.task_status === "Assigned"),
		},
		"In Progress": {
			name: "In Progress",
			items: tasks.filter((item) => item.task_status === "In Progress"),
		},
		Done: {
			name: "Done",
			items: tasks.filter((item) => item.task_status === "Done"),
		},
	};

	const [columns, setColumns] = useState(columnsFromTasks);

	const onDragEnd = (result, columns, setColumns) => {
		if (!result.destination) return;

		const { source, destination } = result;
		const sourceColumn = columns[source.droppableId];
		const destColumn = columns[destination.droppableId];

		const updatedColumns = { ...columns };
		const movedTask = sourceColumn.items[source.index];

		// Moving items between columns
		if (source.droppableId !== destination.droppableId) {
			const updatedMovedTask = {
				...movedTask,
				task_status: destination.droppableId,
			};

			editTaskDocData(movedTask.id, updatedMovedTask);

			const updatedSourceItems = [...sourceColumn.items];
			updatedSourceItems.splice(source.index, 1);
			const updatedDestItems = [...destColumn.items];
			updatedDestItems.splice(destination.index, 0, updatedMovedTask);

			updatedColumns[source.droppableId] = {
				...sourceColumn,
				items: updatedSourceItems,
			};
			updatedColumns[destination.droppableId] = {
				...destColumn,
				items: updatedDestItems,
			};

			// update tasks array -> this might not be needed for firebase
			const updatedTasks = tasks.map((task) => {
				if (task.id === movedTask.id) {
					return updatedMovedTask;
				}
				return task;
			});

			setTasks(updatedTasks);
		}
		// Rearranging within the same column
		else {
			const copiedItems = [...sourceColumn.items];
			const [removed] = copiedItems.splice(source.index, 1);
			copiedItems.splice(destination.index, 0, removed);
			updatedColumns[source.droppableId] = {
				...sourceColumn,
				items: copiedItems,
			};
		}

		setColumns(updatedColumns);
	};

	// *******   Task Related Variables & Functions  ********

	const [show, setShow] = useState(false);

	const emptyForm = {
		task_name: "",
		task_type: "Active Sprint",
		task_status: "",
		development_stage: "",
		task_description: "",
		task_priority: "",
		tags: {
			UI_UX: false,
			Security: false,
			Backend: false,
		},
		story_points: 0,
		project_id: project_id,
		date_complete: "",
		user_time_logged: []
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
		if (typeof taskId === "string") {
			const currTask = tasks.find((task) => task.id === taskId);

			if (currTask) {
				setSelectedTask(taskId);
				setFormData(currTask);
			}
		}
		setShow(true);
	};

	const handleChange = (e) => {
		if (e.target.type == "checkbox") {
			setFormData({
				...formData,
				tags: { ...formData.tags, [e.target.name]: e.target.checked },
			});
			console.log(formData.tags);
		} else {
			setFormData({
				...formData,
				[e.target.name]: e.target.value,
			});
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// check
		if (
			formData.task_name &&
			formData.task_type &&
			formData.task_status &&
			formData.task_description &&
			(!formData.tags || Object.values(formData.tags).some((x) => x)) &&
			(formData.story_points !== undefined || formData.story_points > 0) &&
			(!formData.date_completed || formData.task_status == "Done")
			// TODO: VALIDATE
		) {
			if (selectedTask !== null) {
				// Edit the selected task data
				const updatedTasks = [...tasks];
				const taskIndex = updatedTasks.findIndex(
					(task) => task.id === selectedTask
				);
				if (taskIndex !== -1) {
					// Update the selected task with the new form data
					updatedTasks[taskIndex] = formData;
					// Set the updated tasks array to the state
					setTasks(updatedTasks);

					editTaskDocData(selectedTask, formData);
				}
			} else {
				setTasks([...tasks, formData]);
				addDocsToTasks(formData);
				setHasChanged(!hasChanged);
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

	useEffect(() => {
		// Update columns based whenever tasks state changes
		const updatedColumns = {
			"To-do": {
				name: "To-do",
				items: tasks.filter((item) => item.task_status === "To-do"),
			},
			Assigned: {
				name: "Assigned",
				items: tasks.filter((item) => item.task_status === "Assigned"),
			},
			"In Progress": {
				name: "In Progress",
				items: tasks.filter((item) => item.task_status === "In Progress"),
			},
			Done: {
				name: "Done",
				items: tasks.filter((item) => item.task_status === "Done"),
			},
		};
		setColumns(updatedColumns);
	}, [tasks]);

	const [viewMode, setViewMode] = useState("kanban");

	const formatDate = (dateStr) => {
		const dateObj = new Date(dateStr);
		return `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
	}

	const [logData, setLogData] = useState({
		time_logged: 0,
		date: "",
		user_id: "",
		task_id: ""
	})

	const handleLogChange = (e) => {
		setLogData(
			{
				...logData,
				[e.target.name]: e.target.value
			}
		)
	}

	const notifyLogs = () =>
		toast.error("Please enter all log details", {
			position: "top-center",
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});


	const submitTimeLog = () => {
		if (
			logData.date &&
			logData.time_logged > 0 &&
			logData.task_id
		) {
			addDocsToLoggedTimeData({...logData, "user_id":user})
		} else {
			notifyLogs()
		}
	}

	return (
		<div>
			<div className="h-screen w-full">
				<NavbarComponent />
				<ToastContainer />

				{/* Add Task Modal */}
				<SprintModalComponent
					show={show}
					handleClose={handleClose}
					handleChange={handleChange}
					handleSubmit={handleSubmit}
					deleteAction={deleteTask}
					formData={formData}
				/>

				<Container>
					<div className="mt-4">
						<label className="relative inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								value=""
								className="sr-only peer"
								onClick={() => {
									if (viewMode === "kanban") {
										setViewMode("list");
									}
									if (viewMode === "list") {
										setViewMode("kanban");
									}
								}}
							/>
							<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
							<span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
								{viewMode === "kanban" ? <p>Kanban View</p> : <p>List View</p>}
							</span>
						</label>

						<Button
							variant="outline-primary"
							onClick={handleShow}
							className=" float-right"
						>
							Add Task
						</Button>


						<DropdownButton
						variant="outline-primary"
						id="dropdown-basic"
						className="float-right mx-2"
						drop="start"
						title={"Log Time"}
						>
							<div className="m-3 w-96">
								<Form.Group as={Row} className="mb-3">
									<Form.Label column sm="4">
										Date logged
									</Form.Label>
									<Col sm="8">
										<Form.Control
											onChange={handleLogChange}
											value={logData.date}
											name="date"
											type="date"
											min={sprintInfo && sprintInfo.startDate}
											max={sprintInfo && sprintInfo.endDate}
										>
										</Form.Control>
									</Col>
								</Form.Group>
								<Form.Group as={Row} className="mb-3">
									<Form.Label column sm="4">
										Time Spent
									</Form.Label>
									<Col sm="8">
										<Form.Control
											onChange={handleLogChange}
											value={logData.time_logged}
											name="time_logged"
											type="number"
											min={0}
										>

										</Form.Control>
									</Col>
								</Form.Group>
								<Form.Group as={Row} className="mb-3">
								<Form.Label column sm="4">
									Task worked on
								</Form.Label>
								<Col sm="8">
									<Form.Select
										onChange={handleLogChange}
										value={logData.task_id}
										name="task_id"
									>
										<option>Any</option>
										{tasks.map((task, i) => {
											return <option key={i} value={task.id}>{task.task_name}</option>
										})}
									</Form.Select>
								</Col>
							</Form.Group>
								<Button
									variant="outline-primary"
									onClick={submitTimeLog}
									className=" mx-3 float-right"
								>
									Save Log
								</Button>
							</div>
						</DropdownButton>
					</div>

					{/* Sprint Info */}
					<div className="mb-5">
						<p className="text-2xl mt-4 mb-2">
							Sprint Name: {sprintInfo && sprintInfo.name}
						</p>
						<p>Sprint Goal: {sprintInfo && sprintInfo.goal}</p>
						<div className="flex gap-16">
							<p>
								Duration: {sprintInfo && sprintInfo.startDate} -{" "}
								{sprintInfo && sprintInfo.endDate}
							</p>
							<p className="">
								Status:{" "}
								<span className=" bg-blue-300 px-4 py-2 ml-2">Running</span>
							</p>
						</div>
					</div>

					<div>
						{viewMode === "list" ? (
							// List View
							<DragDropContext
								onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
							>
								{Object.entries(columns).map(([columnId, column]) => {
									return (
										<div key={columnId}>
											<h2 className="my-4 text-2xl">{column.name}</h2>
											<div className="grid grid-cols-4 py-2 px-3 font-bold">
												<p>#</p>
												<p>Task Name</p>
												<p>Task Type</p>
												<p>Task Description</p>
												<p>Date Completed</p>
											</div>
											<Droppable droppableId={columnId} key={columnId}>
												{(provided, snapshot) => {
													return (
														<div
															{...provided.droppableProps}
															ref={provided.innerRef}
															className={` ${
																snapshot.isDraggingOver
																	? " bg-slate-100"
																	: " bg-white"
															}`}
														>
															{column.items.length === 0 &&
																!snapshot.isDraggingOver && (
																	<div className="py-2 text-center border-solid border-1 border-slate-400">
																		<p>No tasks to display in this category</p>
																	</div>
																)}
															{column.items.length > 0 &&
																column.items.map((item, index) => {
																	return (
																		<Draggable
																			key={item.id}
																			draggableId={item.id}
																			index={index}
																		>
																			{(provided, snapshot) => {
																				let backgroundClass = "";

																				if (item.task_priority === "low") {
																					backgroundClass = "bg-green-200";
																				}
																				if (item.task_priority === "medium") {
																					backgroundClass = "bg-yellow-200";
																				}
																				if (item.task_priority === "high") {
																					backgroundClass = " bg-red-200";
																				}

																				return (
																					<div
																						className={`py-2 px-3 border-solid border-1 border-slate-400 grid grid-cols-4${
																							snapshot.isDragging
																								? " bg-slate-300"
																								: ""
																						} ${backgroundClass}`}
																						ref={provided.innerRef}
																						{...provided.draggableProps}
																						{...provided.dragHandleProps}
																						onClick={() => {
																							handleShow(item.id);
																						}}
																					>
																						{/* Each Task Goes Here */}
																						<p>{item.id}</p>
																						<p>{item.task_name}</p>
																						<p>{item.task_type}</p>
																						<p>{item.task_description}</p>
																						<p>{formatDate(item.dateCompleted)}</p>
																					</div>
																				);
																			}}
																		</Draggable>
																	);
																})}
															{provided.placeholder}
														</div>
													);
												}}
											</Droppable>
										</div>
									);
								})}
							</DragDropContext>
						) : (
							// Kanban View
							<div className="grid grid-cols-4 gap-4">
								<DragDropContext
									onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
								>
									{Object.entries(columns).map(([columnId, column]) => {
										return (
											<div key={columnId}>
												<h2 className="my-4 text-2xl">{column.name}</h2>
												<div className="grid grid-cols-2 py-2 px-3 font-bold">
													<p>Task Name</p>
													<p>Description</p>
												</div>
												<Droppable droppableId={columnId} key={columnId}>
													{(provided, snapshot) => {
														return (
															<div
																{...provided.droppableProps}
																ref={provided.innerRef}
																className={` ${
																	snapshot.isDraggingOver
																		? " bg-slate-100"
																		: " bg-white"
																}`}
															>
																{column.items.length === 0 &&
																	!snapshot.isDraggingOver && (
																		<div className="py-2 text-center border-solid border-1 border-slate-400">
																			<p>
																				No tasks to display in this category
																			</p>
																		</div>
																	)}
																{column.items.length > 0 &&
																	column.items.map((item, index) => {
																		return (
																			<Draggable
																				key={item.id}
																				draggableId={item.id}
																				index={index}
																			>
																				{(provided, snapshot) => {
																					let backgroundClass = "";

																					if (item.task_priority === "low") {
																						backgroundClass = "bg-green-200";
																					}
																					if (item.task_priority === "medium") {
																						backgroundClass = "bg-yellow-200";
																					}
																					if (item.task_priority === "high") {
																						backgroundClass = " bg-red-200";
																					}

																					return (
																						<div
																							className={`py-2 px-3 border-solid border-1 border-slate-400 grid grid-cols-2${
																								snapshot.isDragging
																									? " bg-slate-300"
																									: ""
																							} ${backgroundClass}`}
																							ref={provided.innerRef}
																							{...provided.draggableProps}
																							{...provided.dragHandleProps}
																							onClick={() => {
																								handleShow(item.id);
																							}}
																						>
																							{/* Each Task Goes Here */}
																							<p>{item.task_name}</p>
																							<small>{item.date_completed}</small>
																							<p>{item.task_description}</p>
																						</div>
																					);
																				}}
																			</Draggable>
																		);
																	})}
																{provided.placeholder}
															</div>
														);
													}}
												</Droppable>
											</div>
										);
									})}
								</DragDropContext>
							</div>
						)}
					</div>
				</Container>
			</div>
		</div>
	);
};

export default SprintsView;
