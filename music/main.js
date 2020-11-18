const request = require('request');
const UUID = require('uuid');
const fs = require('fs');

const mysql = require('mysql');
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'music'
});

connection.connect();

async function querySql(sql, sqlParams) {
  return new Promise((resolve, reject) => {
    connection.query(sql, sqlParams, function (error, results, fields) {
      if (error) throw error;
      console.log('results: ', results);
      resolve(results)
    });
  })
}



// 封装get请求
async function req(url) {
  return new Promise((resolve, reject) => {
    request.get(url, (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(JSON.parse(body))
      }
    })
  })
}

; (async () => {
  // 标签和分类
  // await getTagAndCategory('http://localhost:8000/playlist/catlist');

  // 歌手、歌曲、专辑
  // await getSinger('http://localhost:8000/top/artists?limit=20');
  // await getSinger('http://localhost:8000/top/artists?limit=20&offset=20');
  // await getSinger('http://localhost:8000/top/artists?limit=20&offset=40');
  // await getSinger('http://localhost:8000/top/artists?limit=20&offset=80');
})()

async function getTagAndCategory(url) {
  const { categories, sub } = await req(url);
  let cSql = "INSERT INTO category(id, `name`, createdAt, updatedAt, version) VALUES ?";
  let cParams = []
  for (const k in categories) {
    let list = [];
    const v = categories[k];
    list.splice(0, 0, UUID.v1(), v, new Date().getTime(), new Date().getTime(), 0);
    cParams.push(list);
  }
  // await querySql(cSql, [cParams]);

  let tagSql = "INSERT INTO tag(id, `name`, hot, categoryId, activity, resourceCount, resourceType, type, createdAt, updatedAt, version) VALUES ?";
  let tagParams = []
  for (const key in sub) {
    const tag = sub[key];
    let list = [];
    list.splice(0, 0, UUID.v1(), tag.name, tag.hot, tag.category, tag.activity, tag.resourceCount, tag.resourceType, tag.type, new Date().getTime(), new Date().getTime(), 0);
    tagParams.push(list);
  }
  // await querySql(tagSql, [tagParams]);
}

async function getSinger(url) {
  const { artists } = await req(url);
  // 添加歌手
  let singerSql = "INSERT INTO singer(id, singer_id,`name`, password, nickname, pic_url, music_count, mv_count, album_count, brief, alias, createdAt, updatedAt, version) VALUES ?";
  let singerParams = [];

  // 添加专辑
  let albumSql = 'INSERT INTO album(id, album_id, singer_id, `name`, pic_url, brief, play_count, share_count, publish_time, sub_type, company, type, createdAt, updatedAt, version) VALUES ?'
  
  // 添加歌曲
  let songSql = 'INSERT INTO song(id, song_id, album_id, `name`, mv_id, lyric_id, play_count, download_count, createdAt, updatedAt, version) VALUES ?'
  
  for (let i = 0; i < artists.length; i++) {
    // for (let i = 0; i < 1; i++) {
    let singerList = [];
    const v = artists[i];

    /** 歌手 Begin */

    // 查询是否有重复的歌手ID
    const res = await querySql('SELECT * FROM singer WHERE singer_id = ?', [v.id]);
    if (res.length !== 0) {
      console.log('singerId重复：' + v.id)
      continue;
    }
    const { artist, hotSongs } = await req('http://localhost:8000/artists?id=' + v.id).catch(err => console.log(err));

    // 下载歌手图片
    // await download(artist.picUrl, './singerImages/', artist.picId + '.jpg');

    singerList.splice(0, 0, UUID.v1(), artist.id, artist.accountId || artist.id, 'e10adc3949ba59abbe56e057f20f883e', artist.name, artist.picUrl, artist.musicSize, artist.mvSize, artist.albumSize, artist.briefDesc, artist.alias.toString(), new Date().getTime(), new Date().getTime(), 0);
    singerParams.push(singerList);
    /** 歌手 End */

    /** 歌曲 Begin */
    let songParams = [];

    for (let j = 0; j < hotSongs.length; j++) {
      const song = hotSongs[j];

      // 查询是否有重复的专辑ID
      const res = await querySql('SELECT * FROM song WHERE song_id = ?', [song.id]);
      if (res.length !== 0) {
        console.log('songId重复：' + song.id)
        continue;
      }

      let songList = [UUID.v1(), song.id, song.al.id, song.name, song.mv, song.id, getRandom(2000, 50000), getRandom(1000, 10000), new Date().getTime(), new Date().getTime(), 0];
      songParams.push(songList);
    }
    if (songParams.length !== 0) {
      await querySql(songSql, [songParams]); // 添加专辑
    }
    /** 歌曲 End */


    /** 专辑 Begin */
    let albumParams = [];

    const { hotAlbums } = await req('http://localhost:8000/artist/album?id=' + v.id).catch(err => console.log(err));
    for (let j = 0; j < hotAlbums.length; j++) {
      const album = hotAlbums[j];

      // 查询是否有重复的专辑ID
      const res = await querySql('SELECT * FROM album WHERE album_id = ?', [album.id]);
      if (res.length !== 0) {
        console.log('albumId重复：' + album.id)
        continue;
      }
      // 下载专辑图片
      await download(album.picUrl, './albumImages/', album.picId + '.jpg');
      let albumList = [UUID.v1(), album.id, v.id, album.name, album.picUrl, album.briefDesc, getRandom(2000, 50000), getRandom(1000, 10000), album.publishTime, album.subType, album.company, album.type, new Date().getTime(), new Date().getTime(), 0];
      albumParams.push(albumList);
    }
    if (albumParams.length !== 0) {
      await querySql(albumSql, [albumParams]); // 添加专辑
    }
    /** 专辑 End */

    await sleep(getRandom(2000, 5000))
    console.log('第' + (i + 1) + '条');

  }
  if (singerParams.length !== 0) {
    await querySql(singerSql, [singerParams]); // 添加歌手
  }
  console.log('完成')
}

async function download(url, path, filename) {
  filename = UUID.v1().toLocaleUpperCase() + '==' + filename;
  await request(url).pipe(fs.createWriteStream(path + filename))
}

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time || 1000);
  })
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}