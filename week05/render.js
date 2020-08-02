import images from 'images'

function render(viewport, element) {
    let style;
    if ((style = element.style)) {
        let img = images(style.width, style.height);

        if (style['background-color']) {
            let color = element.style['background-color'] || 'rgb(0,0,0)';
            color.match(/rgb\((\d+),(\d+),(\d+)\)/);
            img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));
            viewport.draw(img, style.left || 0, style.top || 0);
        }
    }

    if (element.children) {
        for (let child of element.children) {
            render(viewport, child);
        }
    }
}

module.exports = render;