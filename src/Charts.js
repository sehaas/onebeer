import React, { Component } from 'react';
import db from './db';
import State from './State';
import { updateState } from './Helper';
import { ScatterplotChart, BarChart } from 'react-easy-chart';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import moment from 'moment';

class Charts extends Component {

	constructor(props) {
		super(props);
		this.state = {
			global: State,
			punchcard: [],
			weekdays: [],
			month:[],
			drink:[],
			drinkLiter: [],
			width: 300,
			heightPC: 500,
			heightBar: 300,
		};
	}

	async componentDidMount() {
		this._mounted = true;

		var drinks = await db.drinks.toArray();
		var templates = await db.template.toArray();
		var punchcard = [];
		var weekdays = [];
		var month = [];
		var drink = [];
		var drinkLiter = [];
		var drinkLabel = [];

		for (var d=0; d<7; d++){
			var day = moment().weekday(d).format('ddd');
			weekdays.push({
				x: day,
				y: 0
			});
			for (var i=0; i<24; i++){
				punchcard.push({
					type: 0,
					y: i,
					x: day,
					z: 0
				});
			}
		};

		for(var m=0; m<12; m++) {
			month.push({
				x: moment().month(m).format('MMM'),
				y: 0
			});
		}

		templates.forEach((tmp) => {
			drinkLabel.push(tmp.text);
			drink.push({
				x: tmp.text,
				y: 0
			})
			drinkLiter.push({
				x: tmp.text,
				y: 0
			})
		});

		drinks.forEach((elem) => {
			var date = moment(elem.timestamp);
			var day = date.weekday();
			var hours = date.hour();
			var m = date.month();
			var idx = day * 24 + hours;
			var liter = elem.ml / 1000;
			punchcard[idx].z += liter;
			weekdays[day].y += liter;
			month[m].y += liter;
			drink[drinkLabel.indexOf(elem.text)].y += 1;
			drinkLiter[drinkLabel.indexOf(elem.text)].y += liter;
		});

		punchcard = punchcard.filter( e => e.z > 0 || e.y > 16);

		this._mounted && this.setState(updateState({
			punchcard: punchcard,
			weekdays: weekdays,
			month: month,
			drink: drink,
			drinkLiter: drinkLiter,
			width: this.refs.widthHelper.offsetWidth - 50,
		}));
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render() {
		return (
			<div ref="widthHelper">
				<Card initiallyExpanded={true}>
					<CardHeader
						title="Punchcard"
						actAsExpander={true}
						showExpandableButton={true}
					/>
					<CardText expandable={true}>
						<ScatterplotChart
							data={this.state.punchcard}
							axes
							width={this.state.width}
							height={this.state.heightPC}
							xType="text"
							yDomainRange={[0,23]}
							dotRadius={20}
							grid
							margin={{top: 20, right: 0, bottom: 30, left: 30}}
						/>
					</CardText>
				</Card>
				<Card initiallyExpanded={true}>
					<CardHeader
						title="Weekdays"
						actAsExpander={true}
						showExpandableButton={true}
					/>
					<CardText expandable={true}>
						<BarChart
							data={this.state.weekdays}
							colorBars
							axes
							axisLabels={{y: 'litres'}}
							width={this.state.width}
							height={this.state.heightBar}
							xType="text"
							grid
							margin={{top: 10, right: 0, bottom: 30, left: 50}}
						/>
					</CardText>
				</Card>
				<Card initiallyExpanded={true}>
					<CardHeader
						title="Month"
						actAsExpander={true}
						showExpandableButton={true}
					/>
					<CardText expandable={true}>
						<BarChart
							data={this.state.month}
							colorBars
							axes
							axisLabels={{y: 'litres'}}
							width={this.state.width}
							height={this.state.heightBar}
							xType="text"
							grid
							margin={{top: 10, right: 0, bottom: 30, left: 50}}
						/>
					</CardText>
				</Card>
				<Card initiallyExpanded={true}>
					<CardHeader
						title="Drink"
						actAsExpander={true}
						showExpandableButton={true}
					/>
					<CardText expandable={true}>
						<BarChart
							data={this.state.drinkLiter}
							colorBars
							axes
							axisLabels={{y: 'litres'}}
							width={this.state.width}
							height={this.state.heightBar}
							xType="text"
							grid
							margin={{top: 10, right: 0, bottom: 30, left: 50}}
						/>
					</CardText>
				</Card>
			</div>
		)
	}
}

export default Charts;
