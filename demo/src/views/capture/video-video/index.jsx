import React, { Component } from 'react';
import './style.css';

export default class Video2video extends Component {

    componentDidMount() {
        const leftVideo = document.getElementById('leftVideo');
        const rightVideo = document.getElementById('rightVideo');

        leftVideo.addEventListener('canplay', () => {
            const stream = leftVideo.captureStream();
            rightVideo.srcObject = stream;
        });

    }

    render() {
        return (<div id="container">

        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a> <span>captureStream(): video to video</span>
        </h1>
    
        <video id="leftVideo" playsInline controls loop muted>
            <source src="/video/chrome.webm" type="video/webm"/>
            <source src="/video/chrome.mp4" type="video/mp4"/>
            <p>This browser does not support the video element.</p>
        </video>
    
        <video id="rightVideo" playsInline autoPlay></video>
    
        <p>Press play on the left video to start the demo.</p>
    
        <p>A stream is captured from the video element on the left using its <code>captureStream()</code> method and set as
            the <code>srcObject</code> of the video element on the right.</p>
    
        <p>The <code>stream</code> variable are in global scope, so you can inspect them from the browser console.</p>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/capture/video-video"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    
    </div>)
    }
}