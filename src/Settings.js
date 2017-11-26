import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';

import db from './db';
import {updateState} from './Helper';


class Settings extends Component {

	constructor(props) {
		super(props);
		this.state = {
			templates: [],
		};

		this.toggleTemplate = this.toggleTemplate.bind(this);
	}

	async componentDidMount() { 
		this._mounted = true;
		this.reloadTemplates();
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	async reloadTemplates() {
		var templates = await db.template
			.orderBy('order')
			.toArray();
		this._mounted && this.setState(updateState({
			templates: templates,
		}));
	}

	toggleTemplate(tmpl, event, val) {
		console.log(tmpl.text, val);
		db.template.update(tmpl.id, {active: val});
	}

	render() {
		return (
			<div>
				<List>
					<Subheader>Add Menu</Subheader>
					{this.state.templates.map((tmpl, idx) =>
						<ListItem key={`tmpl-${idx}`}
							primaryText={<span>{tmpl.text}</span>}
							secondaryText={<p>{tmpl.ml}ml{tmpl.af ? ", alcohol free" : ""}</p>}
							rightToggle={
								<Toggle
									defaultToggled={tmpl.active}
									onToggle={this.toggleTemplate.bind(null, tmpl)}
								/>
							}
						/>
					)}
				</List>
				<Divider />
			</div>
		);
	}
}
export default Settings;