# Документация

Сверху примеры кода в MD для компилятора, снизу - скомпилированный Ren'Py код.

## Метки

```md
# Метка 1
```

```renpy
label Metka_1:
```

## Реплики персонажей

Код зависит от того, какой задан разделитель реплик и есть ли замены ID персонажей. В примере будет использоваться `_-_` (нижние подчеркивания (`_`) используются в качестве пробелов) как разделитель и оригинальные ID.

```md
dv - Реплика
```

```renpy
dv "Реплика"
```

## Выборы

```md
- Выбор

  Текст в выборе

- Выбор 2

  Текст в выборе 2

- Выбор 3 | True

  Текст в условном выборе 3
```

```renpy
menu:
    "Выбор":
        "Текст в выборе"
    "Выбор 2":
        "Текст в выборе 2"
    "Выбор 3" if True:
        "Текст в условном выборе 3"
```

## Строчные выражения

```md
`peremennaya = True`
```

```renpy
$ peremennaya = True
```

## Комментарии

```md
<!-- Комментарий -->

Привет # Строчный комментарий
```

```renpy
# Комментарий
"Привет" # Строчный комментарий
```

## Игнорирование строки

Зависит от настроек. В примере будет использоваться `\`.

```md
\ $ prolog_time()
\ а "Привет"
```

```renpy
$ prolog_time()
а "Привет" # Это будет ошибкой, потому что компилятор не изменил а => dv
```
