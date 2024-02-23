const cheerio = require('cheerio');
const axios = require('axios');
const ExcelJS = require('exceljs');

/* 
    Site to crawl
*/
const baseUrl = 'https://jdtully.com';

const linkList = [];
async function main() {
    await gatherLinks(baseUrl);

    for (let i = 0; i < linkList.length; i++) {
        await gatherLinks(`${baseUrl}/${linkList[i]}`);
        console.log(linkList.length, ' list length');
    }
    console.log(`${linkList.length} Links Found: `, linkList);

    writeToFile({ header: 'links', contents: linkList });
}

async function gatherLinks(url) {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const links = $('a');

    links.each((i, link) => {
        const url = $(link).attr('href');

        console.log('URL: ', url);
        if (url) {
            if (
                url.split('')[0] === '/' &&
                !linkList.includes(url) &&
                url.indexOf('cdn-cgi') === -1
            ) {
                linkList.push(url);
            }
        }
    });
}

function writeToFile(dataObj) {
    // Load an existing workbook
    const workbook = new ExcelJS.Workbook();
    workbook.xlsx
        .readFile('test.xlsx')
        .then(function () {
            // Access the worksheet you want to write to
            const worksheet = workbook.getWorksheet('Sheet1');

            const column1 = worksheet.getColumn('A');

            column1.header = dataObj.header;

            column1.values = [, , ...dataObj.contents];

            // Save the workbook
            return workbook.xlsx.writeFile('test.xlsx');
        })
        .then(function () {
            console.log('Excel file updated successfully.');
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

main();
