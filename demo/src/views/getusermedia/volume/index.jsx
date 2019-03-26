import React, { Component } from 'react';
import SoundMeter from './soundmeter';
import './style.css';
export default class Volume extends Component {
    state = {
        instantValue: 0,
        slowValue: 0,
        clipValue: 0,
    }
    componentDidMount() {
        const instantMeter = document.querySelector('#instant meter');
        const slowMeter = document.querySelector('#slow meter');
        const clipMeter = document.querySelector('#clip meter');

        const instantValueDisplay = document.querySelector('#instant .value');
        const slowValueDisplay = document.querySelector('#slow .value');
        const clipValueDisplay = document.querySelector('#clip .value');

        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.audioContext = new AudioContext();
        } catch (e) {
            alert('Web Audio API not supported.');
        }

        // Put variables in global scope to make them available to the browser console.
        const constraints = window.constraints = {
            audio: true,
            video: false
        };

        function handleSuccess(stream) {
        // Put variables in global scope to make them available to the
        // browser console.
        window.stream = stream;
        const soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
        soundMeter.connectToSource(stream, function(e) {
            if (e) {
            alert(e);
            return;
            }
            setInterval(() => {
                console.log(soundMeter.instant, soundMeter.slow, soundMeter.clip);
                instantMeter.value = instantValueDisplay.innerText = soundMeter.instant.toFixed(2);
                slowMeter.value = slowValueDisplay.innerText = soundMeter.slow.toFixed(2);
                clipMeter.value = clipValueDisplay.innerText = soundMeter.clip;
            }, 200);
        });
        }

        function handleError(error) {
            console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
        }

        navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

    }

    render() {
        return (<div id="container">

        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a> <span>Audio stream volume</span>
        </h1>
        <p>Measure the volume of a local media stream using WebAudio.</p>
    
        <div id="meters">
            <div id="instant">
                <div className="label">Instant:</div>
                <meter high="0.25" max="1" value="0"></meter>
                <div className="value"></div>
            </div>
            <div id="slow">
                <div className="label">Slow:</div>
                <meter high="0.25" max="1" value="0"></meter>
                <div className="value"></div>
            </div>
            <div id="clip">
                <div className="label">Clip:</div>
                <meter max="1" value="0"></meter>
                <div className="value"></div>
            </div>
        </div>
    
        <p>The 'instant' volume changes approximately every 50ms; the 'slow' volume approximates the average volume over
            about a second.</p>
        <p>Note that you will not hear your own voice; use the <a href="/getusermedia/audio">local audio rendering demo</a> for that.
        </p>
        <p>The <code>audioContext</code>, <code>stream</code> and <code>soundMeter</code> variables are in global scope, so
            you can inspect them from the console.</p>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/volume"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    
    </div>)
    }
}