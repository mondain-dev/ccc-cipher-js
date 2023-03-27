const fs = require("fs")
const {parse} = require('csv-parse/sync');

var tableCCCUnicode = parse(fs.readFileSync('ccc-cipher/CCC_Unicode.csv'), {columns: false, trim: true});
var dictCCCDecoding = new Object();
var dictCCCEncoding = new Object();
tableCCCUnicode.forEach( e => {
    dictCCCDecoding[e[0]] = e[2];
});
fs.writeFileSync('CCCDecoding.json', JSON.stringify(dictCCCDecoding), 'utf8');

for(var code in dictCCCDecoding) {
    dictCCCDecoding[code].split(' ').forEach( c => {
        dictCCCEncoding[c] = code;
    })
};
fs.writeFileSync('CCCEncoding.json', JSON.stringify(dictCCCEncoding), 'utf8');

