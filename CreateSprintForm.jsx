import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const SprintCreator = ({ sprintData, handleChange, submit, admin = true }) => {
	const nameInputSep = 2;
	const inputWidth = 3;
	if (admin) {
		return (
			<div className="mt-16 ring-2 ring-slate-500 ring-offset-2 ring-offset-neutral-500 px-4 py-2">
				<h2 className="my-4 text-2xl">Sprint Creator</h2>
				<Form onSubmit={submit}>
					<Form.Group as={Row} className="mb-3 mx-10">
						<Form.Label column sm={nameInputSep}>
							Sprint Name
						</Form.Label>
						<Col sm={inputWidth}>
							<Form.Control
								required
								name="name"
								value={sprintData.name}
								onChange={handleChange}
								placeholder="Enter sprint name"
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row} className="mb-3 mx-10">
						<Form.Label column sm={nameInputSep}>
							Sprint Goal
						</Form.Label>
						<Col sm={inputWidth}>
							<Form.Control
								required
								as="textarea"
								rows={2}
								name="goal"
								value={sprintData.goal}
								onChange={handleChange}
								placeholder="Enter sprint goal"
								inputMode="text"
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row} className="mb-3 mx-10">
						<Form.Label column sm={nameInputSep}>
							Start Date
						</Form.Label>
						<Col sm={inputWidth}>
							<Form.Control
								required
								type="date"
								name="startDate"
								onChange={handleChange}
								value={sprintData.startDate}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row} className="mb-3 mx-10 my-2">
						<Form.Label column sm={nameInputSep}>
							End Date
						</Form.Label>
						<Col sm={inputWidth}>
							<Form.Control
								required
								type="date"
								name="endDate"
								onChange={handleChange}
								value={sprintData.endDate}
							/>
						</Col>
						<div className="mb-10"></div>
					</Form.Group>

					<div className="relative ">
						<button
							className=" absolute bottom-0 right-4 mt-4 mb-4 px-4 py-2 rounded-lg border-2 border-gray-700
							 hover:bg-blue-800 hover:text-white hover:border-0 transition-all
							"
							onClick={submit}
							id="step-6"
						>
							Create Sprint
						</button>
					</div>
				</Form>
			</div>
		);
	}
};
export default SprintCreator;
