import React from 'react';

export default ({ width = 20, height = 20, color = '#aaa' }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={width}
		height={height}
		x="0"
		y="0"
		enableBackground="new 0 0 612 612"
		version="1.1"
		viewBox="0 0 612 612"
		xmlSpace="preserve"
	>
		<path
			fill={color}
			d="M444.644 306l138.644-138.644c38.284-38.284 38.284-100.36 0-138.644-38.283-38.284-100.359-38.284-138.644 0L306 167.356 167.356 28.713c-38.284-38.284-100.36-38.284-138.644 0s-38.284 100.36 0 138.644L167.356 306 28.713 444.644c-38.284 38.283-38.284 100.36 0 138.644 38.284 38.284 100.36 38.284 138.644 0L306 444.644l138.644 138.644c38.283 38.284 100.36 38.284 138.644 0 38.284-38.283 38.284-100.36 0-138.644L444.644 306z"
		></path>
	</svg>
);