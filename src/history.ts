/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-18 11:48:04
 * @Description: Coding something
 */

import {HistoryMode, HistoryStack} from 'history-stack';
import type {IWebTermOptions} from './types';

export class TermHistory {

    history: HistoryStack<string>;

    pushedCurrent = false;

    provider: Required<IWebTermOptions>['storageProvider'];

    constructor (max: number, provider: Required<IWebTermOptions>['storageProvider']) {

        this.provider = provider;

        this.history = new HistoryStack<string>({
            max,
            mode: HistoryMode.Append
        });
        // window.hh = this.history;
        // debugger;
        const data = provider.read();

        if (data instanceof Promise) {
            data.then(data => {
                this._initHistory(data);
            });
        } else {
            this._initHistory(data);
        }
    }

    private _initHistory (data: string) {
        const list = JSON.parse(data);
        this.history.push(...list as any);
    }

    up (line: string) {
        // ! 如果首次翻看历史记录，会把当前内容加入历史记录
        if (!this.history.isActive) {
            this.push(line);
            this.history.back();
            this.pushedCurrent = true;
        }
        if (this.history.canBack()) {
            const value = this.history.back();
            console.log('history back', value);
            return value;
        } else {
            // 如果翻到第一条了 加一个光标移到最前面
            return null;
        }
    }
    down () {
        if (this.history.canForward()) {
            return this.history.forward();
        }
        return null;
    }
    checkLatest (line: string) {
        // ! 对最新的当前操作的历史记录可以更新
        if (this.history.isLatest) {
            this.history.replace(line);
            this.save();
        }
    }
    push (content: string) {
        if (this.pushedCurrent) {
            this.history.pop();
            this.pushedCurrent = false;
        }

        this.history.push(content);
        this.save();
    }

    private save () {
        this.provider.write(JSON.stringify(this.history.list));
    }

    clear () {
        this.pushedCurrent = false;
        this.history.clear();
        this.save();
    }
}