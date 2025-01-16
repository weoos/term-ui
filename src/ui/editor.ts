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

export class TermEditor extends Eveit<{
    'edit-done': [string],
    'edit-cancel': [],
}> {
    container: Dom;

    editor: Editor;

    title: Dom;

    constructor (store: IStore, {padding}: {
        padding: number,
    }) {
        super();

        this.editor = new Editor({
            mode: 'full',
            paddingLeft: 0,
            paddingTop: 0
        });

        this.container = dom.div.style({
            ...Styles.FullParent,
            padding,
            position: 'relative',
            zIndex: 100,
            backgroundColor: '#000',
            flexDirection: 'column',
        }).append(
            this.title = dom.div.text('').style({
                color: '#aaa',
            }),
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