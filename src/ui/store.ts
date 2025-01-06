/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-29 10:27:31
 * @Description: Coding something
 */

import {createStore} from 'link-dom';

export function createTermStore () {
    return createStore({
        showEditor: false,
    });
}

export type IStore = ReturnType<typeof createTermStore>;