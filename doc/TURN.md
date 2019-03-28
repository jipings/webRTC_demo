
## [TURN](https://www.cnblogs.com/pannengzhi/p/5048965.html)

对于`Symmetric NAT`，传统的P2P打洞方法是不适用的。因此为了保证通信能够建立，我们可以在没办法的情况下用保证成功的中继方法（`Relaying`），
虽然使用中继会对服务器负担加重，而且也算不上P2P，但是至少保证了最坏情况下信道的通畅，从而不至于受NAT类型的限制。`TURN/RFC5766`就是为此目的而进行的拓展。

## TURN简介

TURN的全称为Traversal Using Relays around NAT，是STUN/RFC5389的一个拓展，主要添加了Relay功能。如果终端在NAT之后，
那么在特定的情景下，有可能使得终端无法和其对等端（peer）进行直接的通信，这时就需要公网的服务器作为一个中继，
对来往的数据进行转发。这个转发的协议就被定义为TURN。TURN和其他中继协议的不同之处在于，它允许客户端使用同一个中继地址（relay address）
与多个不同的peer进行通信。

使用TURN协议的客户端必须能够通过中继地址和对等端进行通讯，并且能够得知每个peer的的IP地址和端口（确切地说，应该是peer的服务器反射地址）。

如果TURN使用于ICE协议中，relay地址会作为一个候选，由ICE在多个候选中进行评估，选取最合适的通讯地址。一般来说中继的优先级都是最低的。

TURN协议被设计为ICE协议(`Interactive Connectivity Establishment`)的一部分，而且也强烈建议用户在他们的程序里使用ICE，但是也可以独立于ICE的运行。
值得一提的是，TURN协议本身是STUN的一个拓展，因此绝大部分TURN报文都是STUN类型的，作为STUN的一个拓展，TURN增加了新的方法（method）和属性（attribute）。

## 信道机制(Channels)

对于一些应用程序,比如VOIP(Voice over IP),在Send/Data Indication中多加的36字节格式信息会加重客户端和服务端
之间的带宽压力.为改善这种情况,TURN提供了第二种方法来让client和peer交互数据.该方法使用另一种数据包格式,
即ChannelData message,信道数据报文. ChannelData message不使用STUN头部,而使用一个4字节的头部,包含了
一个称之为信道号的值(channel number).每一个使用中的信道号都与一个特定的peer绑定,即作为对等端地址的一个记号.

要将一个信道与对等端绑定,客户端首先发送一个信道绑定请求(ChannelBind Request)到服务器,并且指定一个未绑定的信道号以及对等端的地址信息.
绑定后client和server都能通过ChannelData message来发送和转发数据.信道绑定默认持续10分钟,并且可以通过重新发送
ChannelBind Request来刷新持续时间.和Allocation不同的是,并没有直接删除绑定的方法,只能等待其超时自动失效.