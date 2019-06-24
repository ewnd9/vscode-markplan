# `markplan`

## Usage

```sh
$ yarn vsce login # https://github.com/Microsoft/vscode-vsce/issues/328
$ yarn vsce package
$ code --install-extension markplan-*.vsix
```

## Development

```sh
$ yarn build:watch &
$ code --disable-extensions --extensionDevelopmentPath=$PWD $PWD # reload to test changes
```

## Related

- [`hyperclick-markdown`] https://github.com/ewnd9/hyperclick-markdown

## License

MIT © [ewnd9](http://ewnd9.com)
