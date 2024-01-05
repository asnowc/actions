### 输入

```yml
script:
  description: Deno 代码
  required: true
scriptArgs:
  description: 传递给脚本的参数
  required: false
args:
  description: 传递给 deno run 的参数
  default: ""
  required: false
```

### 输出

```yml
return
```

### 示例

#### 运行

```yml
name: CI
on:
  push:
jobs:
  script:
    runs-on: ubuntu-latest
    steps:
      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      - uses: asnowc/actions@deno-script/v1
        with:
          args: -A
          script: |
            import { warn } from "npm:@actions/core";
            warn("xxxx")
```

#### 设置返回值

```yml
name: CI
on:
  push:
jobs:
  script:
    runs-on: ubuntu-latest
    steps:
      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      - uses: asnowc/actions@deno-script/v1
        id: run
        with:
          args: -A
          script: |
            import { setOutput } from "npm:@actions/core";
            setOutput("return","value") //必须是 "return"
      - run: echo ${{steps.cc2.outputs.return}}
```
