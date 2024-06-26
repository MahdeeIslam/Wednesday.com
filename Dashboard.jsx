import React, { useEffect, useState } from "react";
import NavbarComponent from "../components/Navbar";
import { Link } from "react-router-dom";

const Dashboard = () => {
	const [user, setUser] = useState("");
	const [accessLevel, setAcessLevel] = useState(null);
	useEffect(() => {
		const userData = JSON.parse(localStorage.getItem("userData"));
		setUser(userData["username"]);
		setAcessLevel(userData["level"]);
	}, []);
	return (
		<>
			<NavbarComponent />
			<div className="flex flex-grow justify-center bg-white px-8 py-8 dark:bg-slate-700 md:px-48 md:py-48">
				<div className="flex flex-col items-center gap-4 mt-10">
					<h1 className="text-center text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
						Welcome, {user}
					</h1>
					<div className="text-xl flex flex-col lg:flex-row gap-4 lg:gap-10 pt-4">
						<Link
							className="px-5 py-2 bg-blue-500 rounded-lg text-white list-none"
							to="/projects"
						>
							{accessLevel === 0 ? "Manage Projects" : "View Projects"}
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};

export default Dashboard;
