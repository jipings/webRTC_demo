
## [ICE](https://www.cnblogs.com/pannengzhi/p/5061674.html)


### SDP
ICE信息的描述格式通常采用标准的SDP,其全称为Session Description Protocol,即会话描述协议.
SDP只是一种信息格式的描述标准,不属于传输协议,但是可以被其他传输协议用来交换必要的信息,如SIP和RTSP等.

### SDP 信息
一个SDP会话描述包含如下部分
* 会话名称和会话目的
* 会话的激活时间
* 构成会话的媒体(media)
* 为了接受该媒体所需要的信息(如地址，端口，格式等)

因为在中途参与会话也许会受限制，所以可能会需要一些额外的信息:
* 会话使用的带宽信息
* 会话拥有者的联系信息

一般来说,SDP必须包含充分的信息使得应用程序能够加入会话,并且可以提供任何非参与者使用时需要知道的资源
状况,后者在当SDP同时用于多个会话声明协议时尤其有用.

### SDP格式

SDP是基于文本的协议,使用ISO 10646字符集和UTF-8编码.SDP字段名称和属性名称只使用UTF-8的一个子集US-ASCII,
因此不能存在中文.虽然理论上文本字段和属性字段支持全集,但最好还是不要在其中使用中文.

SDP会话描述包含了多行如下类型的文本:

    <type>=<value>

其中type是大小写敏感的,其中一些行是必须要有的,有些是可选的,所有元素都必须以固定顺序给出.固定的顺序极大改善了
错误检测,同时使得处理端设计更加简单.如下所示,其中可选的元素标记为* :

会话描述：

     v=  (protocol version)
     o=  (originator and session identifier)
     s=  (session name)
     i=* (session information)
     u=* (URI of description)
     e=* (email address)
     p=* (phone number)
     c=* (connection information -- not required if included in
          all media)
     b=* (zero or more bandwidth information lines)
     One or more time descriptions ("t=" and "r=" lines; see below)
     z=* (time zone adjustments)
     k=* (encryption key)
     a=* (zero or more session attribute lines)
     Zero or more media descriptions

时间信息描述:

    t=  (time the session is active)
    r=* (zero or more repeat times)

多媒体信息描述(如果有的话):

    m=  (media name and transport address)
    i=* (media title)
    c=* (connection information -- optional if included at
          session level)
    b=* (zero or more bandwidth information lines)
    k=* (encryption key)
    a=* (zero or more media attribute lines)

所有元素的type都为小写,并且不提供拓展.但是我们可以用a(attribute)字段来提供额外的信息.一个SDP描述的例子如下:

    v=0
    o=jdoe 2890844526 2890842807 IN IP4 10.47.16.5
    s=SDP Seminar
    i=A Seminar on the session description protocol
    u=http://www.example.com/seminars/sdp.pdf
    e=j.doe@example.com (Jane Doe)
    c=IN IP4 224.2.17.12/127
    t=2873397496 2873404696
    a=recvonly
    m=audio 49170 RTP/AVP 0
    m=video 51372 RTP/AVP 99
    a=rtpmap:99 h263-1998/90000

## Offer/Answer模型

上文说到，SDP用来描述多播主干网络的会话信息，但是并没有具体的交互操作细节是如何实现的，因此RFC3264定义了一种基于SDP的`offer/answer`模型。在该模型中，会话参与者的其中一方生成一个SDP报文构成offer，其中包含了一组offerer希望使用的多媒体流和编解码方法，以及offerer用来接收数据的IP地址和端口信息，offer传输到会话的另一端(称为answerer),由answerer生成一个answer,即用来响应对应offer的SDP报文.answer中包含不同offer对应的多媒体流,并指明该流是否可以接受.

RFC3264只介绍了交换数据过程,而没有定义传递offer/answer报文的方法,后者在RFC3261/SIP
即会话初始化协议中描述.值得一提的是,offer/answer模型也经常被SIP作为一种基本方法使用.
offer/answer模型在SDP报文的基础上进行了一些定义,工作过程不在此描述,需要了解细节的朋友可以参考RFC3261.

## ICE

ICE的全称为Interactive Connectivity Establishment,即交互式连接建立.

ICE是一个用于在offer/answer模式下的NAT传输协议,主要用于UDP下多媒体会话的建立,其使用了STUN协议以及TURN
协议,同时也能被其他实现了offer/answer模型的的其他程序所使用,比如SIP(`Session Initiation Protocol`).

使用offer/answer模型(RFC3264)的协议通常很难在NAT之间穿透,因为其目的一般是建立多媒体数据流,而且在报文中还
携带了数据的源IP和端口信息,这在通过NAT时是有问题的.RFC3264还尝试在客户端之间建立直接的通路,因此中间就缺少
了应用层的封装.这样设计是为了减少媒体数据延迟,减少丢包率以及减少程序部署的负担.然而这一切都很难通过NAT而完成.
有很多解决方案可以使得这些协议运行于NAT环境之中,包括应用层网关(ALGs),Classic STUN以及`Realm Specific IP+SDP`
协同工作等方法.不幸的是,这些技术都是在某些网络拓扑下工作很好,而在另一些环境下表现又很差,因此我们需要一个单一的,
可自由定制的解决方案,以便能在所有环境中都能较好工作.