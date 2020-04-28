const fs = require('fs')
const {
  getTypeMovieList
} = require('./movie')
const {
  createDir,
  writeFile
} = require('./tool-fs');

// 创建不同类型的文件夹，并存入相应分类下的数据
async function createMovieFile(key, dirname) {
  let movies = await getTypeMovieList(key)
  let path = `movies/${dirname}`
  await createDir(path)
  movies.forEach(async (item) => {
    await writeFile(path + '/' + item.type + '.json', JSON.stringify(item.list))
  });
}

let list = [{
    key: 'sort',
    name: '排序'
  },
  {
    key: 'itype',
    name: '类型'
  },
  {
    key: 'iarea',
    name: '地区'
  },
  {
    key: 'characteristic',
    name: '特色'
  },
  {
    key: 'year',
    name: '年份'
  }
]

// 生成所有分类数据保存到本地
for (let i = 0; i < list.length; i++) {
  (async (item) => {
    await createMovieFile(item.key, item.name)
  })(list[i])
}