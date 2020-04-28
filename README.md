## 使用 NodeJs 爬取腾讯视频电影数据

### 爬虫又称网络机器人，是一种按照一定的规则，自动地抓取万维网信息的程序或者脚本；通俗的讲就是模拟人进行浏览器操作。

### 此功能作为node入门课程练习，使用node服务端请求要抓取数据的网站源代码配合正则表达式抓取电影数据。

### 目录结构
```bash
├── movies                     # 保存所有数据的目录
│   │── 地区                    # 地区分类下的所有数据
│   │── 类型                    # 类型分类下的所有数据
│   │── 年份                    # 年份分类下的所有数据
│   │── 排序                    # 排序分类下的所有数据
│   └── 特色                    # 特色分类下的所有数据
├── index.js                   # 入口文件，爬取所有电影数据
├── movies.js                  # 封装的爬虫方法
├── progress-bar.js            # 封装的控制台打印方法
├── server.js                  # 启动web服务，输出数据到页面
├── tool-fs                    # 对fs进行二次封装
└── package.json               # package.json 依赖
```


### 思路：

### 1. 封装request请求
``` js
const request = require('request')

async function req(url) {
  return new Promise((resolve, reject) => {
    request.get(url, (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        resolve({
          res,
          body
        })
      }
    })
  })
}
```

### 2. 请求腾讯视频电影页面
``` js
let movieMainUrl = 'https://v.qq.com/channel/movie?listpage=1&channel=movie&sort=18&_all=1'
/**
 * 获取分类电影数据
 * @param {*} index 0:排序，1：类型，2：地区，3：特色，4：年份
 * @param {*} key sort:排序，itype：类型，iarea：地区，characteristic：特色，year：年份
 */
async function getTypeMovieList(key) {
  let {
    body
  } = await req(movieMainUrl)

  let val = '' , index = 0
  switch(key) {
    case "sort" :
        val = "itype"
        index = 0
      break;
      case "itype" :
        val = "iarea"
        index = 1
      break;
      case "iarea" :
        val = "characteristic"
        index = 2
      break;
      case "characteristic" :
        val = "year"
        index = 3
      break;
      case "year" :
        val = "charge"
        index = 4
      break;
      default:
        key = "itype"
        val = "iarea"
        index = 1
      break;
  }

  // 获取分类大模块内容
  let regStr = `<div class="filter_line filter_line_${index} " data-key="${key}">(.*?)<div class="filter_line filter_line_${index+1} " data-key="${val}">`
  let regexp = new RegExp(regStr, "igs")
  let result = regexp.exec(body)[1]

  // 匹配分类名a标签部分内容
  let regStr2 = `<a href="(.*?)" class="filter_item(.*?) data-key="${key}"(.*?)>(.*?)<\\/a>`
  let regexp2 = new RegExp(regStr2, "igs")
  let result2
  let typeList = []
  let tmpList = [] // 存放类型的临时数组
  while (result2 = regexp2.exec(result)) {
    tmpList.push({
      type: result2[4],
      url: result2[1]
    })
  }
  for (let i = 0; i < tmpList.length; i++) {
    let item = tmpList[i]
    let list = await getMovies(item.url, tmpList.length, i)
    typeList.push({
      type: item.type,
      list
    })
  }
  return typeList
}
```

### 3. 获取列表页电影数据

由于需要在控制台打印爬取进度，需要引入一个包 **single-line-log** ,并对其进行封装。
``` js
yarn add single-line-log
```

封装文件为 progress-bar.js, 简单使用如下：
``` js
// 引入模块
const ProgressBar = require('./progress-bar');

/**
 * params1: 标题
 * params2: 长度
 */
let pb = new ProgressBar('爬取进度', 100);

// 跟新进度条
pb.render({ completed: num, total: total });
```

``` js
// 获取分类下的所有电影
async function getMovies(url, size, index) {
  let {
    body
  } = await req(url)

  let typeList = [] // 某一个分类下的所有电影

  // 获取电影封面、名称
  let picReg = /<img class="figure_pic" src="(.*?)"  alt="(.*?)"(.*?)<div class="figure_caption"/igs
  let picRes
  while (picRes = picReg.exec(body)) {
    let pic = picRes[1]
    let name = picRes[2]
    typeList.push({
      pic,
      name
    })
  }

  // 获取电影详情页链接
  let urlReg = /<div class="list_item" __wind>(.*?)<a href="(.*?)"(.*?)<img/igs
  let urlRes
  let i = 0

  let urlList = []
  while (urlRes = urlReg.exec(body)) {
    urlList.push(urlRes[2])
  }
  for (; i < urlList.length; i++) {
    // 去详情页获取 年份、导演、tag、简介等信息
    pb.render({
      completed: index * urlList.length + i + 1,
      total: urlList.length * size
    });
    let info = await getMoviesDetail(urlList[i])
    typeList[i] = Object.assign({}, typeList[i], {
      ...info,
      urlRes: urlList[i]
    })
  }

  // 获取电影时长
  let durationReg = /<div class="figure_caption" >(.*?)<\/div>/igs
  let duration
  i = 0
  while (duration = durationReg.exec(body)) {
    typeList[i] = Object.assign({}, typeList[i], {
      duration: duration[1]
    })
    i++
  }

  // 获取电影评分
  let scoreReg = /<div class="figure_score">(.*?) <\/div>/igs
  let score
  i = 0
  while (score = scoreReg.exec(body)) {
    typeList[i] = Object.assign({}, typeList[i], {
      score: score[1]
    })
    i++
  }

  // 获取主演
  let toStarReg = /<div class="figure_desc" title="(.*?)">(.*?)<\/div>/igs
  let toStar
  i = 0
  while (toStar = toStarReg.exec(body)) {
    typeList[i] = Object.assign({}, typeList[i], {
      toStar: toStar[1]
    })
    i++
  }

  // 获取播放量
  let playNumReg = /<div class="figure_count">(.*?)svg>(.*?)<\/div>/igs
  let playNumber
  i = 0
  while (playNumber = playNumReg.exec(body)) {
    typeList[i] = Object.assign({}, typeList[i], {
      playNumber: playNumber[2]
    })
    i++
  }
  return typeList
}
```

### 4. 详情页获取 年份、导演、tag、地区、简介等信息
``` js
async function getMoviesDetail(url) {
  let {
    body
  } = await req(url)

  // 获取导演
  let director
  let directorReg = /<div class="director">导演: <a href="(.*?)" target="_blank">(.{1,10})<\/a>&nbsp;&nbsp;&nbsp;/igs
  let directorRes = directorReg.exec(body)
  if (directorRes) {
    if (/^[target]/.test(directorRes[2])) {
      let reg = /target="_blank">(.*?)<\/a>\/<a/ig
      director = reg.exec(directorRes[2])
    } else {
      director = directorRes[2]
    }
  }

  // 获取简介
  let descReg = /<p class="summary">(.*?)<\/p>(.*?)<span/igs
  let desc = descReg.exec(body)[1]


  let reg = /<\/strong>(.*?)<div class="figure_desc">(.*?)<\/div>(.*?)<\/div>(.*?)<div class="figure_num">/igs
  let res = reg.exec(body)
  res = res[2].replace(/ /g, '')

  // 获取年份
  let year = res.substr(1, 4)

  // 获取地区
  let area = res.substring(5, res.length - 1)

  return {
    director,
    desc,
    year,
    area
  }
}
```

### 5. 开启web服务，将抓取到的数据输出到页面查看，或者保存到本地
``` js
const http = require('http');

(async () => {
  let postHTML = await getTypeMovieList()
  http.createServer(function (req, res) {
    req.on('data', function (chunk) {
    });
    req.on('end', function () {
      // 设置响应头部信息及编码
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf8'
      });
      res.write(JSON.stringify(postHTML));
      res.end();
    });
  }).listen(3000);
  console.log('http://localhost:3000')
})()
```

### 6. 保存数据到本地文件
``` js
async function createMovieFile(key, dirname) {
  let movies = await getTypeMovieList(key)
  let path = `movies/${dirname}`
  await createDir(path)
  movies.forEach(async (item) => {
    await writeFile(path + '/' + item.type + '.json', JSON.stringify(item.list))
  });
}

createMovieFile('sort', '排序')
```