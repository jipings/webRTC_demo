import React, { Component } from 'react';
import io from 'socket.io-client';

import '../datachannel/basic/style.css';

export default class SocketRTC extends Component {
    constructor(props){
        super(props);
        this.state = {
            dataChannelSendVal: '',
        }
        this.roomId = this.props.match.params.id;
        this.userId = this.props.match.params.userId;

        this.connection = null;
        this.channel = null;
    }


    componentDidMount() {
        const socket = io.connect('https://localhost:9001');
        console.log(socket, this.props);
        socket.on('rtc-message', (res) => {
            console.log(res, 'custom-message');
            if(res.roomId && res.users && res.users.length > 1) {
                // TODO 建立连接
            }
        });

        socket.emit('rtc-message', {roomId: this.roomId, user: this.userId});

    }

    createConnection = () => {
        const servers = null;
        this.connection = new RTCPeerConnection(servers);
        // 创建信道
        this.channel = this.connection.createDataChannel('sendDataChannel');
        // ice 
        this.connection.onicecandidate = e => {
            // TODO 建立ice连接
            // this.onIceCandidate(this.connection, e);
        }

        this.channel.onopen = () => {console.log('Send channel state is: ' + this.channel.readyState)};
        this.channel.onclose = () => {console.log('Send channel state is: ' + this.channel.readyState)};

        this.connection.ondatachannel = (event) => {
            console.log('Receive Channel Callback');
            // this.receiveChannel = event.channel;
            event.channel.onmessage = (e) => { console.log('Received Message',e); };
            // this.receiveChannel.onopen = this.onReceiveChannelStateChange;
            // this.receiveChannel.onclose = this.onReceiveChannelStateChange;
        }
        // TODO createOffer or createAnswer
        this.connection.createOffer().then(
            this.gotOfferDesc,
            (error) => {console.log('Failed to create session description: ' + error.toString());},
        );

        this.connection.createAnswer().then(
            this.gotDescription
        )
    }

    gotOfferDesc = (desc) => {
        this.connection.setLocalDescription(desc);
        console.log(`Offer from localConnection\n${desc.sdp}`);
        // todo 将sdp发给其他id设置sdp
        // this.remoteConnection.setRemoteDescription(desc);
        // this.remoteConnection.createAnswer().then(
        //     this.gotDescription2,
        //     this.onCreateSessionDescriptionError
        // );
    }

    gotAnswerDesc = (desc) => {
        this.connection.setRemoteDescription(desc);

    }

    onIceCandidate = (pc, event) => {
        this.getOtherPc(pc) 
          .addIceCandidate(event.candidate) // 有可用ice 添加ice到当前pc
          .then(
            () => console.log('AddIceCandidate success.'),
            err =>  console.log(`Failed to add Ice Candidate: ${err.toString()}`)
          );
        console.log(`${this.getName(pc)} ICE candidate: ${event.candidate ? event.candidate.candidate : '(null)'}`);
    }
    render() {
        const { dataChannelSendVal } = this.state;

        return (
        <div className="socket-rtc">
            <div id="sendReceive">
                <div id="send">
                    <h2>Send</h2>
                    <textarea id="dataChannelSend"
                        value={dataChannelSendVal}
                        onChange={e => {this.setState({ dataChannelSendVal: e.target.value })}}
                        placeholder="Press Start, enter some text, then press Send."
                    />
                </div>
            </div>
        </div>)
    }
}