import React, { Component } from 'react';
import { BrowserRouter,HashRouter, Route, Switch} from 'react-router-dom'
import Gum from './views/getusermedia/gum'
import Canvas from './views/getusermedia/canvas';
import Filter from './views/getusermedia/filter';
import GetDisplayMedia from './views/getusermedia/getdisplaymedia';
import Record from './views/getusermedia/record';
class App extends Component {
  render() {
    return (
      <div className="App">
      <HashRouter>
        <Switch>
          <Route exact path="/getusermedia/gum" render={() => <Gum />} />
          <Route exact path="/getusermedia/canvas" render={() => <Canvas />} />
          <Route exact path="/getusermedia/filter" render={() => <Filter />} />
          <Route exact path="/getusermedia/record" render={() => <Record />} />
          <Route exact path="/getusermedia/getdisplaymedia" render={() => <GetDisplayMedia />} />
        </Switch>
      </HashRouter>
      </div>
    );
  }
}

export default App;
