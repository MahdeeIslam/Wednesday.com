import {
	addDocsToTasks,
	getDocsFromTasks,
	editTaskDocData,
	deleteTaskDoc,
	getSprintBacklog,
	addSprint,
	getSprints,
	sprintActivate,
	getProjectFromId,
	editProjectDocData,
} from "../backend/database.js";
import React, { useEffect, useState } from "react";
import NavbarComponent from "../components/Navbar";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Container, Button, DropdownButton } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import SprintCreator from "../components/CreateSprintForm";
import Modal from "../components/Modal";
import MemberModal from "../components/MemberModal";
import { FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader.js";
import { useParams } from "react-router-dom";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Joyride from "react-joyride";
import Dropdown from "react-bootstrap/Dropdown";

const SprintsView = () => {
	const { project_id } = useParams();

	const [project, setProject] = useState(null);

	const [user, setUser] = useState("");
	const [accessLevel, setAcessLevel] = useState(null);
	useEffect(() => {
		const userData = JSON.parse(localStorage.getItem("userData"));
		setUser(userData["username"]);
		setAcessLevel(userData["level"]);
	}, []);

	const [tasks, setTasks] = useState([]);
	const navigate = useNavigate();

	// Loading
	const [loading, setLoading] = useState(false);

	const columnsFromTasks = {
		Backlog: {
			name: "Product Backlog",
			items: tasks.filter((item) => item.task_type === "Backlog"),
		},
		Sprint: {
			name: "Sprint Backlog",
			items: tasks.filter((item) => item.task_type === "Sprint Backlog"),
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
				task_type: destination.droppableId, // Update task_type to the new table type
			};

			editTaskDocData(movedTask.id, updatedMovedTask);

			// Update task_type of the moved task
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
				s: updatedDestItems,
			};
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

	// *******   Team Member Related Variables & Functions  ********
	const [members, setMembers] = useState([]);
	const [showMember, setShowMember] = useState(false);

	const emptyFormMember = {
		member_added: "",
	};

	const [formDataMember, setFormDataMember] = useState(emptyFormMember);
	const [selectedMember, setSelectedMember] = useState(null);
	const [hasChangedMember, setHasChangedMember] = useState(false);

	const handleCloseMember = () => {
		setFormDataMember(emptyFormMember);
		setSelectedMember(null);
		setShowMember(false);
	};

	const handleShowMember = (taskId = null) => {
		setShowMember(true);
	};

	const handleChangeMember = (e) => {
		setFormDataMember({
			...formDataMember,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmitMember = (e) => {
		e.preventDefault();

		const newMemberName = formDataMember.member_name;
		if (newMemberName) {
			console.log(project);
			if (project.members.includes(newMemberName)) {
				notifyMemberAlreadyAdded();
			} else {
				const updatedMembers = [...project.members, newMemberName];
				editProjectDocData(project_id, { members: updatedMembers })
					.then(() => {
						setProject({ ...project, members: updatedMembers });
						handleCloseMember();
					})
					.catch((error) => {
						console.error("Error editing project data: ", error);
					});
			}
		} else {
			notify();
		}
	};

	const handleRemoveMember = (e) => {
		e.preventDefault();

		// Check if the member to be removed is in the project's members array
		const memberNameToRemove = formDataMember.member_name;
		if (memberNameToRemove) {
			if (project.members.includes(memberNameToRemove)) {
				const updatedMembers = project.members.filter(
					(member) => member !== memberNameToRemove
				);
				console.log(updatedMembers);
				editProjectDocData(project_id, { members: updatedMembers })
					.then(() => {
						setProject({ ...project, members: updatedMembers });
						handleCloseMember();
					})
					.catch((error) => {
						console.error("Error editing project data: ", error);
					});
			} else {
				notifyMemberNotAdded();
			}
		} else {
			notify();
		}
	};

	// *******   Task Related Variables & Functions  ********

	const [show, setShow] = useState(false);

	const emptyForm = {
		task_name: "",
		task_type: "",
		member_assigned: "",
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
		estimated_duration: "",
	};
	// formData
	const [formData, setFormData] = useState(emptyForm);
	const [selectedTask, setSelectedTask] = useState(null);
	const [hasChanged, setHasChanged] = useState(false);

	// NFR colour blindness
	const [colorScheme, setColorScheme] = useState("default"); // 'default' or 'colorBlindFriendly'

	const colorSchemes = {
		default: {
			backgroundColorLow: "bg-green-200",
			backgroundColorMedium: "bg-yellow-200",
			backgroundColorHigh: "bg-red-200",
			backgroundColorLow: "bg-green-200",
			backgroundColorMedium: "bg-yellow-200",
			backgroundColorHigh: "bg-red-200",
		},
		colorBlindFriendly: {
			backgroundColorLow: "bg-orange-200",
			backgroundColorMedium: "bg-cyan-200",
			backgroundColorHigh: "bg-purple-200",
			backgroundColorLow: "bg-orange-200",
			backgroundColorMedium: "bg-cyan-200",
			backgroundColorHigh: "bg-purple-200",
		},
	};
	// NFR TEXT SIZE

	let textSizes = ["small", "normal", "large"];
	let textSizesIndex = 0;

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

	// Add a function to toggle the color scheme
	const toggleColorScheme = () => {
		setColorScheme((currentScheme) =>
			currentScheme === "default" ? "colorBlindFriendly" : "default"
		);
	};

	// Define a function to get the styles based on the color scheme
	const getColorSchemeStyles = (scheme) => {
		return colorSchemes[scheme];
	};

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
			// console.log(formData.tags);
		} else {
			setFormData({
				...formData,
				[e.target.name]: e.target.value,
			});
			// console.log(e.target.name , e.target.value);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Validation checks
		const hasValidTaskName = formData.task_name;
		const hasValidTaskType = formData.task_type;
		const hasValidTaskStatus = formData.task_status;
		const hasValidTaskDescription = formData.task_description;
		const hasValidTags =
			!formData.tags || Object.values(formData.tags).some((x) => x);
		const hasValidStoryPoints =
			formData.story_points !== undefined && formData.story_points > 0;
		console.log(formData.estimated_duration);

		const hasValidDuration =
			formData.estimated_duration !== undefined &&
			formData.estimated_duration > 0;
		console.log(formData);

		// Combine all validation checks
		const isFormValid =
			hasValidTaskName &&
			hasValidTaskType &&
			hasValidTaskStatus &&
			hasValidTaskDescription &&
			hasValidTags &&
			hasValidStoryPoints &&
			hasValidDuration;

		if (isFormValid) {
			if (selectedTask !== null) {
				editTaskDocData(selectedTask, formData);
				setHasChanged(!hasChanged);
			} else {
				addDocsToTasks(formData);
				setHasChanged(!hasChanged);
			}
			handleClose(); // Close modal
		} else {
			notify(); // Notify the user about the validation error
		}
	};

	// Delete a task
	const deleteTask = (formData) => {
		deleteTaskDoc(formData.id);

		handleClose();
		setHasChanged(!hasChanged);
	};

	const handleReload = () => {
		window.location.reload();
	};

	// sort tasks
	const [order, setOrder] = useState("ascending");

	const sortColumn = (col) => {
		if (order === "ascending") {
			const sorted = [...tasks].sort((a, b) =>
				a[col].toLowerCase() > b[col].toLowerCase() ? 1 : -1
			);
			setTasks(sorted);
			setOrder("descending");
		} else {
			const sorted = [...tasks].sort((a, b) =>
				a[col].toLowerCase() < b[col].toLowerCase() ? 1 : -1
			);
			setTasks(sorted);
			setOrder("ascending");
		}
	};

	const notify = () =>
		toast.error("Please enter all details", {
			position: "top-center",
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});

	const notifyMemberAlreadyAdded = () =>
		toast.error("Member already added!", {
			position: "top-center",
			autoClose: 2000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: "light",
		});

	const notifyMemberNotAdded = () =>
		toast.error("Member already added!", {
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
		getDocsFromTasks(project_id)
			.then((arr) => setTasks(arr))
			.catch((e) => {
				console.log("Failed to fetch tasks", e);
			});
	}, [hasChanged]);

	// Filters
	const emptyfilterData = {
		task_status: "",
		development_stage: "",
	};

	const [filterData, setFilterData] = useState(emptyfilterData);
	const [filteredTasks, setFilteredTasks] = useState(tasks);
	const [appliedFilters, setAppliedFilters] = useState(false);

	const [filterName, setFilterName] = useState(null);
	const [filterValue, setFilterValue] = useState(null);

	const handleChangeFilter = (e) => {
		setFilterData({
			...emptyfilterData,
			[e.target.name]: e.target.value,
		});

		setFilterName(e.target.name);
		setFilterValue(e.target.value);
	};

	const clearFilters = () => {
		setFilterData(emptyfilterData);
		setFilteredTasks(tasks);
		setFilterName(null);
		setFilterValue(null);
	};

	useEffect(() => {
		let filteredTasks;
		if (filterName !== null) {
			if (filterValue === "Any") {
				filteredTasks = tasks;
				setAppliedFilters(false);
			} else {
				filteredTasks = tasks.filter(
					(item) => item[filterName] === filterValue
				);
				setAppliedFilters(true);
			}
		} else {
			filteredTasks = tasks;
			setAppliedFilters(false);
		}
		setFilteredTasks(filteredTasks);
	}, [filterData, tasks]);

	useEffect(() => {
		// Update columns based whenever tasks state changes
		const updatedColumns = {
			Backlog: {
				name: "Backlog",
				items: filteredTasks.filter((item) => item.task_type === "Backlog"),
			},
			"Sprint Backlog": {
				name: "Sprint Backlog",
				items: filteredTasks.filter(
					(item) => item.task_type === "Sprint Backlog"
				),
			},
		};
		setColumns(updatedColumns);
	}, [filteredTasks]);

	const [sprintData, setSprintData] = useState({
		name: "",
		goal: "",
		tasks: [],
		startDate: "",
		endDate: "",
		archived: false,
	});
	const handleSprintChange = (e) => {
		setSprintData({
			...sprintData,
			[e.target.name]: e.target.value,
		});
	};
	const [sprints, setSprints] = useState([
		{
			name: "Sprint Example",
			sprintGoal: "Temp",
			tasks: [],
			startDate: "22/09/2023",
			endDate: "05/09/2023",
			archived: false,
		},
	]); // Fetch the database one

	const createSprint = () => {
		// Grab tasks marked with "Sprint Backlog"
		// Update tasks to in "Sprint" type
		sprintActivate();
		localStorage.setItem("data", JSON.stringify(sprintData));
		navigate("/sprintview");
	};

	useEffect(() => {
		// const fetchData = async () => {
		// 	try {
		// 		const projectData = await getProjectFromId(project_id);
		// 		setProject({ ...projectData, members: projectData.members || [] });
		// 	} catch (error) {
		// 		console.error("Error fetching project data: ", error);
		// 	}
		// };

		// fetchData();

		getProjectFromId(project_id)
			.then((data) => {
				setProject(data);
			})
			.catch((e) => {
				console.log("Failed to fetch project", e);
			});
	}, []);

	const override = {
		display: "block",
		margin: "0 auto",
		borderColor: "red",
	};

	const [run, setRun] = useState(true);

	const tourSteps = [
		{
			content: <h2>Let's begin our journey!</h2>,
			locale: { skip: <strong>SKIP</strong> },
			placement: "center",
			target: "body",
		},
		{
			content: <h2>Add Task</h2>,
			placement: "bottom",
			target: "#step-1",
			// title: "First step",
		},
		{
			content: <h2>Add Member to Project</h2>,
			placement: "bottom",
			target: "#step-3",
			// title: "Second step",
		},
		{
			content: <h2>Assign Member to Tasks</h2>,
			placement: "bottom",
			target: "#step-4",
			// title: "Second step",
		},
		{
			content: <h2>Set Filters</h2>,
			placement: "bottom",
			target: "#step-5",
			// title: "Second step",
		},
		{
			content: <h2>Create Sprint</h2>,
			placement: "bottom",
			target: "#step-6",
			// title: "Second step",
		},
		{
			content: <h2>View Current Sprint</h2>,
			placement: "bottom",
			target: "#step-8",
			// title: "Second step",
		},
		{
			content: <h2>Click here to toggle colors</h2>,
			placement: "bottom",
			target: "#step-9",
			// title: "Second step",
		},
		{
			content: <h2>Change Text Sizes</h2>,
			placement: "bottom",
			target: "#step-10",
		},
		{
			content: <h2>Enjoy</h2>,
			placement: "center",
			target: "body",
		},
	];

	if (loading) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<HashLoader
					color="#36d7b7"
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
		<div>
			<div className="h-screen w-full">
				<NavbarComponent />

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

				<div>
					<p
						onClick={() => {
							setRun(true);
						}}
						className=" cursor-pointer absolute right-20 bottom-10 border-2 px-3 py-1 border-black text-black"
					>
						Guide
					</p>
				</div>

				<ToastContainer />

				{/* Add Task Modal */}
				<Modal
					show={show}
					handleClose={handleClose}
					handleChange={handleChange}
					handleSubmit={handleSubmit}
					deleteAction={deleteTask}
					formData={formData}
					project={project}
				/>

				{/* Add Member Modal */}
				<MemberModal
					show={showMember}
					handleClose={handleCloseMember}
					handleChange={handleChangeMember}
					handleSubmit={handleSubmitMember}
					deleteAction={handleRemoveMember}
					formData={formDataMember}
				/>

				<Container>
					<Dropdown variant="outline-secondary" className=" float-right ml-3">
						<Dropdown.Toggle variant="outline-secondary" id="step-10">
							Text Size
						</Dropdown.Toggle>

						<Dropdown.Menu>
							<Dropdown.Item onClick={() => setTextSize("small")}>
								Small
							</Dropdown.Item>
							<Dropdown.Item onClick={() => setTextSize("normal")}>
								Normal
							</Dropdown.Item>
							<Dropdown.Item onClick={() => setTextSize("large")}>
								Large
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>

					<Button
						variant="outline-secondary"
						onClick={toggleColorScheme}
						className=" float-right ml-3"
						id="step-9"
					>
						ToggleColours
					</Button>

					<Button
						variant="outline-primary"
						onClick={handleShow}
						className=" float-right ml-3"
						id="step-1"
					>
						Add Task
					</Button>

					{accessLevel === 0 ? (
						<Button
							variant="outline-primary"
							onClick={handleShowMember}
							className=" float-right ml-3"
							id="step-3"
						>
							Add Member
						</Button>
					) : null}

					{appliedFilters && (
						<Button
							variant="outline-primary"
							onClick={clearFilters}
							className=" float-right ml-3"
						>
							Clear Filters
						</Button>
					)}

					<DropdownButton
						variant="outline-primary"
						// // id="dropdown-basic"
						id="step-5"
						className="float-right"
						drop="start"
						title={appliedFilters ? "Applied Filters" : "Set Filters"}
					>
						<div className="m-3 w-96">
							<Form.Group as={Row} className="mb-3">
								<Form.Label column sm="4">
									Task Status
								</Form.Label>
								<Col sm="8">
									<Form.Select
										onChange={handleChangeFilter}
										value={filterData.task_status}
										name="task_status"
									>
										<option>Any</option>
										<option value="To-do">To-do</option>
										<option value="Assigned">Assigned</option>
										<option value="In Progress">In Progress</option>
										<option value="Done">Done</option>
									</Form.Select>
								</Col>
							</Form.Group>
							<Form.Group as={Row} className="mb-3">
								<Form.Label column sm="4">
									Developement Stage
								</Form.Label>
								<Col sm="8">
									<Form.Select
										onChange={handleChangeFilter}
										value={filterData.development_stage}
										name="development_stage"
									>
										<option>Any</option>
										<option value="Planning">Planning</option>
										<option value="Developing">Developing</option>
										<option value="Testing">Testing</option>
										<option value="Integration">Integration</option>
									</Form.Select>
								</Col>
							</Form.Group>
						</div>
					</DropdownButton>

					{appliedFilters && (
						<Button
							variant="primary"
							onClick={clearFilters}
							className=" float-right mr-3 bg-green-600 border-green-600"
						>
							Filters have been applied
						</Button>
					)}

					<div>
						<DragDropContext
							onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
						>
							{Object.entries(columns).map(([columnId, column]) => {
								return (
									<div key={columnId}>
										<h2 className="my-4 text-2xl">{column.name}</h2>
										<div className="grid grid-cols-5 py-2 px-3 font-bold">
											<p
												onClick={() => {
													sortColumn("task_name");
												}}
											>
												Task Name
											</p>
											<p
												onClick={() => {
													sortColumn("task_description");
												}}
											>
												Description
											</p>
											<p
												onClick={() => {
													sortColumn("task_status");
												}}
											>
												Status
											</p>
											<p
												onClick={() => {
													sortColumn("development_stage");
												}}
											>
												Development Stage
											</p>

											<p
												onClick={() => {
													sortColumn("estimated_duration");
												}}
											>
												Task duration
											</p>
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
																			const styles =
																				getColorSchemeStyles(colorScheme);

																			let backgroundClass = "";

																			if (item.task_priority === "low") {
																				backgroundClass =
																					styles.backgroundColorLow;
																			}
																			if (item.task_priority === "medium") {
																				backgroundClass =
																					styles.backgroundColorMedium;
																			}
																			if (item.task_priority === "high") {
																				backgroundClass =
																					styles.backgroundColorHigh;
																			}

																			return (
																				<div
																					className={`py-2 px-3 border-solid border-1 border-slate-400 grid grid-cols-5${
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
																					<p>{item.task_description}</p>
																					<p>{item.task_status}</p>
																					<p>{item.development_stage}</p>
																					<p>{item.estimated_duration}</p>
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
						<SprintCreator
							sprintData={sprintData}
							handleChange={handleSprintChange}
							submit={createSprint}
						/>
					</div>
				</Container>
				{/* <h2 className="mx-5 my-4 text-2xl">Sprints</h2>
				<div className="mx-5">
					<Table bordered hover>
						<thead>
							<tr>
								<th>Sprint Name</th>
								<th>Status</th>
								<th>Start Date</th>
								<th>End Date</th>
							</tr>
						</thead>
						<tbody>
							{sprints.map((sprint, n) => {
								let active = "Blah";
								if (
									new Date(sprint.startDate).getTime() <
									new Date().getTime() <
									new Date(sprint.endDate)
								) {
									active = "Running";
								} else if (
									new Date(sprint.startDate).getTime() < new Date().getTime()
								) {
									active = "Not started";
								} else if (new Date().getTime() < new Date(sprint.endDate)) {
									active = "Ended";
								}
								return (
									<tr key={`sprint-row-${n}`}>
										<td>{sprint.name}</td>
										<td>{active}</td>
										<td>{sprint.startDate}</td>
										<td>{sprint.endDate}</td>
									</tr>
								);
							})}
						</tbody>
					</Table>
				</div> */}
			</div>
			{}
		</div>
	);
};

export default SprintsView;
