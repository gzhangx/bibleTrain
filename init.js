const fs = require('fs');
const mapValues = require('lodash/mapValues');
const maxBy = require('lodash/maxBy');
const flatMap = require('lodash/flatMap');
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


function doChapter(chapter, who, all, names=['cmn2006','engnet']) {
    console.log(`processing ${chapter} ${who}/${all.length}`);
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
    const d1 = (process(names[0]));
    const d2 = (process(names[1]));

    //console.log(maxBy(d1,d=>d.length));
    //console.log(maxBy(d2,d=>d.length));
    return [d1,d2];
}

//doChapter('002_GEN_01');

function processAllChapters(names=['cmn2006','engnet']) {
    const allMapped = allChapters
    .slice(0,3) //TODO remove for full
    .map(doChapter); 
    const maxmax = allMapped.map(([d1,d2])=>{
        const d1max = (maxBy(d1,d=>d.length));
        const d2max = (maxBy(d2,d=>d.length));
        return maxBy([d1max, d2max], d=>d.length);
    });
    const maxLen = (maxBy(maxmax,d=>d.length)).length;
    const doKeysAndArray = (name, acc, wholedata)=>{
        const colInfo = wholedata.reduce((acc, line)=>{
            return line.reduce((acc, d)=>{
                const found = acc.keys[d];
                if (!found) {
                    acc.keyAry.push(d);
                    acc.keys[d] = {
                        id: acc.keyAry.length,
                        count: 1,
                    };
                }else {
                    found.count++;
                }
                return acc;
            },acc);
        },acc.colInfo[name]);
        return {
            ...acc,
            colInfo: {
                ...acc.colInfo,
                name: colInfo,
            },
        };
    };
    const reduced = allMapped.reduce((acc, [d1,d2])=>{
        const d1max = maxBy(d1,d=>d.length);
        const d2max = maxBy(d2,d=>d.length);
        const tmax = maxBy([d1max, d2max], d=>d.length);
        if (tmax.length > acc.maxLen) {
            acc.maxLen = tmax.length;
        }
        acc = doKeysAndArray(names[0],acc, d1);
        acc = doKeysAndArray(names[1],acc, d2);
        return acc;
    },{
        maxLen: 0,
        colInfo: names.reduce((acc, name)=>{
            acc[name] = {
                keys:{},
                keyAry:[],
            }
            return acc;
        },{}),
    });
    console.log(`max len is ${maxLen}`);
    console.log(reduced);
    fs.writeFileSync(`processed/${names.join('_')}_dict.json`, JSON.stringify(reduced));
}

processAllChapters();