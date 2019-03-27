import React, { Component } from 'react';
import './style.css';

export default class Basic extends Component {
    constructor(props){
        super(props);
        this.state = {
            dataChannelSendVal: '',
            dataChannelReceiveVal: '',
            startButton: false,
            closeButton: true,
            sendButton: true,
        };
        this.localConnection = null;
        this.remoteConnection = null;
        this.sendChannel = null;
        this.receiveChannel = null;

        this.dataChannelSend = null;
        this.dataChannelReceive = null;
    }

    componentDidMount() {

    this.dataChannelSend = document.querySelector('textarea#dataChannelSend');
    this.dataChannelReceive = document.querySelector('textarea#dataChannelReceive');

    }

    createConnection = () => { // start 建立连接
        this.dataChannelSend.placeholder = '';
        const servers = null;
        window.localConnection = this.localConnection = new RTCPeerConnection(servers);
        console.log('Created local peer connection object localConnection');
        // 创建DataChannel send 信道
        this.sendChannel = this.localConnection.createDataChannel('sendDataChannel');
        console.log('Created send data channel');
        // 监听可用的ice，
        this.localConnection.onicecandidate = e => {
          this.onIceCandidate(this.localConnection, e);
        };
        this.sendChannel.onopen = this.onSendChannelStateChange; // 监听信道 打开
        this.sendChannel.onclose = this.onSendChannelStateChange;// 监听信道 关闭
        // 创建目标RTC
        window.remoteConnection = this.remoteConnection = new RTCPeerConnection(servers);
        console.log('Created remote peer connection object remoteConnection');
      
        this.remoteConnection.onicecandidate = e => {
            this.onIceCandidate(this.remoteConnection, e);
        };
        this.remoteConnection.ondatachannel = this.receiveChannelCallback;
        // ondatachannel 属性是一个EventHandler，当这个datachannel事件在RTCPeerConnection发生时，
        // 它指定的那个事件处理函数就会被调用。这个事件继承于 RTCDataChannelEvent，
        // 当远方伙伴调用createDataChannel()时这个事件被加到这个连接（RTCPeerConnection）中。
      // 在这个事件被收到的同时，这个RTCDataChannel 实际上并没有打开，确保在open这个事件在RTCDataChannel触发以后才去使用它。

        this.localConnection.createOffer().then( // 建立应答连接交换sdp
            this.gotDescription1,
            this.onCreateSessionDescriptionError
        );
        
        this.setState({ startButton: true, closeButton: false });
    }

    sendData = () => {
        const data = this.state.dataChannelSendVal;
        this.sendChannel.send(data);
        console.log('Sent Data: ' + data);
    }

    closeDataChannels = () => {
        // 关闭发送和接受信道
        console.log('Closing data channels');
        this.sendChannel.close();
        console.log('Closed data channel with label: ' + this.sendChannel.label);
        this.receiveChannel.close();
        console.log('Closed data channel with label: ' + this.receiveChannel.label);
        // 关闭个自 RTC 连接
        this.localConnection.close();
        this.remoteConnection.close();

        this.localConnection = null;
        this.remoteConnection = null;
        console.log('Closed peer connections');
        
        this.setState({ startButton: false, sendButton: true, closeButton: true,
            dataChannelSendVal: '', dataChannelReceiveVal: '',
         })
    }
      
    onCreateSessionDescriptionError(error) {
        console.log('Failed to create session description: ' + error.toString());
    }
      
    gotDescription1 = (desc) => {
        this.localConnection.setLocalDescription(desc);
        console.log(`Offer from localConnection\n${desc.sdp}`);
        this.remoteConnection.setRemoteDescription(desc);
        this.remoteConnection.createAnswer().then(
            this.gotDescription2,
            this.onCreateSessionDescriptionError
        );
    }
      
    gotDescription2 = (desc) => {
        this.remoteConnection.setLocalDescription(desc);
        console.log(`Answer from remoteConnection\n${desc.sdp}`);
        this.localConnection.setRemoteDescription(desc);
    }
      
    getOtherPc = (pc) => {
        return (pc === this.localConnection) ? this.remoteConnection : this.localConnection;
    }
      
    getName = (pc) => {
        return (pc === this.localConnection) ? 'localPeerConnection' : 'remotePeerConnection';
    }
      
    onIceCandidate = (pc, event) => {
        this.getOtherPc(pc)
          .addIceCandidate(event.candidate) // 有可用ice 添加ice到当前pc
          .then(
            () => this.onAddIceCandidateSuccess(pc),
            err => this.onAddIceCandidateError(pc, err)
          );
        console.log(`${this.getName(pc)} ICE candidate: ${event.candidate ? event.candidate.candidate : '(null)'}`);
    }
      
    onAddIceCandidateSuccess() {
        console.log('AddIceCandidate success.');
    }
      
    onAddIceCandidateError(error) {
        console.log(`Failed to add Ice Candidate: ${error.toString()}`);
    }
      
    receiveChannelCallback = (event) => {
        console.log('Receive Channel Callback');
        this.receiveChannel = event.channel;
        this.receiveChannel.onmessage = this.onReceiveMessageCallback;
        this.receiveChannel.onopen = this.onReceiveChannelStateChange;
        this.receiveChannel.onclose = this.onReceiveChannelStateChange;
    }
      
    onReceiveMessageCallback = (event) => {
        console.log('Received Message',event);
        this.setState({ dataChannelReceiveVal: event.data })
    }
      
    onSendChannelStateChange = () => {
        const readyState = this.sendChannel.readyState;
        console.log('Send channel state is: ' + readyState);
        if (readyState === 'open') {
            this.dataChannelSend.focus();
            this.setState({ sendButton: false, closeButton: false });
        } else {
            this.setState({ sendButton: true, closeButton: true })
        }
    }
      
    onReceiveChannelStateChange = () => {
        const readyState = this.receiveChannel.readyState;
        console.log(`Receive channel state is: ${readyState}`);
    }

    render() {
        const { startButton, sendButton, closeButton,
            dataChannelSendVal, dataChannelReceiveVal, } = this.state;

        return (<div id="container">

        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
            <span>Transmit text</span></h1>
    
        <div id="buttons">
            <button id="startButton" disabled={startButton} onClick={this.createConnection}>Start</button>
            <button id="sendButton" disabled={sendButton} onClick={this.sendData}>Send</button>
            <button id="closeButton" disabled={closeButton} onClick={this.closeDataChannels}>Stop</button>
        </div>
    
        <div id="sendReceive">
            <div id="send">
                <h2>Send</h2>
                <textarea id="dataChannelSend"
                        value={dataChannelSendVal}
                        onChange={e => {this.setState({ dataChannelSendVal: e.target.value })}}
                        placeholder="Press Start, enter some text, then press Send."></textarea>
            </div>
            <div id="receive">
                <h2>Receive</h2>
                <textarea
                    value={dataChannelReceiveVal}

                id="dataChannelReceive" disabled></textarea>
            </div>
        </div>
    
        <p>View the console to see logging.</p>
    
        <p>The <code>RTCPeerConnection</code> objects <code>localConnection</code> and <code>remoteConnection</code> are in
            global scope, so you can inspect them in the console as well.</p>
    
        <p>For more information about RTCDataChannel, see <a
                href="http://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcdatachannel"
                title="RTCDataChannel section of HTML5 Rocks article about WebRTC">Getting Started With WebRTC</a>.</p>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/datachannel/basic"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    </div>);
    }
}