import type {Dom} from 'link-dom';
import type {ICursorChangeData} from './ui/editor-comp/editor';

/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-28 23:29:02
 * @Description: Coding something
 */
export type IPromiseMaybe<T=any> = Promise<T>|T;

export interface IWebTermEvents {
    'enter': [string],
    'tab': [string],
    'edit-done': [string],
    'edit-cancel': [],
    'input': [string, string],
    'cursor-change': [ICursorChangeData],
    'edit-cursor-change': [ICursorChangeData],
}

export interface IWebTermStyle {
    padding?: number,
    color?: string,
    background?: string,
}

export interface IWebTermOptions {
    title?: string,
    titleHtml?: boolean,
    container?: string|HTMLElement,
    historyMax?: number,
    storageProvider?: {
        read: ()=>IPromiseMaybe<string>,
        write: (history: string)=>IPromiseMaybe<boolean>
    },
    header?: string,
    theme?: 'dark'|'light',
    style?: IWebTermStyle,
}

export type IContent = string|number|boolean|Dom|HTMLElement;