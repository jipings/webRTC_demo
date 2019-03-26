import React, { Component } from 'react';
import './style.css';

export default class BasicPeer extends Component {
    constructor(props){
        super(props); 
        this.state = {
            selectValue: 'default',

        }
        this.localVideo = null;
        this.remoteVideo = null;
        this.localStream = null;
        this.startTime = null;
        this.pc1 = null;
        this.pc2 = null;
        this.offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
          };
    }
    componentDidMount() {
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
    }
    start = async() => {
        console.log('Requesting local stream');
        // startButton.disabled = true;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
          console.log('Received local stream');
          this.localVideo.srcObject = stream;
          this.localStream = stream;
        //   callButton.disabled = false;
        } catch (e) {
          alert(`getUserMedia() error: ${e.name}`);
        }
    }
    hangup = () => {
        console.log('Ending call');
        this.pc1.close();
        this.pc2.close();
        this.pc1 = null;
        this.pc2 = null;
        // hangupButton.disabled = true;
        // callButton.disabled = false;
    }      
    call = async() => {
        // callButton.disabled = true;
        // hangupButton.disabled = false;
        console.log('Starting call');
        this.startTime = window.performance.now();
        const videoTracks = this.localStream.getVideoTracks();
        const audioTracks = this.localStream.getAudioTracks();
        if (videoTracks.length > 0) {
          console.log(`Using video device: ${videoTracks[0].label}`);
        }
        if (audioTracks.length > 0) {
          console.log(`Using audio device: ${audioTracks[0].label}`);
        }
        const configuration = this.state.selectValue === 'default' ? {} : {sdpSemantics: this.state.selectValue};
        console.log('RTCPeerConnection configuration:', configuration);
        this.pc1 = new RTCPeerConnection(configuration);
        console.log('Created local peer connection object pc1');
        this.pc1.addEventListener('icecandidate', e => this.onIceCandidate(this.pc1, e));
        this.pc2 = new RTCPeerConnection(configuration);
        console.log('Created remote peer connection object pc2');
        this.pc2.addEventListener('icecandidate', e => this.onIceCandidate(this.pc2, e));
        this.pc1.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(this.pc1, e));
        this.pc2.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(this.pc2, e));
        this.pc2.addEventListener('track', this.gotRemoteStream);
      
        this.localStream.getTracks().forEach(track => this.pc1.addTrack(track, this.localStream));
        console.log('Added local stream to pc1');
      
        try {
          console.log('pc1 createOffer start');
          const offer = await this.pc1.createOffer(this.offerOptions);
          await this.onCreateOfferSuccess(offer);
        } catch (e) {
          this.onCreateSessionDescriptionError(e);
        }
      }
    onIceStateChange = (pc, event) => {
        if (pc) {
          console.log(`${this.getName(pc)} ICE state: ${pc.iceConnectionState}`);
          console.log('ICE state change event: ', event);
        }
      }
    onCreateOfferSuccess = async(desc) => {
        console.log(`Offer from pc1\n${desc.sdp}`);
        console.log('pc1 setLocalDescription start');
        try {
          await this.pc1.setLocalDescription(desc);
          this.onSetLocalSuccess(this.pc1);
        } catch (e) {
          this.onSetSessionDescriptionError();
        }
      
        console.log('pc2 setRemoteDescription start');
        try {
          await this.pc2.setRemoteDescription(desc);
          this.onSetRemoteSuccess(this.pc2);
        } catch (e) {
          this.onSetSessionDescriptionError();
        }
      
        console.log('pc2 createAnswer start');
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        try {
          const answer = await this.pc2.createAnswer();
          await this.onCreateAnswerSuccess(answer);
        } catch (e) {
          this.onCreateSessionDescriptionError(e);
        }
      }
    onCreateAnswerSuccess = async(desc) => {
        console.log(`Answer from pc2:\n${desc.sdp}`);
        console.log('pc2 setLocalDescription start');
        try {
          await this.pc2.setLocalDescription(desc);
          this.onSetLocalSuccess(this.pc2);
        } catch (e) {
          this.onSetSessionDescriptionError(e);
        }
        console.log('pc1 setRemoteDescription start');
        try {
          await this.pc1.setRemoteDescription(desc);
          this.onSetRemoteSuccess(this.pc1);
        } catch (e) {
          this.onSetSessionDescriptionError(e);
        }
      }
    onSetLocalSuccess = (pc) => {
        console.log(`${this.getName(pc)} setLocalDescription complete`);
    }
      
    onSetSessionDescriptionError = (error) => {
        console.log(`Failed to set session description: ${error.toString()}`);
    }
    onCreateSessionDescriptionError = (error) => {
        console.log(`Failed to create session description: ${error.toString()}`);
    }
    onSetRemoteSuccess(pc) {
        console.log(`${this.getName(pc)} setRemoteDescription complete`);
    }
    gotRemoteStream = (e) => {
        if (this.remoteVideo.srcObject !== e.streams[0]) {
            this.remoteVideo.srcObject = e.streams[0];
            console.log('pc2 received remote stream');
        }
    }
    getOtherPc = (pc) => {
        return (pc === this.pc1) ? this.pc2 : this.pc1;
    }
    onAddIceCandidateSuccess(pc) {
        console.log(`${this.getName(pc)} addIceCandidate success`);
    }
    getName = (pc) => {
        return (pc === this.pc1) ? 'pc1' : 'pc2';
    }
    onIceCandidate = async(pc, event) =>{
        try {
            await (this.getOtherPc(pc).addIceCandidate(event.candidate));
            this.onAddIceCandidateSuccess(pc);
        } catch (e) {
            this.onAddIceCandidateError(pc, e);
        }
        console.log(`${this.getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
    }
    onAddIceCandidateError = (pc, error) => {
        console.log(`${this.getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
    }
    
    render() {
        return (<div id="container">
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
    
        <p>View the console to see logging. The <code>MediaStream</code> object <code>localStream</code>, and the <code>RTCPeerConnection</code>
            objects <code>pc1</code> and <code>pc2</code> are in global scope, so you can inspect them in the console as
            well.</p>
    
        <p>For more information about RTCPeerConnection, see <a href="http://www.html5rocks.com/en/tutorials/webrtc/basics/"
                                                                title="HTML5 Rocks article about WebRTC by Sam Dutton">Getting
            Started With WebRTC</a>.</p>
    
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/peerconnection/pc1"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    
    </div>)
    }
}