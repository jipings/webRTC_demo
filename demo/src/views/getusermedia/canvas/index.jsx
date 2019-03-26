import React, { Component } from 'react';

export default class ToCanvas extends Component {
    constraints = {
        audio: false,
        video: true
    };

    componentDidMount() {

        const video = document.querySelector('video');
        function handleSuccess(stream) {
        window.stream = stream; // make stream available to browser console
        video.srcObject = stream;
        }

        function handleError(error) {
            console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
        }

        navigator.mediaDevices.getUserMedia(this.constraints).then(handleSuccess).catch(handleError);
    }
    drawCanvas = () => {
        const video = document.querySelector('video');
        const canvas = window.canvas = document.querySelector('canvas');
        canvas.width = 480;
        canvas.height = 360;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    render() {
        return (<div id="container">

        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a> <span>getUserMedia ⇒ canvas</span>
        </h1>
    
        <video playsInline autoPlay></video>
        <button onClick={this.drawCanvas}>Take snapshot</button>
        <canvas></canvas>
    
        <p>Draw a frame from the video onto the canvas element using the <code>drawImage()</code> method.</p>
    
        <p>The variables <code>canvas</code>, <code>video</code> and <code>stream</code> are in global scope, so you can
            inspect them from the console.</p>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/canvas"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    
    </div>)
    }
}