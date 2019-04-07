import React, { Component } from 'react';
import io from 'socket.io-client';

import './style.css';

export default class Basic extends Component {
    constructor(props){
        super(props)
        this.state = {

        }
        this.socket = null;
        this.video = null;
    }

    componentDidMount() {
        this.video = document.querySelector('#my-player');
        this.socket = io.connect('http://localhost:9001');

        this.socket.emit('profile-mp4');
        this.socket.on('profile-mp4', (data) => {
            console.log(data);
            var mediaSource = new MediaSource();
            this.video.src = URL.createObjectURL(mediaSource);

            mediaSource.addEventListener('sourceopen', (e) => {
                URL.revokeObjectURL(this.video.src);
                var mime = 'video/webm; codecs="vorbis,vp8"';
                var mediaSource = e.target;
                var sourceBuffer = mediaSource.addSourceBuffer(mime);

                sourceBuffer.appendBuffer(data.buffer);
            });

            // if(data.buffer) {
            //     const blobList = new Blob([data.buffer],  {type: 'video/webm; codecs=vorbis,vp8'});
                
            //     console.log(blobList, window.URL.createObjectURL(blobList));
            //     // this.video.srcObject = window.URL.createObjectURL(blobList);
            // }
        });

//         var video = document.querySelector('#video');
//    var mediaSource = new MediaSource();
//    video.src = URL.createObjectURL(mediaSource);
//    mediaSource.addEventListener('sourceopen', sourceOpen);

//    function sourceOpen(e) {
//        URL.revokeObjectURL(video.src);
//        // 设置 媒体的编码类型
//        var mime = 'video/webm; codecs="vorbis,vp8"';
//        var mediaSource = e.target;
//        var sourceBuffer = mediaSource.addSourceBuffer(mime);
//        var videoUrl = 'http://localhost:9090/examples/mp4/video.webm';
//        fetch(videoUrl).then(function(response) {
//                console.log(response)
//                return response.arrayBuffer();
//            })
//            .then(function(arrayBuffer) {
//                sourceBuffer.addEventListener('updateend', function(e) {
//                    if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
//                        mediaSource.endOfStream();
//                        // 在数据请求完成后，我们需要调用 endOfStream()。它会改变 MediaSource.readyState 为 ended 并且触发 sourceended 事件。
//                        video.play().then(function() {}).catch(function(err) {
//                            console.log(err)
//                        });
//                    }
//                });
//                sourceBuffer.appendBuffer(arrayBuffer);
//            });
//    }
    }

    render () {
        return (
            <div className="video_broad">
                
                <video 
                    id="my-player"
                    className="video-js"
                    controls
                    preload="auto"
                    // poster="//vjs.zencdn.net/v/oceans.png"
                    playsInline autoPlay muted
                ></video>
                {/* <button onClick={this.start}>Start</button> */}
            </div>
        )
    }
}