<!--
 * @Author: theajack
 * @Date: 2023-05-09 22:31:06
 * @Description: Coding something
-->
# [WebTerm UI](https://github.com/theajack/web-term-ui)

A Web Terminal UI Lib

[Demo](https://theajack.github.io/web-term-ui) | [Playground](https://theajack.github.io/jsbox?github=theajack.web-term-ui) | [Version](https://github.com/theajack/web-term-ui/blob/main/dev/version.md)

Xterm.js is Good, but it is a nightmare when building pure front-end terminal UI, So You need This Lib.

## Features

1. Support block cursor style
2. Support inline wrap
3. Support Multiple-length characters
4. Support history record
5. Support Custom storageProvider
6. Support Dark/Light Mode
7. Support text Editor

## Usage

```
npm i web-term-ui
```

```ts
import {WebTerm} from 'web-term-ui';
const term = new WebTerm({
    title: [
        'This is a Demo. Type "vi" to use vi editor',
        'And "ctrl/cmd + s" to Save, "esc" to cancel.\n'
    ].join('\n'),
    container: '#container',
    getHeader: () => '/ admin$ '
});
term.on('enter', v => {
    if (v === 'vi') term.vi();
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

## Options

```ts
export interface IWebTermOptions {
	title?: string;
	titleHtml?: boolean;
	container?: string | HTMLElement;
	padding?: number;
	historyMax?: number;
	storageProvider?: {
		read: () => IPromiseMaybe<string>;
		write: (history: string) => IPromiseMaybe<boolean>;
	};
	header?: string;
}
```

## API

```ts
{
	theme: "dark" | "light";
    title: string;
    get value(): string;
    get header(): string;
	setTheme(theme: "light" | "dark"): void;
	setColor(opt: Pick<IWebTermStyle, "background" | "color">): void;
	clearInputHistory(): void;
	write(content: IContent, html?: boolean): void;
	insertEdit(content: string): void;
	replaceEdit(content: string): void;
	pushEdit(content: string): void;
	vi(v?: string, title?: string, html?: boolean): void;
	clearTerminal(): void;
	newLine(html?: boolean): void;
	setHeader(header: string): void;
	scrollToBottom(): void;
	focus(): void;
	writeBelow(content: IContent, html?: boolean): void;
	pushBelow(content: IContent, html?: boolean): void;
	clearBelow(): void;
}
```

## Events

```ts
export interface IWebTermEvents {
    'enter': [string],
    'edit-done': [string],
    'edit-cancel': [],
    'tab': [string];
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
