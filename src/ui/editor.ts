/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:34:35
 * @Description: Coding something
 */
import type {Dom} from 'link-dom';
import {dom} from 'link-dom';
import type {IStore} from './store';
import {Editor} from './editor-comp/editor';
import {Styles} from './style/style';
import {isCtrlPressed} from '../utils';
import {Eveit} from 'eveit';
import type {IWebTermStyle} from 'src/types';

export class TermEditor extends Eveit<{
    'edit-done': [string],
    'edit-cancel': [],
}> {
    container: Dom;

    editor: Editor;

    title: Dom;

    constructor (store: IStore, style: IWebTermStyle) {
        super();

        this.editor = new Editor({
            mode: 'full',
            paddingLeft: 0,
            paddingTop: 0,
            fontSize: style.fontSize,
        });

        this.container = dom.div.style({
            ...Styles.FullParent,
            padding: style.padding,
            position: 'relative',
            zIndex: 100,
            flexDirection: 'column',
        }).append(
            this.title = dom.div.class('term-editor-title').text(''),
            this.editor.container.style({
                flex: '1',
                height: 'auto',
            }),
        ).show(() => store.showEditor, 'flex');

        this.container.on('click', e => {
            e.stopPropagation();
        });
        this.container.on('keydown', (e: KeyboardEvent) => {
            if (e.code === 'KeyS' && isCtrlPressed(e)) {
                const v = this.editor.value;
                this.editor.clearContent();
                this.emit('edit-done', v);
                e.preventDefault();
            }
            if (e.code === 'Escape') {
                // console.log('Esc press');
                this.editor.clearContent();
                this.emit('edit-cancel');
            }
        });
    }

    vi (v: string, title = '', html = true) {
        this.editor.textarea.el.focus();
        this.editor.replaceText(v);

        this.title.style({
            paddingBottom: title ? '5px' : 0,
        })[html ? 'html' : 'text'](title);
    }
}