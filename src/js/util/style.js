import {isIE} from './env';
import {append, remove} from './dom';
import {addClass} from './class';
import {each, hyphenate, isArray, isNumber, isNumeric, isObject, isString, isUndefined, toNode, toNodes} from './lang';

const cssNumber = {
    'animation-iteration-count': true,
    'column-count': true,
    'fill-opacity': true,
    'flex-grow': true,
    'flex-shrink': true,
    'font-weight': true,
    'line-height': true,
    'opacity': true,
    'order': true,
    'orphans': true,
    'stroke-dasharray': true,
    'stroke-dashoffset': true,
    'widows': true,
    'z-index': true,
    'zoom': true
};

export function css(element, property, value, priority = '') {

    return toNodes(element).map(element => {

        if (isString(property)) {

            property = propName(property);

            if (isUndefined(value)) {
                return getStyle(element, property);
            } else if (!value && !isNumber(value)) {
                element.style.removeProperty(property);
            } else {
                element.style.setProperty(property, isNumeric(value) && !cssNumber[property] ? `${value}px` : value, priority);
            }

        } else if (isArray(property)) {

            const styles = getStyles(element);

            return property.reduce((props, property) => {
                props[property] = styles[propName(property)];
                return props;
            }, {});

        } else if (isObject(property)) {
            priority = value;
            each(property, (value, property) => css(element, property, value, priority));
        }

        return element;

    })[0];

}

export function getStyles(element, pseudoElt) {
    element = toNode(element);
    return element.ownerDocument.defaultView.getComputedStyle(element, pseudoElt);
}

export function getStyle(element, property, pseudoElt) {
    return getStyles(element, pseudoElt)[property];
}

const vars = {};

export function getCssVar(name) {

    const docEl = document.documentElement;

    if (!isIE) {
        return getStyles(docEl).getPropertyValue(`--uk-${name}`);
    }

    if (!(name in vars)) {

        /* usage in css: .uk-name:before { content:"xyz" } */

        const element = append(docEl, document.createElement('div'));

        addClass(element, `uk-${name}`);

        vars[name] = getStyle(element, 'content', ':before').replace(/^["'](.*)["']$/, '$1');

        remove(element);

    }

    return vars[name];

}

const cssProps = {};

// https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty
export function propName(name) {

    if (!cssProps[name]) {
        cssProps[name] = vendorPropName(name);
    }
    return cssProps[name];
}

const cssPrefixes = ['webkit', 'moz', 'ms'];

function vendorPropName(name) {

    name = hyphenate(name);

    const {style} = document.documentElement;

    if (name in style) {
        return name;
    }

    let i = cssPrefixes.length, prefixedName;

    while (i--) {
        prefixedName = `-${cssPrefixes[i]}-${name}`;
        if (prefixedName in style) {
            return prefixedName;
        }
    }
}
