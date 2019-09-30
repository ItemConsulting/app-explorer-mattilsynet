import getIn from 'get-value';

import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';

import {getEnonicContext} from '../../enonic/Context';
import {setValue} from '../../enonic/Form';


export function QueryFieldSelector(props) {
	//console.debug('QueryFieldSelector props', props);

	const [context, dispatch] = getEnonicContext();
	//console.debug('QueryFieldSelector context', context);

	const {
		fieldOptions,
		parentPath,
		name = 'field',
		path = parentPath ? `${parentPath}.${name}` : name,
		placeholder='Please select a field',
		value = getIn(context.values, path)
	} = props;
	//console.debug('QueryFieldSelector path', path, 'value', value);

	return <SemanticUiReactDropdown
		onChange={(ignoredEvent,{value: field}) => {
			const newValue = {
				field,
				values: []
			};
			//console.debug('QueryFieldSelector newValue', newValue);
			dispatch(setValue({
				path: parentPath,
				value: newValue
			}));
		}}
		options={fieldOptions}
		value={value}
	/>
} // function QueryFieldSelector
