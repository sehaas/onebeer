import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
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
		this._mounted && this.setState(updateState({ drinks: drinks}));
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
				<div>d</div>
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