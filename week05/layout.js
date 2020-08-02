function getStyle(element) {
    if (!element.style) {
        element.style = {}
    }
    for (let prop in element.computedStyle) {
        const p = element.computedStyle.value;
        element.style[prop] = element.computedStyle[prop].value;

        if (element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop])
        }
        if (element.style[prop].toString().match(/^[0-9\.]$/)) {
            element.style[prop] = parseInt(element.style[prop])
        }
    }
    return element.style;
}

function layout(element) {
    if (!element.computedStyle) return;
    let elementStyle = getStyle(element);
    if (elementStyle.display !== 'flex') return
    const items = element.children.filter(e => e.type === 'element');
    items.sort((a, b) => {
        return (a.order || 0) - (b.order || 0)
    })
    const style = elementStyle
        ['width', 'height'].forEach(size => {
        if (style[size] === 'auto' || style[size] === '') {
            style[size] = null
        }
    })

    if (!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row'
    }
    if (!style.alignItems || style.alignItems === 'auto') {
        style.alignItems = 'stretch'
    }
    if (!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start'
    }
    if (!style.flexWrap || style.flexWrap === 'auto') {
        style.flexWrap = 'nowrap'
    }
    if (!style.alignContent || style.alignContent === 'auto') {
        style.alignContent = 'stretch'
    }

    let mainSize, mainStart, mainEnd, mainSign, mainBase;
    let crossSize, crossStart, crossEnd, crossSign, crossBase;
    if (style.flexDirection === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if (style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if (style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }
    if (style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }
    if (style.flexWrap === 'wrap-reverse') {
        const tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    } else {
        crossBase = 0;
        crossSign = 1;
    }

    let isAutoMainSize = false;
    if (!style(mainSize)) { // 宽度自适应
        elementStyle[mainSize] = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let itemStyle = getStyle(item);
            if (itemStyle[mainSize] !== null || itemStyle[mainsize] !== (void 0)) {
                elementStyle[mainSize] = elementStyle[mainSize];
            }
        }
        isAutoMainSize = true;
    }

    let flexLine = [];
    const flexLines = [flexLine];

    let mainSpace = elementStyle[mainSize];
    let crossSpace = 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        let itemStyle = getStyle(item);

        if (itemStyle[mainSize] === null || itemStyle[mainSize] === (void 0)) {
            itemStyle[mainSize] = 0;
        }

        if (itemStyle.flex) {
            //元素本身弹性布局
            flexLine.push(item);
        } else if (style['flex-wrap'] === 'nowrap' || isAutoMainSize) {
            //不能换行或者自动宽度/高度
            mainSpace -= itemStyle[mainSize];
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        } else {
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize];
            }

            //主轴剩余空间不足
            if (mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;

                //创建新行
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
            }

            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }

            mainSpace -= itemStyle[mainSize];
        }
    }

    flexLine.mainSpace = mainSpace;
    flexLine.crossSpace = crossSpace;

    if (style['flex-wrap'] === 'nowarp' || isAutoMainSize) {
        flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace;
    } else {
        flexLine.crossSpace = crossSpace;
    }

    //子级在主轴方向位置计算
    if (mainSpace < 0) { // 等比压缩
        let scale = style[mainSize] / (style[mainSize] - mainSpace);
        let currentMain = mainBase;
        for (let item of items) {
            let itemStyle = getStyle(item);

            if (item.flex) {
                itemStyle[mainSize] = 0;
            }

            itemStyle[mainSize] *= scale;

            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * items[mainSize];
            currentMain = itemStyle[mainEnd];
        }
    } else {
        flexLines.forEach(flexLine => {
            let mainSpace = flexLine.mainSpace;
            let flexTotal = 0;
            for (let item of flexLine) {
                let itemStyle = getStyle(item);
                if (itemStyle.flex !== null && (itemStyle.flex !== (void 0))) {
                    flexTotal += itemStyle.flex;
                }
            }

            if (flexTotal > 0) {
                let currentMain = mainBase;
                for (let item of flexLine) {
                    let itemStyle = getStyle(item);

                    if (itemStyle.flex) {
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                    }

                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd];
                }
            } else {
                let justifyContent = style['justify-content'];
                let currentMain, step;

                if (justifyContent === 'flex-start') {
                    currentMain = mainBase;
                    step = 0;
                } else if (justifyContent === 'flex-end') {
                    currentMain = mainSpace * mainSign + mainBase;
                    step = 0;
                } else if (justifyContent === 'center') {
                    currentMain = mainSpace / 2 * mainSign + mainBase;
                    step = 0;
                } else if (justifyContent === 'space-between') {
                    step = mainSpace / (flexLine.length - 1) * mainSign;
                    currentMain = mainSpace;
                } else if (justifyContent === 'space-around') {
                    step = mainSpace / flexLine.length * mainSign;
                    currentMain = step / 2 + mainSpace;
                }

                for (let item of flexLine) {
                    let itemStyle = getStyle(item);
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] + step;
                }

            }
        })
    }

    //子级在交叉轴方向位置的计算
    if (!style[crossSize]) { // 自适应
        crossSpace = 0;
        style[crossSize] = 0;
        for (let flexLine of flexLines) {
            style[crossSize] += flexLine.crossSpace;
        }
    } else {
        crossSpace = style[crossSize];
        for (let flexLine of flexLines) {
            crossSpace -= flexLine.crossSpace;
        }
    }

    if (style['flex-wrap'] === 'wrap-reverse') {
        crossBase = style[crossSize];
    } else {
        crossBase = 0;
    }

    let lineSize = style[crossSize] / flexLines.length;
    let step;
    let alignContent = style['align-content'];

    if (alignContent === 'flex-start') {
        crossBase += 0;
        step = 0;
    } else if (alignContent === 'flex-end') {
        crossBase += crossSign * crossSpace;
        step = 0;
    } else if (alignContent === 'center') {
        crossBase += crossSign * crossSpace / 2;
        step = 0;
    } else if (alignContent === 'space-between') {
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    } else if (alignContent === 'space-around') {
        step = crossSpace / flexLine.length * crossSign;
        crossBase += step / 2;
    } else if (alignContent === 'stretch') {
        crossBase += 0;
        step = 0;
    }


    flexLines.forEach((flexLine) => {
        let lineCrossSize = style['align-content'] === 'stretch' ?
            flexLine.crossSpace + crossSpace / flexLines.length : flexLine.crossSpace;

        for (let item of flexLine) {
            let itemStyle = getStyle(item);
            let align = itemStyle['align-self'] || style['align-items'];

            if (!itemStyle[crossSize]) {
                itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0;
            }

            if (align === 'flex-start') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            } else if (align === 'flex-end') {
                itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
            } else if (align === 'center') {
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            } else if (align === 'stretch') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = crossBase + crossSign * itemStyle[crossSize];
            }
        }

        crossBase += crossSign * (lineCrossSize + step);
    })

}

module.exports = layout;