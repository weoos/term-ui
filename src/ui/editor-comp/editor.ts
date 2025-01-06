/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:34:35
 * @Description: Coding something
 */
import type {Dom} from 'link-dom';
import {createStore, dom} from 'link-dom';
import {Styles} from '../style/style';
import Eveit from 'eveit';
import {isCtrlPressed, runFnMaybe} from '../../utils';
import type {IFnMaybe} from 'src/types';

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
}

export class Editor extends Eveit<{
    key: ['Enter'|'ArrowUp'|'ArrowDown'],
    input: []
}> {
    container: Dom;

    textarea: Dom;

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
    }: IEditorOptions = {}) {
        super();
        this.size = size;
        this.mode = mode;
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
            this.textarea = dom.textarea.value(this.header).style({
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
        const el = (this.textarea.el as HTMLTextAreaElement);
        let prevLineCount = 1;

        const isCursorChangeKey = (e: KeyboardEvent) => {
            return e.code === 'Backspace' || e.code === 'Enter';
        };
        this.textarea.on('keydown', (e: KeyboardEvent) => {

            if (this.mode === 'inline') {
                if (e.code === 'Enter') {
                    if (isCtrlPressed(e)) {
                        this.pushText('\n');
                    } else {
                        e.preventDefault();
                        this.emit('key', 'Enter');
                        return;
                    }
                } else if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                    e.preventDefault();
                    this.emit('key', e.code);
                    return;
                }
            }

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
        }).on('keyup', (e: KeyboardEvent) => {
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
            if (el.selectionStart !== el.selectionEnd) return;
            // console.log('selectionchange', el.selectionStart, el.selectionEnd);
            this.relocateCursorPosition();
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

    private relocateCursorPosition () {
        const el = (this.textarea.el as HTMLTextAreaElement);
        if (el.clientWidth === 0) return;
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
        this.textarea.value(
            this.textarea.value() + v
        );
    }
    replaceText (v: string) {
        this.textarea.value(`${this.header}${v}`);
        this.relocateCursorPosition();
    }
    clearContent () {
        this.textarea.value(this.header);
        this.relocateCursorPosition();
    }
    setCursorToHead () {
        (this.textarea.el as HTMLTextAreaElement).setSelectionRange(0, 0);
    }
}