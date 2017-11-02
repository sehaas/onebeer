import React, { Component } from 'react';
import {
	HashRouter as Router,
	Route, Switch
} from 'react-router-dom';
import { withRouter } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MaterialIcon from 'react-google-material-icons';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import './App.css';
import Home from './Home';
import Charts from './Charts';
import Heatmap from './Heatmap';

const homeIcon = <MaterialIcon icon="home" className="material-icons" />;
const chartsIcon = <MaterialIcon icon="insert_chart" className="material-icons"/>;
const mapsIcon = <MaterialIcon icon="place" className="material-icons"/>;

const keepDown = {
	position: 'fixed',
	bottom: '0px',
	left: '0px',
	right: '0px'
}

class MainTabs extends Component {
	render() {
		const { location, history } = this.props
		var selectedIndex;
		switch(location.pathname) {
			case '/': selectedIndex = 0; break;
			case '/charts': selectedIndex = 1; break;
			case '/heatmap': selectedIndex = 2; break;
			default: selectedIndex = 0; break;
		}
		return (
				<Paper zDepth={1} style={keepDown}>
					<BottomNavigation selectedIndex={selectedIndex}>
						<BottomNavigationItem
							label="Tracking"
							icon={homeIcon}
							onClick={() => history.replace('/')}
						/>
						<BottomNavigationItem
							label="Charts"
							icon={chartsIcon}
							onClick={() => history.replace('/charts')}
						/>
						<BottomNavigationItem
							label="Heatmap"
							icon={mapsIcon}
							onClick={() => history.replace('/heatmap')}
						/>
					</BottomNavigation>
				</Paper>
			)
	}
}

const MainTabsWithRouter = withRouter(MainTabs);

const ThreeDots = (props) => (
	<IconMenu
		{...props}
		iconButtonElement={
			<IconButton><MoreVertIcon /></IconButton>
		}
		targetOrigin={{horizontal: 'right', vertical: 'top'}}
		anchorOrigin={{horizontal: 'right', vertical: 'top'}}
	>
		<MenuItem primaryText="Refresh" />
		<MenuItem primaryText="Help" />
		<MenuItem primaryText="Sign out" />
	</IconMenu>
);

const muiTheme = getMuiTheme({
	palette: {
		primary1Color: '#ffa000',
		primary2Color: '#ffd149',
		primary3Color: '#c67100',
		accent1Color: '#455a64',
		accent2Color: '#718792',
		accent3Color: '#1c313a',
		textColor: '#1c313a',
		alternateTextColor: '#ffffff',
	},
	appBar: {
		height: 50,
	},
});

class App extends Component {
	render() {
		return (
			<MuiThemeProvider muiTheme={muiTheme}>
				<Router>
					<div style={{marginTop: '50px'}}>
						<AppBar
							title="onebeer"
							showMenuIconButton={false}
							// iconElementRight={<ThreeDots />}
							style={{
								position: 'fixed',
								top: '0px'
							}}
						/>
						<Switch>
							<Route exact path="/" component={Home}/>
							<Route path="/charts" component={Charts}/>
							<Route path="/heatmap" component={Heatmap}/>
						</Switch>
						<MainTabsWithRouter />
					</div>
				</Router>
			</MuiThemeProvider>
		);
	}
}

export default App;
