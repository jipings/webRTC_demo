## [MediaDevices.getUserMedia()](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia)
会提示用户给予使用媒体输入的许可，媒体输入会产生一个MediaStream，里面包含了请求的媒体类型的轨道。此流可以包含一个视频轨道（来自硬件或者虚拟视频源，比如相机、视频采集设备和屏幕共享服务等等）、一个音频轨道（同样来自硬件或虚拟音频源，比如麦克风、A/D转换器等等），也可能是其它轨道类型。

它返回一个 Promise 对象，成功后会resolve回调一个 MediaStream 对象。若用户拒绝了使用权限，或者需要的媒体源不可用，promise会reject回调一个  PermissionDeniedError 或者 NotFoundError 。

## [MediaSource](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaSource)
MediaSource是Media Source Extensions API 表示媒体资源HTMLMediaElement对象的接口。MediaSource 对象可以附着在HTMLMediaElement在客户端进行播放。

## [Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)
Blob 对象表示一个不可变、原始数据的类文件对象。Blob 表示的不一定是JavaScript原生格式的数据。File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件

## [MediaRecorder](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaRecorder)

## [AudioContext](https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext)
AudioContext接口表示由音频模块连接而成的音频处理图，每个模块对应一个AudioNode。AudioContext可以控制它所包含的节点的创建，以及音频处理、解码操作的执行。做任何事情之前都要先创建AudioContext对象，因为一切都发生在这个环境之中。

AudioContext 可以是事件源（event target），所以也实现了EventTarget 接口。
## createScriptProcessor
创建一个可以通过JavaScript直接处理音频的ScriptProcessorNode.

## [RTCPeerConnection](https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection)

## [captureStream](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/%E6%8D%95%E8%8E%B7%E6%B5%81)

## getTracks() addTrack()

## setLocalDescription

## getSenders

## [sdp](https://www.3cx.com/global/cn/voip-sip-webrtc/sdp/)

## sip

## 如何使用WebRTC建立会话
1)  获取本地媒体流(getUserMedia(), MediaStream API)
2)  在浏览器和对等端(其它浏览器或终端)之间建立对等连接(RTCPeerConnection API)
3)  将媒体和数据通道关联至该连接
4)  交换会话描述(RTCSessionDescription)

## 通过offer和answer交换SDP描述符：

1)  甲和乙各自建立一个PC实例
2)  甲通过PC所提供的`createOffer()`方法建立一个包含甲的SDP描述符的offer信令
3)  甲通过PC所提供的`setLocalDescription()`方法，将甲的SDP描述符交给甲的PC实例
4)  甲将`offer`信令通过服务器发送给乙
5)  乙将甲的`offer`信令中所包含的的`SDP`描述符提取出来，通过PC所提供的`setRemoteDescription()`方法交给乙的PC实例
6)  乙通过PC所提供的`createAnswer()`方法建立一个包含乙的`SDP`描述符`answer`信令
7)  乙通过PC所提供的`setLocalDescription()`方法，将乙的`SDP`描述符交给乙的PC实例
8)  乙将`answer`信令通过服务器发送给甲
9)  甲接收到乙的`answer`信令后，将其中乙的SDP描述符提取出来，调用`setRemoteDescripttion()`方法交给甲自己的PC实例

## 通过ICE框架建立NAT/防火墙穿透的连接
webRTC使用ICE框架来获得这个外界可以直接访问的地址，`RTCPeerConnection`在创建的时候可以将ICE服务器的地址传递进去，
```js
    var iceServer = {
        "iceServers": [{
            "url": "stun:stun.l.google.com:19302"
        }]
    };
    var pc = new RTCPeerConnection(iceServer);
```
1)  甲乙各创建配置ICE服务器的PC实例，并为其添加`onicecandidate`事件回调
2)  当网络候选可用时，将会调用`onicecandidate`函数
3)  在回调函数内部，甲或乙将网络候选的消息封装在`ICE Candidate`信令中，通过服务器中转，传递给对方
4)  甲或乙接受到对方通过服务器中转所发送过来`ICE Candidate`信令时，将其解析并获得网络候选，将其通过PC实例的`addIceCandidate()`方法加入到PC实例中

这样连接就创立完成了，可以向RTCPeerConnection中通过addStream()加入流来传输媒体流数据。



## STUN服务器
STUN，Session Traversal Utilities for NAT,称为NAT会话遍历实用工具服务器。简单地说，就是获取内网设备的最外层NAT(公共ip地址)信息。
## TURN服务器
TURN，Traversal Using Relay around NAT，称为中继型NAT遍历服务器

媒体中继地址是一个公共地址，用于转发接收到的包，或者将收到的数据包转发给浏览器。如果两个对等端因为NAT类型等原因不能直接建立P2P连接的话，那么可以使用中继地址。

ps：相比较直接使用web服务器提供媒体中继理想点。

## 数据通道
RTCDataChannel，数据通道是浏览器之间建立的非媒体的交互连接。即不传递媒体消息，绕过服务器直接传递数据。相比WebSocket，http消息，数据通道支持流量大、延迟低。

单个对等连接中的多个数据通道底层共享一个流，所以只需一次offer、answer即可建立首个数据通道。之后再建立数据通道无需再次进行offer、answer交换。

典型应用：游戏实时状态更新。

