
const dicts = require('./processed/cmn2006_engnet_dict.json');
const get = require('lodash/get');

const tran = "In the beginning God created the heavens and the earth".split(' ');

const res = tran.map(w=>get(dicts.colInfo.engnet.keys,[w.toLowerCase(),'id']));
res.map((r,i)=>{
    if (r === undefined) {
        console.log(`Unknown word ${tran[i]}`);
    }
});
console.log(JSON.stringify(res));