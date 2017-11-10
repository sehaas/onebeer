import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import { updateState } from './Helper';

class ThreeDots extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showWhatsNew: false,
		}
		this._mounted = false;
		this._toggleWhatsNew = this._toggleWhatsNew.bind(this);

	}

	componentDidMount() {
		this._mounted = true;
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	_toggleWhatsNew() {
		this._mounted && this.setState(updateState({
			showWhatsNew: !this.state.showWhatsNew
		}));
	}

	render() {
		return (
			<div>
				<IconMenu
					{...this.props}
					iconButtonElement={
						<IconButton><MoreVertIcon /></IconButton>
					}
					targetOrigin={{horizontal: 'right', vertical: 'top'}}
					anchorOrigin={{horizontal: 'right', vertical: 'top'}}
				>
					<MenuItem primaryText="Whats New" onClick={this._toggleWhatsNew} />
				</IconMenu>

				<Dialog
					title="Whats New"
					actions={[
						<FlatButton
							label="OK"
							primary={true}
							onClick={this._toggleWhatsNew}
						/>,
					]}
					modal={false}
					autoScrollBodyContent={true}
					onRequestClose={this._toggleWhatsNew}
					open={this.state.showWhatsNew}
					>

					<div>
						<b>05.11.2017</b>
						<ul>
							<li>Delete entries by tapping it three times</li>
							<li>Add Settings menu</li>
						</ul>
					</div>

				</Dialog>

			</div>
		)
	}
}

export default ThreeDots;