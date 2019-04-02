import React, { Component } from 'react';
import io from 'socket.io-client';

import '../datachannel/basic/style.css';

export default class SocketRTC extends Component {
    constructor(props){
        super(props);
        this.state = {
            dataChannelSendVal: '',
            allMsg: [],
        }
        this.roomId = this.props.match.params.id;
        this.userId = this.props.match.params.userId;

        this.connection = null;
        this.channel = null;
        this.socket = null;
        this.userList = [];
    }


    componentDidMount() {
        this.socket = io.connect('https://localhost:9001');
        console.log(this.socket,);
        this.createConnection();

        this.socket.on('rtc-message', (res) => {
            console.log(res, 'custom-message');
            if(res.roomId && res.users && res.users.length > 1) {
                // TODO 建立连接
                this.userList = res.users;
                // TODO createOffer or createAnswer
                if(this.userId === res.users[0]) { // 第一个用户createOffer
                    this.connection.createOffer().then(
                        this.gotOfferDesc,
                        (error) => {console.log('Failed to create session description: ' + error.toString());},
                    );
                } else {
                    // 必须接受到offer才能answer
                    // this.connection.createAnswer().then(
                    //     this.gotDescription
                    // );
                }
            }
        });

        this.socket.on('rtc-message-desc', (res) => {
            console.log(res, 'rtc-message-desc');
            
            if(res.type === 'Offer' && res.fromUser !== this.userId) {
                this.connection.setRemoteDescription(res.desc).then(res => {
                    // console.log(res, 'setRemoteDescription');
                    this.connection.createAnswer().then(
                        this.gotAnswerDesc,
                        (error) => {console.log('Failed to create session description: ' + error.toString());},
                    )
                })                

            } else if(res.type === 'Answer' && res.fromUser !== this.userId) {
                this.connection.setRemoteDescription(res.desc);

                // this.connection.createAnswer().then(
                //     this.gotAnswerDesc,
                //     (error) => {console.log('Failed to create session description: ' + error.toString());},
                // )
            }
        });

        this.socket.on('rtc-message-ice', (res) => {
            console.log(res, 'rtc-message-ice');
            if(res.userId !== this.userId) {
                this.socket.off('rtc-message-ice');
                this.connection.addIceCandidate(res.candidate) // 有可用ice 添加ice到当前pc
                    .then(
                        () => console.log('AddIceCandidate success.'),
                        err =>  console.log(`Failed to add Ice Candidate: ${err.toString()}`)
                    );
                console.log(`ICE candidate: ${res.candidate ? res.candidate.candidate : '(null)'}`);
            }
        })

        this.socket.emit('rtc-message', {roomId: this.roomId, user: this.userId});

    }

    createConnection = () => {
        const servers = null;
        this.connection = new RTCPeerConnection(servers);
        // 创建信道
        this.channel = this.connection.createDataChannel('sendDataChannel');
        // ice 
        this.connection.onicecandidate = e => {
            console.log(e, 'onicecandidate');
            // TODO 建立ice连接
            this.onIceCandidate(this.connection, e);
        }

        this.channel.onopen = () => {console.log('Send channel state is: ' + this.channel.readyState)};
        this.channel.onclose = () => {console.log('Send channel state is: ' + this.channel.readyState)};

        this.connection.ondatachannel = (event) => {
            console.log('Receive Channel Callback');
            // this.receiveChannel = event.channel;
            event.channel.onmessage = (e) => {
                // 暂时支持2人
                const { data } = e;
                let otherOne = null;
                this.userList.forEach((x) => {
                    if(x !== this.userId) {
                        otherOne= x
                    }
                });
                const { allMsg } = this.state;
                this.setState({ allMsg: [...allMsg, {userId: otherOne, msg: data}] });

                console.log('Received Message', e.data);
            };
            // this.receiveChannel.onopen = this.onReceiveChannelStateChange;
            // this.receiveChannel.onclose = this.onReceiveChannelStateChange;
        } 
    }

    gotOfferDesc = (desc) => {
        this.connection.setLocalDescription(desc);
        console.log(`Offer from localConnection\n${desc.sdp}`);
        // todo 将sdp发给其他id设置sdp
        this.socket.emit('rtc-message-desc', { desc, type: 'Offer', fromUser: this.userId});
        // this.remoteConnection.setRemoteDescription(desc);
        // this.remoteConnection.createAnswer().then(
        //     this.gotDescription2,
        //     this.onCreateSessionDescriptionError
        // );
    }

    gotAnswerDesc = (desc) => {
        this.connection.setLocalDescription(desc);
        this.socket.emit('rtc-message-desc', { desc, type: 'Answer', fromUser: this.userId});
    }

    onIceCandidate = (pc, event) => {
        this.socket.emit('rtc-message-ice', { userId: this.userId, candidate:  event.candidate});
    }
    sendChannelMsg = () => {
        const { dataChannelSendVal, allMsg } = this.state;
        if(dataChannelSendVal) {
            this.channel.send(dataChannelSendVal);
            this.setState({ dataChannelSendVal: '', allMsg: [...allMsg, {userId: this.userId, msg: dataChannelSendVal}] })
        }
        
    }
    render() {
        const { dataChannelSendVal, allMsg } = this.state;
        let allMsgStr = '';

        // allMsg.forEach(x => {
        //     allMsgStr += `${x.userId}: ${x.msg} \n`;
        // })

        return (
        <div className="socket-rtc">
            <div id="sendReceive">
                <div id="send">
                    <h2 onClick={this.sendChannelMsg}>Send</h2>
                    <textarea id="dataChannelSend"
                        value={dataChannelSendVal}
                        onChange={e => {this.setState({ dataChannelSendVal: e.target.value })}}
                        placeholder="Press Start, enter some text, then press Send."
                    />
                </div>
                
            </div>
            <div> { allMsg.map(x => <div key={Math.random()}>{x.userId}:{x.msg}</div>) } </div>
        </div>)
    }
}