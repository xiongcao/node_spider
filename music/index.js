/** 爬取echo音乐网数据 */

 const puppeteer = require('puppeteer');

async function initBrowser() {
  return await puppeteer.launch({
    headless: false,
    width: 1200,
    height: 600
  })
}

(async () => {
  // 初始化浏览器窗口
  let browser = await initBrowser()
  // 打开目标网站
  const page = await browser.newPage();
  await page.goto('http://www.app-echo.com/');
  await page.waitFor(2000); // 等待2s，让页面结构加载完

  /** 模拟登陆 begin */

  // 获取登录按钮
  let logBtn = await page.$('.headerv3-login');
  logBtn.click();

  await page.waitFor(1000);

  // 获取登录表单
  let username = await page.$('input[name="username"]');
  await username.focus();
  page.keyboard.type('***');

  await page.waitFor(1000);
  
  let password = await page.$('input.password');
  await password.focus();
  page.keyboard.type('***');

  await page.waitFor(1000);
  
  let loginBtn = await page.$('button.login-btn');
  loginBtn.click();
  /** 模拟登陆 end */
})()