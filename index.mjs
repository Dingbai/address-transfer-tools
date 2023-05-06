import { launch } from 'puppeteer';
import { data } from './data.mjs';
import clipboardy from 'clipboardy';
import fs from 'fs';

(async () => {
  const browser = await launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://api.map.baidu.com/lbsapi/getpoint/index.html');
  // 递归函数
  async function recursion(arr, result = []) {
    const item = arr.shift();
    if (!item) {
      console.log('result :>> ', result);
      fs.writeFileSync('./result.json', JSON.stringify(result));
      await browser.close();
      return;
    }
    const inputElement = await page.$('#localvalue');
    await inputElement.click({ clickCount: 3 });
    await inputElement.press('Backspace');
    await inputElement.type(`${item.name}市政府`, {
      delay: 100,
    });
    const searchElement = await page.$('#localsearch');
    await searchElement.click();
    await page.waitForSelector('#txtPanel #no0');
    const resultElement = await page.$('#txtPanel #no0');
    await resultElement.click();
    const copyElement = await page.$('#copyButton');
    await copyElement.click();
    await inputElement.type('');
    const txt = await clipboardy.readSync();
    result.push({ ...item, lat: txt.split(',')[0], lng: txt.split(',')[1] });
    recursion(arr, result);
  }
  await recursion(data);
})();
