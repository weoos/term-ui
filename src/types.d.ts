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
    'input': [string, string],
    'cursor-change': [ICursorChangeData],
    'command': [ICommandInfo, ICommandInfo[]],
}

export interface IWebTermStyle {
    padding?: number,
    color?: string,
    background?: string,
    selectionColor?: string,
    selectionBackground?: string
    fontSize?: number,
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
    parseCommand?: boolean,
}

export type IContent = string|number|boolean|Dom|HTMLElement;

export interface ICommandInfo {
    name: string;
    args: string[];
    options: Record<string, string|boolean>;
}