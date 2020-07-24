# hgit

### 安装组件

```
$ npm install -g @hnpm/hgit
```

### 使用方法

在命令行中直接输入 hgit 即可查看所有命令。

```
$ hgit
```

输入`hgit add `,用法类似于git add。

```
$ hgit add .          // 添加所有文件
$ hgit add <filename> // 添加指定文件
```

输入` hgit cz `, 可将暂存区的改动提交到本地的版本库。

```
$ hgit cz
```


输入` hgit push `, 可将本地版本库同步到远端版本库, 同时返回review链接。

```
$ hgit push
```

...详细用法请看confluence: http://confluence.haodf.net/pages/viewpage.action?pageId=53223411