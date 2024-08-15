# whistle.combo-url

A whistle plug-in for reassembling the combo request. Proxy several requests in combo according to the regular expression.

A combo url is like `http://i.cdn.com/??x.js,y.js,z.js`. 

whistle.combo splits the combo url to a path array `[x.js, y.js, z.js]` and concats them one by one with prefix URL. like [http://i.cdn.com/x.js, http://i.cdn.com/y.js, http://i.cdn.com/z.js].

Then, match the key in the `mapping` as a regular expression, and replace the matched url with the corresponding `mapping.value`. Each url is then requested and merged back

## Usage

**1. first install [whistle](https://github.com/avwo/whistle)(version of whistle must above or equal 0.12.3, check by typing `w2 -V`) and start whistle. Visit [https://github.com/avwo/whistle](https://github.com/avwo/whistle) to get more info about whistle usage**

```
$ npm i -g whistle
```

**2. install whistle.combo**

```
$ npm i -g @eric-gitta-moore/whistle.combo-url yaml
```
    

**3. config combo protocal**

All configurations are optional

~~~
# sample 1, for https://www.taobao.com/
# sourceURL: https://d.alicdn.com/alilog/??aplus/1.13.5/aplus_pc.js,aplus/1.13.5/plugin/aplus_spmact.js?v=20240718161046
# target:
#   - aplus/1.13.5/aplus_pc.js -> not modified
#   - aplus/1.13.5/plugin/aplus_spmact.js -> https://d.alicdn.com/alilog/aplus/1.13.2/plugin/aplus_spmact.js

/.+.(ali)cdn.com/i combo-url://{com} resCors://*
```com
mapping:
  /aplus/1.13.5/plugin/aplus_spmact.js/i: https://d.alicdn.com/alilog/aplus/1.13.2/plugin/aplus_spmact.js
```
~~~

**4. enjoy yourself.**

## Default Config

```yaml
delimiter: ??
separator: ","
mapping: {}
resStatusCode: 200
OverrideResHeaders: {}
```

## Dependency
- yaml

## License
[MIT](./LICENSE)
