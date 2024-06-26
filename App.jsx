import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../src/pages/Login";
import LoginAdmin from "../src/pages/LoginAdmin";
import RegisterPage from "../src/pages/RegisterPage";
import Error from "../src/pages/Error";
import SprintsView from "./pages/SprintsView";
import Backlogs from "./pages/Backlogs";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Burndown from "./pages/Burndown"

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Change the root directory to Login once 
				login functionality is setup */}
				<Route path="/" element={<Login />} />
				<Route path="home" element={<Login />} />
				<Route path="/loginadmin" element={<LoginAdmin />} />
				<Route path="/projects" element={<Projects />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/registerpage" element={<RegisterPage />} />
				<Route path="/sprintview/:project_id" element={<SprintsView />} />
				<Route path="/backlogs/:project_id" element={<Backlogs />} />
				<Route path="/burndown/:project_id" element={<Burndown />}/>
				<Route path="*" element={<Error />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
