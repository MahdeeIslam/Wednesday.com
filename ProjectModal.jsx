import React from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import DeleteDropdown from "./DeleteDropdown";

const ModalComponent = ({
	show,
	handleClose,
	handleChange,
	handleSubmit,
	deleteAction,
	formData,
}) => {
	return (
		<div>
			<Modal show={show} onHide={handleClose} centered>
				<Form onSubmit={handleSubmit}>
					<Modal.Header>
						<Modal.Title>Projects Modal</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form.Group
							as={Row}
							className="mb-3"
							controlId="formPlaintextEmail"
						>
							<Form.Label column sm="4">
								Project Name
							</Form.Label>
							<Col sm="8">
								<Form.Control
									name="project_name"
									placeholder="Enter project name"
									onChange={handleChange}
									value={formData.project_name}
								/>
							</Col>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
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

export default ModalComponent;
