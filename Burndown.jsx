import React, { useEffect, useState, PureComponent } from "react";
import { useParams } from "react-router-dom";
import NavbarComponent from "../components/Navbar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { getActiveSprintTasks } from "../backend/database";
import moment from "moment";
import TimeSpentChart from "../components/SprintTimeChart";
import TaskTimeSpentChart from "../components/TasksTimeChart";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from 'react-bootstrap/Table';
import { Container } from "react-bootstrap";


const drawGraph = (data) => {
    const dateFormatter = date => {
        // return moment(date).unix();
        return moment(date).format('DD/MM/YY');
      };

    return (
    <div style={{ width: '100%' }}>
        <ResponsiveContainer width="100%" height={300}>
        <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
            top: 10,
            right: 30,
            left: 30,
            bottom: 20,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
                tickFormatter={dateFormatter}
                domain={[data[0].date, data[data.length - 1].date]} 
                dataKey="date"
                scale="time"
                type="number"
                >
                <Label offset={-18} position="insideBottom">Date of Completion</Label>
            </XAxis>
            <YAxis type="number">
                <Label offset={0} angle={-90} position="insideBottomLeft"> Story Points Remaining </Label>
            </YAxis>
            <Legend align="left" formatter={raw => {
                const firstChar = raw.charAt(0).toUpperCase();
                const remainingChars = raw.slice(1).replace("_", " ");
                return `${firstChar}${remainingChars}`;
            }}></Legend>
            <Tooltip label={20} labelFormatter={dateFormatter}/>
            <Line connectNulls strokeDasharray="10 5" type="monotone" dataKey="ideal" stroke="#22de4b" fill="#8884d8" />
            <Line connectNulls type="monotone" dataKey="points_remaining" stroke="#8884d8" fill="#8884d8" />
        </LineChart>
        </ResponsiveContainer>
    </div>
    );
}


const dateRangeGenerator = function* (start, end, step = 1) {
    let d = start;
    while (d <= end) {
        yield new Date(d);
        d.setDate(d.getDate() + step);
    }
};
// B - t*(A-B)
// Map start to end to [0,1] for x, f(start) = 0, f(end) = 1 f(curr) = curr - start , then normalise for sprint length
// y = -(x)/length + total
const pointsCalc = (total_points, start_date, end_date, curr_date) => {
    return Math.round((-(curr_date.getTime() - start_date.getTime())/(end_date.getTime() - start_date.getTime()) + 1)*total_points)
}
const Burndown = () => {
    const { project_id } = useParams();
    const [project, setProject] = useState(null);
    const [user, setUser] = useState("");
	const [accessLevel, setAcessLevel] = useState(null);
	useEffect(() => {
		const userData = JSON.parse(localStorage.getItem("userData"));
		setUser(userData["username"]);
		setAcessLevel(userData["level"]);
	}, []);

    const [sprint, setSprint] = useState({
        name: "Sprint Example",
        sprintGoal: "Temp",
        tasks: [],
        startDate: "2023-10-09",
        endDate: "2023-10-20",
        archived: false,
    })
    const [tasks, setTasks] = useState([])
    useEffect(() => {
        // Get Sprint data

        // Get active sprint tasks in the project
        getActiveSprintTasks(project_id)
        .then(res => setTasks(res))
        .catch((e)=>console.log("Failed to fetch active tasks", e))
    }, [])


    useEffect(() => {
        // Ideal:
            // Sum the story points
            // Get start and end dates, calc duration
            // create a function to compute ideal progress
                // total_points - (end_date - todays_date)*total_points
                // Remember to check today is in sprint date/active sprint
            // Plot ideal points remaining for each day

        // Present progress:
            // Plot a point for each completed user story.
            // Get task names as hover
            // Use date_completed as the x_value
            // Generate y values as story points remaining (Total)

        const total_points = (tasks.map((e) => parseInt(e.story_points))).reduce((accum, x) => accum+x, 0)
        let x = [...dateRangeGenerator(new Date(sprint.startDate), new Date(sprint.endDate))]
            .map(d => { return {
                    date: d.toISOString(),
                    ideal: pointsCalc(total_points, new Date(sprint.startDate), new Date(sprint.endDate), d),
                    }
                }
            )
        x.sort((a,b) => new Date(a) < new Date(b))
    }, [])
    const total_points = (tasks.map((e) => parseInt(e.story_points))).reduce((accum, x) => accum+x, 0)
    let dataPoints = [...dateRangeGenerator(new Date(sprint.startDate), new Date(sprint.endDate))]
        .map(d => { return {
                date: d.toISOString(),
                ideal: pointsCalc(total_points, new Date(sprint.startDate), new Date(sprint.endDate), d),
                }
            }
        )
    dataPoints.sort((a,b) => new Date(a) < new Date(b))
    dataPoints[0].points_remaining = dataPoints[0].ideal
    let storyPointsRemaining = total_points
        let completed_tasks = []
        tasks.forEach( (task, index) => {
            if (task.date_completed
                && new Date(sprint.startDate) < new Date(task.date_completed) 
                && new Date(task.date_completed) < new Date(sprint.endDate)) {
                storyPointsRemaining -= task.story_points
                completed_tasks.push(
                    {
                        date: new Date(task.date_completed).toISOString(),
                        points_remaining: storyPointsRemaining,
                    }
                )
            }
        })
    dataPoints = [...dataPoints, ...completed_tasks]
    
    dataPoints.forEach(d => {
    d.date = moment(d.date).valueOf(); // date -> epoch
    });
    dataPoints.sort((a,b) => a.date < b.date)
    
    // Set start and end dates for viewing worked hours
    const [startWorkDate, setStartWorkDate] = useState(sprint.startDate)
    const [endWorkDate, setEndtWorkDate] = useState(sprint.endDate)

    // LOGGED HOURS DISPLAY



    return (
        <div className="h-screen w-full">
            <NavbarComponent/>
            <div className="mx-4">
                <h1 className="my-4 text-3xl">Sprint Burndown</h1>
                {drawGraph(dataPoints)}
                
                
            </div>

            <h1 className="mx-4 my-4 text-3xl"> Working Times</h1>         
            <TimeSpentChart
                start_date={startWorkDate}
                end_date={endWorkDate}
            />

            <Form className="mx-4">
                <Form.Group  as={Row} className="mb-3">

                    <Form.Label>
                                Starting from:
                    </Form.Label>
                    <Col sm="2">
                        
                        <Form.Control
                            type="date"
                            name="startWorkDate"
                            onChange={(e)=>setStartWorkDate(e.target.value)}
                            value={startWorkDate}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3">
                    <Form.Label>
                                Ending at:
                    </Form.Label>
                    <Col sm="2">
                        
                        <Form.Control
                            type="date"
                            name="startWorkDate"
                            onChange={(e)=>setEndtWorkDate(e.target.value)}
                            value={endWorkDate}
                        />
                    </Col>
                </Form.Group>
            </Form>

            <h1 className="mx-4 my-4 text-3xl"> Tasks Time Logged</h1>   
            <TaskTimeSpentChart/>
            
        </div>
    )
}
export default Burndown;