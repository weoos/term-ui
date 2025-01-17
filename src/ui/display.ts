/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:19:37
 * @Description: Coding something
 */
import type {Dom} from 'link-dom';
import {dom} from 'link-dom';
import type {IContent} from '../types';
import {transformContent} from '../utils';


export class TermDisplay {
    container: Dom;
    constructor () {
        this.container = dom.div.class('term-display-box').on('click', e => {
            e.stopPropagation();
        });
    }

    pushContent (content: IContent, html: boolean) {
        this.container.append(
            transformContent(content, html, '\n')
        );
    }
}