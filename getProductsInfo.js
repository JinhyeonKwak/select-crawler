const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.wconcept.co.kr/Product/301799005?entry_channel=women_category&cate_no=001001&cate_nm=%EC%95%84%EC%9A%B0%ED%84%B0&cate_sort='; // 크롤링할 웹사이트 URL

async function fetchImageSrc() {
  try {
    const { data } = await axios.get(url); // 웹페이지 HTML 가져오기
    const $ = cheerio.load(data); // Cheerio로 HTML 파싱

    // 이미지 태그 선택 후 src 값 추출
    const imgSrc = $('#container > div > div > div.pdt_contents.detail > div.marketing > div:nth-child(1) > img').attr('src');

    console.log('이미지 URL:', imgSrc);
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

fetchImageSrc();


