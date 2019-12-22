const fs = require('fs');
const mapValues = require('lodash/mapValues');
const allChapters = require('./chapters');

function addSpace(l) {
    return l.split('').map(c=>{
        if (c.match(/[0-9a-zA-Z]/))
            return c;
        return ' ' + c+' ';
    }).join('');
}
function doSplit(line, splitChar) {
    if (splitChar === '')
        return line.split(splitChar);
    const splits = addSpace(line.toLowerCase()).split(splitChar).filter(x=>x!=='');
    return splits;
}
function loadData(tag = 'cmn2006', splitChar='') {
    const dir = `./data/${tag}_readaloud`;
    const files = fs.readdirSync(dir).filter(f=>f.startsWith(tag) && !f.startsWith(`${tag}_000`));
    //console.log(files);
    fs.writeFileSync('chapters.json', JSON.stringify(files.map(f=>f.substr(tag.length+1).replace('_read.txt',''))))
    const allRes = files.reduce((acc,filename)=>{
        const fullName = `${dir}/${filename}`;
        const lines = fs.readFileSync(fullName).toString().split('\n').map(l=>l.trim()).filter(x=>x);
        //console.log(lines);

        return lines.reduce((acc, l)=>{
            const chars = doSplit(l, splitChar);//  l.split(splitChar);
            chars.forEach(c=>{
                if (!acc[c]) {
                    acc[c] = 1;
                } else {
                    acc[c]++;
                }
            });
            return acc;
        }, acc);
    },{});
    console.log(Object.values(mapValues(allRes, (val,key)=>({word:key, count:val}))).sort((a,b)=>b.count-a.count));
}


//loadData();
//loadData('engnet', ' ');


function doChapter(chapter) {
    const getFileName = tag=>`./data/${tag}_readaloud/${tag}_${chapter}_read.txt`;
    const process = tag=>{
        const fullName = getFileName(tag);
        const splitChar = tag === 'cmn2006'?'':' ';
        const lines = fs.readFileSync(fullName).toString().split('\n').map(l=>l.trim()).filter(x=>x);
        return lines.reduce((acc, l)=>{
            const chars = doSplit(l, splitChar);//  l.split(splitChar);
            acc.push(chars);
            return acc;
        }, []);
    };
    //console.log(process('cmn2006'));
    console.log(process('engnet'));
}

doChapter('002_GEN_01');