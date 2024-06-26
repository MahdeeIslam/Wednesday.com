import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./RegisterPage.css";
import { addDocsToUsers } from "../backend/database.js";
import { ToastContainer, toast } from "react-toastify";

function generateRandomId(length) {
	let characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let randomId = "";
	for (let i = 0; i < length; i++) {
		randomId += characters.charAt(
			Math.floor(Math.random() * characters.length)
		);
	}
	return randomId;
}

const RegisterPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [level, setLevel] = useState("");

	const [isCredentialsValid, setIsCredentialsValid] = useState(true);

	const handleOptionChange = (event) => {
		setLevel(event.target.value);
	};

	const handleButtonClick = () => {
		if (username !== "" && password !== "" && level !== "") {
			setIsCredentialsValid(true);

			const userData = {
				username: username,
				password: password,
				level: level,
			};

			addDocsToUsers(userData);
			notify("Registered successfully");
		} else {
			setIsCredentialsValid(false);
		}
	};

	const handleButtonClick2 = () => {
		// create a random password and store in a variable
		const randomPassword = generateRandomId(10);
		setPassword(randomPassword);
	};

	const notify = (msg) =>
		toast.error(msg, {
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
		<div className="page">
			<ToastContainer />
			<div className="cover">
				<h1>Register an account</h1>
				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className="input"
				/>
				<div className="w-[80%]">
					<input
						type="text"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full input"
					/>

					<button
						onClick={handleButtonClick2}
						className="mt-3 bg-cyan-500 text-white px-4 py-2"
					>
						Generate password
					</button>
				</div>

				<select id="dropdown" value={level} onChange={handleOptionChange}>
					<option value="">Select level</option>
					<option value="0">Admin</option>
					<option value="1">User</option>
				</select>

				{!isCredentialsValid && (
					<p className="error-message">Please enter all details</p>
				)}

				<button onClick={handleButtonClick} className="register-btn">
					Register
				</button>
			</div>
		</div>
	);
};

export default RegisterPage;
