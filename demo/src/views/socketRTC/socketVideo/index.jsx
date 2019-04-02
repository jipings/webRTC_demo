import React, { Component } from 'react';
import io from 'socket.io-client';

import '../../peerconnection/pc1/style.css'

export default class SocketForVideo extends Component {
    constructor(props){
        super(props);
        this.state = {
            selectValue: 'default',
        };
        this.localVideo = null;
        this.remoteVideo = null;
        this.localStream = null;

        this.offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        };
        this.roomId = this.props.match.params.id;
        this.userId = this.props.match.params.userId;


    }

    componentDidMount() {
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');

        this.socket = io.connect('https://localhost:9001');

        this.socket.on('rtc-message', (res) => {
            console.log(res, 'rtc-message');
            if(res.roomId && res.users && res.users.length > 1) {

            }
        });
    }
    

    start = async() => {
        console.log('Requesting local stream');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            console.log('Received local stream');
            this.localVideo.srcObject = stream;
            this.localStream = stream;
        } catch (e){
            console.warn(`getUserMedia() error: ${e.name}`);
        }
    }




    render() {
        return <div id="container">
        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
            <span>Peer connection</span></h1>
    
        <p>This sample shows how to setup a connection between two peers using
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection">RTCPeerConnection</a>.
            An option to specify the <a href="https://webrtc.org/web-apis/chrome/unified-plan/">SDP semantics</a> for
            the connection is also available (unified-plan, plan-b or default).
        </p>
    
        <video id="localVideo" playsInline autoPlay muted></video>
        <video id="remoteVideo" playsInline autoPlay></video>
    
        <div className="box">
            <button id="startButton" onClick={this.start}>Start</button>
            <button id="callButton" onClick={this.call}>Call</button>
            <button id="hangupButton" onClick={this.hangup}>Hang Up</button>
        </div>
    
        <div className="box">
            <span>SDP Semantics:</span>
            <select id="sdpSemantics" value={this.state.selectValue} onChange={(e) => {this.setState({selectValue: e.target.value})}}>
                <option value="default">Default</option>
                <option value="unified-plan">Unified Plan</option>
                <option value="plan-b">Plan B</option>
            </select>
        </div>
    
    </div>
    }
}