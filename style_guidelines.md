# Style Guidelines

## in general

- files are always named in `snake_case`.
- Classes are always named in `PascalCase`.
- methods are always named in `camelCase`.
- mutable variables are always named in `camelCase`.
- immutable variables are always named in all-caps `SNAKE_CASE`.

## classes

Classes are noun-like and are named in `PascalCase`. One class should inhabit one file unless their functions are very closely related to one another.

```ts
// Bad class design 👎

// stuff.ts
export class actor {/* ... */}
export class scene {/* ... */}

// Good class design! 👍

// actor.ts
export default class Actor {/* ... */}

// scene.ts
export default class Scene {/* ... */}
```

## variables

Variables are named in `camelCase`. They are named in a way that describes what the variable is. Variables always contain a type annotation.
Variables are declared as `const` or `readonly` unless they are mutable.
Variable properties in a class are always `private` unless their value needs to be accessible outside of the class.

```ts
// Bad variable design 👎
let thingamajig;

// Good variable design! 👍
const maxUsers: number = 150;

class Database {
  private readonly _maxUsers: number = 150;

  public get maxUsers(): number {
    return this._maxUsers;
  }
}
```

## methods

Methods are verb-like named in `camelCase`. They are named in an imperative way that describes the action the method performs. Methods are written as arrow functions.

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

## documentation

Documentation is written in [JSDoc](https://jsdoc.app/) format. Documentation is written for all classes, methods, and variables.
Descriptions are written in full, proper sentences in the present tense.
Any one line of documentation should not be longer than 80 characters. Use line breaks if necessary

Documentation following `@` tags are written without a hyphen separating the tag and the description. The description starts in lowercase, and all subsequent sentences are capitalized and punctuated.

`@param` tags always contain the TypeScript type of the parameter, followed by the parameter name, followed by the description of the parameter.

``` ts
/**
 * @param {Array<User>} users an array of valid users
 */
```

`@returns` tags always contain the TypeScript type of the return value, followed by the description of the return value.

`@throws` tags always contain an applicable error type (`Error` if no specific error type exists), followed by the description of the error.

`@example` tags always contain a code snippet that demonstrates the usage of the method.

There is always a full empty line between the following:
- Description
- `@param` tags
- `@returns` tag
- `@throws` tag
- `@example` tag

```ts
/**
 * This is a description of the function in full, proper sentences in the
 * present tense. This function does X, Y, and Z.
 *
 * @param {string} name name of the user
 * @param {number} age age of the user
 *
 * @returns {Array<User>} an array of users
 *
 * @throws {Error} if the user is not found
 */
const getUsersByNameAndAge = (name: string, age: number): Array<User> => {
  // ...
}


