import React, { Component } from 'react';
import io from 'socket.io-client';

import './style.css';
const RTCMultiConnection = window.RTCMultiConnection;

export default class Basic extends Component {
    constructor(props){
        super(props)
        this.state = {

        }
        this.roomId = this.props.match.params.roomId;
        this.userId = this.props.match.params.userId;
        this.video = null;
    }

    componentDidMount() {
        this.video = document.querySelector('#my-player');
        var connection = new RTCMultiConnection();
        connection.socketURL = 'http://localhost:9001/';
        // this.socket = io.connect('http://localhost:9001');

        connection.onstream = (event) => {
            console.log(event, 'onstream');
            this.video.srcObject = event.stream;
        }
        
        connection.socketMessageEvent = 'video-broadcast-demo';

        connection.session = {
            audio: true,
            video: true,
            oneway: true
        };

        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: false
        };
        const self = this;
        console.log(connection)
        
        if(this.userId !== 'admin') {
            connection.join(self.roomId);
        } else {
            connection.open(self.roomId);
        }

    }

    render () {
        return (
            <div className="video_broad">
                
                <video 
                    id="my-player"
                    className="video-js"
                    controls
                    preload="auto"
                    // poster="//vjs.zencdn.net/v/oceans.png"
                    playsInline autoPlay muted
                ></video>
                {/* <button onClick={this.start}>Start</button> */}
            </div>
        )
    }
}