import React, { Component } from 'react';
import './style.css';
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 0
  };

export default class Upgrade extends Component {
    constructor(props){
        super(props);
        this.state = {
            callButton: true,
            hangupButton: true,
            upgradeButton: true,
            startButton: false,
        }
        this.startTime = null;
        this.localVideo = null;
        this.remoteVideo = null;
        this.localStream = null;
        this.pc1 = null;
        this.pc2 = null;
    }

    componentDidMount() {

        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');

        this.localVideo.addEventListener('loadedmetadata', function() {
            console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
        });

        this.remoteVideo.addEventListener('loadedmetadata', function() {
            console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
        });

        this.remoteVideo.onresize = () => {
            console.log(`Remote video size changed to ${this.remoteVideo.videoWidth}x${this.remoteVideo.videoHeight}`);
            console.warn('RESIZE', this.remoteVideo.videoWidth, this.remoteVideo.videoHeight);
            // We'll use the first onsize callback as an indication that video has started
            // playing out.
            if (this.startTime) {
                const elapsedTime = window.performance.now() - this.startTime;
                console.log(`Setup time: ${elapsedTime.toFixed(3)}ms`);
                this.startTime = null;
            }
        };
    }


    start = () => {
        console.log('Requesting local stream');
        this.setState({ startButton: true })
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          }).then(this.gotStream).catch(e => alert(`getUserMedia() error: ${e.name}`));
      }
      
    call = () => {
        this.setState({ callButton: true, upgradeButton: false, hangupButton: false })
        
        console.log('Starting call');
        this.startTime = window.performance.now();
        const audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length > 0) {
          console.log(`Using audio device: ${audioTracks[0].label}`);
        }
        const servers = null;
        this.pc1 = new RTCPeerConnection(servers);
        console.log('Created local peer connection object pc1');
        this.pc1.onicecandidate = e => this.onIceCandidate(this.pc1, e);

        this.pc2 = new RTCPeerConnection(servers);
        console.log('Created remote peer connection object pc2');
        this.pc2.onicecandidate = e => this.onIceCandidate(this.pc2, e);

        // 添加iceconnectionstatechange 
        this.pc1.oniceconnectionstatechange = e => this.onIceStateChange(this.pc1, e);
        this.pc2.oniceconnectionstatechange = e => this.onIceStateChange(this.pc2, e);

        this.pc2.ontrack = this.gotRemoteStream;
      
        this.localStream.getTracks().forEach(track => this.pc1.addTrack(track, this.localStream));
        console.log('Added local stream to pc1');
      
        console.log('pc1 createOffer start');
        this.pc1.createOffer(offerOptions).then(this.onCreateOfferSuccess, this.onCreateSessionDescriptionError);
      }
      
    upgrade = () => {
        this.setState({ upgradeButton: true })
        navigator.mediaDevices.getUserMedia({video: true})
          .then(stream => {
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
              console.log(`Using video device: ${videoTracks[0].label}`);
            }

            this.localStream.addTrack(videoTracks[0]);
            this.localVideo.srcObject = null;
            this.localVideo.srcObject = this.localStream;
            // 更新传输流不需要重新设置RTCPeerConnection，直接创建offer和description，建立answer
            this.pc1.addTrack(videoTracks[0], this.localStream);
            return this.pc1.createOffer();
          })
          .then(offer => this.pc1.setLocalDescription(offer))
          .then(() => this.pc2.setRemoteDescription(this.pc1.localDescription))
          .then(() => this.pc2.createAnswer())
          .then(answer => this.pc2.setLocalDescription(answer))
          .then(() => this.pc1.setRemoteDescription(this.pc2.localDescription));
      }

    hangup = () => {
        console.log('Ending call');
        this.pc1.close();
        this.pc2.close();
        this.pc1 = null;
        this.pc2 = null;
      
        const videoTracks = this.localStream.getVideoTracks();
        videoTracks.forEach(videoTrack => {
          videoTrack.stop();
          this.localStream.removeTrack(videoTrack);
        });
        this.localVideo.srcObject = null;
        this.localVideo.srcObject = this.localStream;
        this.setState({ hangupButton: true, callButton: false })
      }
      
    getName = (pc) => {
        return (pc === this.pc1) ? 'pc1' : 'pc2';
      }
      
    getOtherPc = (pc) => {
        return (pc === this.pc1) ? this.pc2 : this.pc1;
    }
      
    gotStream = (stream) => {
        console.log('Received local stream');
        this.localVideo.srcObject = stream;
        this.localStream = stream;
        this.setState({ callButton: false })
    }
      
      
    onCreateSessionDescriptionError(error) {
        console.log(`Failed to create session description: ${error.toString()}`);
    }
      
    onCreateOfferSuccess = (desc) => {
        console.log(`Offer from pc1\n${desc.sdp}`);
        console.log('pc1 setLocalDescription start');
        this.pc1.setLocalDescription(desc).then(() => this.onSetLocalSuccess(this.pc1), this.onSetSessionDescriptionError);
        console.log('pc2 setRemoteDescription start');
        this.pc2.setRemoteDescription(desc).then(() => this.onSetRemoteSuccess(this.pc2), this.onSetSessionDescriptionError);
        console.log('pc2 createAnswer start');
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        this.pc2.createAnswer().then(this.onCreateAnswerSuccess, this.onCreateSessionDescriptionError);
    }
      
    onSetLocalSuccess = (pc) => {
        console.log(`${this.getName(pc)} setLocalDescription complete`);
    }
      
    onSetRemoteSuccess = (pc) => {
        console.log(`${this.getName(pc)} setRemoteDescription complete`);
    }
      
    onSetSessionDescriptionError(error) {
        console.log(`Failed to set session description: ${error.toString()}`);
    }
      
    gotRemoteStream = (e) => {
        console.log('gotRemoteStream', e.track, e.streams[0]);
      
        // reset srcObject to work around minor bugs in Chrome and Edge.
        this.remoteVideo.srcObject = null;
        this.remoteVideo.srcObject = e.streams[0];
    }
      
    onCreateAnswerSuccess = (desc) => {
        console.log(`Answer from pc2:
      ${desc.sdp}`);
        console.log('pc2 setLocalDescription start');
        this.pc2.setLocalDescription(desc).then(() => this.onSetLocalSuccess(this.pc2), this.onSetSessionDescriptionError);
        console.log('pc1 setRemoteDescription start');
        this.pc1.setRemoteDescription(desc).then(() => this.onSetRemoteSuccess(this.pc1), this.onSetSessionDescriptionError);
    }
      
    onIceCandidate = (pc, event) => {
        this.getOtherPc(pc)
          .addIceCandidate(event.candidate)
          .then(() => this.onAddIceCandidateSuccess(pc), err => this.onAddIceCandidateError(pc, err));
        console.log(`${this.getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
    }
      
    onAddIceCandidateSuccess = (pc) => {
        console.log(`${this.getName(pc)} addIceCandidate success`);
    }
      
    onAddIceCandidateError = (pc, error) => {
        console.log(`${this.getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
    }
      
    onIceStateChange = (pc, event) => {
        if (pc) {
          console.log(`${this.getName(pc)} ICE state: ${pc.iceConnectionState}`);
          console.log('ICE state change event: ', event);
        }
    }

    render() {
        const { callButton, hangupButton, upgradeButton, startButton, } = this.state;
        return (<div id="container">
        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
            <span>Peer connection</span></h1>
    
        <video id="localVideo" playsInline autoPlay muted></video>
        <video id="remoteVideo" playsInline autoPlay></video>
    
        <div>
            <button id="startButton" disabled={startButton} onClick={this.start}>Start</button>
            <button id="callButton" disabled={callButton} onClick={this.call}>Call</button>
            <button id="upgradeButton" disabled={upgradeButton} onClick={this.upgrade}>Turn on video</button>
            <button id="hangupButton" disabled={hangupButton} onClick={this.hangup}>Hang Up</button>
        </div>
    
        <p>View the console to see logging. The <code>MediaStream</code> object <code>localStream</code>, and the <code>RTCPeerConnection</code>
            objects <code>pc1</code> and <code>pc2</code> are in global scope, so you can inspect them in the console as
            well.</p>
    
        <p>For more information about RTCPeerConnection, see <a href="http://www.html5rocks.com/en/tutorials/webrtc/basics/"
                                                                title="HTML5 Rocks article about WebRTC by Sam Dutton">Getting
            Started With WebRTC</a>.</p>
    
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/peerconnection/upgrade"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    </div>)
    }
}