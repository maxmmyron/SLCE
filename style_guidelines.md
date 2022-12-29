# Style Guidelines

## in general

- files are always named in `snake_case`.
- Classes are always named in `PascalCase`.
- methods are always named in `camelCase`.
- mutable variables are always named in `camelCase`.
- immutable variables are always named in all-caps `SNAKE_CASE`.

## files

Files are named in `snake_case`. Files are named like the class they contain. If a file contains multiple related classes, then the file takes a more general, yet descriptive name.

## classes

Classes are noun-like and are named in `PascalCase`. One class should inhabit one file unless their functions are very closely related to one another.

## variables

Variables are named in `camelCase`. They are named in a way that succinctly (but fully) describes what the variable is.

## methods

Methods are verb-like named in `camelCase`. They are named in an action-oriented way that succinctly (but fully) describes what the method does.

Methods are written as arrow functions when possible.

```ts
// Bad function design👎
function users(name: string): Array<User> {
  // ...
}

// Good function design! 👍
const getUsersByName = (name: string): Array<User> => {
  // ...
}
```


