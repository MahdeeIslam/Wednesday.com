import { initializeApp } from "firebase/app";
import {
	getFirestore,
	collection,
	addDoc,
	getDocs,
	getDoc,
	updateDoc,
	deleteDoc,
	doc,
	query,
	where,
	runTransaction,
	writeBatch,
} from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
	apiKey: "AIzaSyB6fBqUFmL_7jQOUQ4yZpB_LfI8iQc9ZVY",
	authDomain: "wednesday-com.firebaseapp.com",
	databaseURL:
		"https://wednesday-com-default-rtdb.asia-southeast1.firebasedatabase.app",
	projectId: "wednesday-com",
	storageBucket: "wednesday-com.appspot.com",
	messagingSenderId: "724321651683",
	appId: "1:724321651683:web:652ecffc22425ae6756ed6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Tasks collection
const tasksColRef = collection(db, "tasks");

export function addDocsToTasks(formData) {
	addDoc(tasksColRef, {
		...formData
	}).then(console.log("Added new task!"));
}

export async function getDocsFromTasks(project_id) {
	let tasks = [];

	const q = query(tasksColRef, where("project_id", "==", project_id));

	const querySnapshot = await getDocs(q);
	querySnapshot.forEach((doc) => {
		tasks.push({ id: doc.id, ...doc.data() });
	});

	return tasks;
}

export async function editTaskDocData(docId, formData) {
	const docRef = doc(db, "tasks", docId);

	await updateDoc(docRef, {
		...formData,
	});
}

export async function deleteTaskDoc(docId) {
	const docRef = doc(db, "tasks", docId);

	await deleteDoc(docRef);
}

export async function getTaskName(docId){
	const docRef = doc(db, "tasks", docId)

	const docSnap = await getDoc(docRef);

	if (docSnap.exists()) {
		console.log("Document data:", docSnap.data());
	} else {
		// docSnap.data() will be undefined in this case
		console.log("No such document!");
	}

	return docSnap.data().task_name
}

// User Collection
const userColRef = collection(db, "users");

export async function getUserDocAll() {
	let users = [];

	const querySnapshot = await getDocs(collection(db, "users"));
	querySnapshot.forEach((doc) => {
		users.push({ id: doc.id, ...doc.data() });
	});
	return users;
}

export async function addDocsToUsers(userData) {
	addDoc(userColRef, {
		username: userData.username,
		password: userData.password,
		level: userData.level,
	}).then(console.log("Added new user!"));
}

export async function getDocsFromUsers() {
	let tasks = [];

	const querySnapshot = await getDocs(userColRef);
	querySnapshot.forEach((doc) => {
		tasks.push({ id: doc.id, ...doc.data() });
	});

	return tasks;
}

export async function editUserDocData(username, userData) {
	const docRef = doc(db, "users", username);

	await updateDoc(docRef, {
		...userData,
	});
}

export async function deleteUserDoc(username) {
	const docRef = doc(db, "users", username);

	await deleteDoc(docRef);
}

export async function userMatchesPassword(userData) {
	const q = query(
		userColRef,
		where("username", "==", userData.username),
		where("password", "==", userData.password)
	);

	const querySnapshot = await getDocs(q);
	querySnapshot.forEach((doc) => {
		return true;
	});

	return false;
}

export async function getUserDocFromUsername(username) {
	// const docRef = doc(db, "users", "test");
	// const docSnap = await getDoc(docRef);

	// if (docSnap.exists()) {
	// console.log("Document data:", docSnap.data());
	// } else {
	// // docSnap.data() will be undefined in this case
	// console.log("No such document!");
	// }

	const q = query(userColRef, where("username", "==", username));

	const querySnapshot = await getDocs(q);

	let userData = [];

	querySnapshot.forEach((doc) => {
		// doc.data() is never undefined for query doc snapshots
		userData.push(doc.data());
	});

	if (userData.length === 0) {
		return false;
	} else {
		return userData.at(0);
	}
}

export async function getSprintBacklog() {
	// Create a reference to the cities collection
	const tasksRef = collection(db, "tasks");

	// Create a query against the collection
	const q = query(tasksRef, where("task_type", "==", "Sprint"));

	let tasks = [];
	const querySnapshot = await getDocs(q).then((arr) =>
		arr.forEach((doc) => {
			tasks.push({ id: doc.id, ...doc.data() });
		})
	);

	return tasks;
}

export async function addSprint(sprint) {
	const docRef = await addDoc(collection(db, "sprints"), sprint)
		.then((res) => console.log("Added sprint", res))
		.catch((e) => console.log("Failed to add sprint", res));
}

export async function getSprints() {
	let sprints = [];

	const querySnapshot = await getDocs(collection(db, "sprints"));
	querySnapshot.forEach((doc) => {
		sprints.push({ id: doc.id, ...doc.data() });
	});
	return sprints;
}

export async function sprintActivate() {
	const batch = writeBatch(db);

	const q = query(
		collection(db, "tasks"),
		where("task_type", "==", "Sprint Backlog")
	);
	const querySnapshot = await getDocs(q);
	querySnapshot.forEach((item) => {
		const docRef = doc(db, "tasks", item.id);
		batch.update(docRef, { task_type: "Active Sprint" });
	});
	await batch.commit();
}

export async function getActiveSprintTasks(project_id) {
	let tasks = [];
	const q = query(
		collection(db, "tasks"),
		where("task_type", "==", "Active Sprint"),
		where("project_id", "==", project_id)
	);
	const querySnapshot = await getDocs(q);
	querySnapshot.forEach((doc) => {
		tasks.push({ id: doc.id, ...doc.data() });
	});

	return tasks;
}

// projects

const projectsColRef = collection(db, "projects");

export async function getProjects() {
	let projects = [];

	const querySnapshot = await getDocs(collection(db, "projects"));
	querySnapshot.forEach((doc) => {
		projects.push({ id: doc.id, ...doc.data() });
	});
	return projects;
}

export async function getProjectFromId(project_id) {
	const docRef = doc(db, "projects", project_id);

	const document = await getDoc(docRef);
	return document.data();
}
export function addDocsToProjects(formData) {
	addDoc(projectsColRef, {
		project_name: formData.project_name,
		members: [],
	}).then(console.log("Added new project!"));
}

export async function editProjectDocData(docId, formData) {
	const docRef = doc(db, "projects", docId);

	await updateDoc(docRef, {
		...formData,
	});
}

export async function deleteProjectDoc(docId) {
	const docRef = doc(db, "projects", docId);

	await deleteDoc(docRef);
}

// logged_time database

const loggedTimeRef = collection(db, "logged_time")

export async function getloggedTimeData() {
	let loggedTime = [];

	const querySnapshot = await getDocs(loggedTimeRef);
	querySnapshot.forEach((doc) => {
		loggedTime.push({ id: doc.id, ...doc.data() });
	});
	return loggedTime;
}

export function addDocsToLoggedTimeData(formData) {
	addDoc(loggedTimeRef, {
		user_id: formData.user_id,
		date: formData.date,
		task_id: formData.task_id,
		time_logged: formData.time_logged,
	}).then(console.log("Logged new Time!"));
}

export async function editLoggedTimeDocData(docId, formData) {
	const docRef = doc(db, "logged_time", docId);

	await updateDoc(docRef, {
		...formData,
	});
}

export async function deleteLoggedTimeData(docId){
	const docRef = doc(db, "logged_time", docId);

	await deleteDoc(docRef);
}
// // team members

// const membersColRef = collection(db, "members");

// export async function getMembers() {
// 	let members = [];

// 	const querySnapshot = await getDocs(collection(db, "members"));
// 	querySnapshot.forEach((doc) => {
// 		projects.push({ id: doc.id, ...doc.data() });
// 	});
// 	return members;
// }

// export function addDocsToMembers(formData) {
// 	addDoc(projectsColRef, {
// 		member_name: formData.member_name,
// 	}).then(console.log("Added new member!"));
// }

// export async function deleteMemberDoc(docId) {
// 	const docRef = doc(db, "members", docId);

// 	await deleteDoc(docRef);
// }

// logged_time database