import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { getUserDocAll } from "../backend/database";
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
	const [teamMembers, setTeamMembers] = useState([]);
    const [users, setUsers] = useState([]);
	const [hasChanged, setHasChanged] = useState(false);

	useEffect(() => {
		async function fetchUsers() {
			try {
				const result = await getUserDocAll();
				setUsers(result);
			} catch (e) {
				console.log("Failed fetching users", e);
			}
		}

		fetchUsers();
	}, [hasChanged]);
	
	useEffect(() => {
		// Extract user names from the fetched users and populate teamMembers array
		const memberNames = users.map((user) => user.username);
		setTeamMembers(memberNames);
	  }, [users]);

	return (
		<div>
			<Modal show={show} onHide={handleClose} centered>
				<Form onSubmit={handleSubmit}>
					<Modal.Header>
						<Modal.Title>Members Modal</Modal.Title>
					</Modal.Header>
					<Modal.Body>

                    <Form.Group as={Row} className="mb-3">
						<Form.Label column sm="4">
							Member Name
						</Form.Label>
						<Col sm="8">
							<Form.Select
							onChange={handleChange}
							value={formData.member_name}
							name="member_name"
							>
							<option>Open this select menu</option>
							{teamMembers.map((memberName, index) => (
								<option key={index} value={memberName}>
								{memberName}
								</option>
							))}
							</Form.Select>
						</Col>
					</Form.Group>

					</Modal.Body>
					<Modal.Footer>
						<Button variant="outline-secondary" onClick={handleClose}>
							Close
						</Button>
						<Button
							variant="outline-secondary"
							onClick={deleteAction}
						>
							Remove Member
						</Button>
						<Button
							variant="outline-primary"
							onClick={handleSubmit}
							type="submit"
						>
							Add Member
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
		</div>
	);
};

export default ModalComponent;
