const request = require('request');
const UUID = require('uuid');
const fs = require('fs');

const mysql = require('mysql');
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'music',
  charset: 'utf8mb4'
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

  // 歌手、歌曲、专辑、歌手-歌曲关联表

  // 热门-推荐歌手
  // await getSinger('http://localhost:8000/top/artists?limit=20'), 1;
  // await getSinger('http://localhost:8000/top/artists?limit=20&offset=20', 1);
  // await getSinger('http://localhost:8000/top/artists?limit=20&offset=40', 1);
  // await getSinger('http://localhost:8000/top/artists?limit=20&offset=60', 1);
  // await getSinger('http://localhost:8000/top/artists?limit=20&offset=80', 1);


  await getSinger('http://localhost:8000/toplist/artist?type=2', 2); // 华语歌手
  // await getSinger('http://localhost:8000/toplist/artist?type=3', 3); // 欧美歌手
  // await getSinger('http://localhost:8000/toplist/artist?type=4', 4); // 日本歌手
  // await getSinger('http://localhost:8000/toplist/artist?type=5', 5); // 韩国歌手

  // 榜单（歌单）32
  // await getTopList('http://localhost:8000/toplist/detail');

  // 精选歌单 300
  // await getHighquality('http://localhost:8000/top/playlist/highquality?limit=10'); // 请求10条
  // await getHighquality('http://localhost:8000/top/playlist/highquality?before=1592799664000&limit=40'); // 请求40条，共50条
  // await getHighquality('http://localhost:8000/top/playlist/highquality?before=1584342949287&limit=50'); // 请求50条，共100条
  // await getHighquality('http://localhost:8000/top/playlist/highquality?before=1565748319572&limit=30'); // 请求30条，共130条
  // await getHighquality('http://localhost:8000/top/playlist/highquality?before=1543763449032&limit=30'); // 请求30条，共160条
  // await getHighquality('http://localhost:8000/top/playlist/highquality?before=1520777379293&limit=40'); // 请求40条，共200条
  // await getHighquality('http://localhost:8000/top/playlist/highquality?before=1496167200316&limit=40'); // 请求40条，共240条
  // await getHighquality('http://localhost:8000/top/playlist/highquality?before=1496167200255&limit=30'); // 请求30条，共270条
  // await getHighquality('http://localhost:8000/top/playlist/highquality?before=1496167200214&limit=30'); // 请求30条，共300条

  // 网友歌单 330
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30`);
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30&offset=30`);
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30&offset=60`);
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30&offset=90`);
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30&offset=120`);
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30&offset=150`);
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30&offset=180`);
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30&offset=210`);
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30&offset=240`);
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30&offset=270`);
  // await getHighquality(`http://localhost:8000/top/playlist?cat=%E5%85%A8%E9%83%A8&limit=30&offset=300`);

  // 添加歌手类型
  // await addSingerType();

  // 更新song表的时长、添加歌词

  // 推荐歌手
  // await updateSongDateTime('http://localhost:8000/top/artists?limit=20', 1);
  // await updateSongDateTime('http://localhost:8000/top/artists?limit=20&offset=20', 1);
  // await updateSongDateTime('http://localhost:8000/top/artists?limit=20&offset=40', 1);
  // await updateSongDateTime('http://localhost:8000/top/artists?limit=20&offset=60', 1);
  // await updateSongDateTime('http://localhost:8000/top/artists?limit=20&offset=80', 1);


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

async function getSinger(url, type) {
  let artists = [];

  if (type === 1) {
    const data = await req(url);
    artists = data.artists;
  } else {
    const { list } = await req(url);
    artists = list.artists;
  }
  // 添加歌手
  let singerSql = "INSERT INTO singer(id, singer_id,`name`, password, nickname, pic_url, music_count, mv_count, album_count, brief, alias, createdAt, updatedAt, version) VALUES ?";
  let singerParams = [];

  // 添加专辑
  let albumSql = 'INSERT INTO album(id, album_id, singer_id, `name`, pic_url, brief, play_count, share_count, publish_time, sub_type, company, type, createdAt, updatedAt, version) VALUES ?'

  // 添加歌曲
  let songSql = 'INSERT INTO song(id, song_id, album_id, `name`, mv_id, lyric_id, play_count, download_count, createdAt, updatedAt, version) VALUES ?'

  // 歌手-歌曲关联表
  let s_s_Sql = "INSERT INTO singer_song_mapping(id, singer_id, song_id, createdAt, updatedAt, version) VALUES ?";

  // 歌词
  const lyricSql = 'INSERT INTO lyric(id, content, createdAt, updatedAt, version) VALUES ?';

  // 歌手-类型-关联表
  let singertypeSql = 'INSERT INTO singer_type_mapping(id, type_id, singer_id, createdAt, updatedAt, version) VALUES ?';

  let singertypeParams = [];

  for (let i = 0; i < artists.length; i++) {
    let singerList = [];
    const v = artists[i];


    // 查询是否有重复的歌手，存在该歌手：只更新，歌手-类型-映射表数据
    const res = await querySql('SELECT * FROM singer WHERE singer_id = ?', [v.id]);

    singertypeParams.push([UUID.v1(), type, v.id, new Date().getTime(), new Date().getTime(), 0]);

    if (res.length !== 0) {
      // 添加歌手-分类-关联表数据
      continue;
    }

    const { artist, hotSongs } = await req('http://localhost:8000/artists?id=' + v.id).catch(err => console.log(err));


    /** 歌手 Begin */
    // 下载歌手图片
    await download(artist.picUrl, './singerImages/', artist.picId + '.jpg');

    singerList.splice(0, 0, UUID.v1(), artist.id, artist.accountId || artist.id, 'e10adc3949ba59abbe56e057f20f883e', artist.name, artist.picUrl, artist.musicSize, artist.mvSize, artist.albumSize, artist.briefDesc, artist.alias.toString(), new Date().getTime(), new Date().getTime(), 0);
    singerParams.push(singerList);
    /** 歌手 End */

    /** 歌曲 Begin */
    let songParams = [];
    let s_s_params = [];

    let lyricParams = []

    for (let j = 0; j < hotSongs.length; j++) {
      const song = hotSongs[j];

      /** 歌手-歌曲 关联表 Begin */
      s_s_params.push([UUID.v1(), v.id, song.id, new Date().getTime(), new Date().getTime(), 0])

      /** 歌手-歌曲 关联表 End */

      // 查询是否有重复的歌曲
      const res = await querySql('SELECT * FROM song WHERE song_id = ?', [song.id]);
      if (res.length !== 0) {
        console.log('songId重复：' + song.id)
        continue;
      }

      let songList = [UUID.v1(), song.id, song.al.id, song.name, song.mv, song.id, getRandom(2000, 50000), getRandom(1000, 10000), new Date().getTime(), new Date().getTime(), 0];
      songParams.push(songList);

      /** 歌词 Begin */
      const lrcRes = await querySql('SELECT * FROM lyric WHERE id = ?', [song.id]);

      if (lrcRes.length !== 0) {
        continue;
      }

      if (filterRepeat(lyricParams, song.id, 0)) {
        continue;
      }

      // 添加歌词
      const { lrc } = await req('http://localhost:8000/lyric?id=' + song.id);

      if (lrc) {
        const { lyric, version } = lrc;
        if (lyric && version) {
          lyricParams.push([song.id, lyric, new Date().getTime(), new Date().getTime(), version]);
        }
      }
      /** 歌词 End */

      await sleep(getRandom(1000, 1500))
    }

    // 批量添加歌词
    if (lyricParams.length !== 0) {
      await querySql(lyricSql, [lyricParams]);
    }

    if (songParams.length !== 0) {
      await querySql(songSql, [songParams]); // 添加专辑
    }

    /** 歌手-歌曲 关联表 Begin */
    if (s_s_params.length !== 0) {
      await querySql(s_s_Sql, [s_s_params]);
    }

    /** 歌手-歌曲 关联表 End */
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

    console.log('第' + (i + 1) + '条');

  }
  if (singerParams.length !== 0) {
    await querySql(singerSql, [singerParams]); // 添加歌手
  }

  if (singertypeParams.length !== 0) {
    await querySql(singertypeSql, [singertypeParams]);
  }
  console.log('完成')
}

// 歌手类型
async function updateSongDateTime(url, type) {
  const { artists } = await req(url);

  const lyricSql = 'INSERT INTO lyric(id, content, createdAt, updatedAt, version) VALUES ?';
  const singertypeSql = 'INSERT INTO singer_type_mapping(id, type_id, singer_id, createdAt, updatedAt, version) VALUES ?';

  let singertypeParams = []

  for (let i = 0; i < artists.length; i++) {
    const v = artists[i];

    // 查询是否有存在该歌手，只更新已有的歌手
    const res = await querySql('SELECT * FROM singer WHERE singer_id = ?', [v.id]);
    if (res.length === 0) {
      continue;
    }

    // 添加歌手-分类-关联表数据
    singertypeParams.push([UUID.v1(), type, v.id, new Date().getTime(), new Date().getTime(), 0]);

    const { hotSongs } = await req('http://localhost:8000/artists?id=' + v.id).catch(err => console.log(err));

    let lyricParams = [];

    for (let j = 0; j < hotSongs.length; j++) {
      const song = hotSongs[j];

      // 只更新已有的歌曲
      const res = await querySql('SELECT * FROM song WHERE song_id = ?', [song.id]);
      if (res.length === 0) {
        continue;
      }

      const lrcRes = await querySql('SELECT * FROM lyric WHERE id = ?', [song.id]);

      if (lrcRes.length !== 0) {
        continue;
      }

      if (filterRepeat(lyricParams, song.id, 0)) {
        continue;
      }

      // 添加歌词
      const { lrc } = await req('http://localhost:8000/lyric?id=' + song.id);

      if (lrc) {
        const { lyric, version } = lrc;
        if (lyric && version) {
          lyricParams.push([song.id, lyric, new Date().getTime(), new Date().getTime(), version]);
        }
      }

      // 更新时长
      await querySql('UPDATE song SET dt = ? WHERE song_id = ?', [song.dt, song.id]);

      await sleep(getRandom(1000, 1500))
    }

    // 批量添加歌词
    if (lyricParams.length !== 0) {
      await querySql(lyricSql, [lyricParams]);
    }

    console.log('第' + (i + 1) + '条');
  }

  if (singertypeParams.length !== 0) {
    await querySql(singertypeSql, [singertypeParams]);
  }

  console.log('完成')
}

async function getTopList(url) {
  const { list } = await req(url);
  getSheet(list);
}

async function getHighquality(url) {
  const { playlists } = await req(url);
  getSheet(playlists);
}

async function getSheet(list) {
  // 榜单
  let topSql = "INSERT INTO sheet(id, sheet_id, user_id, `name`, pic_url, description, play_count, share_count, collection_count, type, createdAt, updatedAt, version) VALUES ?";
  // 歌手（用户）
  let singerSql = "INSERT INTO singer(id, singer_id,`name`, password, nickname, pic_url, music_count, mv_count, album_count, brief, province, city, birthday, gender, createdAt, updatedAt, version) VALUES ?";
  // 歌曲-歌单关联表
  let trackSql = "INSERT INTO song_sheet_mapping(id, song_id, sheet_id, createdAt, updatedAt, version) VALUES ?";
  // 用户-歌单关联表
  let subSql = "INSERT INTO singer_sheet_mapping(id, singer_id, sheet_id, createdAt, updatedAt, version) VALUES ?";

  let topParams = [], singerCreatorParams = [];
  for (let k = 0; k < list.length; k++) { // 遍历榜单
    const sheet = list[k];

    // 已存在该歌单，则跳过，进入下一条
    const sheetSql = await querySql('SELECT * FROM sheet WHERE sheet_id = ?', [sheet.id]);
    if (sheetSql.length !== 0) {
      continue;
    }

    // 查询榜单详细信息
    const { playlist } = await req('http://localhost:8000/playlist/detail?id=' + sheet.id).catch(err => console.log(err));

    const { tracks, subscribers, tags, creator } = playlist; // 榜单歌曲、榜单收藏者、标签、创建者

    /** 歌曲-歌单 关联表 Begin */
    let trackParams = []
    for (const i in tracks) { // 遍历歌曲
      const track = tracks[i];
      trackParams.push([UUID.v1(), track.id, sheet.id, new Date().getTime(), new Date().getTime(), 0]);
    }
    if (trackParams.length !== 0) {
      await querySql(trackSql, [trackParams]);
    }
    /** 歌曲-歌单 关联表 End */


    /** 用户-歌单 关联表 Begin */
    let subParams = [];
    let singerParams = [];

    for (const i in subscribers) { // 遍历收藏者
      const sub = subscribers[i];

      // 查询是否存在该用户
      const res = await querySql('SELECT * FROM singer WHERE singer_id = ?', [sub.userId]);
      if (res.length === 0) { // 不存在、可以添加
        // 下载用户图片
        await download(sub.avatarUrl, './singerImages/', sub.avatarImgIdStr + '.jpg');
        singerParams.push([UUID.v1(), sub.userId, sub.userId, 'e10adc3949ba59abbe56e057f20f883e', sub.nickname, sub.avatarUrl, 0, 0, 0, sub.signature, sub.province, sub.city, sub.birthday, sub.gender, new Date().getTime(), new Date().getTime(), 0]);
      }

      subParams.push([UUID.v1(), sub.userId, sheet.id, new Date().getTime(), new Date().getTime(), 0]);
    }
    if (singerParams.length !== 0) {
      await querySql(singerSql, [singerParams]); // 添加用户信息
    }
    await querySql(subSql, [subParams]); // 添加 收藏者-歌单关联表信息
    /** 用户-歌单 关联表 End */

    /** 标签-歌单 关联表 Begin */
    let tagParams = [];
    let tagSql = "INSERT INTO tag_sheet_mapping(id, tag_id, sheet_id, createdAt, updatedAt, version) VALUES ?";
    for (const i in tags) {
      const tagName = tags[i];
      let taglist = await querySql('select * from tag where name = ?', tagName);
      if (taglist.length !== 0) {
        tagParams.push([UUID.v1(), taglist[0].id, sheet.id, new Date().getTime(), new Date().getTime(), 0]);
      }
    }
    if (tagParams.length !== 0) {
      await querySql(tagSql, [tagParams]); // 添加 标签-歌单 关联表 信息
    }

    /** 标签-歌单 关联表 End */

    /** 歌单创建者 */

    // 查询是否存在该用户
    const creatorRes = await querySql('SELECT * FROM singer WHERE singer_id = ? or `name` = ?', [creator.userId, creator.userId]);
    if (creatorRes.length === 0) { // 不存在、可以添加
      if (!filterRepeat(singerCreatorParams, creator.userId, 1) && !filterRepeat(singerCreatorParams, creator.userId, 2)) {
        // 下载用户图片
        await download(creator.avatarUrl, './singerImages/', creator.avatarImgIdStr + '.jpg');
        singerCreatorParams.push([UUID.v1(), creator.userId, creator.userId, 'e10adc3949ba59abbe56e057f20f883e', creator.nickname, creator.avatarUrl, 0, 0, 0, creator.signature, creator.province, creator.city, creator.birthday, creator.gender, new Date().getTime(), new Date().getTime(), 0]);
      }
    }

    // 下载榜单图片
    await download(playlist.coverImgUrl, './toplistImages/', playlist.coverImgId + '.jpg');

    topParams.push([UUID.v1(), playlist.id, playlist.userId, playlist.name, playlist.coverImgUrl, playlist.description, playlist.playCount, playlist.shareCount, playlist.subscribedCount, 2, new Date().getTime(), new Date().getTime(), 0]);

    await sleep(getRandom(2000, 4000))
    console.log('第' + (Number(k) + 1) + '条');
  }
  if (singerCreatorParams.length !== 0) {
    await querySql(singerSql, [singerCreatorParams]); // 歌手
  }
  await querySql(topSql, [topParams]); // 添加榜单信息
  console.log('完成')
}

async function addSingerType() {
  let typeSql = "INSERT INTO singertype(id, pid, `name`, createdAt, updatedAt, version) VALUES ?";

  const typeParams = [
    [1, 0, '推荐', new Date().getTime(), new Date().getTime(), 0],
    [7, 1, '推荐歌手', new Date().getTime(), new Date().getTime(), 0], [8, 1, '入驻歌手', new Date().getTime(), new Date().getTime(), 0],

    [2, 0, '华语', new Date().getTime(), new Date().getTime(), 0],
    [9, 2, '华语男歌手', new Date().getTime(), new Date().getTime(), 0], [10, 2, '华语女歌手', new Date().getTime(), new Date().getTime(), 0], [11, 2, '华语组合/乐队', new Date().getTime(), new Date().getTime(), 0],

    [3, 0, '欧美', new Date().getTime(), new Date().getTime(), 0],
    [12, 3, '欧美男歌手', new Date().getTime(), new Date().getTime(), 0], [13, 3, '欧美女歌手', new Date().getTime(), new Date().getTime(), 0], [14, 3, '欧美组合/乐队', new Date().getTime(), new Date().getTime(), 0],

    [4, 0, '日本', new Date().getTime(), new Date().getTime(), 0],
    [15, 4, '日本男歌手', new Date().getTime(), new Date().getTime(), 0], [16, 4, '日本女歌手', new Date().getTime(), new Date().getTime(), 0], [17, 4, '日本组合/乐队', new Date().getTime(), new Date().getTime(), 0],

    [5, 0, '韩国', new Date().getTime(), new Date().getTime(), 0],
    [18, 5, '韩国男歌手', new Date().getTime(), new Date().getTime(), 0], [19, 5, '韩国女歌手', new Date().getTime(), new Date().getTime(), 0], [20, 5, '韩国组合/乐队', new Date().getTime(), new Date().getTime(), 0],

    [6, 0, '其他', new Date().getTime(), new Date().getTime(), 0],
    [21, 6, '其他男歌手', new Date().getTime(), new Date().getTime(), 0], [22, 6, '其他女歌手', new Date().getTime(), new Date().getTime(), 0], [23, 6, '其他组合/乐队', new Date().getTime(), new Date().getTime(), 0]
  ];
  await querySql(typeSql, [typeParams]);
  console.log('完成');
}


async function download(url, path, filename) {
  filename = UUID.v1().toLocaleUpperCase() + '==' + filename;
  try {
    await request(url).pipe(fs.createWriteStream(path + filename, { autoClose: true }))
  } catch (error) {
    console.log(err)
  }
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

// 二维数组：判断是否存在某个值
function filterRepeat(list, id, index) {
  let flag = false;
  for (let i = 0; i < list.length; i++) {
    let arr = list[i];
    if (arr[index] == id) {
      flag = true;
      break;
    }
  }
  return flag;
}