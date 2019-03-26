import React, { Component } from 'react';
import './style.css'
// todo 录屏功能异常以后研究
export default class GetDisplayMedia extends Component {
    constructor(props) {
        super(props);
        this.stream = null;
        this.chunks = [];
        this.mediaRecorder = null;
        this.state = {
            enableStartCapture: true,
            enableStopCapture: false,
            enableDownloadRecording: false,
            status: 'Inactive',
            recording: null,
        }
    }

    _startScreenCapture() {
        if (navigator.getDisplayMedia) {
          return navigator.getDisplayMedia({video: true});
        } else if (navigator.mediaDevices.getDisplayMedia) {
          return navigator.mediaDevices.getDisplayMedia({video: true});
        } else {
          return navigator.mediaDevices.getUserMedia({video: {mediaSource: 'screen'}});
        }
    }

    _startCapturing = async(e) => {
        const { recording, status, enableStartCapture, enableStopCapture, enableDownloadRecording } = this.state;

        console.log('Start capturing.');
        this.setState({ status: 'Screen recording started.', enableStartCapture: false, enableStopCapture: true, enableDownloadRecording: false });
        // this.requestUpdate('buttons');
    
        if (recording) {
          window.URL.revokeObjectURL(recording);
        }
    
        this.chunks = [];
        this.setState({ recording: null })
        this.stream = await this._startScreenCapture();
        this.stream.addEventListener('inactive', e => {
          console.log('Capture stream inactive - stop recording!');
          this._stopCapturing(e);
        });
        this.mediaRecorder = new MediaRecorder(this.stream, {mimeType: 'video/webm'});
        this.mediaRecorder.addEventListener('dataavailable', event => {
          if (event.data && event.data.size > 0) {
            this.chunks.push(event.data);
          }
        });
        this.mediaRecorder.start(10);
      }

      _stopCapturing = (e) => {
        const { recording, status, enableStartCapture, enableStopCapture, enableDownloadRecording } = this.state;

        console.log('Stop capturing.');
        this.setState({ status: 'Screen recorded completed.', enableStartCapture: true, enableStopCapture: false, enableDownloadRecording: true });
    
        this.mediaRecorder.stop();
        this.mediaRecorder = null;
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.setState({ recording:  window.URL.createObjectURL(new Blob(this.chunks, {type: 'video/webm'}))})
      }
    
      _downloadRecording = (e) => {
        console.log('Download recording.');
        this.setState({  enableStartCapture: true, enableStopCapture: false, enableDownloadRecording: false });

        const downloadLink = document.querySelector('a#downloadLink');
        downloadLink.addEventListener('progress', e => console.log(e));
        downloadLink.href = this.recording;
        downloadLink.download = 'screen-recording.webm';
        downloadLink.click();
      }
    render() {
        const { recording, status, enableStartCapture, enableStopCapture, enableDownloadRecording } = this.state;

        return (<div id="container">
        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a> <span>Demo of getDisplayMedia and screen recording</span></h1>
    
        <h4>Screen capturing is currently an experimental feature which is only supported by latest Chrome and Firefox!</h4>
        <p>To enable this feature in Chrome, toggle the Experimental Web Platform feature (See chrome://flags/#enable-experimental-web-platform-features).</p>
        <screen-sharing></screen-sharing>
        <video controls={recording !== null} playsInline autoPlay loop muted src={recording}></video>
        <div>
        <p>Status: {status}</p>
        <button disabled={!enableStartCapture} 
            onClick={this._startCapturing}
        >Start screen capture</button>
        <button disabled={!enableStopCapture}
            onClick={this._stopCapturing}
         >Stop screen capture</button>
        <button disabled={!enableDownloadRecording}
            onClick={this._downloadRecording}
         >Download recording</button>
        <a id="downloadLink" type="video/webm" style={{display: 'none'}}></a>
        </div>
        <p>Display the screensharing stream from <code>getDisplayMedia()</code> in a video element and record the stream.</p>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/getdisplaymedia" title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
      </div>)
    }
}