/*
 * @Author: chenzhongsheng
 * @Date: 2024-12-21 10:15:35
 * @Description: Coding something
 */
// npm run init USER/REPO
const fs = require('fs');
const pkg = require('../package.json');

function main () {
    const v = process.argv[2];
    const [user, repo] = v.split('/');

    pkg.name = repo;
    pkg.ebuild.libName = repo.split('-').map(v => v[0].toUpperCase() + v.slice(1)).join('');
    pkg.ebuild.fileName = repo;
    pkg.ebuild.publish.name = repo;
    pkg.ebuild.publish.repository.url = `https://github.com/${v}`;
    pkg.ebuild.publish.author = user;
    pkg.ebuild.publish.bugs.url = `https://github.com/${v}/issues`;
    pkg.ebuild.publish.homepage = `https://${user}.github.io/${repo}`,

    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
}

main();