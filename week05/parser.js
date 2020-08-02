
const layout = require('./layout');
const css = require('css');
let currentToken = null;

let currentAttribute = null;
let stack = [{type:"document", children: []}];


let rules = [];
function addCSSRules(text) {
    var ast = css.parse(text);
    console.log(JSON.stringify(ast, null, "  "));
    rules.push(...ast.stylesheet.rules);
}

function match(element, selector) {
    if(!selector || !element.attributes) {
        return false;
    }

    if(selector.charAt(0) == "#") {
        var attr = element.attributes.filter(attr => attr.name === "id");
        if(attr && attr.value === selector.replace("#", '')){
            return true;
        }
    }else if(selector.charAt(0) == ".") {
        var attr = element.attributes.filter(attr => attr.name === "class");
        if(attr && attr.value === selector.replace(".", '')){
            return true;
        }
    }else {
        if(element.tagName === selector) {
            return true;
        }
    }
    return false;
}

function computeCSS(element) {
    console.log(rules);
    console.log("compute CSS for Element", element);
    var elements = stack.slice().reverse();
    if(!element.computedStyle) {
        element.computedStyle = {};
    };
    for(let rule of rules) {
        var selectorParts = rules.selectors[0].split(" ").reverse();
        if(!match(element, selectorParts[0])) {
            continue;
        }

        let matched = false;
        var j = 1;
        for(var i = 0; i < elements.length; i++) {
            if(match(elements[i], selectorParts[j])) {
                j++;
            }
        };
        if(j >= selectorParts.length) {
            matched = true;
        }
        if(matched) {
            console.log("element", element, "match rule", rule);
            var computedStyle = element.computedStyle;
            for(var declaration of rule.declarations) {
                if(!computedStyle[declaration.poperty]) {
                    computedStyle[declaration.poperty] = {};
                };
                computedStyle[declaration.poperty].value = declaration.value
            }
            console.log(element.computedStyle);
        }
    }
}

function emit(token){
    if(token.type === "text"){
        return
    }

    let top = stack[stack.length - 1]

    if(token.type == "startTag"){
        let element = {
            type: "element",
            children: [],
            attributes: []
        }

        element.tagName = token.tagName

        for(let p in token){
            if(p != "type" && p != "tagName"){
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

        computeCSS(element);

        top.children.push(element)
        element.parent = top

        if(!token.isSelfClosing){
            stack.push(element)
        }
        
        currentTextNode = null

    }else if(token.type == "endTag"){
        if(top.tagName != token.tagName){
            throw new Error("Tag start end doesn't match")
        }else{
            // 遇到style 标签 执行css 规则的操作
            if(top.tagName === 'style') {
                addCSSRules(top.children[0].content);
            }
            layout(top);
            stack.pop()
        }

        currentTextNode = null
    }else if(token.type == "text"){
        if(currentTextNode == null){
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content 
    }
}

const EOF = Symbol('EOF');

function data(c) {
    if(c == "<") {
        return tagOpen;
    } else if(c === EOF) {
        emit({
            type: "EOF"
        })
        return ;
    } else {
        emit({
            type: "text",
            content: c
        })
        return data;
    }
}

function tagOpen(c) {
    if(c === "/") {
        return endTagOpen;
    } else if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type: "startTag",
            tagName: ""
        }
        return tagName(c)
    } else {
        return ;
    }
}

function endTagOpen(c) {
    if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName: ""
        }
        return tagName(c);
    } else if(c === ">") {

    } else if (c === EOF) {

    } else {

    }
}

function tagName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c === "/") {
        return selfClosingStartTag;
    } else if(c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if(c === ">") {
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

function selfClosingStartTag() {
    if(c === ">") {
        currentToken.isSelfColsing = true;
        return data;
    } else if(c === EOF){
        return tagName;
    } else {

    }
}

function beforeAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c === "/" || c === ">" || c === EOF) {
        return afterAttributeName(c);
    } else if(c === "=") {
        
    } else {
        currentAttribute = {
            name: "",
            value: "",
        }
        return attributeName(c);
    }
}

function attributeName(c) {
    if(c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
        return afterAttributeName(c);
    } else if (c === "=") {
        return beforeAttributeValue;
    } else if (c === "\u0000") {

    } else if (c === "/" || c === ">" || c === EOF) {

    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

function beforeAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF){
        return beforeAttributeValue
    }else if(c == "\""){
        return doubleQuotedAttributeValue
    }else if(c == "\'"){
        return singleQuotedAttributeValue
    }else if(c == ">"){

    }else{
        return UnquotedAttributeValue(c)
    }
}

function afterAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/) || c === "/" || c === ">" || c === EOF) {
        return afterAttributeName(c);
    } else if (c === "=") {
        return beforeAttributeValue;
    } else if (c === "\u0000") {

    } else if (c === "/" || c === ">" || c === EOF) {

    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

function singleQuotedAttributeValue(c){
    if(c == "\'"){
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    }else if(c == "\u0000"){

    }else if(c == EOF){

    }else{
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}

function UnquotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    }else if(c == "/"){
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    }else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    }else if(c == "\u0000"){

    }else if(c == "\"" || c == "'" || c == "<" || c == "=" || c == "`"){

    }else if(c == EOF){

    }else{
        currentAttribute.value += c
        return UnquotedAttributeValue
    }
}

function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName
    }else if(c == "/"){
        return selfClosingStartTag
    }else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    }else if(c == EOF){

    }else{
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}




module.exports.parserHTML = function parserHTML(html) {
    let state = data;
    for(let c of html) {
        state = state(c);
    };
    state = state(EOF);
    return stack[0];
}