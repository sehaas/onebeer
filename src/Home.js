import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import moment from 'moment';
import { blue200, blue500, blue900 } from 'material-ui/styles/colors';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { SpeedDial, BubbleList, BubbleListItem } from 'react-speed-dial';
import injectTapEventPlugin from 'react-tap-event-plugin';
import State from './State';
import db from './db';
import {getCurrentPosition, updateState} from './Helper';

injectTapEventPlugin();

class Home extends Component {

	constructor(props) {
		super(props);
		this.state = {
			global: State,
			drinks: [],
			isSpeedDialOpen: false
		};

		this._updatePosition = this._updatePosition.bind(this);
		this._trackBeer = this._trackBeer.bind(this);
		this.handleChangeSpeedDial = this.handleChangeSpeedDial.bind(this);
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
		var data = drinks.reduce((l, e) => {
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
		this._mounted && this.setState(updateState({ drinks: drinks }));
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
					rightAvatar: <Avatar backgroundColor={blue200} icon={<ContentAdd />}/>,
					onClick() { that._trackBeer(500, true); },
				},
				{
					primaryText: 'Seidl',
					rightAvatar: <Avatar backgroundColor={blue500} icon={<ContentAdd />}/>,
					onClick() { that._trackBeer(330); },
				},
				{
					primaryText: 'Halbe',
					rightAvatar: <Avatar backgroundColor={blue900} icon={<ContentAdd />}/>,
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
				<List>
				{this.state.drinks.map((day, idx) =>
					<div key={`day-${idx}`}>
						<Subheader>{day.key.calendar(null, dayLabel)}
						</Subheader>
						{day.list.map((drink, didx) =>
							<ListItem key={`d-${didx}`}
								primaryText={
									<div>
										<span role="img" aria-label="beer">🍺</span>
										<span> {drink.ml}ml {moment(drink.timestamp).format("HH:mm:ss")}</span>
									</div>
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
			</div>
		)
	}
}

export default Home;