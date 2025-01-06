/*
 * @Author: chenzhongsheng
 * @Date: 2024-08-12 17:51:34
 * @Description: Coding something
 */

import {WebTerm} from '../src/index';

const term = new WebTerm({
    title: 'Welcome to WebOS!',
    getHeader: () => '/ admin$ '
});

term.on('enter', v => {
    console.log('term enter:', v);
    term.write(`exec: ${v}`);
});

term.on('edit-done', v => {
    console.log('term edit done:', v);
    term.write(`edit done: ${v}`);
});

window.term = term;