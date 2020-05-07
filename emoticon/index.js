const path = require('path');
const url = require('url');
const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');

const { createDir } = require('../tool-fs');

(async () => {
  let page = 10 // 总共的页数
  for (let i = 0; i < page; i++) {
    let { emojiPackUrlList, emojiPackTitleList } = await getEmojiType(i)
    await getAllEmoji(emojiPackUrlList, emojiPackTitleList)
  }
})()


async function getEmojiType(i) {
  const URL = `https://www.fabiaoqing.com/bqb/lists/type/hot/page/${i}.html`
  let { protocol, host } = url.parse(URL);
  host = protocol + '//' + host
  const { data } = await axios.get(URL);
  const $ = cheerio.load(data);
  let emojiPackUrlList = []; // 表情包详情页地址
  let emojiPackTitleList = []; // 表情包名称
  $('#bqblist a.bqba').each(function (i, ele) {
    emojiPackUrlList.push(host + $(ele).attr('href'));
    emojiPackTitleList.push($(ele).find('h1').text());
  })

  return {
    emojiPackUrlList,
    emojiPackTitleList
  }
}

async function getAllEmoji(emojiPackUrlList, emojiPackTitleList) {
  // 表情包详情页部分
  for (let i = 0; i < emojiPackUrlList.length; i++) {
    let emojiUrl = emojiPackUrlList[i]
    let dirname = emojiPackTitleList[i]
    // 创建类型目录
    await createDir(dirname)

    let { data } = await axios.get(emojiUrl);
    const $ = cheerio.load(data);

    $('.swiper-wrapper img.bqbppdetail').each(async (i, ele) => {
      await downloadEmoji($(ele).attr('data-original'), $(ele).attr('title'), dirname)
    })
  }
}

async function downloadEmoji(src, title, dirname) {
  // 创建文件
  let suffix = path.extname(src)
  let writerStream = fs.createWriteStream(dirname + '/' + title + suffix);
  let { data } = await axios.get(src, { responseType: 'stream' })
  data.pipe(writerStream)
  data.on('close', function() {
    writerStream.close()
  })
}

