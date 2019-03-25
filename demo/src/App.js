import React, { Component } from 'react';
import { BrowserRouter,HashRouter, Route, Switch} from 'react-router-dom'
import Gum from './views/getusermedia/gum'
import Canvas from './views/getusermedia/canvas';

class App extends Component {
  render() {
    return (
      <div className="App">
      <HashRouter>
        <Switch>
          <Route exact path="/getusermedia/gum" render={() => <Gum />} />
          <Route exact path="/getusermedia/canvas" render={() => <Canvas />} />
        </Switch>
      </HashRouter>
      </div>
    );
  }
}

export default App;
