const fs = require('fs');
const path = require('path');
const axios = require('axios');

// const MOD = 10;
// const OFFSET = 5;
let countItemCodes = 0;

const baseUrl = 'https://api-display.wconcept.co.kr/display/api/v1/category/products';

const dataDir = path.join(__dirname, 'data');
const readFilePath = path.join(dataDir, 'all_categories.json');
const writeFilePath = path.join(dataDir, `item_codes.json`);

const allCategories = JSON.parse(fs.readFileSync(readFilePath, 'utf8'));

// 랜덤 딜레이 함수 (0.5초 ~ 2초)
function getRandomDelay() {
    return Math.floor(Math.random() * 1500) + 500; // 500ms ~ 2000ms
}

async function fetchItemCodes() {
    const result = [];

    try {
        const requestHeaders = {
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-length": "165",
            "content-type": "application/json; charset=UTF-8",
            "cust_no": "",
            "display-api-key": "VWmkUPgs6g2fviPZ5JQFQ3pERP4tIXv/J2jppLqSRBk=",
            "origin": "https://display.wconcept.co.kr",
            "priority": "u=1, i",
            "referer": "https://display.wconcept.co.kr/",
            "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
        };

        for (let i = 0; i < allCategories.length; i++) {
            const category = allCategories[i];
            const mediumCode = category[category.length - 2];
            const categoryCodes = splitCategoryCodes(category);
            const requestUrl = `${baseUrl}/${mediumCode}/${categoryCodes}`;

            console.log(`[카테고리] 요청 시작: ${requestUrl}`);
            console.log(`[카테고리 정보] ${category.join(' > ')}`);

            let requestBody;
            let pageNo = 1;
            let totalPages = 1000000;

            while (true) {
                requestBody = {
                    "custNo": "",
                    "gender": "Women",
                    "sort": "WCK",
                    "pageNo": pageNo,
                    "pageSize": 60,
                    "bcds": [],
                    "colors": [],
                    "benefits": [],
                    "discounts": [],
                    "status": ["01"],
                    "shopCds": [],
                    "domainType": "m"
                };

                try {
                    const response = await axios.post(requestUrl, requestBody, { headers: requestHeaders });
                    console.log(`[응답] 상태 코드: ${response.status}`);

                    const content = response.data['data']['productList']['content'];
                    totalPages = response.data['data']['productList']['totalPages'];
                    console.log(`[페이지] 진행 중: ${pageNo} / ${totalPages}`);

                    for (const item of content) {
                        console.log(`📦 [상품] itemCd: ${item['itemCd']}`);
                        const product = [...category, item['itemCd']];
                        result.push(product);
                    }

                    countItemCodes += 60;
                    if (pageNo >= totalPages) break;
                    pageNo++;
                } catch (error) {
                    console.error(`[요청 실패] (${pageNo}페이지 실패) ${requestUrl} - ${error.message}`);
                    break;
                } finally {
                    const randomDelay = getRandomDelay();
                    console.log(`⏳ [대기] ${randomDelay}ms 동안 대기 중...`);
                    await delay(randomDelay);
                }
            }
        }

        return result;
    } catch (error) {
        console.error("[전체 크롤링 오류]", error.message);
    }
}

function splitCategoryCodes(category) {
    const concat = category[category.length - 1];
    let codes = "";
    for (let i = 0; i < concat.length; i += 3) {
        codes += concat.substring(i, i + 3) + "/";
    }
    return codes;
}

function saveToFile(data) {
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(writeFilePath, JSON.stringify(data, null, 2), 'utf8');
        console.log("파일 저장 완료:", writeFilePath);
    } catch (error) {
        console.error(`파일 저장 실패: ${error.message}`);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    console.log("🚀 [크롤링 시작]");
    const itemCodes = await fetchItemCodes();
    saveToFile(itemCodes);
    console.log(`🏁 [크롤링 완료]`);
    console.log(`itemCode 개수: 대략 ${countItemCodes}개`)
})();