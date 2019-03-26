import React, { Component } from 'react';

export default class Audio extends Component {

    componentDidMount() {
        // Put variables in global scope to make them available to the browser console.
        const audio = document.querySelector('audio');

        const constraints = window.constraints = {
        audio: true,
        video: false
        };

        function handleSuccess(stream) {
            const audioTracks = stream.getAudioTracks();
            console.log('Got stream with constraints:', constraints);
            console.log('Using audio device: ' + audioTracks[0].label);
            stream.oninactive = function() {
                console.log('Stream ended');
            };
            window.stream = stream; // make variable available to browser console
            audio.srcObject = stream;
        }

        function handleError(error) {
            console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
        }

        navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

    }

    render() {
        return (<div id="container">

        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a> <span>getUserMedia, audio only</span>
        </h1>
    
        <audio id="gum-local" controls autoPlay></audio>
    
        <p className="warning">Warning: if you're not using headphones, pressing play will cause feedback.</p>
    
        <p>Render the audio stream from an audio-only <code>getUserMedia()</code> call with an audio element.</p>
    
        <p>The <code>MediaStream</code> object <code><em>stream</em></code> passed to the <code>getUserMedia()</code>
            callback is in global scope, so you can inspect it from the console.</p>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/audio"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    
    </div>)
    }
}