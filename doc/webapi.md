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