import type {Dom} from 'link-dom';
import type {ICursorChangeData} from './ui/editor-comp/editor';
import type {ICommandInfo} from '@tcbox/command-parser';

export type {ICommandInfo} from '@tcbox/command-parser';

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
