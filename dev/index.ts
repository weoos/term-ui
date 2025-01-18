/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-12 17:51:34
 * @Description: Coding something
 */

import {HighLight} from 'light-hl';
import {WebTerm} from '../src/index';
// import {WebTerm} from '../npm';
const term = new WebTerm({
    title: 'This is a Demo. Type "help" to get Help.\n',
    container: '#container',
    header: '/ admin$ ',
    // theme: 'light',
    style: {padding: 10}
});
term.on('enter', v => {
    if (!v) {
        term.newLine();
    } else if (v === 'vi' || v.startsWith('vi ')) {
        term.vi('test\n11', `${v.substring(3)} "Ctrl/Cmd + s" to Save, "Esc" to Exit`);
    } else if (v === 'clear') {
        term.clearTerminal();
    } else if (v === 'help') {
        writeHelp();
    } else if (v === 'progress') {
        mockProgress();
    } else if (v.startsWith('header')) {
        term.setHeader(`/ ${v.replace('header', '').trim()}$ `);
        term.write(`SetHeader "${v}"`);
    } else if (v === 'theme') {
        const target = term.theme === 'dark' ? 'light' : 'dark';
        term.setTheme(target);
        term.write(`Set theme to "${target}"`);
    } else if (v.startsWith('font')) {
        const size = parseInt(v.replace('font', '').trim());
        term.setFontSize(size);
        term.write(`Set FontSize = "${size}"`);
    } else {
        term.write(`Exec "${v}"`);
    }
});
term.on('edit-done', v => {
    term.write(`Edit Save: ${v}`);
});
term.on('tab', () => {
    term.insertEdit('[test]');
});
function writeHelp () {
    term.write([
        'vi      : Open vi Editor',
        'clear   : Clear Terminal',
        'progress: Mock Progress Bar',
        'header  : "header <name>" to Set Header',
        'theme   : Toggle theme between dark and light',
        'font    : "font <size>" to set font-size'
    ].join('\n'), false);
}
function mockProgress () {
    let progress = 0;
    const time = Date.now();
    const interval = setInterval(() => {
        progress += Math.round(Math.random() * 10);
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
        }
        term.writeBelow(`Progressing...[${progress}%]`);
        if (progress === 100) {
            term.clearBelow();
            term.write(`Progress Done in ${Date.now() - time}ms!`);
        }
    }, 100);
}
// term.on('input', (v1, v2) => {
//     console.log('input', v1, v2);
// });

document.getElementById('code')!.appendChild(
    HighLight({
        code: `import {WebTerm} from 'web-term-ui';
const term = new WebTerm({
    title: 'This is a Demo. Type "help" to get Help.\\n',
    container: '#container',
    header: '/ admin$ ',
    // theme: 'light',
    style: {padding: 10}
});
term.on('enter', v => {
    if (!v) {
        term.newLine();
    } else if (v === 'vi' || v.startsWith('vi ')) {
        term.vi('test\\n11', \`\${v.substring(3)} "Ctrl/Cmd + s" to Save, "Esc" to Exit\`);
    } else if (v === 'clear') {
        term.clearTerminal();
    } else if (v === 'help') {
        writeHelp();
    } else if (v === 'progress') {
        mockProgress();
    } else if (v.startsWith('header')) {
        term.setHeader(\`/ \${v.replace('header', '').trim()}$ \`);
        term.write(\`SetHeader "\${v}"\`);
    } else if (v === 'theme') {
        const target = term.theme === 'dark' ? 'light' : 'dark';
        term.setTheme(target);
        term.write(\`Set theme to "\${target}"\`);
    } else if (v.startsWith('font')) {
        const size = parseInt(v.replace('font', '').trim());
        term.setFontSize(size);
        term.write(\`Set FontSize = "$\{size}"\`);
    } else {
        term.write(\`Exec "\${v}"\`);
    }
});
term.on('edit-done', v => {
    term.write(\`Edit Save: \${v}\`);
});
term.on('tab', () => {
    term.insertEdit('[test]');
});
function writeHelp () {
    term.write([
        'vi      : Open vi Editor',
        'clear   : Clear Terminal',
        'progress: Mock Progress Bar',
        'header  : "header <name>" to Set Header',
        'theme   : Toggle theme between dark and light',
        'font    : "font <size>" to set font-size'
    ].join('\\n'), false);
}
function mockProgress () {
    let progress = 0;
    const time = Date.now();
    const interval = setInterval(() => {
        progress += Math.round(Math.random() * 10);
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
        }
        term.writeBelow(\`Progressing...[\${progress}%]\`);
        if (progress === 100) {
            term.clearBelow();
            term.write(\`Progress Done in \${Date.now() - time}ms!\`);
        }
    }, 100);
}`
    })
);

// @ts-ignore
window.term = term;