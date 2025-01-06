/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:39:18
 * @Description: Coding something
 */

import type {Dom} from 'link-dom';
import type {IFnMaybe} from './types';

export function runFnMaybe<T> (v: IFnMaybe<T>): T {
    // @ts-ignore
    return typeof v === 'function' ? v() : v;
}


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