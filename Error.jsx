import React from "react";
import { Link } from "react-router-dom";

const Error = () => {
	return (
		<div>
			<p>
				Oops, you've landed in the wrong place. Lets take you back to
				civilization
			</p>
			<Link to="/">Take me back home</Link>
		</div>
	);
};

export default Error;
