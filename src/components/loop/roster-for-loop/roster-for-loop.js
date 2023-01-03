import React, { useState, useCallback } from 'react';
import {
	DeclarationsBeforeText,
	DeclarationsAfterText,
	DeclarationsDetachable,
} from '../../declarations';
import RosterTable from './roster-table';
import { createCustomizableLunaticField } from '../../commons';
import HandleRowButton from '../commons/handle-row-button';
import D from '../../../i18n';
import getInitLength from '../commons/get-init-length';

const DEFAULT_MIN_ROWS = 1;
const DEFAULT_MAX_ROWS = 12;

function RosterforLoop({
	valueMap,
	lines,
	handleChange,
	declarations,
	label,
	components,
	executeExpression,
	headers,
	missing,
	shortcut,
	id,
	management,
	custom,
	errors,
}) {
	const min = lines?.min || DEFAULT_MIN_ROWS;
	const max = lines?.max || DEFAULT_MAX_ROWS;
	const [nbRows, setNbRows] = useState(() => getInitLength(valueMap));
	const showButtons = min && max && min !== max;

	const addRow = useCallback(
		function () {
			if (nbRows < max) {
				setNbRows(nbRows + 1);
			}
		},
		[max, nbRows]
	);

	const handleChangeLoop = useCallback(
		function (response, value, args) {
			const v = valueMap[response.name];
			v[args.index] = value;
			handleChange(response, v, { loop: true, length: nbRows }); // TODO: a retaper pour déplacer cette compléxité
		},
		[handleChange, nbRows, valueMap]
	);

	const removeRow = useCallback(
		function () {
			if (nbRows > 1) {
				const newNbRows = nbRows - 1;
				setNbRows(newNbRows);
				Object.entries(valueMap).forEach(([k, v]) => {
					const newValue = v.reduce((acc, e, i) => {
						if (i < newNbRows) return [...acc, e];
						return acc;
					}, []);
					handleChange({ name: k }, newValue);
				});
			}
		},
		[nbRows, handleChange, valueMap]
	);

	if (nbRows > 0) {
		return (
			<>
				<DeclarationsBeforeText
					declarations={declarations}
					id={id}
					custom={custom}
				/>
				<DeclarationsAfterText
					declarations={declarations}
					id={id}
					custom={custom}
				/>
				<RosterTable
					id={id}
					components={components}
					nbRows={nbRows}
					executeExpression={executeExpression}
					header={headers}
					handleChange={handleChangeLoop}
					valueMap={valueMap}
					management={management}
					missing={missing}
					shortcut={shortcut}
					custom={custom}
					errors={errors}
				/>
				<DeclarationsDetachable
					declarations={declarations}
					id={id}
					custom={custom}
				/>
				{showButtons && (
					<>
						<HandleRowButton
							onClick={addRow}
							disabled={nbRows === max}
							custom={custom}
						>
							{label || D.DEFAULT_BUTTON_ADD}
						</HandleRowButton>
						<HandleRowButton
							onClick={removeRow}
							disabled={nbRows === min}
							custom={custom}
						>
							{D.DEFAULT_BUTTON_REMOVE}
						</HandleRowButton>
					</>
				)}
			</>
		);
	}
	return null;
}

export default createCustomizableLunaticField(RosterforLoop);
