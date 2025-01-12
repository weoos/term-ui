/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-28 23:29:02
 * @Description: Coding something
 */

export type IPromiseData<T extends Promise<any>> = T extends Promise<infer U> ? U: any;

export type IPromiseMaybe<T=any> = Promise<T>|T;

export type IFnMaybe<T=any> = T|(()=>T);


export interface IWebTermEvents {
    'enter': [string],
    'tab': [],
    'edit-done': [string],
    'edit-cancel': [],
}

export interface IWebTermOptions {
    title?: string,
    container?: string|HTMLElement,
    historyMax?: number,
    storageProvider?: {
        read: ()=>IPromiseMaybe<string>,
        write: (history: string)=>IPromiseMaybe<boolean>
    },
    getHeader?: IFnMaybe<string>,
}