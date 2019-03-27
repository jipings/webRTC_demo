import React, { Component } from 'react';
import './style.css';

export default class VideoContenthint extends Component {
    constructor(props){
        super(props);
        this.state = {

        }
        this.srcStream = null;
        this.motionStream = null;
        this.detailStream = null;
        this.offerOptions = {
            offerToReceiveAudio: 0,
            offerToReceiveVideo: 1
        };
        this.srcVideo= null;
        this.motionVideo = null;
        this.detailVideo = null;
    }
    componentDidMount() {
        this.srcVideo = document.getElementById('srcVideo');
        this.motionVideo = document.getElementById('motionVideo');
        this.detailVideo = document.getElementById('detailVideo');

        // Video tag capture must be set up after video tracks are enumerated.
        this.srcVideo.oncanplay = this.maybeCreateStream;
        if (this.srcVideo.readyState >= 3) { // HAVE_FUTURE_DATA
        // Video is already ready to play, call maybeCreateStream in case oncanplay
        // fired before we registered the event handler.
            this.maybeCreateStream();
        }
        this.srcVideo.play();   
    }
    maybeCreateStream = () => {
        if (this.srcStream) {
            return;
        }
        if (this.srcVideo.captureStream) {
            this.srcStream = this.srcVideo.captureStream(); // 捕获视频流
            this.call();
        } else {
            console.log('captureStream() not supported');
        }
    }
    onSetSessionDescriptionError(error) {
        console.log('Failed to set session description: ' + error.toString());
    }

    onCreateAnswerSuccess = (pc1, pc2, desc) => {
        // Hard-code video bitrate to 50kbps.
        console.log(desc)
        desc.sdp = desc.sdp.replace(/a=mid:(.*)\r\n/g, 'a=mid:$1\r\nb=AS:' + 50 + '\r\n'); // 控制流传输速度
        pc2.setLocalDescription(desc)
            .then(() => pc1.setRemoteDescription(desc))
            .catch(this.onSetSessionDescriptionError);
    }

    onIceCandidate = (pc, otherPc, event) => {
        otherPc.addIceCandidate(event.candidate);
    }
    establishPC = (videoTag, stream) => {
        const pc1 = new RTCPeerConnection(null);
        const pc2 = new RTCPeerConnection(null);
        pc1.onicecandidate = e => {
            console.log(e, 'onicecandidate');
            this.onIceCandidate(pc1, pc2, e);
        };
        pc2.onicecandidate = e => {
            this.onIceCandidate(pc2, pc1, e);
        };
        pc2.ontrack = event => {
            if (videoTag.srcObject !== event.streams[0]) {
            videoTag.srcObject = event.streams[0];
            }
        };

        stream.getTracks().forEach(track => pc1.addTrack(track, stream));

        pc1.createOffer(this.offerOptions)
            .then(desc => {
            pc1.setLocalDescription(desc)
                .then(() => pc2.setRemoteDescription(desc))
                .then(() => pc2.createAnswer())
                .then(answerDesc => this.onCreateAnswerSuccess(pc1, pc2, answerDesc))
                .catch(this.onSetSessionDescriptionError);
            })
            .catch(e => console.log('Failed to create session description: ' + e.toString()));
    }
    call = () => {
        // This creates multiple independent PeerConnections instead of multiple
        // streams on a single PeerConnection object so that b=AS (the bitrate
        // constraints) can be applied independently.
        this.motionStream = this.srcStream.clone();
        // TODO(pbos): Remove fluid when no clients use it, motion is the newer name.
        this.setVideoTrackContentHints(this.motionStream, 'fluid');
        this.setVideoTrackContentHints(this.motionStream, 'motion');
        this.establishPC(this.motionVideo, this.motionStream);
        this.detailStream = this.srcStream.clone();
        // TODO(pbos): Remove detailed when no clients use it, detail is the newer
        // name.
        this.setVideoTrackContentHints(this.detailStream, 'detailed');
        this.setVideoTrackContentHints(this.detailStream, 'detail');
        this.establishPC(this.detailVideo, this.detailStream);
    }
    setVideoTrackContentHints = (stream, hint) => {
        const tracks = stream.getVideoTracks(); 
        // 返回流中kind属性为"video"的MediaStreamTrack列表。顺序是不确定的，不同浏览器间会有不同，每次调用也有可能不同。
        // MediaStreamTrack接口在User Agent中表示一段媒体源，比如音轨或视频。

        tracks.forEach(track => {
            if ('contentHint' in track) {
                track.contentHint = hint;
                // contentHint？ A string that may be used by the web application to provide a hint as to what type of content the track contains to guide how it should be treated by API consumers.
                if (track.contentHint !== hint) {
                    console.log('Invalid video track contentHint: \'' + hint + '\'');
                }
            } else {
                console.log('MediaStreamTrack contentHint attribute not supported');
            }
        });
    }
    render() {
        return (<div id="container">

        <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a> <span>Guiding video encoding with content hints</span>
        </h1>
    
        <div id="videos">
            <div className="video-container">
                <h2>Source video file (high bitrate)</h2>
                <video id="srcVideo" playsInline controls muted loop>
                    <source src="../../../video/mixed-content.webm" type="video/webm"/>
                    <p>This browser does not support the video element.</p>
                </video>
            </div>
            <div className="video-container">
                <h2>"motion" video @ 50kbps</h2>
                <video id="motionVideo" playsInline autoPlay muted></video>
            </div>
            <div className="video-container">
                <h2>"detail" video @ 50kbps</h2>
                <video id="detailVideo" playsInline autoPlay muted></video>
            </div>
        </div>
    
        <p>This demo requires Chrome 57.0.2957.0 or later with <strong>Experimental Web Platform features</strong> enabled
            from <tt>chrome://flags</tt>.</p>
    
        <p>A stream is captured from the source video using the <code>captureStream()</code> method. The stream is cloned
            and transmitted via two separate PeerConnections using 50kbps of video bandwidth. This is insufficient to
            generate good quality in the encoded bitstream, so trade-offs have to be made.</p>
    
        <p>The transmitted stream tracks are using <a href="https://wicg.github.io/mst-content-hint/">MediaStreamTrack
            Content Hints</a> to indicate characteristics in the video stream, which informs PeerConnection on how to encode
            the track (to prefer motion or individual frame detail).</p>
    
        <p>The text part of the clip shows a clear case for when <tt>'detail'</tt> is better, and the fighting scene shows a
            clear case for when <tt>'motion'</tt> is better. The spinning model however shows a case where <tt>'motion'</tt>
            or <tt>'detail'</tt> are not clear-cut decisions and even with good content detection what's preferred depends
            on what the user prefers.</p>
    
        <p>Other MediaStreamTrack consumers such as MediaStreamRecorder can also make use of this information to guide
            encoding parameters for the stream without additional extensions to the MediaStreamRecorder specification, but
            this is currently not implemented in Chromium.</p>
    
        <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/capture/video-pc"
           title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    
    </div>);
    }
}