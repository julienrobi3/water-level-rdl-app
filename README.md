# water-level-rdl-app

## Project setup
```
npm install
```

### Pour le partir en développement
```
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm run serve
```

### Compiles and minifies for production and push to github pages
```
$env:NODE_OPTIONS="--openssl-legacy-provider"
git checkout --orphan gh-pages
npm run build
git --work-tree dist add --all
git --work-tree dist commit -m 'Deploy'
git push origin HEAD:gh-pages-3 --force
rm -r dist
git checkout -f master
git branch -D gh-pages-3
```

