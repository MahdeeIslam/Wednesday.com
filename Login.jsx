import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { getUserDocFromUsername } from "../backend/database";
import { ToastContainer, toast } from "react-toastify";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

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
						window.location.href = "/dashboard";
					} else {
						notify("Invalid username or password");
					}
				}
			})
			.catch((e) => {
				notify("User not found");
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
				<h1>Wednesday.com</h1>
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

				<p className="text">Register Account</p>

				<Link to="/loginadmin" className="register-btn">
					Register
				</Link>
			</div>
		</div>
	);
};

export default Login;
