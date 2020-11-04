# babel-plugin-inject-args

Babel plugin that processes specially annotated functions or classes and
exposes the names of their parameters as runtime-accessible metadata. This can
be used by dependency injection containers to call the function or instantiate
the class and automatically resolve dependencies.

To enable this metadata for a function or class, add the string `@inject`
in a leading comment. The plugin will add a `$inject` property to the object
which contains an array of parameter names. For example, this source:

```js
// @inject
function createThing(paramA, paramB) {
}
```

Is transformed into:

```js
// @inject
function createThing(paramA, paramB) {
}

myService.$inject = ['paramA', 'paramB']
```

## Usage

To use the plugin, first add the dependency to your project:

```
npm install --save-dev babel-plugin-inject-args
```

Then enable the plugin in your Babel configuration, for example in a `.babelrc` file:

```
{
  "plugins": ["inject-args"]
}
```

## Further reading

For information on understanding the plugin implementation, see
https://github.com/jamiebuilds/babel-handbook.
