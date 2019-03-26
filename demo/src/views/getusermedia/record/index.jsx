import React, { Component } from 'react';
import './style.css';

export default class Record extends Component {
    mediaSource = new MediaSource();
    mediaRecorder = null;
    sourceBuffer = null;
    recordedBlobs = [];
    state={ recordStatus: 'Start Recording', playStatus: false,
     downloadStatus: false, errorMsg: ''}
    componentDidMount() {
        this.mediaSource.addEventListener('sourceopen', this.handleSourceOpen, false);
    }
    handleSourceOpen = (event) => {
        console.log('MediaSource opened');
        this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        console.log('Source buffer: ', this.sourceBuffer);
    }
    init = async(constraints) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.handleSuccess(stream);
        } catch (e) {
            console.error('navigator.getUserMedia error:', e);
            this.setState({ errorMsg: `navigator.getUserMedia error:${e.toString()}` })
        }
    }
    handleSuccess = (stream) => {
        this.setState({ recordStatus: 'Start Recording' })
        console.log('getUserMedia() got stream:', stream);
        window.stream = stream;

        const gumVideo = document.querySelector('video#gum');
        gumVideo.srcObject = stream;
    }
    startMedia = async() => {
        const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
        const constraints = {
            audio: {
            echoCancellation: {exact: hasEchoCancellation}
            },
            video: {
                width: 1280, height: 720
            }
        };
        console.log('Using media constraints:', constraints);
        await this.init(constraints);
    }
    playRecord = () => {
        const recordedVideo = document.querySelector('video#recorded');

        const superBuffer = new Blob(this.recordedBlobs, {type: 'video/webm'});
        recordedVideo.src = null;
        recordedVideo.srcObject = null;
        recordedVideo.src = window.URL.createObjectURL(superBuffer);
        recordedVideo.controls = true;
        recordedVideo.play();
    }
    handleDataAvailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedBlobs.push(event.data);
        }
    }
    startRecording = () => {
        this.recordedBlobs = [];
        let options = {mimeType: 'video/webm;codecs=vp9'};
        // 检测浏览器兼容的视频格式
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not Supported`);
          this.setState({ errorMsg:  `${options.mimeType} is not Supported`})
          
          options = {mimeType: 'video/webm;codecs=vp8'};
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`${options.mimeType} is not Supported`);
            this.setState({ errorMsg:  `${options.mimeType} is not Supported`})
            options = {mimeType: 'video/webm'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
              console.error(`${options.mimeType} is not Supported`);
              this.setState({ errorMsg:  `${options.mimeType} is not Supported`})
              options = {mimeType: ''};
            }
          }
        }
      
        try {
            // 创建 MediaRecorder 对象，接入stream
          this.mediaRecorder = new MediaRecorder(window.stream, options);
        } catch (e) {
          console.error('Exception while creating MediaRecorder:', e);
          this.setState({ errorMsg: `Exception while creating MediaRecorder: ${JSON.stringify(e)}`})
          return;
        }
      
        console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
        this.setState({ recordStatus: 'Stop Recording',playStatus: true, downloadStatus: true })

        this.mediaRecorder.onstop = (event) => {
          console.log('Recorder stopped: ', event);
        };
        // 将接受到的流放到recordedBlobs对象内
        this.mediaRecorder.ondataavailable = this.handleDataAvailable;
        this.mediaRecorder.start(10); // collect 10ms of data
        console.log('MediaRecorder started', this.mediaRecorder);
    }

    stopRecording = () => {
        this.mediaRecorder.stop();
        console.log('Recorded Blobs: ', this.recordedBlobs);
    }

    download = () => {
        const blob = new Blob(this.recordedBlobs, {type: 'video/webm'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'test.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
    recordClick = () => {
        const { recordStatus } = this.state;
        if (recordStatus === 'Start Recording') {
            this.startRecording();
        } else {
            this.stopRecording();
            this.setState({ recordStatus: 'Start Recording', playStatus: false, downloadStatus: false });
        }
    }
    render() {

        const { recordStatus, playStatus, downloadStatus } = this.state;

        return (<div id="container">

            <h1>
                <a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
                <span>MediaRecorder</span>
            </h1>
    
            <p>For more information see the MediaStream Recording API 
                <a href="http://w3c.github.io/mediacapture-record/MediaRecorder.html" title="W3C MediaStream Recording API Editor's Draft">Editor's&nbsp;Draft</a>.
            </p>
    
        <video id="gum" playsInline autoPlay muted></video>
        <video id="recorded" playsInline loop style={{marginLeft:'30px'}}></video>
    
        <div>
            <button id="start" onClick={this.startMedia}>Start camera</button>
            <button onClick={this.recordClick}>{recordStatus}</button>
            <button id="play" onClick={this.playRecord}>Play</button>
            <button onClick={this.download}>Download</button>
        </div>
    
        <div>
            <h4>Media Stream Constraints options</h4>
            <p>Echo cancellation: <input type="checkbox" id="echoCancellation" /> </p>
        </div>
    
        <div>
            <span id="errorMsg"></span>
        </div>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/record"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    
    </div>)
    }
}