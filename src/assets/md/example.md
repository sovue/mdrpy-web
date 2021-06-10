# Day 1

% some_scene

= Day_2

# some_scene

a - Hi

- Choice 1

  s - Hi from choice 1

- Choice 2

  a - Hi from choice 2

Story continues

# Day 2

- Hi

  s - Hi

- Hi, Alice | True # Supports conditional choices

  s - Hi, Alice

\ "This line will NOT be transpiled by parser and will go into the code as is"

<!-- Useful when you need to perform some custom operation or that is not supported by parser -->

\ $ print('Python')

<!-- If using inline code, inline comment must be inside the inline code as showed below -->

`set_mode_nvl # Inline code with inline comment`

```
if foo == bar:
    print('It preserves the original code indent')
```

# Day_3

<!-- If statements are created like choices -->

<!-- Just prepend choice content with: -->

<!-- `?` for `if` statement -->

<!-- `??` for `elif` statement -->

<!-- `???` for `else` statement -->

- ? test_condition

  Condition content

  - Choices inside if condition

    Choice content

- ?? elif_condition # Auto elif

  Elif condition content

- ??? else_condition # Auto else

  else condition content
