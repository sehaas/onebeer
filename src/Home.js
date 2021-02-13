import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import moment from 'moment';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { SpeedDial, BubbleList, BubbleListItem } from 'react-speed-dial';
import Dialog from 'material-ui/Dialog';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import { amber600, amber500, amber400, amber300, amber200, amber100, amber50 } from 'material-ui/styles/colors';

import db from './db';
import State from './State';
import { getCurrentPosition, updateState, getFilter } from './Helper';

class Home extends Component {

	constructor(props) {
		super(props);
		this.state = {
			global: State,
			templates: [],
			drinks: [],
			overall: 0.0,
			nrDrinks: 0,
			isSpeedDialOpen: false,
			showEdit: false,
			selectedDrink: {},
		};

		this._updatePosition = this._updatePosition.bind(this);
		this._trackBeer = this._trackBeer.bind(this);
		this.handleChangeSpeedDial = this.handleChangeSpeedDial.bind(this);
		this._deleteDrink = this._deleteDrink.bind(this);

		this.lastId = null;
		this.lastIdCount = 0;
		this.startTouch = this.startTouch.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.updateState = updateState.bind(null, this);
		this._updateDate = this._updateDate.bind(this);
		this._updateTime = this._updateTime.bind(this);
		this._updateDrinkPosition = this._updateDrinkPosition.bind(this);
		this._saveDrink = this._saveDrink.bind(this);
	}

	async componentDidMount() {
		this._mounted = true;
		this.reloadDrinks();
		this.reloadTemplates();
	}

	componentWillReceiveProps(props) {
		this.reloadDrinks();
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	async reloadTemplates() {
		var templates = await db.template
			.orderBy('order').reverse()
			.filter((t) => t.active)
			.toArray();
		this._mounted && this.setState(this.updateState({
			templates: templates,
		}));
	}

	async reloadDrinks() {
		var filter = await getFilter(db);
		var drinks = filter != null
			? (await db.drinks.where('timestamp').between(filter.start, filter.end, true, true).toArray()).reverse()
			: (await db.drinks.toArray()).reverse();
		var overall = 0;
		var nrDrinks = drinks.length;
		var data = drinks.reduce((l, e) => {
			overall += e.ml;
			var k = moment(e.timestamp).startOf('day');
			var sec = '' + k.unix();
			l[sec] = l[sec] || {
				key: k,
				list: []
			};
			l[sec].list.push(e);
			return l;
		}, {});
		drinks = [];
		Object.keys(data).reverse().forEach((elem, idx) => {
			drinks.push(data[elem]);
		});
		this._mounted && this.setState(this.updateState({
			drinks: drinks,
			overall: Math.round(overall / 10) / 100,
			nrDrinks: nrDrinks
		}));
	}

	async _trackBeer(item) {
		this._mounted && this.setState(this.updateState({
			isSpeedDialOpen: !this.state.isSpeedDialOpen
		}));
		var pos = await getCurrentPosition();
		var rld = this.reloadDrinks.bind(this);
		db.drinks.add({
			ml: item.ml,
			timestamp: new Date(),
			lat: pos.latitude,
			lng: pos.longitude,
			af: item.af,
			text: item.text,
		}).then(rld, (err) => { console.log('add failed', err) });
		this._updatePosition(pos);
	}

	async _saveDrink() {
		if (this.lastId) {
			await db.drinks.update(this.state.selectedDrink.id, this.state.selectedDrink);
			this.reloadDrinks();
		}
		this.handleClose();
	}

	_updateDrinkPosition(event, value) {
		var target = event.target.id;
		var drink = this.state.selectedDrink;
		drink[target] = value;
		this._mounted && this.setState(this.updateState({
			selectedDrink: drink
		}));
	}

	_updateDate(event, value) {
		var drink = this.state.selectedDrink;
		drink.timestamp.setDate(value.getDate());
		drink.timestamp.setMonth(value.getMonth());
		drink.timestamp.setFullYear(value.getFullYear());
		this._mounted && this.setState(this.updateState({
			selectedDrink: drink
		}));
	}

	_updateTime(event, value) {
		var drink = this.state.selectedDrink;
		drink.timestamp = value;
		this._mounted && this.setState(this.updateState({
			selectedDrink: drink
		}));
	}

	async _deleteDrink() {
		this.handleClose();
		if (this.lastId) {
			await db.drinks.delete(this.lastId);
			this.reloadDrinks();
		}
	}

	startTouch(id, drink) {
		if (id === this.lastId) {
			if (this.lastIdCount >= 2) {
				this.lastIdCount = 0;
				this._mounted && this.setState(this.updateState({
					showEdit: true,
					selectedDrink: drink
				}));
			} else {
				this.lastIdCount++;
			}
		} else {
			this.lastId = id;
			this.lastIdCount = 1;
		}
	}

	handleClose() {
		this._mounted && this.setState(this.updateState({
			showEdit: false,
			selectedDrink: {}
		}));
	}

	_updatePosition(pos) {
		State.coords = {
			lat: pos.latitude,
			lng: pos.longitude
		};
		this._mounted && this.setState(this.updateState({ global: State }));
	}

	_error(err) {
		console.warn('ERROR(' + err.code + '): ' + err.message);
	}

	handleChangeSpeedDial({ isOpen }) {
		this.setState(this.updateState({ isSpeedDialOpen: isOpen }));
	}

	render() {
		const moveUp = {
			bottom: '56px',
			zIndex: 1000
		};
		const dayLabel = {
			sameDay: '[Today]',
			nextDay: '[Tomorrow]',
			nextWeek: 'dddd',
			lastDay: '[Yesterday]',
			lastWeek: '[Last] dddd',
			sameElse: 'DD.MM.YYYY'
		};
		const colors = [amber600, amber500, amber400, amber300, amber200, amber100, amber50];
		return (
			<div>
				<Paper zDepth={2}
					style={{
						width: '48vw',
						textAlign: 'center',
						display: 'inline-block',
						margin: '1vw'
					}}
				>
					<span style={{ fontSize: '3em' }}>{this.state.overall}</span>
					<span><br />litres</span>
				</Paper>
				<Paper zDepth={2}
					style={{
						width: '48vw',
						textAlign: 'center',
						display: 'inline-block',
						margin: '1vw'
					}}
				>
					<span style={{ fontSize: '3em' }}>{this.state.nrDrinks}</span>
					<span><br />drinks</span>
				</Paper>
				<List>
					{this.state.drinks.map((day, idx) =>
						<div key={`day-${idx}`}>
							<Subheader>{day.key.calendar(null, dayLabel)}</Subheader>
							{day.list.map((drink, didx) =>
								<ListItem key={`drink-${didx}`}
									onClick={this.startTouch.bind(null, drink.id, drink)}
									leftAvatar={<Avatar backgroundColor={'#718792'}
										icon={<span role="img" aria-label="beer" style={{ marginTop: '.75em' }}>🍺</span>} />}
									primaryText={<span>{drink.text} ({Math.round(drink.ml)}ml)</span>}
									secondaryText={
										<p>{moment(drink.timestamp).format("HH:mm:ss")}</p>
									}
								/>
							)}
							<Divider />
						</div>
					)}
				</List>
				<SpeedDial isOpen={this.state.isSpeedDialOpen} onChange={this.handleChangeSpeedDial} style={moveUp}>
					<BubbleList>
						{this.state.templates.map((item, index) =>
							<BubbleListItem key={index}
								primaryText={item.text}
								rightAvatar={
									<Avatar
										backgroundColor={colors[Math.min(this.state.templates.length - index, colors.length)]}
										icon={<ContentAdd />}
									/>
								}
								onClick={this._trackBeer.bind(null, item)}
							/>
						)}
					</BubbleList>
				</SpeedDial>
				<Dialog
					title="Edit Drink"
					contentStyle={{
						width: '100%',
						maxWidth: 'none',
					}}
					actions={[
						<FlatButton
							label="Delete"
							secondary={true}
							onClick={this._deleteDrink}
							style={{
								float: 'left',
							}}
						/>,
						<FlatButton
							label="Cancel"
							primary={false}
							onClick={this.handleClose}
						/>,
						<FlatButton
							label="Save"
							primary={true}
							onClick={this._saveDrink}
						/>,
					]}
					modal={true}
					open={this.state.showEdit}
				>
					<TextField
						id="lat"
						floatingLabelText="Latitude"
						fullWidth={true}
						value={this.state.selectedDrink.lat}
						onChange={this._updateDrinkPosition}
					/>
					<TextField
						id="lon"
						floatingLabelText="Longitude"
						fullWidth={true}
						value={this.state.selectedDrink.lng}
						onChange={this._updateDrinkPosition}
					/>
					<DatePicker
						floatingLabelText="Date"
						value={this.state.selectedDrink.timestamp}
						onChange={this._updateDate}
						formatDate={(d) => moment(d).format("DD.MM.YYYY")}
					/>
					<TimePicker
						floatingLabelText="Time"
						value={this.state.selectedDrink.timestamp}
						onChange={this._updateTime}
						format="24hr"
					/>
				</Dialog>
			</div>
		)
	}
}

export default Home;
