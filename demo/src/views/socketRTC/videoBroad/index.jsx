import React, { Component } from 'react';
import io from 'socket.io-client';

import './style.css';
export default class VideoBroad extends Component {
    constructor(props){
        super(props)
        this.state = {

        }
        this.roomId = this.props.match.params.roomId;
        this.userId = this.props.match.params.userId;
        this.video = null;
        this.stream = null;
        this.connection = null;
        this.offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1,
        };
        this.userList = [];
        this.socket = null;

    }

    componentDidMount() {
        this.video = document.querySelector('#videoBroad');

        const servers = null;
        this.connection = new RTCPeerConnection(servers);
        this.connection.onicecandidate = (e) => this.onIceCandidate(this.connection, e);
        this.socket = io.connect('http://localhost:9001');

        this.socket.emit('rtc-message', {roomId: this.roomId, user: this.userId});

        this.socket.on('rtc-message', (res) => {
            console.log(res, 'rtc-message');
            if(res.roomId !== this.roomId) {
                return
            }
            if(res.roomId && res.users && res.users.length > 1) {
                
                if(this.userId === res.users[0]) {

                    this.userList = res.users;
                    if(this.userId === res.users[0]) { 
                        this.connection.createOffer(this.offerOptions).then(
                            this.gotOfferDesc,
                            (error) => {console.log('Failed to create session description: ' + error.toString());},
                        )
                    };

                }
                
            } else {
                this.start();
            };
        });

        this.socket.on('rtc-message-desc', (res) => {
            console.log(res, 'rtc-message-desc');
            if(res.type === 'Offer' && res.fromUser !== this.userId) {
                this.connection.setRemoteDescription(res.desc)
 
                this.connection.createAnswer().then(
                    this.gotAnswerDesc,
                    (error) => {console.log('Failed to create session description: ' + error.toString());},
                )   

            } else if(res.type === 'Answer' && res.fromUser !== this.userId) {
                this.connection.setRemoteDescription(res.desc);

            }
            
        });
        // ice
        this.socket.on('rtc-message-ice', (res) => {
            console.log(res, 'rtc-message-ice');
            if(res.userId !== this.userId) {
                // this.socket.off('rtc-message-ice');
                this.connection.addIceCandidate(res.candidate) 
                    .then(
                        () => console.log('AddIceCandidate success.'),
                        err =>  console.log(`Failed to add Ice Candidate: ${err.toString()}`)
                    );
                console.log(`ICE candidate: ${res.candidate ? res.candidate.candidate : '(null)'}`);
            }

            this.connection.addEventListener('track', this.gotRemoteStream)
        });    
    }

    gotRemoteStream = (e) => {
        if(this.video.srcObject !== e.streams[0]) {
            this.video.srcObject = e.streams[0];
            console.log('remote video got stream', e);
        }
    }

    gotOfferDesc = (desc) => {
        this.connection.setLocalDescription(desc);
        console.log(`Offer from localConnection\n${desc.sdp}`);
        // todo 将sdp发给其他id设置sdp
        this.socket.emit('rtc-message-desc', { desc, type: 'Offer', fromUser: this.userId});
    }

    gotAnswerDesc = (desc) => {
        this.connection.setLocalDescription(desc);
        this.socket.emit('rtc-message-desc', { desc, type: 'Answer', fromUser: this.userId});
    }

    onIceCandidate = (pc, event) => {
        this.socket.emit('rtc-message-ice', { userId: this.userId, candidate:  event.candidate});
    }


    createConnection = () => {
        this.stream && this.stream.getTracks().forEach(track => {
            console.log(track, 'track');
            this.connection.addTrack(track, this.stream);
        });

    }

    start = async(callback) => {
        console.log('Requesting local stream');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
          console.log('Received local stream', stream);
          this.video.srcObject = stream;
          this.stream = stream;
          this.createConnection();
          callback && callback()
        } catch (e) {
          console.error(`getUserMedia() error: ${e.name}`);
        }
    }

    render() {
        return (
            <div className="video_broad">
                
                <video id="videoBroad" playsInline autoPlay muted></video>
                {/* <button onClick={this.start}>Start</button> */}
            </div>
        )
    }
}