import * as React from 'react';
import {
	Button,
	Header,
	Icon,
	Modal,
	Popup
} from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';
import {GQL_MUTATION_API_KEY_DELETE} from '../../../services/graphQL/mutations/apiKeyDeleteMutation';


export const DeleteApiKeyModal = (props :{
	_id :string
	_name :string
	servicesBaseUrl :string
	afterClose? :() => void
	beforeOpen? :() => void
	disabled ?:boolean
	loading ?:boolean
}) => {
	//console.debug('props', props);
	const {
		_id,
		_name,
		servicesBaseUrl,
		afterClose = () => {/**/},
		beforeOpen = () => {/**/},
		disabled = false,
		loading = false
	} = props;
	const [state, setState] = React.useState({
		open: false
	});

	const doClose = () => {
		setState({open: false});
		afterClose();
	};

	// Made doOpen since onOpen doesn't get called consistently.
	const doOpen = () => {
		beforeOpen();
		setState({open: true});
	};

	return <Modal
		closeIcon
		closeOnDimmerClick={false}
		onClose={doClose}
		open={state.open}
		size='tiny'
		trigger={
			<Popup
				content={`Delete API Key ${_name}`}
				inverted
				trigger={
					<HoverButton
						color='red'
						disabled={disabled}
						icon='trash alternate outline'
						loading={loading}
						onClick={doOpen}
					/>
				}
			/>
		}
	>
		<Modal.Header>{`Delete API Key ${_name}`}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {_name}?</Header>
		</Modal.Content>
		<Modal.Actions>
			<Button onClick={doClose}>Cancel</Button>
			<Button
				icon
				onClick={() => {
					fetch(`${servicesBaseUrl}/graphQL`, {
						method: 'POST',
						headers: {
							'Content-Type':	'application/json'
						},
						body: JSON.stringify({
							query: GQL_MUTATION_API_KEY_DELETE,
							variables: {
								_id
							}
						})

					}).then((response) => {
						if (response.status === 200) {doClose();}
						//doClose();
					});
				}}
				primary
			><Icon name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Actions>
	</Modal>;
}; // DeleteApiKeyModal
