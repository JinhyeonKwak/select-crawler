const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const largeCategories = ['women', 'men', 'kids', 'beauty', 'life'];
const baseUrl = "https://display.wconcept.co.kr/category";
const existsByCode = {};

const dataDir = path.join(__dirname, 'data');
const filePath = path.join(dataDir, 'category_data.json');

async function fetchCategoryData() {
    const result = [];

    try {
        for (const category of largeCategories) {
            for (let i = 1; i <= 20; i++) {
                const urlPath = '/' + category + '/' + String(i).padStart(3, '0');
                const requestUrl = baseUrl + urlPath;

                try {
                    const response = await axios.get(requestUrl);
                    if (response.status === 200) {
                        const categoryPath = parseCategoryPath(response);

                        if (categoryPath.length >= 3) {
                            const smallCategories = await fetchSmallCategories(urlPath);
                            result.push(smallCategories);
                        }
                    }
                } catch (error) {
                    console.error(`[중분류] 요청 실패: ${requestUrl} - ${error.message}`);
                }

                await delay(1000);
            }
        }
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function fetchSmallCategories(prefix) {
    const result = [];

    try {
        for (let i = 1; i <= 20; i++) {
            const urlPath = prefix + String(i).padStart(3, '0');
            const requestUrl = baseUrl + urlPath;

            try {
                const response = await axios.get(requestUrl);

                if (response.status === 200) {
                    const categoryPath = parseCategoryPath(response);

                    if (categoryPath.length >= 4) {
                        const split = urlPath.split('/');
                        const categoryCode = split[split.length - 1];
                        if (!existsByCode[categoryCode]) {
                            existsByCode[categoryCode] = true;
                            categoryPath.push(categoryCode);
                            result.push(categoryPath);
                        }

                        const subSmallCategories = await fetchSubSmallCategories(urlPath);
                        result.push(subSmallCategories);
                    }
                }
            } catch (error) {
                console.error(`[소분류] 요청 실패: ${requestUrl} - ${error.message}`);
            }

            await delay(1000);
        }
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function fetchSubSmallCategories(prefix) {
    const result = [];

    try {
        for (let i = 1; i <= 20; i++) {
            const urlPath = prefix + String(i).padStart(3, '0');
            const requestUrl = baseUrl + urlPath;

            console.log(`🔍 [세부 소분류] 요청 중: ${requestUrl}`);

            try {
                const response = await axios.get(requestUrl);
                console.log(`[세부 소분류] 응답 상태: ${response.status}`);

                if (response.status === 200) {
                    const categoryPath = parseCategoryPath(response);

                    if (categoryPath.length >= 5) {
                        const split = urlPath.split('/');
                        const categoryCode = split[split.length - 1];
                        if (!existsByCode[categoryCode]) {
                            existsByCode[categoryCode] = true;
                            categoryPath.push(categoryCode);
                            console.log(`[세부 소분류] ${categoryPath.join(' > ')}`);
                            result.push(categoryPath);
                        }
                    }
                }
            } catch (error) {
                console.error(`[세부 소분류] 요청 실패: ${requestUrl} - ${error.message}`);
            }

            await delay(1000);
        }
        return result;
    } catch (error) {
        console.error(error);
    }
}

function parseCategoryPath(response) {
    try {
        const $ = cheerio.load(response.data);
        const jsonString = $('script').text();
        const parsedJson = JSON.parse(jsonString);
        const categoryPath = parsedJson['props']['pageProps']['initialData']['categoryInfo']['data']['categoryPath'];

        let mediumCode = '';
        if (parsedJson['props']['pageProps']['initialData']['categoryInfo']['data']['shortcutCategory'] !== undefined
            && parsedJson['props']['pageProps']['initialData']['categoryInfo']['data']['shortcutCategory'].length > 0) {
            mediumCode = parsedJson['props']['pageProps']['initialData']['categoryInfo']['data']['shortcutCategory'][0]['mediumCd'];
        }
        categoryPath.push(mediumCode);
        return categoryPath;
    } catch (error) {
        return [];
    }
}

function saveToFile(data) {
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log("파일 저장 성공:", filePath);
    } catch (error) {
        console.error(`파일 저장 실패: ${error.message}`);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    console.log("[크롤링 시작]");
    const categoryData = await fetchCategoryData();
    saveToFile(categoryData);
    console.log("[크롤링 완료]");
})();
