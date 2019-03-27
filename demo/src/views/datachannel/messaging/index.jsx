import React, { Component } from 'react';
import './style.css';

export default class Messaging extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            localMessages: '',
            remoteMessages: '',
            allMessages: '',
            inputLocal:'',
            inputRemote:''
        }
        // this.connected = false;
        this._localConnection = null;
        this._remoteConnection = null;

    }

    disconnect = () => {
        this._localConnection.close();
        this._remoteConnection.close();
    }
    
    connect = async() => {
        console.log('connect!');
        try {
          const dataChannelParams = {ordered: true};
            // 本地RTC
          window.localConnection = this._localConnection = new RTCPeerConnection();
          this._localConnection.addEventListener('icecandidate', async e => {
            console.log('local connection ICE candidate: ', e.candidate);
            await this._remoteConnection.addIceCandidate(e.candidate);
          });
          // 目标RTC
          window.remoteConnection = this._remoteConnection = new RTCPeerConnection();
          this._remoteConnection.addEventListener('icecandidate', async e => {
            console.log('remote connection ICE candidate: ', e.candidate);
            await this._localConnection.addIceCandidate(e.candidate);
          });
          // 本地信道
          window.localChannel = this._localChannel = this._localConnection
            .createDataChannel('messaging-channel', dataChannelParams);
          this._localChannel.binaryType = 'arraybuffer';
          this._localChannel.addEventListener('open', () => {
            console.log('Local channel open!');
            this.setState({ connected: true })
            // this.connected = true;
          });
          this._localChannel.addEventListener('close', () => {
            console.log('Local channel closed!');
            this.setState({ connected: false})
            // this.connected = false;
          });
          this._localChannel.addEventListener('message', this._onLocalMessageReceived);
          // 目标信道
          this._remoteConnection.addEventListener('datachannel', this._onRemoteDataChannel);
    
          const initLocalOffer = async () => {
            const localOffer = await this._localConnection.createOffer();
            console.log(`Got local offer ${JSON.stringify(localOffer)}`);
            const localDesc = this._localConnection.setLocalDescription(localOffer);
            const remoteDesc = this._remoteConnection.setRemoteDescription(localOffer);
            return Promise.all([localDesc, remoteDesc]);
          };
    
          const initRemoteAnswer = async () => {
            const remoteAnswer = await this._remoteConnection.createAnswer();
            console.log(`Got remote answer ${JSON.stringify(remoteAnswer)}`);
            const localDesc = this._remoteConnection.setLocalDescription(remoteAnswer);
            const remoteDesc = this._localConnection.setRemoteDescription(remoteAnswer);
            return Promise.all([localDesc, remoteDesc]);
          };
          // 建立应答
          await initLocalOffer();
          await initRemoteAnswer();
        } catch (e) {
          console.log(e);
        }
    }

      _sendMessage = (input, channel) => {
        const value = this.state[input];
        if (value === '') {
          console.log('Not sending empty message!');
          return;
        }
        console.log('Sending remote message: ', value);
        channel.send(value);
        this.setState({[input]: '' })
      }
    
      _onLocalMessageReceived = (event) => {
        console.log(`Remote message received by local: ${event.data}`);
        let { localMessages, allMessages } = this.state;
        this.setState({
            localMessages: localMessages += event.data + '\n',
            allMessages: allMessages += 'Remote: '+event.data + '\n',
        })
      }
    
      _onRemoteDataChannel = (event) => {
        console.log(`onRemoteDataChannel: ${JSON.stringify(event)}`);
        window.remoteChannel = this._remoteChannel = event.channel;
        this._remoteChannel.binaryType = 'arraybuffer';
        this._remoteChannel.addEventListener('message', this._onRemoteMessageReceived);
        this._remoteChannel.addEventListener('close', () => {
          console.log('Remote channel closed!');
          this.setState({ connected: false });
        //   this.connected = false;
        });
      }
    
      _onRemoteMessageReceived = (event) => {
        console.log(`Local message received by remote: ${event.data}`);
        let { remoteMessages, allMessages } = this.state;
        this.setState({ 
            remoteMessages: remoteMessages += event.data + '\n',
            allMessages: allMessages +=  'Local: '+event.data + '\n'
         })
      }


    render() {
        const { connected, localMessages, remoteMessages, inputLocal, inputRemote, allMessages } = this.state;
        return (<div id="container">

        <h1><a href="https://webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a> <span>Send messages with datachannel</span>
        </h1>
        <section>
    
            <p>This page show how to send text messages via WebRTC datachannels.</p>
    
            <p>Enter a message in one text box and press send and it will be transferred to the "remote" peer over a
                datachannel.</p>
    
        </section>
    
        <div>
            <button disabled={connected} onClick={this.connect}>Connect</button>
            <button disabled={!connected} onClick={this.disconnect}>Disconnect</button>
        </div>

        <div className="messageBox">
            <label htmlFor="localOutgoing">Local outgoing message:</label>
            <textarea className="message" id="localOutgoing" 
            value={inputLocal} onChange={e => {this.setState({ inputLocal: e.target.value })}}
                        placeholder="Local outgoing message goes here."></textarea>
            <button disabled={!connected} onClick={e => this._sendMessage('inputLocal', this._localChannel)} 
                id="sendLocal">Send message from local</button>
        </div>
        {/* <div className="messageBox">
            <label htmlFor="localIncoming">Local incoming messages:</label>
            <textarea className="message" id="localIncoming" disabled 
                value={ allMessages }
                        placeholder="Local incoming messages arrive here."></textarea>
        </div> */}

        <div className="messageBox">
            <label htmlFor="remoteOutgoing">Remote outgoing message:</label>
            <textarea className="message" id="remoteOutgoing" 
                value={inputRemote} onChange={e => { this.setState({ inputRemote: e.target.value }) }}
                        placeholder="Remote outgoing message goes here."></textarea>
            <button disabled={!connected} onClick={e => this._sendMessage('inputRemote', this._remoteChannel)} 
            id="sendRemote">Send message from remote</button>
        </div>
        <div className="messageBox">
            <label htmlFor="remoteIncoming">Remote incoming messages:</label>
            <textarea className="message" id="remoteIncoming" disabled
            value={allMessages}
                        placeholder="Remote incoming messages arrive here."></textarea>
        </div>
    
        <section>
            <p>View the console to see logging.</p>
    
            <p>For more information about RTCDataChannel, see <a
                    href="http://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcdatachannel"
                    title="RTCDataChannel section of HTML5 Rocks article about WebRTC">Getting Started With WebRTC</a>.</p>
        </section>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/datachannel/messaging"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    </div>)
    }
}