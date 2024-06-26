import React, { PureComponent, useState, useEffect } from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { getloggedTimeData } from '../backend/database';

const tabulateData = (rawLogs, dateBounds) => {
  let totals = {}
  rawLogs.forEach(log => {
    // console.log(new Date(dateBounds.start_date), new Date(log.date),new Date(dateBounds.end_date))
    if (new Date(dateBounds.start_date) <= new Date(log.date) && new Date(log.date) <= new Date(dateBounds.end_date)) {
      if (totals[log.user_id]) {
        totals[log.user_id] += log.time_logged
      } else {
        totals[log.user_id] = log.time_logged
      }
    }
  });
  let data = []
  for (const [key, value] of Object.entries(totals)) {
    data.push({
      name: key,
      hours: value,
    })
  }
  console.log(rawLogs)
  console.log(data);
  return data
}

const TimeSpentChart = (dateBounds) => {

  const [logs, setLogs] = useState([])

  useEffect(() => {
		getloggedTimeData()
      .then((res) => {
        setLogs(res);
        
      })
      .catch((e)=>console.log("Failed to fetch logs", e))

	}, []);

  let data = tabulateData(logs, dateBounds);;

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
            <XAxis dataKey="name">
              <Label offset={-28} position="insideBottom">Team Member</Label>
            </XAxis>
            <YAxis>
              <Label offset={0} angle={-90} position="insideLeft"> Time Spent (Hours) </Label>
            </YAxis>
            <Tooltip />
            <Legend align='left' />
            <Bar dataKey="hours" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
        </BarChart>
    </ResponsiveContainer>
);
}
export default TimeSpentChart;
