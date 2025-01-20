/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-28 23:24:36
 * @Description: Coding something
 */
import {Eveit} from 'eveit';
import type {IContent, IWebTermEvents, IWebTermOptions, IWebTermStyle} from './types';
import {TermHistory} from './history';
import {dom, Dom, mount, createStore} from 'link-dom';
import {TermDisplay} from './ui/display';
import {TermEditor} from './ui/editor';
import {ContainerClass, DisplayGap} from './ui/style/style';
import {Editor} from './ui/editor-comp/editor';
import {TermBelow} from './ui/below';
import {DefaultStyle} from './ui/constant/constant';

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
    below: TermBelow;

    style: Required<IWebTermStyle> = {
        ...DefaultStyle,
    };

    store = createStore({
        showEditor: false,
    });

    theme: 'dark'|'light' = 'dark';

    constructor ({
        title = '',
        titleHtml = true,
        historyMax = 100,
        storageProvider = createDefaultStorageProvider(),
        container,
        header,
        theme,
        style = {}
    }: IWebTermOptions = {}) {
        super();
        this.title = title;
        this.history = new TermHistory(historyMax, storageProvider);
        Object.assign(this.style, style);

        this.editor = new TermEditor(this.store, this.style);
        
        this.input = new Editor({
            paddingTop: DisplayGap,
            paddingLeft: 0,
            header,
            size: 'auto',
            mode: 'inline',
            fontSize: this.style.fontSize,
        });
        this.display = new TermDisplay();
        this.below = new TermBelow();

        if (title) {
            this.display.pushContent(title, titleHtml);
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

        if (theme) {
            this.setTheme(theme);
        } else {
            this.setColor(style);
        }
        this._setFontSize(this.style.fontSize);

        this.render();
    }

    get value () {
        return this.input.value;
    }

    get beforeValue () {
        return this.input.beforeValue;
    }

    get header () {
        return this.input.header;
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
            this.emit('input', this.value, this.input.beforeValue);
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
        this.editor.editor.on('cursor-change', data => {
            this.emit('edit-cursor-change', data);
        });
        this.input.on('cursor-change', data => {
            this.emit('cursor-change', data);
        });
    }

    private render () {
        this.container.style({
            overflow: () => this.store.showEditor ? 'hidden' : 'auto',
        }).append(
            this.mainContainer = dom.div.style('padding', this.style.padding)
                .append(
                    this.display.container,
                    this.input.container,
                    this.below.container,
                ).show(() => !this.store.showEditor),
            this.editor.container
        );
    }
    setTheme (theme: 'light'|'dark') {
        const white = '#fff';
        const dark = '#000';
        const isLight = (theme === 'light');
        this.theme = theme;
        this.setColor({
            background: isLight ? white : dark,
            color: isLight ? dark : white,
            selectionBackground: isLight ? dark : white,
            selectionColor: isLight ? white : dark,
        });
    }
    setColor (opt: Pick<IWebTermStyle, 'background'|'color'|'selectionBackground'|'selectionColor'>) {
        Object.assign(this.style, opt);
        this.container.style({
            '--background': this.style.background,
            '--color': this.style.color,
            '--selection': this.style.selectionColor,
            '--selection-bg': this.style.selectionBackground,
        });
    }

    private _setFontSize (size: number) {
        this.style.fontSize = size;
        const lineHeight = size + 2;
        this.container.style({
            '--font-size': size,
            '--line-height': lineHeight,
        });
    }

    get fontSize () {
        return this.style.fontSize;
    }

    setFontSize (size: number) {
        this._setFontSize(size);
        this.editor.editor.setFontSize(size);
        this.input.setFontSize(size);
        this.resize();
    }

    clearInputHistory (): void {
        this.history.clear();
    }

    write (content: IContent, html = true) {
        this.display.pushContent(this.input.fullValue, html);
        if (content) {
            this.display.pushContent(content, html);
        }
        this.input.clearContent();
        this.scrollToBottom();
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

    vi (v: string = '', title = '', html = true) {
        this.store.showEditor = true;
        this.editor.vi(v, title, html);
    }

    clearTerminal () {
        this.display.container.empty();
        this.input.clearContent();
    }

    newLine (html = true) {
        this.write('', html);
    }

    setHeader (header: string) {
        this.input.header = header;
    }

    scrollToBottom () {
        this.container.el.scrollTop = this.container.el.scrollHeight;
    }

    focus () {
        this.input.focus();
    }

    writeBelow (content: IContent, html = true) {
        this.below.write(content, html);
        this.scrollToBottom();
    }
    pushBelow (content: IContent, html = true) {
        this.below.push(content, html);
        this.scrollToBottom();
    }
    clearBelow () {
        this.below.clear();
    }

    resize () {
        this.editor.editor.resize();
        this.input.resize();
    }
}