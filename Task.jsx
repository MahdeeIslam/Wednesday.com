import React from "react";
import { Draggable } from "react-beautiful-dnd";

const Task = ({ item, index }) => {
	return (
		<Draggable key={item.id} draggableId={item.id} index={index}>
			{(provided, snapshot) => {
				return (
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						className={`p-4 m-0 mb-2 min-h-14 ${
							snapshot.isDragging ? "bg-sky-800" : "bg-sky-500"
						} text-white ${provided.draggableProps.className} rounded-lg`}
					>
						{item.content}
					</div>
				);
			}}
		</Draggable>
	);
};

export default Task;
