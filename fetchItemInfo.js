const fs = require('fs');
const path = require('path');
const axios = require('axios');

const largeCategories = ['Women', 'Men', 'Kids', 'Beauty', 'Life'];
const baseUrl = 'https://api-display.wconcept.co.kr/display/api/v1/category/products/M33439436/001';

async function fetchItemInfo() {

    try {
        const requestHeaders = {
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-length": "165",
            "content-type": "application/json; charset=UTF-8",
            "cust_no": "",  // 필요하면 값 설정
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

        const requestBody = {
            "custNo": "",
            "gender": "Women",
            "sort": "WCK",
            "pageNo": 1,
            "pageSize": 60,
            "bcds": [],
            "colors": [],
            "benefits": [],
            "discounts": [],
            "status": ["01"],
            "shopCds": [],
            "domainType": "m"
        };

        for (const category of largeCategories) {

            const response = await axios.post(baseUrl, requestBody, {headers: requestHeaders});

        }

        console.log(response.data['data']);
    } catch (error) {
        console.error(error);
    }
}

fetchItemInfo();