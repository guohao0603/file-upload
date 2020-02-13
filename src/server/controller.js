const multiparty = require('multiparty');
const path = require('path');
const fse = require('fs-extra');

const extractExt = filename =>
  filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名
const UPLOAD_DIR = path.resolve(__dirname, '..', 'target'); // 大文件存储目录

const pipeStream = (path, writeStream) =>
    new Promise(resolve => {
        const readStream = fse.createReadStream(path);  // 读取文件 传入path
        readStream.on("end", () => {
            fse.unlinkSync(path);  // 删除切片文件 删完所有切片 然后在删切片文件目录
            resolve();
        });
        readStream.pipe(writeStream); // 写入文件 pipe 管道
    });

// 合并切片
const mergeFileChunk = async (filePath, filename, size) => {
    const chunkDir = path.resolve(UPLOAD_DIR, filename); // 切片文件目录
    const chunkPaths = await fse.readdir(chunkDir); // 切片 array
    // 根据切片下标进行排序
    // 否则直接读取目录的获得的顺序可能会错乱
    chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
    await Promise.all(  // 切片顺序合并
        chunkPaths.map((chunkPath, index) =>
            pipeStream(
                path.resolve(chunkDir, chunkPath),  // 每个切片的文件路径
                // 指定位置创建可写流
                fse.createWriteStream(filePath, {   // 读取在指定的filepath下
                    start: index * size,
                    end: (index + 1) * size
                })
            )
        )
    );
    fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
};


const resolvePost = req =>
  new Promise(resolve => {
    let chunk = "";
    req.on("data", data => {
      chunk += data;
    });
    req.on("end", () => {
      resolve(JSON.parse(chunk));
    });
  });



module.exports = class {
  // 合并切片
  async handleMerge(req, res) {
    const data = await resolvePost(req);
    const { filename,size } = data;  // 源文件名 文件size
    const ext = extractExt(filename);
    const name = 'result' // 重新命名的文件名
    const filePath = path.resolve(UPLOAD_DIR, `${name}${ext}`);
    await mergeFileChunk(filePath, filename, size);
     res.end(
       JSON.stringify({
         code: 0,
         message: "file merged success"
       })
     )
  }
  // 处理切片
  async handleFormData(req, res) {
    const multipart = new multiparty.Form();
    multipart.parse(req, async (err, fields, files) => {
          if (err) {
            return;
          }
          const [chunk] = files.chunk;  // 切片文件
          const [hash] = fields.hash;  // 切片名称
          const [filename] = fields.filename; // 源文件名称
          const chunkDir = path.resolve(UPLOAD_DIR, filename); // 切片目录 .../target/filename
            // 切片目录不存在，创建切片目录
           if (!fse.existsSync(chunkDir)) {
                await fse.mkdirs(chunkDir);
           }
           await fse.move(chunk.path, path.resolve(chunkDir, hash)); // 切片文件移动到目标文件夹下
           res.end("received file chunk");
        });
  }
};