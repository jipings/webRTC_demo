import React, { Component } from 'react';

export default class Gum extends Component {
    state = {
        disabled: false,
        msg: null,
    }
    constraints = window.constraints = {
        audio: true,
        video: true
      };
    
      
    handleSuccess(stream) {
        const video = document.querySelector('video');
        const videoTracks = stream.getVideoTracks();
        console.log('Got stream with constraints:', this.constraints);
        console.log(`Using video device: ${videoTracks[0].label}`);
        window.stream = stream; // make variable available to browser console
        video.srcObject = stream;
      }
      
    handleError(error) {
        if (error.name === 'ConstraintNotSatisfiedError') {
          let v = this.constraints.video;
          this.errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
        } else if (error.name === 'PermissionDeniedError') {
          this.errorMsg('Permissions have not been granted to use your camera and ' +
            'microphone, you need to allow the page access to your devices in ' +
            'order for the demo to work.');
        }
        this.errorMsg(`getUserMedia error: ${error.name}`, error);
      }
      
    errorMsg = (msg, error) => {
        this.setState({msg})
        if (typeof error !== 'undefined') {
          console.error(error);
        }
      }
      
      showVideo = async (e) =>  {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(this.constraints);
          this.handleSuccess(stream);
          this.setState({ disabled: true })
        } catch (e) {
          this.handleError(e);
        }
      }
      

    render() {
        return(
            <div id="container">
                <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
                    <span>getUserMedia</span></h1>

                <video id="gum-local" autoPlay playsInline></video>
                <button id="showVideo" onClick={this.showVideo} disabled={this.state.disabled} >Open camera</button>

                <div id="errorMsg">{this.state.msg}</div>

                <p className="warning"><strong>Warning:</strong> if you're not using headphones, pressing play will cause feedback.</p>

                <p>Display the video stream from <code>getUserMedia()</code> in a video element.</p>

                <p>The <code>MediaStream</code> object <code>stream</code> passed to the <code>getUserMedia()</code> callback is in
                    global scope, so you can inspect it from the console.</p>

                <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/gum"
                title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
            </div>
        )
    }
}