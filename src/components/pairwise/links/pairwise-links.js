import React, { useCallback } from 'react';
import LinksOrchestrator from './links-orchestrator';
import {
	DeclarationsBeforeText,
	DeclarationsAfterText,
	DeclarationsDetachable,
} from '../../declarations';

const PairwiseLinks = ({
	declarations,
	components,
	handleChange,
	value,
	missing,
	shortcut,
	features,
	preferences,
	management,
	executeExpression,
	xAxisIterations,
	yAxisIterations,
	custom,
}) => {
	const nbRows = xAxisIterations * yAxisIterations;
	const handleChangeLinks = useCallback(
		function (response, value, args) {
			handleChange(response, value, args);
		},
		[handleChange]
	);

	if (nbRows > 0)
		return (
			<>
				<DeclarationsBeforeText declarations={declarations} custom={custom} />
				<DeclarationsAfterText declarations={declarations} custom={custom} />
				<LinksOrchestrator
					components={components}
					handleChange={handleChangeLinks}
					nbRows={nbRows}
					valueMap={value}
					management={management}
					missing={missing}
					shortcut={shortcut}
					features={features}
					preferences={preferences}
					executeExpression={executeExpression}
					custom={custom}
					xAxisIterations={xAxisIterations}
				/>
				<DeclarationsDetachable declarations={declarations} custom={custom} />
			</>
		);

	return null;
};

export default PairwiseLinks;