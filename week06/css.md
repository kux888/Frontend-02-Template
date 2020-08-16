## CSS 总结

### @-rules
- @charset
- @import
- @media
- @page
- @counter-style
- @keyframes
- @fontface
- @support
- @namespace


### css-规则

> 选择器 + 声明（key：value）

#### Selector
- selector-group
- selector
- - `> <sp> + ~`
- simple-selector
- - type * . # [] : :: :not()
#### Key
- variables
- properties
#### Value
- calc
- number
- length
...

### CSS变量
```css
:root {
  --main-color: #0c6;
}
.class{
  color: var(--main-color);
}
```
### CSS函数
```javascript
calc()
max()、min()
clamp()
toggle()
attr()
```
### CSS 选择器
#### 简单选择器
- div svg|a `单竖线，命名空间分隔符；svg需要使用@namespace声明；svg与html重叠的标签只有a`
- .cls
- #id
- [attr=value]
- :hover
- ::before

#### 复合选择器
- <简单选择器> <简单选择器> <简单选择器> ...

- 复杂选择器
<复合选择器> <复合选择器>
<复合选择器> ">" <复合选择器>
<复合选择器> "~" <复合选择器> 后继
<复合选择器> "+" <复合选择器> 直接后继
<复合选择器> "||" <复合选择器> （Selector Level4，table中选中某一列）

