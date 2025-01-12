/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:34:35
 * @Description: Coding something
 */
import type {Dom} from 'link-dom';
import {createStore, dom} from 'link-dom';
import {Styles} from '../style/style';
import {Eveit} from 'eveit';
import {handleCompositionEvents, isCtrlPressed, runFnMaybe} from '../../utils';
import type {IFnMaybe} from '../../types';
import {onKeyDown, setTabValue} from 'tab-text';

function isMultiByte (char: string) {
    if (!char) return false;
    const code = char.charCodeAt(0);
    return code >= 0x80;
}

const SingleCharWidth = 9;
const MultiCharWidth = 15;
const SingleLineHeight = 17;

export interface IEditorOptions {
    header?: IFnMaybe<string>,
    padding?: number,
    size?: 'full' | 'auto',
    mode?: 'full' | 'inline',
    tab?: string,
}

export class Editor extends Eveit<{
    key: ['Enter'|'ArrowUp'|'ArrowDown'|'Tab'],
    input: []
}> {
    container: Dom;

    textarea: Dom<HTMLTextAreaElement>;

    cursor: Dom;

    private cursorText: Dom;

    ctx: CanvasRenderingContext2D;

    wrapLine = true;

    private padding: number;
    private headerGetter: IFnMaybe<string>;

    store = createStore({
        cx: 0,
        cy: 0,
    });


    private size: IEditorOptions['size'];
    private mode: IEditorOptions['mode'];

    get value () {
        const v = this.textarea.value();
        const n = this.header.length;
        if (!n) { return v; }
        return v.substring(n);
    }

    constructor ({
        header = '',
        padding = 5,
        size = 'full',
        mode = 'inline',
        tab = '  ',
    }: IEditorOptions = {}) {
        super();
        this.size = size;
        this.mode = mode;
        setTabValue(tab);
        this.padding = padding;

        const canvas = dom.canvas;
        this.ctx = (canvas.el as HTMLCanvasElement).getContext('2d')!;
        this.ctx.font = '15px courier-new, courier, monospace';

        this.headerGetter = header;
        this.render();
        this._monitorStart();
    }

    private _prevHeader = '';
    private _prevHeaderWidth = 0;

    get header () {
        return runFnMaybe(this.headerGetter);
    }
    get headerWidth () {
        const v = this.header;
        if (v !== this._prevHeader) {
            this._prevHeaderWidth = this.measureTextWidth(v);
        }
        return this._prevHeaderWidth;
    }

    private _monitorStart () {
        setTimeout(() => {
            if (this.textarea.el.clientWidth) {
                this.relocateCursorPosition();
            } else {
                this._monitorStart();
            }
        }, 100);
    }

    render () {
        this.container = dom.div.style({
            position: 'relative',
            height: this.size === 'full' ? '100%' : `${SingleLineHeight + 2 * this.padding}px`,
        }).append(
            this.cursor = dom.div.class('editor-cursor').append(
                dom.div.class('editor-cursor-border'),
                this.cursorText = dom.div.class('editor-cursor-text'),
            ),
            this.textarea = dom.textarea.class('editor-textarea').value(this.header).style({
                ...Styles.FullParent,
                padding: `${this.padding}px`,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                outline: 'none',
                resize: 'none',
                zIndex: '1',
                caretColor: 'transparent',
            })
        );

        if (this.wrapLine) {
            this.textarea.style({
                wordBreak: 'break-all',
                whiteSpace: 'pre-wrap',
            });
        }

        this.initEvents();

    }

    private initEvents () {

        let isDelPressed = false;
        const el = (this.textarea.el);
        let prevLineCount = 1;

        const isCursorChangeKey = (e: KeyboardEvent) => {
            return e.code === 'Backspace' || e.code === 'Enter';
        };

        const isComposing = handleCompositionEvents(this.textarea);

        let timer: any = null;

        let remove: any = this.compatSelChange();

        this.textarea.on('keydown', (e: KeyboardEvent) => {

            if (isComposing()) return;

            if (this.mode === 'inline') {
                if (e.code === 'Enter') {
                    if (isCtrlPressed(e)) {
                        this.pushText('\n');
                    } else {
                        e.preventDefault();
                        this.emit('key', 'Enter');
                        return;
                    }
                } else if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'Tab') {
                    e.preventDefault();
                    this.emit('key', e.code);
                    return;
                }
            }
            if (e.code === 'Tab') {
                if (el.selectionStart !== el.selectionEnd) {
                    this.showCursor(false);
                }
            }

            onKeyDown.call(el, e);

            if (isCursorChangeKey(e)) {
                isDelPressed = true;
            }
            if (e.code === 'Backspace') {
                // 阻止删除了head
                const {x, y} = this.getCursorPosition();
                if (y === 0 && x === this.headerWidth) {
                    e.preventDefault();
                }
            }

            console.log(e.code);
            if (isCtrlPressed(e) && e.code === 'KeyZ') {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    this.relocateCursorPosition();
                }, 50);
            }
        }).on('keyup', (e: KeyboardEvent) => {
            if (isComposing()) return;
            if (isCursorChangeKey(e)) {
                isDelPressed = false;
            }
        }).on('input', e => {
            e.preventDefault();
            // console.log('oninput', this.textarea.value());
            if (isDelPressed) {
                this.relocateCursorPosition();
            }
            if (this.size === 'auto') {
                const value = el.value;
                const lineCount = value.split('\n').length;
                if (prevLineCount !== lineCount) {
                    prevLineCount = lineCount;
                    this.textarea.style('height', `${lineCount * SingleLineHeight + 2 * this.padding}px`);
                }
            }
            this.emit('input');
        }).on('selectionchange', () => {
            console.log('selectionchange');
            if (remove) {
                remove();
                remove = null;
            }
            this._onSelectionChange();
        }).on('scroll', () => {
            this.relocateCursorPosition();
        }).on('focus', () => {
            this.cursor.addClass('cursor-focus');
        }).on('blur', () => {
            this.cursor.removeClass('cursor-focus');
        });

        let prevWidth = el.clientWidth;
        globalThis.addEventListener('resize', () => {
            if (el.clientWidth !== prevWidth) {
                prevWidth = el.clientWidth;
                this.relocateCursorPosition();
            }
        });
    }

    private _onSelectionChange () {
        const el = this.textarea.el;
        if (el.selectionStart === el.selectionEnd) {
            // console.log('selectionchange', el.selectionStart, el.selectionEnd);
            this.relocateCursorPosition();
        } else {
            if (el.clientWidth === 0) return;
            const min = this.header.length;
            if (el.selectionStart < min) {
                el.selectionStart = min;
            }
            const max = el.value.length;
            if (el.selectionEnd > max) {
                el.selectionEnd = max;
            }
        }
    }

    private compatSelChange () {
        // 兼容 safari不支持 textarea selectionchange
        const fn = () => {
            const el = this.textarea.el;
            if (document.activeElement !== el) return;
            this._onSelectionChange();
        };
        document.addEventListener('selectionchange', fn);
        return () => document.removeEventListener('selectionchange', fn);
    }

    private measureTextWidth (text: string) {
        if (!text) return 0;
        return this.ctx.measureText(text).width;
    }

    private getCursorPosition () {
        const el = this.textarea.el as HTMLTextAreaElement;
        const selectionStart = el.selectionStart;
        const value = el.value.substring(0, selectionStart);

        const arr = value.split('\n');

        const curLineBefore = arr.pop()!;
        const lineCount = arr.length;

        const cursorWord = el.value[selectionStart] || '';


        const width = this.measureTextWidth(curLineBefore);
        let x = width;
        let lineOffset = 0;

        const clientWidth = el.clientWidth - 2 * this.padding;
        // 考虑换行
        if (this.wrapLine) {
            // 当前行的换行数
            lineOffset = Math.floor(width / clientWidth);
            x = width % clientWidth;

            // 计算gap
            if (lineOffset > 0) {
                let gap = 0;
                let count = lineOffset;
                let start = 0;
                const length = curLineBefore.length;
                while (count > 0) {
                    const minLength = Math.floor(clientWidth / MultiCharWidth);
                    let text = curLineBefore.substring(start, start + minLength);
                    start += minLength;
                    let prev = this.measureTextWidth(text);
                    for (let i = start; i < length; i++) {
                        text += curLineBefore[i];
                        const w = this.measureTextWidth(text);
                        if (w > clientWidth) {
                            start = i;
                            gap += (clientWidth - prev);
                            break;
                        }
                        prev = w;
                    }
                    count --;
                }
                x += gap;
            }
        }

        const wordWidth = isMultiByte(cursorWord) ? MultiCharWidth : SingleCharWidth;
        if (x + wordWidth > clientWidth) {
            x = 0;
            lineOffset += 1;
        }

        return {
            x,
            y: SingleLineHeight * (lineCount + lineOffset),
            word: cursorWord,
            wordWidth,
        };
    }

    private _isShowCursor = false;
    private showCursor (v = true) {
        if (this._isShowCursor === v) return;
        this.cursor.style('visibility', v ? 'visible' : 'hidden');
        this._isShowCursor = v;
    }

    private relocateCursorPosition () {
        const el = (this.textarea.el as HTMLTextAreaElement);


        this.showCursor();

        const {x, y, word, wordWidth} = this.getCursorPosition();

        let left = x;
        if (y === 0 && x < this.headerWidth) {
            const pos = this.header.length;
            el.setSelectionRange(pos, pos);
            left = this.headerWidth;
        }

        this.cursor.style({
            left: `${left + this.padding}px`,
            top: `${y + this.padding - el.scrollTop}px`,
            width: `${wordWidth}px`,
        });
        this.cursorText.text(word);
    }

    focus () {
        this.textarea.el.focus();
    }

    pushText (v: string) {
        console.log(`pushText "${v}"`);
        const el = this.textarea.el;
        el.selectionStart = el.selectionEnd = el.value.length;
        this.insertText(v);
    }
    insertText (content: string) {
        console.log(`insertText "${content}"`);
        if (!content)  return;
        document.execCommand('insertText', false, content);
    }
    replaceText (v: string) {
        console.log(`replaceText "${v}"`);
        this.clearContent(false);
        this.pushText(v);
        this.relocateCursorPosition();
    }
    clearContent (relocate = true) {
        const el = this.textarea.el;
        const start = this.header.length;
        el.selectionStart = start;
        el.selectionEnd = el.value.length + 1;
        if (start === el.value.length) return;
        
        console.log(`clearContent "${el.value}" start=${start} end=${el.value.length} ${el.selectionStart} ${el.selectionEnd}`);
        document.execCommand('delete', false);
        if (relocate)
            this.relocateCursorPosition();
    }
    setCursorToHead () {
        const el = this.textarea.el;
        el.selectionStart = el.selectionEnd = this.header.length;
        // (this.textarea.el as HTMLTextAreaElement).setSelectionRange(0, 0);
    }
}