/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:19:37
 * @Description: Coding something
 */
import type {Dom} from 'link-dom';
import {dom} from 'link-dom';
import type {IStore} from './store';
import {addStyle} from './style/style';

export const DisplayGap = 2;

addStyle({
    '.display-item': {
        'padding': `${DisplayGap}px 0`,
        wordBreak: 'break-all',
        whiteSpace: 'pre-wrap',
    }
});

export class TermDisplay {
    container: Dom;
    constructor (
        public store: IStore,
        public title: string
    ) {
        this.container = dom.div.on('click', e => {
            e.stopPropagation();
        });
    }

    pushContent (content: string|Dom) {
        const className = 'display-item';
        this.container.append(
            typeof content === 'string' ?
                dom.div.class(className).text(content + '\n') :
                content.addClass(className)
        );
    }
}