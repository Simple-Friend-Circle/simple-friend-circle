# 友链朋友圈

## Workflow

```yml
name: Friend Circle

on:
  schedule:
    # Update friend circle automatically everyday at 00:00 UTC
    - cron: "0 0 * * *"
  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:
  push:
    paths:
      - "links"
      - "template.html"
      - "public/*"

jobs:
  friend_circle:
    permissions:
      contents: write

    name: Friend Circle
    runs-on: ubuntu-22.04
    steps:
    - name: Checkout
      uses: actions/checkout@master

    - name: Friend Circle
      uses: mumu-lhl/simple-friend-circle@main

    - name: Deploy 🚀
      uses: JamesIves/github-pages-deploy-action@v4
      with:
        branch: gh-pages
        folder: public
        clean: true
        single-commit: true
```

## 配置

links 文件用于配置各个博客的 RSS 地址和头像：

```
https://mumulhl.eu.org/index.xml https://mumulhl.eu.org/img/avatar_hub440208ea63c4061633255bf6046ed7b_104338_300x0_resize_q75_h2_box_2.webp
```
