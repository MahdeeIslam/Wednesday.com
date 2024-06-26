import React, { PureComponent, useState, useEffect } from "react";
import {
	BarChart,
	Bar,
	Rectangle,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Label,
} from "recharts";
import { getloggedTimeData, getTaskName } from "../backend/database";

const tabulateData = (rawLogs) => {
	let totals = {};
	rawLogs.forEach((log) => {
		if (totals[log.task_id]) {
			totals[log.task_id] += log.time_logged;
		} else {
			totals[log.task_id] = log.time_logged;
		}
	});

	let data = [];
	for (const [key, value] of Object.entries(totals)) {
		data.push({
			task_id: key,
			hours: value,
		});
	}
	console.log(rawLogs);
	console.log(data);

	return data;
};

const TaskTimeSpentChart = () => {
	const [logs, setLogs] = useState([]);

	useEffect(() => {
		getloggedTimeData()
			.then((res) => {
				setLogs(res);
			})
			.catch((e) => console.log("Failed to fetch logs", e));
	}, []);

	let data = tabulateData(logs);

	return (
		<ResponsiveContainer width="100%" height="50%">
			<BarChart
				width={500}
				height={200}
				data={data}
				margin={{
					top: 5,
					right: 30,
					left: 20,
					bottom: 25,
				}}
			>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="task_id">
					<Label offset={-28} position="insideBottom">
						Team Member
					</Label>
				</XAxis>
				<YAxis>
					<Label offset={0} angle={-90} position="insideLeft">
						{" "}
						Time Spent (Hours){" "}
					</Label>
				</YAxis>
				<Tooltip />
				<Legend align="left" />
				<Bar
					dataKey="hours"
					fill="#8884d8"
					activeBar={<Rectangle fill="pink" stroke="blue" />}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
};
export default TaskTimeSpentChart;
