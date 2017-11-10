import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import DownloadIcon from 'material-ui/svg-icons/action/get-app';
import download from 'downloadjs';
import moment from 'moment';

import db from './db';
import {updateState} from './Helper';


class Settings extends Component {

	constructor(props) {
		super(props);
		this.state = {
			templates: [],
			showExport: false,
		};
		this._mounted = false;

		this.toggleTemplate = this.toggleTemplate.bind(this);
		this._toggleExport = this._toggleExport.bind(this);
		this._export = this._export.bind(this);
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

	_toggleExport() {
		this._mounted && this.setState(updateState({
			showExport: !this.state.showExport
		}));
	}

	async _export() {
		this._toggleExport();
		var data = await db.export();
		var dataString = JSON.stringify(data);
		var filename =  "onebeer_" + moment().format("YYYYMMDD-HHmmss") + ".json";
		download(dataString, filename, "application/json");
	}

	render() {
		return (
			<div>
				<List>
					<Subheader>Export</Subheader>
					<ListItem
						primaryText="Export Database"
						rightIcon={<DownloadIcon />}
						onClick={this._toggleExport}
					/>
				</List>
				<Divider />
				<List>
					<Subheader>Configuration '+' Menu</Subheader>
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

				<Dialog
					title="Export"
					actions={[
						<FlatButton
							label="Cancel"
							primary={false}
							onClick={this._toggleExport}
						/>,
						<FlatButton
							label="Download"
							primary={true}
							onClick={this._export}
						/>,
					]}
					modal={false}
					autoScrollBodyContent={true}
					onRequestClose={this._toggleExport}
					open={this.state.showExport}
					>

					You can export all your data and settings as a JSON file. (May not work under iOS)

				</Dialog>
			</div>
		);
	}
}
export default Settings;