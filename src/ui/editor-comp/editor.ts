/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 09:34:35
 * @Description: Coding something
 */
import type {Dom} from 'link-dom';
import {createStore, dom} from 'link-dom';
import {Styles} from '../style/style';
import {Eveit} from 'eveit';
import {handleCompositionEvents, isCtrlPressed} from '../../utils';
import {onKeyDown, setTabValue} from 'tab-text';

function isMultiByte (char: string) {
    if (!char) return false;
    const code = char.charCodeAt(0);
    return code >= 0x80;
}

const SingleLineHeight = 16;

type ILineInfoList = {
    content: string,
    width: number,
}[];

export interface IEditorOptions {
    header?: string,
    paddingLeft?: number,
    paddingTop?: number,
    size?: 'full' | 'auto',
    mode?: 'full' | 'inline',
    tab?: string,
}

export interface ICursorChangeData {
    x: number, y: number, word: string, wordWidth: number, beforeValue: string, value: string
}

export class Editor extends Eveit<{
    key: ['Enter'|'ArrowUp'|'ArrowDown'|'Tab'],
    input: [],
    'cursor-change': [ICursorChangeData],
}> {

    SingleCharWidth = 9;
    MultiCharWidth = 15;
    container: Dom;

    textarea: Dom<HTMLTextAreaElement>;

    cursor: Dom;

    private cursorText: Dom;

    ctx: CanvasRenderingContext2D;

    wrapLine = true;

    private paddingTop: number;
    private paddingLeft: number;

    store = createStore({
        cx: 0,
        cy: 0,
    });


    private size: IEditorOptions['size'];
    private mode: IEditorOptions['mode'];

    get value () {
        const v = this.fullValue;
        const n = this.header.length;
        if (!n) { return v; }
        return v.substring(n);
    }

    get fullValue () {
        return this.textarea.value();
    }

    get beforeValue () {
        const v = this.fullValue;
        const n = this.header.length;
        const start = this.textarea.el.selectionStart;
        if (typeof start === 'number' && start > 0) {
            return v.substring(n, start);
        }
        return v.substring(n);
    }

    constructor ({
        header = '',
        paddingTop = 5,
        paddingLeft = 5,
        size = 'full',
        mode = 'inline',
        tab = '  ',
    }: IEditorOptions) {
        super();
        this.size = size;
        this.mode = mode;
        setTabValue(tab);
        this.paddingTop = paddingTop;
        this.paddingLeft = paddingLeft;

        const canvas = dom.canvas;
        this.ctx = (canvas.el as HTMLCanvasElement).getContext('2d')!;
        this.ctx.font = '14px courier-new, courier, monospace';

        this.SingleCharWidth = this.measureTextWidth('a');
        this.MultiCharWidth = this.measureTextWidth('一');
        // console.log('width', this.SingleCharWidth, this.MultiCharWidth);

        this.header = header;
        this.render();
        this._monitorStart();
    }


    header = '';

    private _prevHeader = '';
    private _prevHeaderWidth = 0;
    get headerWidth () {
        const v = this.header;
        if (v !== this._prevHeader) {
            this._prevHeader = v;
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
        const isFull = this.size === 'full';
        this.container = dom.div.style({
            position: 'relative',
            height: isFull ? '100%' : `${SingleLineHeight + 2 * this.paddingTop}px`,
        }).append(
            this.cursor = dom.div.class('editor-cursor').append(
                dom.div.class('editor-cursor-border'),
                this.cursorText = dom.div.class('editor-cursor-text'),
            ),
            this.textarea = dom.textarea.class('editor-textarea').value(this.header).style({
                ...Styles.FullParent,
                padding: `${this.paddingTop}px ${this.paddingLeft}px`,
                backgroundColor: 'transparent',
                border: 'none',
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

    private _pasteTimer: any = null;
    private initEvents () {

        let isDelPressed = false;
        const el = (this.textarea.el);

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
                const {x, y, isRange} = this.getCursorPosition();
                if (y === 0 && x <= this.headerWidth && !isRange) {
                    e.preventDefault();
                }
            }

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
        }).on('paste', () => {
            this._pasteTimer = setTimeout(() => {
                this.relocateCursorPosition();
            }, 50);
        }).on('input', e => {
            e.preventDefault();
            // console.log('oninput', isDelPressed, this.textarea.value());
            if (isDelPressed) {
                this.relocateCursorPosition();
            }
            if (this.size === 'auto') {
                const height = this._countContentHeight(this.fullValue, true);
                if (height != el.clientHeight) {
                    this.textarea.style('height', `${height}px`);
                }
            }
            this.emit('input');
        }).on('selectionchange', () => {
            // console.log('selectionchange');
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
        }).on('cut', () => {
            const el = this.textarea.el;
            if (el.selectionStart !== el.selectionEnd) {
                this.relocateCursorPosition();
            }
        });

        let prevWidth = el.clientWidth;
        globalThis.addEventListener('resize', () => {
            if (el.clientWidth !== prevWidth) {
                prevWidth = el.clientWidth;
                this.relocateCursorPosition();
            }
        });
    }

    private _countContentHeight (content: string, needPadding = false) {
        return this._countContentSize(content, needPadding).height;
    }

    private _countContentSize (content: string, needPadding = false): {
        lines: ILineInfoList[],
        height: number,
    } {
        const lines = content.split('\n');
        let height = 0;
        const linesInfo: ILineInfoList[] = lines.map(line => {
            const list = this.countSingleLineInfo(line);
            height += list.length * SingleLineHeight;
            return list;
        });
        // console.log('linesInfo', JSON.stringify(linesInfo));
        return {
            lines: linesInfo,
            height: height + (needPadding ? (2 * this.paddingTop) : 0)
        };
    }

    private countSingleLineInfo (line: string): ILineInfoList {
        const contentWidth = this._getLineBoxWidth();
        if (contentWidth <= 0) return [{content: line, width: this.measureTextWidth(line)}];
        // 一行所能放下的最小字符数
        const minCount = Math.floor(contentWidth / this.MultiCharWidth);
        if (line.length <= minCount) {
            return [{content: line, width: this.measureTextWidth(line)}];
        }

        const info: ILineInfoList = [];

        let count = line.length;

        let start = 0;
        let end = start + minCount;

        const getInfo = () => {
            const content = line.substring(start, end);
            return {
                content,
                width: this.measureTextWidth(content)
            };
        };

        while (count > minCount) {
            let {content, width} = getInfo();

            let prevContent: string;
            let prevWidth: number;
            do {
                prevContent = content;
                prevWidth = width;
                if (end >= line.length) {
                    end ++;
                    break;
                }
                content += line[end];
                width = this.measureTextWidth(content);
                end ++;
            } while (width <= contentWidth);
            // 此时width超过了最大width
            info.push({content: prevContent, width: prevWidth});
            start = end - 1;
            end = start + minCount;
            count -= prevContent.length;
        }
        if (start < line.length) {
            info.push(getInfo());
        }

        return info;

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

    private _getLineBoxWidth () {
        return this.textarea.el.clientWidth - 2 * this.paddingLeft;
    }

    private _prevPos = {x: -1, y: -1};
    private getCursorPosition () {
        const el = this.textarea.el as HTMLTextAreaElement;
        const selectionStart = el.selectionStart;
        const selectionEnd = el.selectionEnd;
        //
        const cursorBefore = el.value.substring(0, selectionStart);
        const clientWidth = this._getLineBoxWidth();

        const cursorWord = el.value[selectionStart] || '';

        let x = 0, y = 0;

        // 考虑换行
        if (this.wrapLine) {
            const list = this._countContentSize(cursorBefore);
            y = list.height - SingleLineHeight;
            x = list.lines.pop()?.pop()?.width || 0;
        } else {
            x = this.measureTextWidth(cursorBefore);
            y = (cursorBefore.split('\n').length - 1) * SingleLineHeight;
        }

        const wordWidth = isMultiByte(cursorWord) ? this.MultiCharWidth : this.SingleCharWidth;

        if (x + wordWidth > clientWidth) {
            x = 0;
            y += SingleLineHeight;
        }

        if (this._prevPos.x !== x || this._prevPos.y !== y) {
            Object.assign(this._prevPos, {x, y});
            this.emit('cursor-change', {x, y, word: cursorWord, wordWidth, beforeValue: this.beforeValue, value: this.value});
        }

        return {
            x,
            y,
            isRange: selectionStart != selectionEnd,
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
        clearTimeout(this._pasteTimer);
        const el = (this.textarea.el as HTMLTextAreaElement);

        this.showCursor();

        const {x, y, word, wordWidth} = this.getCursorPosition();

        // console.log('relocateCursorPosition', x, y, word, wordWidth);

        let left = x;
        if (y === 0 && x < this.headerWidth) {
            const pos = this.header.length;
            el.setSelectionRange(pos, pos);
            left = this.headerWidth;
        }

        this.cursor.style({
            left: `${left + this.paddingLeft}px`,
            top: `${y + this.paddingTop - el.scrollTop}px`,
            width: `${wordWidth}px`,
        });
        this.cursorText.text(word);
    }

    focus () {
        this.textarea.el.focus();
    }

    pushText (v: string) {
        // console.log(`pushText "${v}"`);
        const el = this.textarea.el;
        el.selectionStart = el.selectionEnd = el.value.length;
        this.insertText(v);
    }
    insertText (content: string) {
        // console.log(`insertText "${content}"`);
        if (!content)  return;
        document.execCommand('insertText', false, content);
    }
    replaceText (v: string) {
        // console.log(`replaceText "${v}"`);
        this.clearContent(false);
        this.pushText(v);
        this.relocateCursorPosition();
    }
    clearContent (relocate = true) {
        const el = this.textarea.el;
        const value = el.value;
        const replace = !value.startsWith(this.header);

        const start = this.header.length;

        el.selectionStart = replace ? 0 : start;
        el.selectionEnd = value.length + 1;
        if (start === value.length) return;
        
        // console.log(`clearContent "${el.value}" start=${start} end=${el.value.length} ${el.selectionStart} ${el.selectionEnd}`);
        document.execCommand('delete', false);

        if (replace) {
            this.insertText(this.header);
        }

        if (relocate)
            this.relocateCursorPosition();
    }
    setCursorToHead () {
        const el = this.textarea.el;
        el.selectionStart = el.selectionEnd = this.header.length;
        // (this.textarea.el as HTMLTextAreaElement).setSelectionRange(0, 0);
    }
}