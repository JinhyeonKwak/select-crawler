const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const readFilePath = path.join(dataDir, 'category_data.json');
const writeFilePath = path.join(dataDir, 'all_categories.json');

function extractValues(jsonObj, valuesList = []) {
    if (typeof jsonObj === 'object' && jsonObj !== null) {
        if (Array.isArray(jsonObj)) {
            jsonObj.forEach(item => extractValues(item, valuesList));
        } else {
            Object.values(jsonObj).forEach(value => extractValues(value, valuesList));
        }
    } else {
        valuesList.push(jsonObj);
    }
    return valuesList;
}

const jsonData = JSON.parse(fs.readFileSync(readFilePath, 'utf8'));
const extracted = extractValues(jsonData);

const result = [];
let temp = [];
for (const item of extracted) {
    temp.push(item);
    if (item.startsWith('0')) {
        result.push(temp);
        temp = [];
    }
}
result.push(temp);

fs.writeFileSync(writeFilePath, JSON.stringify(result, null, 2), 'utf8');
