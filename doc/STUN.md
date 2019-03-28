
## [STUN简介](https://www.cnblogs.com/pannengzhi/p/5041546.html)

RFC3489和RFC5389的名称都是STUN，但其全称是不同的。在RFC3489里，
STUN的全称是Simple Traversal of User Datagram Protocol (UDP) Through Network Address Translators (NATs)，
即穿越NAT的简单UDP传输，是一个轻量级的协议，允许应用程序发现自己和公网之间的中间件类型，
同时也能允许应用程序发现自己被NAT分配的公网IP。这个协议在2003年3月被提出，其介绍页面里
说到已经被STUN/RFC5389所替代。

RFC5389中，STUN的全称为Session Traversal Utilities for NAT，即NAT环境下的会话传输工具，
是一种处理NAT传输的协议，但主要作为一个工具来服务于其他协议。和STUN/RFC3489
类似，可以被终端用来发现其公网IP和端口，同时可以检测端点间的连接性，也可以作为一种保活（keep-alive）协议来维持NAT的绑定。

和RFC3489最大的不同点在于，STUN本身不再是一个完整的NAT传输解决方案，而是在NAT传输环境中作为一个辅助的解决方法，
同时也增加了TCP的支持。RFC5389废弃了RFC3489，因此后者通常称为classic STUN，但依旧是后向兼容的。

而完整的NAT传输解决方案则使用STUN的工具性质，`ICE`就是一个基于`offer/answer`方法的完整NAT传输方案，如SIP。
STUN是一个C/S架构的协议，支持两种传输类型。一种是请求/响应（request/respond）类型，由客户端给服务器发送请求，
并等待服务器返回响应；另一种是指示类型（indication transaction），由服务器或者客户端发送指示，另一方不产生响应。
两种类型的传输都包含一个96位的随机数作为事务ID（transaction ID），对于请求/响应类型，事务ID允许客户端将响应和产生响应的请求连接起来；
对于指示类型，事务ID通常作为debugging aid使用。
所有的STUN报文信息都含有一个固定头部，包含了方法，类和事务ID。方法表示是具体哪一种传输类型（两种传输类型又分了很多具体类型），

## STUN 通信过程
1)  产生一个Requst或Indication
当产生一个Request或者Indication报文时，终端必须根据规则来生成头部，class字段必须是Request或者Indication，
而method字段为Binding或者其他用户拓展的方法。属性部分选择该方法所需要的对应属性，比如在一些
情景下我们会需要authenticaton属性或FINGERPRINT属性，注意在发送Request报文时候，需要加上SOFTWARE属性（内含软件版本描述）。

2) 发送Requst或Indication
3. 接收STUN消息
