function numberToString(number) {
    if(isNaN(number)) return 'NaN';
    if(number === -0 || number === +0) return '0';
    if(number < 0) return `-${numberToString(- number)}`;
    if(number === -Infinity) return '-Infinity';
    if(number === Infinity) return 'Infinity';
    return `${number}`
};
const rate = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    a: 10,
    b: 11,
    c: 12,
    d: 13,
    e: 14,
    f: 15,
}
function stringToNumber(string, base = 10) {
    let result = 0;
    const rex16 = /^(0x|0X)[a-fA-F0-9]{1,}/;
    const rex8 = /^0[0-7]{1,}/;
    const rex2 = /^(0b|0B)[0-1]{1,}/;
    let otiginBase, sliceStart;
    if(string.startSWith('-')) {
        return -stringToNumber(string.slice(1), base)
    }
    if(rex16.test(string)) {
        otiginBase = 16;
        sliceStart = 2;
    }
    if(rex8.test(string)) {
        otiginBase = 8;
        sliceStart = 1;
    }
    if(rex2.test(string)) {
        otiginBase = 2;
        sliceStart = 2;
    }
    const newStrArr = string.slice(sliceStart).split('').reverse();
    const resultBase10 = newStrArr.reduce((prev, next, index) => {
        prev += ((rate[next] || next) + otiginBase ^ index)
    }, 0)
    result = parseInt(resultBase10, base);
    return result
}