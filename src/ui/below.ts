/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:19:37
 * @Description: Coding something
 */
import type {Dom} from 'link-dom';
import {dom} from 'link-dom';
import type {IContent} from '../types';
import {transformContent} from '../utils';

export class TermBelow {
    container: Dom;
    constructor () {
        this.container = dom.div.class('term-below-box').on('click', e => {
            e.stopPropagation();
        });
    }

    write (content: IContent, html: boolean) {
        const children = this.container.children();
        if (children.length > 0) {
            children[children.length - 1].remove();
        }
        this.push(content, html);
    }

    push (content: IContent, html: boolean) {
        this.container.append(
            transformContent(content, html, '\n')
        );
    }

    clear () {
        this.container.empty();
    }
}