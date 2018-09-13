import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import DownloadIcon from 'material-ui/svg-icons/action/get-app';
import UploadIcon from 'material-ui/svg-icons/file/file-upload';
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
			showImport: false,
			errorMessage: '',
			importJson: '',
		};
		this._mounted = false;

		this.toggleTemplate = this.toggleTemplate.bind(this);
		this._toggleExport = this._toggleExport.bind(this);
		this._export = this._export.bind(this);
		this._toggleImport = this._toggleImport.bind(this);
		this._import = this._import.bind(this);
		this._updateJson = this._updateJson.bind(this);
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

	_toggleImport() {
		this._mounted && this.setState(updateState({
			showImport: !this.state.showImport
		}));
	}

	_updateJson(event) {
		this._mounted && this.setState(updateState({
			importJson: event.target.value
		}));
	}

	async _export() {
		this._toggleExport();
		var data = await db.export();
		var dataString = JSON.stringify(data);
		var filename =  "onebeer_" + moment().format("YYYYMMDD-HHmmss") + ".json";
		download(dataString, filename, "application/json");
	}

	async _import() {
		try {
			var data = JSON.parse(this.state.importJson);
			var drinks = undefined;
			if (Array.isArray(data)) {
				drinks = data.find((elem) => elem.table === 'drinks');
			}
			if (drinks && drinks.rows) {
				drinks.rows.forEach((drink) => {
					db.drinks.add({
						ml: drink.ml,
						timestamp: drink.timestamp,
						lat: drink.lat,
						lng: drink.lng,
						af: drink.af,
						text: drink.text,
					});
				})
				this._mounted && this.setState(updateState({
					showImport: false,
					importJson: '',
					errorMessage: ''
				}));
			} else {
				this._mounted && this.setState(updateState({
					errorMessage: 'Could not import data. Invalid format.'
				}));
			}

		} catch(e) {
			this._mounted && this.setState(updateState({
				errorMessage: e.message
			}));
		}
	}

	render() {
		return (
			<div>
				<List>
					<Subheader>Export/Import</Subheader>
					<ListItem
						primaryText="Export Database"
						rightIcon={<DownloadIcon />}
						onClick={this._toggleExport}
					/>
					<ListItem
						primaryText="Import Database"
						rightIcon={<UploadIcon />}
						onClick={this._toggleImport}
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

				<Dialog
					title="Import"
					actions={[
						<FlatButton
							label="Cancel"
							primary={false}
							onClick={this._toggleImport}
						/>,
						<FlatButton
							label="Upload"
							primary={true}
							onClick={this._import}
						/>,
					]}
					modal={false}
					autoScrollBodyContent={true}
					onRequestClose={this._toggleImport}
					open={this.state.showImport}
					>

					<TextField
						hintText="Paste JSON Data"
						multiLine={true}
						rows={7}
						rowsMax={7}
						value={this.state.importJson}
						onChange={this._updateJson}
						errorText={this.state.errorMessage}
						/>

				</Dialog>
			</div>
		);
	}
}
export default Settings;
