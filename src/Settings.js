import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import DownloadIcon from 'material-ui/svg-icons/action/get-app';
import UploadIcon from 'material-ui/svg-icons/file/file-upload';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import download from 'downloadjs';
import moment from 'moment';

import db from './db';
import { updateState } from './Helper';


class Settings extends Component {

	constructor(props) {
		super(props);
		this.state = {
			templates: [],
			showExport: false,
			showImport: false,
			showEditDrink: false,
			errorMessage: '',
			importJson: '',
			currentTemplate: {},
		};
		this._mounted = false;

		this._toggleExport = this._toggleExport.bind(this);
		this._export = this._export.bind(this);
		this._toggleImport = this._toggleImport.bind(this);
		this._import = this._import.bind(this);
		this._updateJson = this._updateJson.bind(this);
		this.updateState = updateState.bind(null, this);
		this._newDrink = this._newDrink.bind(this);
		this._editDrink = this._editDrink.bind(this);
		this._saveDrink = this._saveDrink.bind(this);
		this._deleteDrink = this._deleteDrink.bind(this);
		this._updateTemplate = this._updateTemplate.bind(this);
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
		this._mounted && this.setState(this.updateState({
			templates: templates,
		}));
	}

	_toggleExport() {
		this._mounted && this.setState(this.updateState({
			showExport: !this.state.showExport
		}));
	}

	_toggleImport() {
		this._mounted && this.setState(this.updateState({
			showImport: !this.state.showImport
		}));
	}

	_updateJson(event) {
		this._mounted && this.setState(this.updateState({
			importJson: event.target.value
		}));
	}

	_newDrink() {
		this._mounted && this.setState(this.updateState({
			currentTemplate: {
				text: 'Drink',
				ml: 500,
				af: false,
				active: true,
				order: 99
			},
			showEditDrink: true,
			showDeleteDrink: false
		}))
	}

	_editDrink(tmpl) {
		this._mounted && this.setState(this.updateState({
			currentTemplate: tmpl,
			showEditDrink: true,
			showDeleteDrink: true
		}));
	}

	async _deleteDrink(tmpl) {
		await db.template.delete(this.state.currentTemplate.id);
		this._mounted && this.setState(this.updateState({
			showEditDrink: false
		}));
		this.reloadTemplates();
	}

	_updateTemplate(event, value) {
		var target = event.target.id;
		if (target === 'ml' | target === 'order') {
			value = Number(value);
		}
		var tmpl = this.state.currentTemplate;
		tmpl[target] = value;
		this._mounted && this.setState(this.updateState({
			currentTemplate: tmpl
		}));
	}

	async _saveDrink(save) {
		if (save) {
			var tmpl = this.state.currentTemplate;
			if (tmpl.id) {
				await db.template.update(tmpl.id, tmpl);
			} else {
				await db.template.add(tmpl);
			}
		}

		this._mounted && this.setState(this.updateState({
			showEditDrink: false
		}));
		this.reloadTemplates();
	}

	async _export() {
		this._toggleExport();
		var data = await db.export();
		var dataString = JSON.stringify(data);
		var filename = "onebeer_" + moment().format("YYYYMMDD-HHmmss") + ".json";
		download(dataString, filename, "application/json");
	}

	async _import() {
		try {
			var data = JSON.parse(this.state.importJson);
			var drinks = undefined;
			var templates = undefined;
			if (Array.isArray(data)) {
				drinks = data.find((elem) => elem.table === 'drinks');
				templates = data.find((elem) => elem.table === 'template');
			}
			if (drinks && drinks.rows && templates && templates.rows) {
				drinks.rows.forEach((drink) => {
					db.drinks.add({
						ml: drink.ml,
						timestamp: new Date(drink.timestamp),
						lat: drink.lat,
						lng: drink.lng,
						af: drink.af,
						text: drink.text,
					});
				})
				await db.template.clear();
				await db.template.bulkAdd(templates.rows);
				this._mounted && this.setState(this.updateState({
					showImport: false,
					importJson: '',
					errorMessage: ''
				}));
			} else {
				this._mounted && this.setState(this.updateState({
					errorMessage: 'Could not import data. Invalid format.'
				}));
			}

		} catch (e) {
			this._mounted && this.setState(this.updateState({
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
					<Subheader>
						Configuration '+' Menu
						<FlatButton
							label="Add New..."
							primary={true}
							onClick={this._newDrink}
						/>
					</Subheader>
					{this.state.templates.map((tmpl, idx) =>
						<ListItem key={`tmpl-${idx}`}
							primaryText={<span>{tmpl.text}</span>}
							secondaryText={<p>{tmpl.ml}ml{tmpl.af ? ", alcohol free" : ""}{tmpl.active ? "" : ", inactive"}</p>}
							rightIconButton={
								<IconButton onClick={() => this._editDrink(tmpl)} >
									<SettingsIcon />
								</IconButton>
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
						id="importText"
						hintText="Paste JSON Data"
						multiLine={true}
						rows={7}
						rowsMax={7}
						value={this.state.importJson}
						onChange={this._updateJson}
						errorText={this.state.errorMessage}
					/>

				</Dialog>

				<Dialog
					title="Edit drink"
					modal={false}
					autoScrollBodyContent={true}
					onRequestClose={this._toggleEditDrink}
					open={this.state.showEditDrink}
					actions={[
						<FlatButton
							label="Delete"
							primary={false}
							disabled={!this.state.showDeleteDrink}
							onClick={this._deleteDrink}
						/>,
						<FlatButton
							label="Cancel"
							primary={false}
							onClick={() => this._saveDrink(false)}
						/>,
						<FlatButton
							label="Save"
							primary={true}
							onClick={() => this._saveDrink(true)}
						/>,
					]}
				>

					<TextField
						id="text"
						floatingLabelText="Name"
						fullWidth={true}
						value={this.state.currentTemplate.text}
						onChange={this._updateTemplate}
					/>
					<TextField
						id="ml"
						floatingLabelText="Millilitre"
						type="number"
						fullWidth={true}
						value={this.state.currentTemplate.ml}
						onChange={this._updateTemplate}
					/>
					<Toggle
						id="active"
						label="Show in Menu"
						defaultToggled={this.state.currentTemplate.active}
						onToggle={this._updateTemplate}
					/>
					<Toggle
						id="af"
						label="Alcohol free"
						defaultToggled={this.state.currentTemplate.af}
						onToggle={this._updateTemplate}
					/>
					<TextField
						id="order"
						floatingLabelText="Sort order"
						type="number"
						fullWidth={true}
						value={this.state.currentTemplate.order}
						onChange={this._updateTemplate}
					/>
				</Dialog>
			</div>
		);
	}
}
export default Settings;
