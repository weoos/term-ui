<!--
 * @Author: theajack
 * @Date: 2023-05-09 22:31:06
 * @Description: Coding something
-->
# [WebTerm UI](https://github.com/theajack/web-term-ui)

A Web Terminal UI Lib

[Demo](https://theajack.github.io/web-term-ui)

## Features

1. Support block cursor style
2. Support inline wrap
3. Support Chinese Block style
4. Support history record
5. Support Custom storageProvider

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
    title?: string,
    container?: string|HTMLElement,
    historyMax?: number,
    storageProvider?: {
        read: ()=>IPromiseMaybe<string>,
        write: (history: string)=>IPromiseMaybe<boolean>
    },
    getHeader?: IFnMaybe<string>,
}
```

## API

```ts
{
    clearHistory(): void;
    write(content: string | Dom): void;
    insertEdit(content: string): void;
    replaceEdit(content: string): void;
    pushEdit(content: string): void;
    vi(v?: string): void;
	clearTerminal(): void;
	newLine(): void;
}
```

## Events

```ts
export interface IWebTermEvents {
    'enter': [string],
    'edit-done': [string],
    'edit-cancel': [],
    'tab': [];
}
```
