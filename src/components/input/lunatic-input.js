import React, { useCallback } from 'react';
import { FieldContainer, Label } from '../commons';
import Input from './input';
import {
	DeclarationsBeforeText,
	DeclarationsAfterText,
	DeclarationsDetachable,
} from '../declarations';
import './input.scss';

function LunaticInput(props) {
	const { label, id, value, handleChange, response, disabled, declarations } =
		props;

	const onChange = useCallback(
		function (inputValue) {
			if (value !== inputValue) {
				handleChange(response, inputValue);
			}
		},
		[handleChange, response, value]
	);

	const inputId = `lunatic-input-${id}`;
	const labelId = `lunatic-input-label-${id}`;

	return (
		<>
			<DeclarationsBeforeText declarations={declarations} />
			<Label id={labelId} htmlFor={inputId} className={'todo'}>
				{label}
			</Label>
			<DeclarationsAfterText declarations={declarations} />
			<FieldContainer value={value} id={id}>
				<Input
					id={inputId}
					labelledBy={labelId}
					value={value}
					onChange={onChange}
					disabled={disabled}
				/>
			</FieldContainer>
			<DeclarationsDetachable declarations={declarations} />
		</>
	);
}

export default React.memo(LunaticInput);