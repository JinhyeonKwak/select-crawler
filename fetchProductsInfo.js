const axios = require("axios");
const path = require("path");
const cheerio = require("cheerio");
const fs = require("fs");

const MOD = 3;
const OFFSET = 0; // TODO: 작업 끝날 때마다 하나씩 올려서 작업 진행!
let countItems = 0;

const GET_PRODUCT_INFO_URL = "https://www.wconcept.co.kr/Ajax/GetProductsInfo"

const dataDir = path.join(__dirname, 'data');
const READ_FILE_PATH = path.join(dataDir, 'item_codes.json');
const WRITE_FILE_PATH = path.join(dataDir, `products_info_${OFFSET}`);

const itemCodes = JSON.parse(fs.readFileSync(READ_FILE_PATH, 'utf8'));

async function fetchProductsInfo() {

    const productsInfo = [];

    let response;
    let $;

    for (let i = (itemCodes.length / MOD) * OFFSET; i < (itemCodes.length / MOD) * (OFFSET + 1); i++) {
        const itemCode = itemCodes[i][itemCodes[i].length - 1];
        const productInfo = {};

        // 상품 요약 정보
        response = await axios.post(GET_PRODUCT_INFO_URL, {
            "itemcds[]": itemCode
        }, {
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            }
        });
        productInfo['productSummary'] = extractProductSummary(response.data[0]);

        await delay(getRandomDelay());

        // 상품 요약 이미지
        response = await axios.get(productDetailPage(itemCode));
        $ = cheerio.load(response.data);
        productInfo['productSummaryImages'] = extractProductSummaryImages($);

        await delay(getRandomDelay());

        // 상품 상세 이미지
        response = await axios.get(productDetailPage(itemCode));
        $ = cheerio.load(response.data);
        productInfo['productDetailImages'] = extractProductDetailImages($);

        await delay(getRandomDelay());

        // 상품 정보 고시
        response = await axios.get(productDetailPage(itemCode));
        $ = cheerio.load(response.data);
        productInfo['productDetails'] = extractProductDetails($);

        productInfo['info'] = itemCode;
        productsInfo.push(productInfo);

        countItems++;
        await delay(getRandomDelay());
    }

    return productsInfo;
}

function extractProductSummary(productInfo) {
    return {
        "item_code": productInfo['itemCd'],
        "brand_name": productInfo['brandNameKr'],
        "name": productInfo['itemName'],
        "review_score": productInfo['reviewScore'],
        "review_count": productInfo['reviewCnt'],
        "like_count": productInfo['heartCnt'],
        "price": productInfo['customerPrice'],
        "image_url": productInfo['imageUrl']
    };
}

function extractProductSummaryImages($) {
    const productSummaryImages = [];
    let index = 1;
    while (true) {
        if ($('#gallery > li:nth-child(1)') === undefined) break;
        productSummaryImages.push($('#gallery > li:nth-child(index) > a').prop('data-image'));
        index++;
    }
    return productSummaryImages;
}

function extractProductDetailImages($) {
    const productDetailImages = [];
    for (let i = 1; i <= 3; i++) {
        if ($('#container > div > div > div.pdt_contents.detail > div.marketing > div:nth-child(i)') === undefined) {
            break;
        }
        productDetailImages.push($('#container > div > div > div.pdt_contents.detail > div.marketing > div:nth-child(i) > img').attr('src'));
    }
    return productDetailImages;
}

function extractProductDetails($) {
    const productDetails = {};
    let index = 1;
    while (true) {
        if ($('#container > div > div > div.pdt_contents.detail > div.marketing > div:nth-child(index)') === undefined) {
            break;
        }
        const key = $('#container > div > div > div.pdt_contents.detail > div.noti_prod_info.st_default > table > tbody > tr:nth-child(index) > th').text();
        const val = $('#container > div > div > div.pdt_contents.detail > div.noti_prod_info.st_default > table > tbody > tr:nth-child(index) > td').text();
        productDetails[key] = val;
        index++;
    }
    return productDetails;
}

function saveToFile(data) {
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(WRITE_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
        console.log("파일 저장 완료:", WRITE_FILE_PATH);
    } catch (error) {
        console.error(`파일 저장 실패: ${error.message}`);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 랜덤 딜레이 함수 (0.5초 ~ 2초)
function getRandomDelay() {
    return Math.floor(Math.random() * 1500) + 500; // 500ms ~ 2000ms
}

function productDetailPage(itemCode) {
    return `https://www.wconcept.co.kr/Product/${itemCode}?cate_sort=`;
}

(async () => {
    console.log("🚀 [크롤링 시작]");
    const productsInfo = await fetchProductsInfo();
    saveToFile(productsInfo);
    console.log(`🏁 [크롤링 완료]`);
    console.log(`products 개수: 대략 ${countItems}개`);
})();
