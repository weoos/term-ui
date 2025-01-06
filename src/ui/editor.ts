/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:34:35
 * @Description: Coding something
 */
import type {Dom} from 'link-dom';
import {dom} from 'link-dom';
import type {IStore} from './store';
import type {IEditorOptions} from './editor-comp/editor';
import {Editor} from './editor-comp/editor';
import {Styles} from './style/style';
import {isCtrlPressed} from '../utils';
import Eveit from 'eveit';

export class TermEditor extends Eveit<{
    'edit-done': [string],
    'edit-cancel': [],
}> {
    container: Dom;

    editor: Editor;

    constructor (store: IStore, opts?: IEditorOptions) {
        super();
        this.editor = new Editor(opts);
        this.container = dom.div.style({
            ...Styles.FullParent,
            zIndex: 100,
            backgroundColor: '#000',
        }).append(
            this.editor.container,
        ).show(() => store.showEditor);

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
                this.editor.clearContent();
                this.emit('edit-cancel');
            }
        });
    }

    vi (v: string) {
        this.editor.replaceText(v);
        this.editor.textarea.el.focus();
    }
}