/*
 * @Author: chenzhongsheng
 * @Date: 2025-01-05 20:44:41
 * @Description: Coding something
 */
import type {IStyle} from 'link-dom';
import {style} from 'link-dom';

export const ContainerClass = 'web-term-container';

export const Styles = {
    FullParent: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    } as IStyle,
    Text: {
        fontFamily: 'courier-new, courier, monospace',
        fontSize: '15px',
        fontKerning: 'none',
        whiteSpace: 'pre',
        lineHeight: '17px',
        boxSizing: 'border-box',
    } as IStyle,
    ScrollBar: {
        '&::-webkit-scrollbar': {
            width: '5px',
            cursor: 'pointer',
            height: '5px',
        },
        '&::-webkit-scrollbar-button': {
            display: 'none',
        },
        '&::-webkit-scrollbar-track': {
            display: 'none',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#555',
            cursor: 'pointer',
        }
    } as IStyle,
};

const styleStore: Parameters<typeof style>[0] = {};

export function addStyle (v: Parameters<typeof style>[0]) {
    Object.assign(styleStore, v);
}

export function renderStyle () {
    style(styleStore);
}

addStyle({
    [`.${ContainerClass}`]: {
        position: 'relative',
        ...Styles.Text,
        '*': {
            ...Styles.Text,
        },
        ...Styles.ScrollBar,
    },
    '.editor-cursor': {
        position: 'absolute',
        zIndex: '2',
        height: '16px',
        backgroundColor: '#000',
        color: '#fff',
        '&.cursor-focus': {
            backgroundColor: '#fff',
            color: '#000',
        },
        '.editor-cursor-border': {
            ...Styles.FullParent,
            border: '1px solid #fff',
        },
        '.editor-cursor-text': {
            ...Styles.FullParent,
        }
    },
    '.editor-textarea': {
        ...Styles.ScrollBar,
    }
});