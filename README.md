<!--
 * @Author: theajack
 * @Date: 2023-05-09 22:31:06
 * @Description: Coding something
-->
# [WebTerm UI](https://github.com/weoos/term-ui)

A Web Terminal UI Lib

[Demo](https://weoos.github.io/term-ui) | [Playground](https://theajack.github.io/jsbox?github=weoos.term-ui) | [Version](https://github.com/weoos/term-ui/blob/main/dev/version.md)

Xterm.js is Good, but it is a nightmare when building pure front-end terminal UI, So You need This Lib.

## Features

1. Support block cursor style
2. Support inline wrap
3. Support Multiple-length characters
4. Support history record
5. Support Custom storageProvider
6. Support Dark/Light Mode
7. Support text Editor
8. Support set fontSize

## Usage

```
npm i web-term-ui
```

```ts
import {WebTerm} from 'web-term-ui';
const term = new WebTerm({
    title: 'This is a Demo. Type "help" to get Help.\n',
    container: '#container',
    header: '/ admin$ ',
});
term.on('enter', v => {
    if (v === 'vi') term.vi('', `"Ctrl/Cmd + s" to Save, "Esc" to Exit`);
    else term.write(`Exec "${v}"`);
});
term.on('edit-done', v => {
    term.write(`Edit Save: ${v}`);
});
term.on('tab', () => {
    term.insertEdit('[test]');
});
```

CDN

```html
<script src="https://cdn.jsdelivr.net/npm/web-term-ui"></script>
<script>console.log(window.WebTermUi);</script>
```

More usage please refer to [typing](https://cdn.jsdelivr.net/npm/web-term-ui/web-term-ui.es.min.d.ts)

## Options

```ts
export interface IWebTermStyle {
	padding?: number;
	color?: string;
	background?: string;
	selectionColor?: string;
	selectionBackground?: string;
	fontSize?: number;
}
export interface IWebTermOptions {
	title?: string;
	titleHtml?: boolean;
	container?: string | HTMLElement;
	historyMax?: number;
	storageProvider?: {
		read: () => IPromiseMaybe<string>;
		write: (history: string) => IPromiseMaybe<boolean>;
	};
	header?: string;
	theme?: "dark" | "light";
	style?: IWebTermStyle;
	parseCommand?: boolean;
}
```

## API

```ts
{
    theme: "dark" | "light";
    title: string;
    get value(): string;
    get header(): string;
    get fontSize(): number;
	setTheme(theme: "light" | "dark"): void;
	setColor(opt: Pick<IWebTermStyle, "background" | "color" | "selectionBackground" | "selectionColor">): void;
	setFontSize(size: number): void;
	clearInputHistory(): void;
	write(content: IContent, { html, clear, }?: {
		html?: boolean;
		clear?: boolean;
	}): void;
	insertEdit(content: string): void;
	replaceEdit(content: string): void;
	setCursorPos(index: number): void;
	pushEdit(content: string): void;
	vi(v?: string, { title, html }?: {
		title?: string;
		html?: boolean;
	}): void;
	clearTerminal(): void;
	newLine(html?: boolean): void;
	setHeader(header: string): void;
	scrollToBottom(): void;
	focus(): void;
	writeBelow(content: IContent, html?: boolean): void;
	pushBelow(content: IContent, html?: boolean): void;
	clearBelow(): void;
	resize(): void;
	parseCommand(v: string): ICommandInfo[];
}
```

## Events

```ts
export interface IWebTermEvents {
    'enter': [string],
    'edit-done': [string],
    'edit-cancel': [],
    'tab': [string]; // before cursor value
    "input": [
        string, // full value
        string, // before cursor value
    ];
    "cursor-change": [
        ICursorChangeData
    ];
    "edit-cursor-change": [
        ICursorChangeData
    ];
	"command": [
		ICommandInfo,
		ICommandInfo[]
	];
}

interface ICursorChangeData {
    x: number;
    y: number;
    word: string;
    wordWidth: number;
    beforeValue: string;
    value: string;
}
```
