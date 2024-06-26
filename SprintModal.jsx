import React from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import DeleteDropdown from "./DeleteDropdown";

const SprintModalComponent = ({
	show,
	handleClose,
	handleChange,
	handleSubmit,
	deleteAction,
	formData,
}) => {
	class TimeLogEntry {
		constructor(user, date, loggedTime) {
			this.user = user;
			this.date = date;
			this.loggedTime = loggedTime;
		}
	}

	// const [timeLog, setTimeLog] = useState(
	// 	new TimeLogEntry("", "", "")
	// );

	return (
		<div>
			<Modal show={show} onHide={handleClose} centered>
				<Form onSubmit={handleSubmit}>
					<Modal.Header>
						<Modal.Title>Backlog Editor</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form.Group
							as={Row}
							className="mb-3"
							controlId="formPlaintextEmail"
						>
							<Form.Label column sm="4">
								Task Name
							</Form.Label>
							<Col sm="8">
								<Form.Control
									name="task_name"
									placeholder="Enter task name"
									onChange={handleChange}
									value={formData.task_name}
								/>
							</Col>
						</Form.Group>

						<Form.Group className="mb-3" as={Row}>
							<Form.Label column sm="4">
								Task Description
							</Form.Label>
							<Col>
								<Form.Control
									as="textarea"
									rows={3}
									name="task_description"
									onChange={handleChange}
									value={formData.task_description}
								/>
							</Col>
						</Form.Group>

						{/* <Form.Group as={Row} className="mb-3">
							<Form.Label column sm="4">
								Task Type
							</Form.Label>
							<Col sm="8">
								<Form.Select
									onChange={handleChange}
									value={formData.task_type}
									name="task_type"
								>
									<option>Open this select menu</option>
									<option value="Backlog">Backlog</option>
									<option value="Sprint Backlog">Sprint Backlog</option>
								</Form.Select>
							</Col>
						</Form.Group> */}
						<Form.Group as={Row} className="mb-3">
							<Col sm="1000">	
							<Form.Label column sm="4">
								Tags (at least 1)
							</Form.Label>
								{formData.tags && Object.keys(formData.tags).map((type, n) => (
									// Disabled until all task objects are updated
									<Form.Check 
										key = {`Check-${n}`}
										inline
										type="checkbox"
										name={`${type}`}
										label={`${type}`}
										onChange={handleChange}
										checked={formData.tags[type]}
										inputprops={{ 'aria-label': 'controlled' }}
									/>
								))}
							</Col>
						</Form.Group>

						{formData.story_points!==undefined &&
							<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="4">
								Story Points
							</Form.Label>
							<Col sm="8">
								<Form.Control
									onChange={handleChange}
									value={formData.story_points}
									name="story_points"
									type="number"
								>
								</Form.Control>
							</Col>
						</Form.Group>}

						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="4">
								Task Status
							</Form.Label>
							<Col sm="8">
								<Form.Select
									onChange={handleChange}
									value={formData.task_status}
									name="task_status"
								>
									{/* <option>Open this select menu</option> */}
									<option>Open this select menu</option>
									<option value="To-do">To-do</option>
									<option value="Assigned">Assigned</option>
									<option value="In Progress">In Progress</option>
									<option value="Done">Done</option>
								</Form.Select>
							</Col>
						</Form.Group>

						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="4">
								Task Priority
							</Form.Label>
							<Col sm="8">
								<Form.Select
									onChange={handleChange}
									value={formData.task_priority}
									name="task_priority"
								>
									<option>Open this select menu</option>
									<option value="low">low</option>
									<option value="medium">medium</option>
									<option value="high">high</option>
								</Form.Select>
							</Col>
						</Form.Group>

						<Form.Group as={Row} className="mb-3">
							<Form.Label column sm="4">
								Development Stage
							</Form.Label>
							<Col sm="8">
								<Form.Select
									onChange={handleChange}
									value={formData.development_stage}
									name="development_stage"
								>
									<option>Open this select menu</option>
									<option value="Planning">Planning</option>
									<option value="Developing">Developing</option>
									<option value="Testing">Testing</option>
									<option value="Integration">Integration</option>
								</Form.Select>
							</Col>
						</Form.Group>
                        <Form.Group  as={Row} className="mb-3">
                            <Form.Label column sm="4">
								Date Completed
							</Form.Label>
                            <Col sm="8">
                                <Form.Control
                                    type="date"
                                    name="date_completed"
                                    onChange={handleChange}
                                    value={formData.date_completed}
                                />
                            </Col>
                        </Form.Group>
							<Form.Group as={Row} className="mb-3">
								<Form.Label column sm="4">
									Time spent (hours) 
								</Form.Label>
								<Col sm="8">
									<Form.Control
											type="number"
											name="time_spent"
											placeholder="Enter hours spent"
											onChange={handleChange}
											value={formData.time_spent || ''}
									/>
								</Col>
							</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<DeleteDropdown
							deleteAction={() => {
								console.log("Can delete", formData);
								deleteAction(formData);
							}}
						/>
						<Button variant="outline-secondary" onClick={handleClose}>
							Close
						</Button>
						<Button
							variant="outline-primary"
							onClick={handleSubmit}
							type="submit"
						>
							Save Changes
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</div>
	);
};

export default SprintModalComponent;