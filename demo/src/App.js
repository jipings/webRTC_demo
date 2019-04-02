import React, { Component } from 'react';
import { BrowserRouter,HashRouter, Route, Switch} from 'react-router-dom'
import Gum from './views/getusermedia/gum'
import Canvas from './views/getusermedia/canvas';
import Filter from './views/getusermedia/filter';
import GetDisplayMedia from './views/getusermedia/getdisplaymedia';
import Record from './views/getusermedia/record';
import Audio from './views/getusermedia/audio';
import Volume from './views/getusermedia/volume';
import Video2video from './views/capture/video-video';
import VideoContenthint from './views/capture/video-contenthint';

import Basic from './views/peerconnection/pc1';
import Aduio2Peer from './views/peerconnection/audio';
import Upgrade from './views/peerconnection/upgrade';

import ChannelBasic from './views/datachannel/basic';
import Messaging from './views/datachannel/messaging';
import SocketRTC from './views/socketRTC'; // msg socket
import SocketVideo from './views/socketRTC/socketVideo';
import VideoBroad from './views/socketRTC/videoBroad';

class App extends Component {
  render() {
    return (
      <div className="App">
      <HashRouter>
        <Switch>
          <Route exact path="/rtc/socket/VideoBroad/:roomId/:userId" render={ (props) => <VideoBroad {...props} />} />
          <Route exact path="/rtc/socket/video/:id/:userId" render={(props) => <SocketVideo {...props} />} />
          <Route exact path="/rtc/socket/:id/:userId" render={(props) => <SocketRTC {...props} />} />
          <Route exact path="/datachannel/messaging" render={() => <Messaging />} />
          <Route exact path="/datachannel/basic" render={() => <ChannelBasic />} />
          <Route exact path="/peerconnection/upgrade" render={() => <Upgrade />} />
          <Route exact path="/peerconnection/audio" render={() => <Aduio2Peer />} />
          <Route exact path="/capture/video-contenthint" render={() => <VideoContenthint />} />
          <Route exact path="/peerconnection/basic" render={() => <Basic />} />
          <Route exact path="/capture/video-video" render={() => <Video2video />} />
          <Route exact path="/getusermedia/volume" render={() => <Volume />} />
          <Route exact path="/getusermedia/audio" render={() => <Audio />} />
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
