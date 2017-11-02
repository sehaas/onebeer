import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import moment from 'moment';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { SpeedDial, BubbleList, BubbleListItem } from 'react-speed-dial';
import injectTapEventPlugin from 'react-tap-event-plugin';
import State from './State';
import db from './db';
import {getCurrentPosition, updateState} from './Helper';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';

injectTapEventPlugin();

class Home extends Component {

	constructor(props) {
		super(props);
		this.state = {
			global: State,
			drinks: [],
			overall: 0.0,
			nrDrinks: 0,
			isSpeedDialOpen: false,
			showDelete: false,
		};

		this._updatePosition = this._updatePosition.bind(this);
		this._trackBeer = this._trackBeer.bind(this);
		this.handleChangeSpeedDial = this.handleChangeSpeedDial.bind(this);
		this._deleteDrink = this._deleteDrink.bind(this);

		this.lastId = null;
		this.lastIdCount = 0;
		this.startTouch = this.startTouch.bind(this);
		this.handleClose = this.handleClose.bind(this);
	}

	async componentDidMount() { 
		this._mounted = true;
		this.reloadDrinks();
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	async reloadDrinks() {
		var drinks = (await db.drinks.toArray()).reverse();
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
		this._mounted && this.setState(updateState({
			drinks: drinks,
			overall: overall / 1000,
			nrDrinks: nrDrinks
		}));
	}

	async _trackBeer(ml, af) {
		this._mounted && this.setState(updateState({
			isSpeedDialOpen: !this.state.isSpeedDialOpen
		}));
		var pos = await getCurrentPosition();
		var rld = this.reloadDrinks.bind(this);
		db.drinks.add({
			ml: ml,
			timestamp: new Date(),
			lat: pos.latitude,
			lng: pos.longitude,
			af: af
		}).then(rld, (err) => { console.log('add failed', err) });
		this._updatePosition(pos);
	}

	async _deleteDrink() {
		this.handleClose();
		if (this.lastId) {
			await db.drinks.delete(this.lastId);
			this.reloadDrinks();
		}
	}

	startTouch(id) {
		if (id === this.lastId) {
			if (this.lastIdCount > 5) {
				this.lastIdCount = 0;
				this._mounted && this.setState(updateState({ showDelete: true }));
			} else {
				this.lastIdCount++;
			}
		} else {
			this.lastId = id;
			this.lastIdCount = 1;
		}
	}

	handleClose() {
		this._mounted && this.setState(updateState({ showDelete: false }));
	}

	_updatePosition(pos) {
		State.coords = {
			lat: pos.latitude,
			lng: pos.longitude
		};
		this._mounted && this.setState(updateState({ global: State }));
	}

	_error(err) {
		console.warn('ERROR(' + err.code + '): ' + err.message);
	}

	handleChangeSpeedDial({ isOpen }) {
		this.setState(updateState({isSpeedDialOpen: isOpen}));
	}

	render() {
		const that = this;
		const list = {
			items: [
				{
					primaryText: 'Halbe AF',
					rightAvatar: <Avatar backgroundColor={'#ffd149'} icon={<ContentAdd />}/>,
					onClick() { that._trackBeer(500, true); },
				},
				{
					primaryText: 'Seidl',
					rightAvatar: <Avatar backgroundColor={'#ffa000'} icon={<ContentAdd />}/>,
					onClick() { that._trackBeer(330); },
				},
				{
					primaryText: 'Halbe',
					rightAvatar: <Avatar backgroundColor={'#c67100'} icon={<ContentAdd />}/>,
					onClick() { that._trackBeer(500); },
				},
			],
		};
		const moveUp = {
			bottom: '56px'
		};
		const dayLabel = {
			sameDay: '[Today]',
			nextDay: '[Tomorrow]',
			nextWeek: 'dddd',
			lastDay: '[Yesterday]',
			lastWeek: '[Last] dddd',
			sameElse: 'DD/MM/YYYY'
		};
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
					<span style={{fontSize:'3em'}}>{this.state.overall}</span>
					<span><br/>litres</span>
				</Paper>
				<Paper zDepth={2}
					style={{
						width: '48vw',
						textAlign: 'center',
						display: 'inline-block',
						margin: '1vw'
					}}
				>
					<span style={{fontSize:'3em'}}>{this.state.nrDrinks}</span>
					<span><br/>drinks</span>
				</Paper>
				<List>
				{this.state.drinks.map((day, idx) =>
					<div key={`day-${idx}`}>
						<Subheader>{day.key.calendar(null, dayLabel)}</Subheader>
						{day.list.map((drink, didx) =>
								<ListItem key={`drink-${didx}`}
									onClick={this.startTouch.bind(null, drink.id)}
									leftAvatar={<Avatar backgroundColor={'#718792'}
										icon={<span role="img" aria-label="beer" style={{marginTop:'.75em'}}>🍺</span>} />}
									primaryText={<span>{drink.ml}ml {drink.af? '(AF)' :''}</span>}
									secondaryText={
										<p>{moment(drink.timestamp).format("HH:mm:ss")}</p>
									}
								/>
						)}
						<Divider/>
					</div>
				)}
				</List>
				<SpeedDial isOpen={this.state.isSpeedDialOpen} onChange={this.handleChangeSpeedDial} style={moveUp}>
					<BubbleList>
						{list.items.map((item, index) =>
							<BubbleListItem key={index} {...item} />
						)}
					</BubbleList>
				</SpeedDial>
				<Dialog
					title="Delete Drink"
					actions={[
						<FlatButton
							label="Cancel"
							primary={true}
							onClick={this.handleClose}
						/>,
						<FlatButton
							label="Delete"
							primary={true}
							onClick={this._deleteDrink}
						/>,
					]}
					modal={true}
					open={this.state.showDelete}
					>
					Remove selected drink?
				</Dialog>
			</div>
		)
	}
}

export default Home;