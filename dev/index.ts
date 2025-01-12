/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-12 17:51:34
 * @Description: Coding something
 */

import {HighLight} from 'light-hl';
import {WebTerm} from '../src/index';
// import {WebTerm} from '../npm';

const term = new WebTerm({
    title: [
        'This is a Demo. Type "vi" to use vi editor',
        'And "ctrl/cmd + s" to Save, "esc" to cancel.\n'
    ].join('\n'),
    container: '#container',
    getHeader: () => '/ admin$ '
});
term.on('enter', v => {
    if (!v) term.write('');
    else if (v === 'vi') term.vi('test\n11');
    else if (v === 'clear') term.clearTerminal();
    else term.write(`Exec "${v}"`);
});
term.on('edit-done', v => {
    term.write(`Edit Save: ${v}`);
});
term.on('tab', () => {
    term.insertEdit('[test]');
});

document.getElementById('code')!.appendChild(
    HighLight({
        code: `import {WebTerm} from 'web-term-ui';
const term = new WebTerm({
    title: [
        'This is a Demo. Type "vi" to use vi editor',
        'And "ctrl/cmd + s" to Save, "esc" to cancel.\n'
    ].join('\n'),
    container: '#container',
    getHeader: () => '/ admin$ '
});
term.on('enter', v => {
    if (!v) term.write('');
    else if (v === 'vi') term.vi('test\n11');
    else if (v === 'clear') term.clearTerminal();
    else term.write(\`Exec "\${v}"\`);
});
term.on('edit-done', v => {
    term.write(\`Edit Save: \${v}\`);
});
term.on('tab', () => {
    term.insertEdit('[test]');
});`
    })
);

// @ts-ignore
window.term = term;