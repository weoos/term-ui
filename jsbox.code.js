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
const term = new WebTerm({
    title: [
        'This is a Demo. Type "vi" to use vi editor',
        'And "ctrl/cmd + s" to Save, "esc" to cancel.\\n'
    ].join('\\n'),
    container: '#container',
    getHeader: () => '/ admin$ '
});
term.on('enter', v => {
    if (!v) term.write('');
    else if (v === 'vi') term.vi('test\\n11');
    else if (v === 'clear') term.clearTerminal();
    else term.write(\`Exec "\${v}"\`);
});
term.on('edit-done', v => {
    term.write(\`Edit Save: \${v}\`);
});
term.on('tab', () => {
    term.insertEdit('[test]');
});`
};