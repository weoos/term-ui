/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-28 23:24:36
 * @Description: Coding something
 */
import {Eveit} from 'eveit';
import type {IWebTermEvents, IWebTermOptions} from './types';
import {TermHistory} from './history';
import {dom, Dom, mount, createStore} from 'link-dom';
import {TermDisplay} from './ui/display';
import {TermEditor} from './ui/editor';
import {ContainerClass, renderStyle} from './ui/style/style';
import {Editor} from './ui/editor-comp/editor';
import {runFnMaybe} from './utils';

function createDefaultStorageProvider () {
    const KEY = '_web_term_ui_history;';
    return {
        read: () => localStorage.getItem(KEY) || '[]',
        write: (history: string) => {
            localStorage.setItem(KEY, history);
            return true;
        }
    };
}

export class WebTerm extends Eveit<IWebTermEvents> {

    history: TermHistory;

    container: Dom;

    title: string;

    mainContainer: Dom;
    input: Editor;
    display: TermDisplay;
    editor: TermEditor;

    store = createStore({
        showEditor: false,
    });

    getHeader: ()=>string;

    constructor ({
        title = '',
        historyMax = 100,
        storageProvider = createDefaultStorageProvider(),
        container,
        getHeader,
    }: IWebTermOptions = {}) {
        super();
        this.getHeader = () => runFnMaybe<string>(getHeader || '');
        renderStyle();
        this.title = title;
        this.history = new TermHistory(historyMax, storageProvider);

        this.editor = new TermEditor(this.store, {
            mode: 'full',
        });
        
        this.input = new Editor({
            paddingTop: 2,
            header: getHeader,
            size: 'auto',
            mode: 'inline',
        });
        this.display = new TermDisplay(this.store, title);

        if (title) {
            this.display.pushContent(title);
        }

        if (!container) {
            this.container = dom.div.class(ContainerClass).style({
                'position': 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
            });
            mount(this.container, 'body');
        } else {
            if (typeof container === 'string') {
                const el = document.querySelector(container);
                if (!el) throw new Error('Container not exists');
                this.container = new Dom(el as HTMLElement);
            } else {
                this.container = new Dom(container);
            }
            this.container.addClass(ContainerClass);
        }
        this.initEvents();
        this.render();
    }

    get value () {
        return this.input.value;
    }

    private initEvents () {
        this.input.on('key', key => {
            // console.log('input onkey', key);
            switch (key) {
                case 'Enter': {
                    const value = this.input.value;
                    if (value) { this.history.push(value); }
                    this.emit('enter', value);
                }; break;
                case 'ArrowDown': {
                    const dv = this.history.down();
                    if (typeof dv === 'string') {
                        this.input.replaceText(dv);
                    }
                };break;
                case 'ArrowUp': {
                    const uv = this.history.up(this.input.value);
                    if (typeof uv === 'string') {
                        this.input.replaceText(uv);
                    } else {
                    // 如果翻到第一条了 加一个光标移到最前面
                        this.input.setCursorToHead();
                    }
                };break;
                case 'Tab': {
                    this.emit('tab', this.input.beforeValue);
                }; break;
            }
        });
        this.input.on('input', () => {
            this.history.checkLatest(this.input.value);
        });

        this.container.on('click', () => {
            this.input.focus();
        });

        const hideEditor = () => {
            this.store.showEditor = false;
            this.input.focus();
        };

        this.editor.on('edit-done', v => {
            hideEditor();
            this.emit('edit-done', v);
        });

        this.editor.on('edit-cancel', () => {
            hideEditor();
            this.emit('edit-cancel');
        });
    }

    private render () {
        this.container.style({
            cursor: 'text',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '16px',
            lineHeight: '20px',
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            overflow: () => this.store.showEditor ? 'hidden' : 'auto',
        }).append(
            this.mainContainer = dom.div.append(
                this.display.container,
                this.input.container,
            ),
            this.editor.container
        );
    }

    clearHistory (): void {
        this.history.clear();
    }

    write (content: string|Dom) {
        this.display.pushContent(this.input.fullValue);
        if (content) {
            this.display.pushContent(content);
        }
        this.input.clearContent();
        this.container.el.scrollTop = this.container.el.scrollHeight;
    }

    insertEdit (content: string) {
        this.editor.editor.insertText(content);
    }

    replaceEdit (content: string) {
        this.editor.editor.replaceText(content);
    }

    pushEdit (content: string) {
        this.editor.editor.pushText(content);
    }

    vi (v: string = '') {
        this.store.showEditor = true;
        this.editor.vi(v);
    }

    clearTerminal () {
        this.display.container.empty();
        this.input.clearContent();
    }

    newLine () {
        this.display.pushContent(this.input.fullValue);
        this.input.clearContent();
    }
}