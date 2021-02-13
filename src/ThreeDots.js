import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import moment from 'moment';
import FilterListIcon from 'material-ui/svg-icons/content/filter-list';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import WhatsNewIcon from 'material-ui/svg-icons/av/new-releases';

import db from './db';
import { updateState, getFilter, checkAppVersion } from './Helper';

class ThreeDots extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedYear: null,
			years: [],
			whatsnew: [],
			showWhatsNew: false,
			showFilter: false
		}

		this._mounted = false;
		this._toggleWhatsNew = this._toggleWhatsNew.bind(this);
		this._openFilterDialog = this._openFilterDialog.bind(this);
		this._closeFilterDialog = this._closeFilterDialog.bind(this);
		this._applyFilterDialog = this._applyFilterDialog.bind(this);
		this._handleChange = this._handleChange.bind(this);
		this.updateState = updateState.bind(null, this);

		this.whatsnew = {
			"2021-01-10": ["Edit tracked drinks: Triple click a drink to edit date, time, and location."],
			"2020-11-08": ["Customize trackable drinks"],
			"2019-07-13": ["Add year filter"],
			"2019-04-24": ["Fix Import on iPhones"],
			"2018-12-23": ["Add Pints"],
			"2018-10-28": ["Add graph: barchart for each day of a year", "Add longest streak / break"],
			"2018-09-29": ["Add graph: Litres per drink-type"],
			"2018-09-13": ["Fix import of geolocations", "Upgrade libraries"],
			"2017-12-22": ["Import Database (experimental)"],
			"2017-11-26": ["Customize the '+' menu", "Export Database"],
			"2017-11-05": ["Delete entries by tapping it three times", "Add Settings menu"]
		};
	}

	async componentDidMount() {
		this._mounted = true;
		var showDlg = await checkAppVersion(db, Object.keys(this.whatsnew)[0]);
		this.setState(this.updateState({
			showWhatsNew: showDlg,
			whatsnew: Object.entries(this.whatsnew)
		}));
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	_toggleWhatsNew() {
		this._mounted && this.setState(this.updateState({
			showWhatsNew: !this.state.showWhatsNew,
		}));
	}

	async _openFilterDialog() {
		var filter = await getFilter(db) || { year: null };
		var yearStart = (await db.drinks.orderBy('timestamp').limit(1).first(f => f ? f.timestamp : new Date())).getFullYear();
		var yearCurr = new Date().getFullYear();
		var years = [];
		for (var i = yearCurr; i >= yearStart; i--) {
			years.push(i);
		}
		this._mounted && this.setState(this.updateState({
			showFilter: true,
			selectedYear: filter.year,
			years: years
		}));
	}

	async _applyFilterDialog() {
		await db.settings.where({ key: 'yearFilter' }).modify((val, ref) => delete ref.value);
		await db.settings.add({
			key: 'yearFilter',
			value: this.state.selectedYear
		});
		this._mounted && this.setState(this.updateState({
			showFilter: false
		}));
		this.props.applyFilter();
	}

	_closeFilterDialog() {
		this._mounted && this.setState(this.updateState({
			showWhatsNew: this.state.showWhatsNew,
			showFilter: false
		}));
	}

	async _handleChange(event, idx, year) {
		this._mounted && this.setState(this.updateState({
			selectedYear: year
		}));
	}

	render() {
		const { history } = this.props;
		return (
			<div>
				<IconButton onClick={this._openFilterDialog} >
					<FilterListIcon />
				</IconButton>

				<IconMenu
					iconButtonElement={
						<IconButton><MoreVertIcon /></IconButton>
					}
					targetOrigin={{ horizontal: 'right', vertical: 'top' }}
					anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
				>
					<MenuItem primaryText="Settings" onClick={() => history.replace('/settings')} rightIcon={<SettingsIcon />} />
					<MenuItem primaryText="Whats New" onClick={this._toggleWhatsNew} rightIcon={<WhatsNewIcon />} />
				</IconMenu>

				<Dialog
					title="Filter Time Range"
					modal={true}
					open={this.state.showFilter}
					actions={[
						<FlatButton
							label="Cancel"
							onClick={this._closeFilterDialog}
						/>,
						<FlatButton
							label="OK"
							primary={true}
							onClick={this._applyFilterDialog}
						/>
					]}
				>
					<SelectField floatingLabelText="Filter by year"
						value={this.state.selectedYear} onChange={this._handleChange}>
						<MenuItem value={null} label=" " primaryText="no filter" />
						{this.state.years.map(y =>
							<MenuItem key={y} value={y} primaryText={y} />
						)}
					</SelectField>
				</Dialog>
				<Dialog
					title="Whats New"
					actions={[
						<FlatButton
							href="https://paypal.me/sehaas"
							target="_blank"
							label="Buy me a 🍺"
							secondary={true}
							style={{
								float: 'left',
							}}
						/>,
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
					<List>
						{this.state.whatsnew.map(([date, list]) =>
							<div key={date}>
								<Subheader>{moment(date).format("DD.MM.YYYY")}</Subheader>
								{list.map((entry, didx) =>
									<ListItem key={`${date}-${didx}`}
										primaryText={<span>{entry}</span>}
									/>
								)}
								<Divider />
							</div>
						)}
					</List>
				</Dialog>

			</div>
		)
	}
}

export default ThreeDots;
