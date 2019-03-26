import React, { Component } from 'react';

export default class Filter extends Component {
    state = {
        select: 'none',
    }
    componentDidMount() {

        // Put variables in global scope to make them available to the browser console.
        const video = window.video = document.querySelector('video');

        const constraints = {
            audio: false,
            video: true
        };
        function handleSuccess(stream) {
            window.stream = stream; // make stream available to browser console
            video.srcObject = stream;
        }
        function handleError(error) {
            console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
        }
        navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

    }
    snapShot = () => {
        const canvas = window.canvas = document.querySelector('canvas');
        const video = window.video = document.querySelector('video');

        canvas.width = video.videoWidth || 480;
        canvas.height = video.videoHeight || 360;
        canvas.className = this.state.select;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    changeSelect = (e) => {
        this.setState({ select: e.target.value })
    }
    render() {
        return (<div id="container">

        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a> <span>getUserMedia + CSS filters</span>
        </h1>
    
        <video playsInline autoPlay className={this.state.select}></video>
    
        <label htmlFor="filter">Filter: </label>
        <select id="filter" value={this.state.value} onChange={this.changeSelect}>
            <option value="none">None</option>
            <option value="blur">Blur</option>
            <option value="grayscale">Grayscale</option>
            <option value="invert">Invert</option>
            <option value="sepia">Sepia</option>
        </select>
    
        <button id="snapshot" onClick={this.snapShot}>Take snapshot</button>
    
        <canvas className={this.state.select}></canvas>
    
        <p>Draw a frame from the getUserMedia video stream onto the canvas element, then apply CSS filters.</p>
    
        <p>The variables <code>canvas</code>, <code>video</code> and <code>stream</code> are in global scope, so you can
            inspect them from the console.</p>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/filter"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    </div>)
    }
}