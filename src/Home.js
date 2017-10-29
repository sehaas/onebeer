import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import { blue200, blue500, blue900 } from 'material-ui/styles/colors';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { SpeedDial, BubbleList, BubbleListItem } from 'react-speed-dial';
import injectTapEventPlugin from 'react-tap-event-plugin';
import State from './State';
import db from './db';
import {getCurrentPosition} from './Helper';

injectTapEventPlugin();

class Home extends Component {

	constructor(props) {
		super(props);
		State.tab = '0';
		this.state = State;

		this._updatePosition = this._updatePosition.bind(this);
		this._trackBeer = this._trackBeer.bind(this);
		this.handleChangeSpeedDial = this.handleChangeSpeedDial.bind(this);
		//this._locationPromise.promise.then(this._updatePosition, ()=>{});

		this.reloadDrinks();
	}

	async componentDidMount() { 
		this._mounted = true;
		var pos = await getCurrentPosition();
		this._updatePosition(pos);
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	async reloadDrinks() {
		State.drinks = (await db.drinks.toArray()).reverse();
		this._mounted && this.setState(State);
	}

	async _trackBeer(ml) {
		State.isSpeedDialOpen = !State.isSpeedDialOpen;
		this._mounted && this.setState(State);
		var pos = await getCurrentPosition();
		var rld = this.reloadDrinks.bind(this);
		db.drinks.add({
			ml: ml,
			timestamp: new Date(),
			lat: pos.latitude,
			lng: pos.longitude,
		}).then(rld, (err) => { console.log('add failed', err) });
	}


	_updatePosition(pos) {
		State.coords.lat = pos.latitude;
		State.coords.lng = pos.longitude;
		this._mounted && this.setState(State);
	}

	_error(err) {
		console.warn('ERROR(' + err.code + '): ' + err.message);
	}

	handleChangeSpeedDial({ isOpen }) {
		State.isSpeedDialOpen = isOpen;
		this.setState(State);
	}

	render() {
		const that = this;
		const list = {
			items: [
				{
					primaryText: 'Pfiff',
					rightAvatar: <Avatar backgroundColor={blue200} icon={<ContentAdd />}/>,
					onClick() { that._trackBeer(250); },
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
		const fullHeight = {
			height:'calc(100vh - 56px)'
		};
		const moveUp = {
			bottom: '56px'
		};
		return (
			<div style={fullHeight}>
				<div>lat: {this.state.coords.lat}</div>
				<div>lng: {this.state.coords.lng}</div>
				<ul>
				{this.state.drinks.map((b, idx) => 
					<li key={`b-${idx}`}>{b.ml} {b.timestamp.toUTCString()}</li>
				)}
				</ul>
				<SpeedDial isOpen={this.state.isSpeedDialOpen} onChange={this.handleChangeSpeedDial} style={moveUp}>
					<BubbleList>
						{list.items.map((item, index) => {
							return (
								<BubbleListItem key={index} {...item} />);
						})}
					</BubbleList>
				</SpeedDial>
			</div>
		)
	}
}

export default Home;