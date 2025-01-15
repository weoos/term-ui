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
}

export interface IWebTermOptions {
    title?: string,
    container?: string|HTMLElement,
    padding?: number,
    historyMax?: number,
    storageProvider?: {
        read: ()=>IPromiseMaybe<string>,
        write: (history: string)=>IPromiseMaybe<boolean>
    },
    header?: string,
}