import React, { Component } from 'react';
import './style.css';
import {TimelineDataSeries, TimelineGraphView} from './graph';

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 0,
    voiceActivityDetection: false
};
export default class Audio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            codecSelector: 'opus' 
        };
        this.pc1 = null;
        this.pc2 = null;
        this.localStream = null;
        this.bitrateGraph = null;
        this.bitrateSeries = null;
        this.packetGraph = null;
        this.packetSeries = null;
        this.lastResult = null;
        this.audio2 = null;
    }

    componentDidMount() {
        this.audio2 = document.querySelector('audio#audio2')

        // query getStats every second
        window.setInterval(() => {
        if (!this.pc1 || !this.bitrateSeries) {
            return;
        }
        const sender = this.pc1.getSenders()[0];
        // The RTCPeerConnection method getSenders() returns an array of RTCRtpSender objects, each of which represents the RTP sender responsible for transmitting one track's data.
        //  A sender object provides methods and properties for examining and controlling the encoding and transmission of the track's data.
        console.log(sender, 'sender');
        sender.getStats().then(res => {
            res.forEach(report => {
            let bytes;
            let packets;
            if (report.type === 'outbound-rtp') {
                if (report.isRemote) {
                return;
                }
                const now = report.timestamp;
                bytes = report.bytesSent;
                packets = report.packetsSent;
                if (this.lastResult && this.lastResult.has(report.id)) {
                // calculate bitrate
                const bitrate = 8 * (bytes - this.lastResult.get(report.id).bytesSent) /
                    (now - this.lastResult.get(report.id).timestamp);
                console.log(bitrate, 'bitrate', this.lastResult.get(report.id));
                // append to chart
                this.bitrateSeries.addPoint(now, bitrate);
                this.bitrateGraph.setDataSeries([this.bitrateSeries]);
                this.bitrateGraph.updateEndDate();

                // calculate number of packets and append to chart
                this.packetSeries.addPoint(now, packets -
                    this.lastResult.get(report.id).packetsSent);
                this.packetGraph.setDataSeries([this.packetSeries]);
                this.packetGraph.updateEndDate();
                }
            }
            });
            this.lastResult = res;
            console.log(res, 'getStats');
        });
        }, 1000);
    }
    call = () => {
        // callButton.disabled = true;
        // codecSelector.disabled = true;
        console.log('Starting call');
        const servers = null;
        this.pc1 = new RTCPeerConnection(servers);
        console.log('Created local peer connection object pc1');
        this.pc1.onicecandidate = e => this.onIceCandidate(this.pc1, e);
        
        this.pc2 = new RTCPeerConnection(servers);
        console.log('Created remote peer connection object pc2');
        this.pc2.onicecandidate = e => this.onIceCandidate(this.pc2, e);
        this.pc2.ontrack = this.gotRemoteStream;

        console.log('Requesting local stream');
        navigator.mediaDevices.getUserMedia({ audio: true, video: false})
            .then(this.gotStream)
            .catch(e => {
                console.error(`getUserMedia() error: ${e.name}`, e);
            });
    }
    hangup = () => {
        console.log('Ending call');
        this.localStream.getTracks().forEach(track => track.stop());
        this.pc1.close();
        this.pc2.close();
        this.pc1 = null;
        this.pc2 = null;
        // hangupButton.disabled = true;
        // callButton.disabled = false;
        // codecSelector.disabled = false;
    }

    gotStream = (stream) => {
        // hangupButton.disabled = false;
        console.log('Received local stream');
        this.localStream = stream;
        const audioTracks = this.localStream.getAudioTracks();
        if (audioTracks.length > 0) {
          console.log(`Using Audio device: ${audioTracks[0].label}`);
        }
        this.localStream.getTracks().forEach(track => this.pc1.addTrack(track, this.localStream));
        console.log('Adding Local Stream to peer connection');
      
        this.pc1.createOffer(offerOptions)
          .then(this.gotDescription1, this.onCreateSessionDescriptionError);
      
        this.bitrateSeries = new TimelineDataSeries();
        this.bitrateGraph = new TimelineGraphView('bitrateGraph', 'bitrateCanvas');
        this.bitrateGraph.updateEndDate();
      
        this.packetSeries = new TimelineDataSeries();
        this.packetGraph = new TimelineGraphView('packetGraph', 'packetCanvas');
        this.packetGraph.updateEndDate();
    }

    gotDescription1 = (desc) => {
        console.log(`Offer from pc1\n${desc.sdp}`);
        this.pc1.setLocalDescription(desc)
          .then(() => {
            desc.sdp = this.forceChosenAudioCodec(desc.sdp);
            this.pc2.setRemoteDescription(desc).then(() => {
              return this.pc2.createAnswer().then(this.gotDescription2, this.onCreateSessionDescriptionError);
            }, this.onSetSessionDescriptionError);
          }, this.onSetSessionDescriptionError);
    }

    onCreateSessionDescriptionError(error) {
        console.log(`Failed to create session description: ${error.toString()}`);
    }
      
      
      
    gotDescription2 = (desc) => {
        console.log(`Answer from pc2\n${desc.sdp}`);
        this.pc2.setLocalDescription(desc).then(() => {
        desc.sdp = this.forceChosenAudioCodec(desc.sdp);
          this.pc1.setRemoteDescription(desc).then(() => {}, this.onSetSessionDescriptionError);
        }, this.onSetSessionDescriptionError);
    }
    gotRemoteStream = (e) => {
        if (this.audio2.srcObject !== e.streams[0]) {
          this.audio2.srcObject = e.streams[0];
          console.log('Received remote stream');
        }
    }
      
    getOtherPc = (pc) => {
        return (pc === this.pc1) ? this.pc2 : this.pc1;
    }
      
    getName = (pc) => {
        return (pc === this.pc1) ? 'pc1' : 'pc2';
    }
      
    onIceCandidate = (pc, event) => {
        this.getOtherPc(pc).addIceCandidate(event.candidate)
          .then(
            () => this.onAddIceCandidateSuccess(pc),
            err => this.onAddIceCandidateError(pc, err)
          );
        console.log(`${this.getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
    }
      
    onAddIceCandidateSuccess() {
        console.log('AddIceCandidate success.');
    }
      
    onAddIceCandidateError(error) {
        console.log(`Failed to add ICE Candidate: ${error.toString()}`);
    }
      
    onSetSessionDescriptionError(error) {
        console.log(`Failed to set session description: ${error.toString()}`);
    }
      
    forceChosenAudioCodec = (sdp) => {
        return this.maybePreferCodec(sdp, 'audio', 'send', this.state.codecSelector);
    }
      
      // Copied from AppRTC's sdputils.js:
      
      // Sets |codec| as the default |type| codec if it's present.
      // The format of |codec| is 'NAME/RATE', e.g. 'opus/48000'.
    maybePreferCodec = (sdp, type, dir, codec) => {
        const str = `${type} ${dir} codec`;
        if (codec === '') {
          console.log(`No preference on ${str}.`);
          return sdp;
        }
      
        console.log(`Prefer ${str}: ${codec}`);
      
        const sdpLines = sdp.split('\r\n');
      
        // Search for m line.
        const mLineIndex = this.findLine(sdpLines, 'm=', type);
        if (mLineIndex === null) {
          return sdp;
        }
      
        // If the codec is available, set it as the default in m line.
        const codecIndex = this.findLine(sdpLines, 'a=rtpmap', codec);
        console.log('codecIndex', codecIndex);
        if (codecIndex) {
          const payload = this.getCodecPayloadType(sdpLines[codecIndex]);
          if (payload) {
            sdpLines[mLineIndex] = this.setDefaultCodec(sdpLines[mLineIndex], payload);
          }
        }
      
        sdp = sdpLines.join('\r\n');
        return sdp;
      }
      
      // Find the line in sdpLines that starts with |prefix|, and, if specified,
      // contains |substr| (case-insensitive search).
    findLine = (sdpLines, prefix, substr) => {
        return this.findLineInRange(sdpLines, 0, -1, prefix, substr);
    }
      
      // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
      // and, if specified, contains |substr| (case-insensitive search).
    findLineInRange = (sdpLines, startLine, endLine, prefix, substr) => {
        const realEndLine = endLine !== -1 ? endLine : sdpLines.length;
        for (let i = startLine; i < realEndLine; ++i) {
          if (sdpLines[i].indexOf(prefix) === 0) {
            if (!substr ||
              sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
              return i;
            }
          }
        }
        return null;
    }
      
      // Gets the codec payload type from an a=rtpmap:X line.
    getCodecPayloadType = (sdpLine) => {
        const pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
        const result = sdpLine.match(pattern);
        return (result && result.length === 2) ? result[1] : null;
    }
      
      // Returns a new m= line with the specified codec as the first one.
    setDefaultCodec = (mLine, payload) => {
        const elements = mLine.split(' ');
      
        // Just copy the first three parameters; codec order starts on fourth.
        const newLine = elements.slice(0, 3);
      
        // Put target payload first and copy in the rest.
        newLine.push(payload);
        for (let i = 3; i < elements.length; i++) {
          if (elements[i] !== payload) {
            newLine.push(elements[i]);
          }
        }
        return newLine.join(' ');
    }
      

    render() {
        return (
            <div>
        <div id="container">

        <h1>
            <a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
            <span>Peer connection: audio only</span>
        </h1>
    
        <div id="audio">
            <div>
                <div className="label">Local audio:</div>
                <audio id="audio1" autoPlay controls muted></audio>
            </div>
            <div>
                <div className="label">Remote audio:</div>
                <audio id="audio2" autoPlay controls></audio>
            </div>
        </div>
    
        <div id="buttons">
            <select id="codec" value={this.state.codecSelector} onChange={(e) => {this.setState({ codecSelector: e.target.value })}}>
                {/* Codec values are matched with how they appear in the SDP.
                For instance, opus matches opus/48000/2 in Chrome, and ISAC/16000
                matches 16K iSAC (but not 32K iSAC). */}
                <option value="opus">Opus</option>
                <option value="ISAC">iSAC 16K</option>
                <option value="G722">G722</option>
                <option value="PCMU">PCMU</option>
            </select>
            <button id="callButton" onClick={this.call}>Call</button>
            <button id="hangupButton" onClick={this.hangup}>Hang Up</button>
        </div>
        <div className="graph-container" id="bitrateGraph">
            <div>Bitrate</div>
            <canvas id="bitrateCanvas"></canvas>
        </div>
        <div className="graph-container" id="packetGraph">
            <div>Packets sent per second</div>
            <canvas id="packetCanvas"></canvas>
        </div>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/peerconnection/audio"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
        <table>
        <caption>Bitrate and Packes sent per second - approximate results in browsers</caption>
        <tbody>
            <tr>
                <th>Opus</th>
                <th>iSAC 16K</th>
                <th>G722</th>
                <th>PCMU</th>
                <th>Browsers Tested</th>
            </tr>
            <tr>
                <td>~40 kbps / Muted : Same, ~50 Packets, Muted : Same or slight drop</td>
                <td>~30 kbps / Muted : Same, ~33 Packets, Muted : Same or slight drop</td>
                <td>~70 kbps / Muted : Same, ~50 Packets, Muted : Same</td>
                <td>~70 kbps / Muted : Same, ~55 Packets, Muted : Same</td>
                <td>Tested in Chrome, Not tested in Opera, Firefox, Safari, Edge</td>
            </tr>
        </tbody>
        
    </table>
    <hr />
    </div>
    </div>
    )
    }
}