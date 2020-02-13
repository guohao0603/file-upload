<template>
 <div id="main">
   <div id="head">
    <span id="my_btn">
      选择文件
    </span>
     <input type="file" @change="handleFileChange" id="upload_file"/>
     <el-button @click="handleUpload" :disabled="uploadDisabled">上传</el-button>
   </div>
   <div id="all_pro">
     <p>总进度</p>
     <el-progress :percentage="fakeUploadPercentage" color="#fdd600"></el-progress>
   </div>
   <div id="content_list">
     <el-table :data="data">
       <el-table-column
         prop="hash"
         label="切片"
         align="center"
       ></el-table-column>
       <el-table-column label="大小(MB)" align="center" width="120">
         <template v-slot="{ row }">
           {{ row.size | transformByte }}
         </template>
       </el-table-column>
       <el-table-column label="进度" align="center">
         <template v-slot="{ row }">
           <el-progress
             :percentage="row.percentage"
             color="#f9e574"
           ></el-progress>
         </template>
       </el-table-column>
     </el-table>
   </div>
 </div>
</template>
<script>
const SIZE = 10 * 1024 * 1024 // 切片大小 10MB
const Status = {
  wait: 'wait',
  pause: 'pause',
  uploading: 'uploading'
}
export default {
  name: 'UploadFile',
  // 过滤器 管道符 前面的value 传入当参数
  filters: {
    transformByte (val) {
      return Number((val / (1024 * 1024)).toFixed(0))
    }
  },
  data () {
    return {
      container: {
        file: null
      },
      data: [],
      status: Status.wait, // 默认等待上传
      fakeUploadPercentage: 0 // 定义假的进度条 防止 置空 this.container.file 时 进度条消失
    }
  },
  mounted () {
    let spanDom = document.getElementById('my_btn')
    let fileDom = document.getElementById('upload_file')
    spanDom.onclick = function () {
      fileDom.click()
    }
    console.log(this.$store)
  },
  computed: {
    uploadDisabled () {
      return (
        !this.container.file ||
        [Status.pause, Status.uploading].includes(this.status)
      )
    },
    uploadPercentage () {
      if (!this.container.file || !this.data.length) return 0
      const loaded = this.data
        .map(item => item.size * item.percentage)
        .reduce((arr, cur) => arr + cur)
      return parseInt((loaded / this.container.file.size).toFixed(2))
    }
  },
  watch: {
    uploadPercentage (now) {
      if (now > this.fakeUploadPercentage) {
        this.fakeUploadPercentage = now
      }
    }
  },
  methods: {
    // 请求
    request ({url, method = 'post', data, headers = {}, onProgress = e => e, requestList}) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = onProgress
        xhr.open(method, url)
        Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]))
        xhr.send(data)
        xhr.onload = e => {
          resolve({
            data: e.target.response
          })
        }
      })
    },
    handleFileChange (e) {
      const [file] = e.target.files
      // console.log('4444', file)
      if (!file) return
      Object.assign(this.$data, this.$options.data())
      console.info(56666, this.$data)
      this.container.file = file
    },
    // 生成切片
    createFileChunk (file, size = SIZE) {
      const fileChunkList = [] // 切片array
      let cur = 0
      while (cur < file.size) {
        fileChunkList.push({file: file.slice(cur, cur + size)})// 0---10MB  为一片
        cur += size
      }
      return fileChunkList
    },
    // 上传切片
    async uploadChunks () {
      const requestList = this.data.map(({chunk, hash, index}) => {
        const formData = new FormData()
        formData.append('chunk', chunk)
        formData.append('hash', hash)
        formData.append('filename', this.container.file.name)
        return { formData, index }
      }).map(async ({ formData, index }) =>
        this.request({
          url: 'http://localhost:8880',
          data: formData,
          onProgress: this.createProgressHandler(this.data[index])
        })
      )
      // Promise.all可以将多个Promise实例包装成一个新的Promise实例
      // Promse.all在处理多个异步处理时非常有用，比如说一个页面上需要等两个或多个ajax的数据回来以后才正常显示
      // requestList 是一个数组 eg:[p1,p2,p3] Promise.all获得的成功结果的数组里面的数据顺序和Promise.all接收到的数组顺序是一致的，
      // 即p1的结果在前，即便p1的结果获取的比p2要晚
      await Promise.all(requestList) // 发送切片
      // 合并切片
      await this.mergeRequest()
    },
    async mergeRequest () {
      console.log('size', SIZE)
      await this.request({
        url: 'http://localhost:8880/merge',
        headers: {
          'content-type': 'application/json'
        },
        data: JSON.stringify({
          size: SIZE,
          filename: this.container.file.name
        })
      })
      // 上传成功
      this.container.file = null
      this.status = Status.wait
    },
    async handleUpload () {
      if (!this.container.file) return
      this.status = Status.uploading
      const fileChunkList = this.createFileChunk(this.container.file)
      console.log('切片list', fileChunkList)
      this.data = fileChunkList.map(({ file }, index) => ({
        chunk: file,
        index,
        size: file.size,
        hash: this.container.file.name + '-' + index, // 文件名+数组下标
        percentage: 0
      }))
      console.log('data444', this.data)
      await this.uploadChunks()
    },
    createProgressHandler (item) {
      return e => {
        item.percentage = parseInt(String((e.loaded / e.total) * 100))
      }
    }
  }
}
</script>
<style scoped>
  #main {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }
  #head {
    padding-bottom: 60px;
  }
  #my_btn {
    font-weight: 500;
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 4px;
    text-align: center;
    background-color:cornflowerblue;
    color: #fff;
    line-height: 40px;
    cursor: pointer;
    margin-right: 20px;
  }
  #upload_file {
    display: none;
  }
  #content_list {
    width: 1200px;
    height: 1000px;
    overflow-x: hidden;
    overflow-y: scroll;
    position: relative;
    left: 50%;
    margin-left: -600px;
    border: 1px solid #eee;
  }
  #all_pro {
    width: 1200px;
    height: 100px;
    position: relative;
    left: 50%;
    margin-left: -600px;
  }
  input{
    outline-style: none ;
    border: 1px solid #ccc;
    border-radius: 3px;
  }
</style>
