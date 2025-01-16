/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:39:18
 * @Description: Coding something
 */

import {Dom, dom} from 'link-dom';
import type {IContent} from './types';


export function isMac () {
    const ua = navigator.userAgent;
    // ! 这里判断永远为false todo 修复可能会引入其他问题
    return /macintosh|mac os x/i.test(ua);
}

export function isCtrlPressed (e: KeyboardEvent) {
    return (isMac() && e.metaKey) || (!isMac() && e.ctrlKey);
}

export function handleCompositionEvents (dom: Dom) {
    let isComposing = false;
    dom.on('compositionstart', () => {
        isComposing = true;
    });
    dom.on('compositionend', () => {
        isComposing = false;
    });
    return () => isComposing;
}

export function transformContent (content: IContent, html = true, tail = ''): Dom {
    if (content instanceof HTMLElement) {
        return new Dom(content);
    } else if (content instanceof Dom) {
        return content;
    } else if (typeof content === 'string') {
        return dom.div[html ? 'html' : 'text'](content + tail) as Dom;
    } else {
        return dom.div[html ? 'html' : 'text'](content.toString() + tail) as Dom;
    }

}