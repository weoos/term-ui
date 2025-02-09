/*
 * @Author: chenzhongsheng
 * @Date: 2025-02-09 12:15:21
 * @Description: Coding something
 */
import type {WebTerm} from '../../term';
import type {IWebTermStyle} from '../../types';
import {TermEditor} from '../editor';

export class EditorManager {
    list: TermEditor[] = [];

    constructor (
        private parent: WebTerm,
        private style: IWebTermStyle,
    ) {
    }

    create (text: string, opt: {title?:string, html?: boolean} = {}) {
        const termEditor = new TermEditor(this.style);
        this.parent.container.append(termEditor.container);
        this.parent.store.showEditor = true;
        const editor = termEditor.editor;
        const remove = () => {
            this.removeEditor(termEditor);
        };
        editor.once('edit-done', remove);
        editor.once('edit-cancel', remove);
        if (this.list.length > 0) {
            const latest = this.list[this.list.length - 1];
            latest.container.display('none');
        }
        this.list.push(termEditor);
        termEditor._init(text, opt);
        return editor;
    }

    removeEditor (termEditor: TermEditor) {
        const index = this.list.indexOf(termEditor);
        if (index >= 0) {
            this.list.splice(index, 1);
            if (this.list.length === 0) {
                this.parent.store.showEditor = false;
            } else {
                const latest = this.list[this.list.length - 1];
                latest.container.display('flex');
                latest.editor.focus();
            }
            termEditor.container.remove();
            this.parent.input.focus();
        }
    }

    setFontSize (size: number) {
        this.list.forEach(each => {
            each.editor.setFontSize(size);
        });
    }

    resize () {
        this.list.forEach(each => {
            each.editor.resize();
        });
    }
}