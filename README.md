#前端大文件上传-分片上传
* 前端 vue element-ui

* 服务端 nodejs


* 前端上传大文件时使用 Blob.prototype.slice 将文件切片，并发上传多个切片，最后发送一个合并的请求通知服务端合并切片
* 服务端接收切片并存储，收到合并请求后使用流将切片合并到最终文件
* 原生 XMLHttpRequest 的 upload.onprogress 对切片上传进度的监听
* 使用 Vue 计算属性根据每个切片的进度算出整个文件的上传进度

***********
