const axios = require('axios');
const cheerio = require('cheerio');

const largeCategories = ['women', 'men', 'kids', 'beauty', 'life']

const baseUrl = "https://display.wconcept.co.kr/category";

async function fetchMiddleCategoryInfo() {
    const result = [];

    try {
        let urlPath;
        for (const category of largeCategories) {
            // 중분류
            for (let i = 1; i <= 20; i++) {
                urlPath = '/' + category + '/' + String(i).padStart(3, '0');
                const response = await axios.get(baseUrl + urlPath);
                if (response.status === 200) {
                    const $ = cheerio.load(response.data);

                    const jsonString = $('script').text();
                    const parsedJson = JSON.parse(jsonString);
                    const categoryPath = parsedJson['props']['pageProps']['initialData']['categoryInfo']['data']['categoryPath'];

                    if (categoryPath.length === 2) {
                        categoryPath.push(String(i).padStart(3, '0'));
                        result.push(categoryPath);
                    }
                }

                await delay(1000);
            }
        }

        return result;
    } catch (error) {
        console.error('에러 발생:', error);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const middleCategoryInfo = await fetchMiddleCategoryInfo();
    console.log(middleCategoryInfo);
})();