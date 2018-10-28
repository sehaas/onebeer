import React, { Component } from 'react';
import db from './db';
import State from './State';
import { updateState } from './Helper';
import { ScatterplotChart, BarChart } from 'react-easy-chart';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import moment from 'moment';
import * as d3 from 'd3';

class Charts extends Component {

	constructor(props) {
		super(props);
		this.state = {
			global: State,
			punchcard: [],
			weekdays: [],
			month:[],
			year:[],
			drink:[],
			drinkLiter: [],
			streak: 0,
			break: 0,
			streakStart: "",
			breakStart: "",
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
		var year = new Array(366).fill(0).map((d, i) => {
			return { x:moment(i+1,'DDD').format('DD-MM-YYYY'), y:0 };
		});
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
			var d = date.dayOfYear();
			var idx = day * 24 + hours;
			var liter = elem.ml / 1000;
			punchcard[idx].z += liter;
			weekdays[day].y += liter;
			month[m].y += liter;
			year[d - 1].y += liter;
			drink[drinkLabel.indexOf(elem.text)].y += 1;
			drinkLiter[drinkLabel.indexOf(elem.text)].y += liter;
		});

		var curStreak = 1;
		var longestStreak = drinks.length > 0
			? { cnt: 1, day: moment(drink[0].timestamp).format('DD.MM.YYYY')}
			: { cnt: 0, day: null };
		var tmpDrinks = d3.pairs(drinks, (a, b) => {
			var aDay = moment(a.timestamp).endOf('day');
			var aDoy = aDay.dayOfYear();
			var bDay = moment(b.timestamp).startOf('day');
			var bDoy = bDay.dayOfYear();
			var diff = bDay.diff(aDay, 'days');
			if (diff === 0) {
				if (aDoy !== bDoy) {
					curStreak++;
				}
				if (curStreak > longestStreak.cnt) {
					longestStreak.cnt = curStreak;
					longestStreak.day = aDay.subtract(curStreak - 1, 'days').format('DD.MM.YYYY');
				}
			} else {
				curStreak = 1;
			}
			return {
				cnt: diff,
				day:  aDay.add(1, 'day').format('DD.MM.YYYY')
			};
		});
		var longestBreak = tmpDrinks[d3.scan(tmpDrinks, (a,b) => b.cnt - a.cnt)] || { cnt: 0, day: null };

		punchcard = punchcard.filter( e => e.z > 0 );

		this._mounted && this.setState(updateState({
			punchcard: punchcard,
			weekdays: weekdays,
			month: month,
			year: year,
			drink: drink,
			drinkLiter: drinkLiter,
			width: this.refs.widthHelper.offsetWidth - 50,
			streak: longestStreak.cnt,
			streakStart: longestStreak.day,
			break: longestBreak.cnt,
			breakStart: longestBreak.day
		}));
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render() {
		return (
			<div ref="widthHelper">
				{this.state.streak > 0 &&
					<Paper zDepth={2}
						style={{
							width: '48vw',
							textAlign: 'center',
							display: 'inline-block',
							margin: '1vw'
						}}
					>
						<span>longest streak<br/></span>
						<span style={{fontSize:'3em'}}>{this.state.streak}</span>
						<span><br/>from {this.state.streakStart}</span>
					</Paper>
				}
				{this.state.break > 0 &&
					<Paper zDepth={2}
						style={{
							width: '48vw',
							textAlign: 'center',
							display: 'inline-block',
							margin: '1vw'
						}}
					>
						<span>longest break<br/></span>
						<span style={{fontSize:'3em'}}>{this.state.break}</span>
						<span><br/>from {this.state.breakStart}</span>
					</Paper>
				}
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
						title="Year"
						actAsExpander={true}
						showExpandableButton={true}
					/>
					<CardText expandable={true}>
						<BarChart
							data={this.state.year}
							colorBars
							axes
							axisLabels={{y: 'litres'}}
							xTickNumber={12}
							barWidth={1}
							xType={'time'}
							datePattern={'%d-%m-%Y'}
							tickTimeDisplayFormat={'%b'}
							width={this.state.width}
							height={this.state.heightBar}
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
