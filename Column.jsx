import React from "react";
import Task from "../components/Task";
import { Droppable } from "react-beautiful-dnd";

const Column = ({ columnId, column }) => {
	return (
		<div className="my-2">
			<Droppable droppableId={columnId} key={columnId}>
				{(provided, snapshot) => {
					return (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
							style={{
								background: snapshot.isDraggingOver ? "lightblue" : "lightgrey",
							}}
							className="p-2 rounded-lg h-[60vh] overflow-scroll"
						>
							{column.items.length === 0 && !snapshot.isDraggingOver && (
								<div>
									<p>Empty</p>
								</div>
							)}
							{column.items.length > 0 &&
								column.items.map((item, index) => {
									return <Task item={item} index={index} key={index} />;
								})}
							{provided.placeholder}
						</div>
					);
				}}
			</Droppable>
		</div>
	);
};

export default Column;
