import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FilterListIcon from 'material-ui/svg-icons/content/filter-list';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import WhatsNewIcon from 'material-ui/svg-icons/av/new-releases';

import db from './db';
import { updateState, getFilter } from './Helper';

class ThreeDots extends Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedYear: null,
			years : [],
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
	}

	componentDidMount() {
		this._mounted = true;
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
		var filter = await getFilter(db) || {year: null};
		var yearStart = (await db.drinks.orderBy('timestamp').limit(1).first(f => f ? f.timestamp : new Date())).getFullYear();
		var yearCurr = new Date().getFullYear();
		var years = [];
		for (var i = yearCurr; i >= yearStart; i--) {
			years.push(i);
		}
		this._mounted && this.setState(this.updateState({
			showFilter: true,
			selectedYear: filter.year,
			years : years
		}));
	}

	async _applyFilterDialog() {
		await db.settings.where({key:'yearFilter'}).modify((val, ref) => delete ref.value);
		await db.settings.add({
			key:'yearFilter',
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
					targetOrigin={{horizontal: 'right', vertical: 'top'}}
					anchorOrigin={{horizontal: 'right', vertical: 'top'}}
				>
					<MenuItem primaryText="Settings" onClick={() => history.replace('/settings')} rightIcon={<SettingsIcon/>} />
					<MenuItem primaryText="Whats New" onClick={this._toggleWhatsNew} rightIcon={<WhatsNewIcon/>} />
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
						<b>13.07.2019</b>
						<ul>
							<li>Add year filter</li>
						</ul>
					</div>

					<div>
						<b>24.04.2019</b>
						<ul>
							<li>Fix Import on iPhones</li>
						</ul>
					</div>

					<div>
						<b>23.12.2018</b>
						<ul>
							<li>Add Pints</li>
						</ul>
					</div>

					<div>
						<b>28.10.2018</b>
						<ul>
							<li>Add graph: barchart for each day of a year</li>
							<li>Add longest streak / break</li>
						</ul>
					</div>

					<div>
						<b>29.09.2018</b>
						<ul>
							<li>Add graph: Litres per drink-type</li>
						</ul>
					</div>

					<div>
						<b>13.09.2018</b>
						<ul>
							<li>Fix import of geolocations</li>
							<li>Upgrade libraries</li>
						</ul>
					</div>

					<div>
						<b>22.12.2017</b>
						<ul>
							<li>Import Database (experimental)</li>
						</ul>
					</div>

					<div>
						<b>26.11.2017</b>
						<ul>
							<li>Customize the "+" menu</li>
							<li>Export Database</li>
						</ul>
					</div>

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
