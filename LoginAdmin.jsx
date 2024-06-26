import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginAdmin.css";
import { getUserDocFromUsername } from "../backend/database";
import { ToastContainer, toast } from "react-toastify";

const LoginAdmin = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [level, setLevel] = useState("");

	const [isCredentialsValid, setIsCredentialsValid] = useState(true);

	const handleButtonClick = () => {
		getUserDocFromUsername(username)
			.then((data) => {
				if (data === false) {
					notify("User not found");
				} else {
					localStorage.setItem("userData", JSON.stringify(data));

					if (
						password === JSON.parse(localStorage.getItem("userData")).password
					) {
						if (JSON.parse(localStorage.getItem("userData")).level == 0) {
							window.location.href = "/registerpage";
						} else {
							notify("Access level not high enough.");
						}
					} else {
						notify("Incorrect password");
					}
				}
			})
			.catch((e) => {
				console.log("failed to fetch username", e);
			});
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
				<h1>Sign in using admin account</h1>
				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className="input"
				/>
				<input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="input"
				/>

				<button onClick={handleButtonClick} className="login-btn">
					Login
				</button>
			</div>
		</div>
	);
};

export default LoginAdmin;
