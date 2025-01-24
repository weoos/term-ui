/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:39:18
 * @Description: Coding something
 */

import {Dom, dom} from 'link-dom';
import type {ICommandInfo, IContent} from './types';


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


// 解析 rm --rf a -rf x -ab 类似的 => {rf: 'a', r: 'x', f: 'x', a: true, b: true}
export function parseCommand (content: string): ICommandInfo[] {

    content = content.trim();

    if (!content) return [];

    const values = content.split('|').map(v => v.trim());
    const commands: ICommandInfo[] = [];
    for (const value of values) {
        const command: ICommandInfo = {
            name: '',
            args: [],
            options: {},
        };
        const arr = value.split(' ');

        command.name = arr.shift() || '';

        let optKey = '', isLong = false;

        const addOptions = (value: string|true) => {
            if (isLong) {
                command.options[optKey] = value;
            } else {
                for (const v of optKey) {
                    command.options[v] = value;
                }
            }
        };

        const setOptKey = (value: string) => {
            optKey = value.substring(isLong ? 2 : 1);
        };
        const setLong = (value: string) => {
            isLong = value[1] === '-';
        };

        for (let item of arr) {
            item = item.trim();
            if (!item) continue;
            if (item[0] === '-') {
                setLong(item);
                if (optKey) addOptions(true);
                setOptKey(item);
            } else {
                if (optKey) {
                    if (item[0] === '-') {
                        setLong(item);
                        addOptions(true);
                        setOptKey(item);
                    } else {
                        addOptions(item);
                        optKey = '';
                    }
                } else {
                    command.args.push(item);
                }
            }
        }

        if (optKey) {
            addOptions(true);
        }
        commands.push(command);
    }
    return commands;
}