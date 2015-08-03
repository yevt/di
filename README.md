# lib.platform.rpc

    git clone --recursive git@gitlab.nemotele.com:nemo-ui/lib-platform-rpc.git

## Структура репозитория
 - __README.md__ - этот файл.
 - __package.json__ - описание и настройки npm-пакета.
 - __gulpfile.ts__ - конфигурационный скрипт gulp.
 - __tsconfig.json__ - настройки typescript.
 - *dev* - скрипты, их отчеты и конфигурации, все что нужно для обеспечения среды разработки.
    - *dev/report* - отчеты инструментального анализа кода.
    - *dev/conf* - настройки инструментов (jsdoc, mocha и т.п.).
    - *dev/htdocs* - папка, которую обслуживает тестовый web-сервер.
 - *docs* - документация, диаграммы и т.п.
    - *docs/jsdoc* - сгенерированная по jsDoc документация.
    - *docs/uml* - проектная документация в PlantUML.
    - *docs/tutorials* - руководства по использованию библиотеки.
 - *src* - исходные коды.
 - *test* - исходные коды тестов.
 - *typings* - Заголовочные файлы TypeScript для сторонних библиотек.