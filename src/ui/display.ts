/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:19:37
 * @Description: Coding something
 */
import type {Dom} from 'link-dom';
import {dom} from 'link-dom';
import type {IStore} from './store';
import {addStyle} from './style/style';

addStyle({
    '.display-item': {
        'padding': 2,
    }
});

export class TermDisplay {
    container: Dom;
    constructor (
        public store: IStore,
        public title: string
    ) {
        this.container = dom.div.style({
            padding: '5px 3px 0 3px',
        }).on('click', e => {
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