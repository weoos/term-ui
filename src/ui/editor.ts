/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:34:35
 * @Description: Coding something
 */
import type {Dom} from 'link-dom';
import {dom} from 'link-dom';
import {Editor} from './editor-comp/editor';
import {Styles} from './style/style';
import {isCtrlPressed} from '../utils';
import type {IWebTermStyle} from '../types';

export class TermEditor {
    container: Dom;

    editor: Editor;

    title: Dom;

    constructor (style: IWebTermStyle) {

        this.editor = new Editor({
            mode: 'full',
            paddingLeft: 0,
            paddingTop: 0,
            fontSize: style.fontSize,
        });

        this.container = dom.div.style({
            ...Styles.FullParent,
            padding: style.padding,
            zIndex: 100,
            flexDirection: 'column',
            display: 'flex',
        }).append(
            this.title = dom.div.class('term-editor-title').text(''),
            this.editor.container.style({
                flex: '1',
                height: 'auto',
            }),
        );

        this.container.on('click', e => {
            e.stopPropagation();
        });
        this.container.on('keydown', (e: KeyboardEvent) => {
            if (e.code === 'KeyS' && isCtrlPressed(e)) {
                const v = this.editor.value;
                this.editor.clearContent();
                this.editor.emit('edit-done', v);
                e.preventDefault();
            }
            if (e.code === 'Escape') {
                // console.log('Esc press');
                this.editor.clearContent();
                this.editor.emit('edit-cancel');
            }
        });
    }

    _init (text: string, {title = '', html = false}: {title?:string, html?: boolean}) {
        this.editor.textarea.el.focus();
        this.editor.replaceText(text);
        this.title.style({
            paddingBottom: title ? '5px' : 0,
        })[html ? 'html' : 'text'](title);
    }
}