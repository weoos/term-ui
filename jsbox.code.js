/*
 * @Author: chenzhongsheng
 * @Date: 2025-01-14 20:05:01
 * @Description: Coding something
 */
window.jsboxCode = {
    lib: 'https://cdn.jsdelivr.net/npm/web-term-ui',
    lang: 'javascript',
    needUI: true,
    hideLog: true,
    code: `document.getElementById('jx-app').innerHTML = '<div id="container" style="width: 600px; height: 400px;"></div>';
var {WebTerm} = window.WebTermUi
var term = new WebTerm({
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
};