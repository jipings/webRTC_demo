import React, { Component } from 'react';
import './style.css';

export default class Video2video extends Component {

    componentDidMount() {
        const leftVideo = document.getElementById('leftVideo');
        const rightVideo = document.getElementById('rightVideo');
        // const otherVideo = document.getElementById('otherVideo');

        leftVideo.addEventListener('canplay', () => {
            // 捕获流 返回一个 MediaStream 对象的引用
            const stream = leftVideo.captureStream();
            window.leftStream = stream;
            // 返回流中所有的MediaStreamTrack列表。
            const allTracks = stream.getTracks();
            // 返回流中kind属性为"audio"的MediaStreamTrack列表
            const audioTracks = stream.getAudioTracks()
            // 返回流中kind属性为"video"的MediaStreamTrack列表
            const videoTracks = stream.getVideoTracks()

            const newMediaStream = new MediaStream()
            // debugger;
            newMediaStream.addTrack(audioTracks[0]);
            newMediaStream.addTrack(videoTracks[0]);

            rightVideo.srcObject = newMediaStream;
        });
        // leftVideo.addEventListener('durationchange',function(e){
        //     console.log(leftVideo.seekable.end(0));
        //     var seekable = leftVideo.seekable,
        //         start = seekable.start(0),
        //         end = seekable.end(0),
        //         half = Math.floor((start+end)/2);
        //     // 从视频中间部分开始播放
        //     leftVideo.currentTime = half;
        //     leftVideo.play();
        // },false);

    }

    render() {
        return (<div id="container">

        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a> <span>captureStream(): video to video</span>
        </h1>
    
        <video id="leftVideo" playsInline controls loop muted>
            <source src="/video/chrome.webm#t=10,20" type="video/webm"/>
            <source src="/video/chrome.mp4" type="video/mp4"/>
         {
             // 字幕的格式通常是依照webVTT来的
            //  <track src="devstories-en.vtt" label="English subtitles" 
            //  kind="subtitles" srclang="en" default></track>
         }
            <p>This browser does not support the video element.</p>
        </video>
    
        <video id="rightVideo" playsInline autoPlay></video>
        {/* <video id="otherVideo" playsInline autoPlay></video> */}

    
        <p>Press play on the left video to start the demo.</p>
    
        <p>A stream is captured from the video element on the left using its <code>captureStream()</code> method and set as
            the <code>srcObject</code> of the video element on the right.</p>
    
        <p>The <code>stream</code> variable are in global scope, so you can inspect them from the browser console.</p>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/capture/video-video"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    
    </div>)
    }
}