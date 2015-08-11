module.exports = function(w) {

    return {
        files: [
            'src/**/*.ts',
            'test/mock/**/*.ts',
            '!src/**/*.d.ts'
        ],

        tests: [
            'test/**/*.test.ts'
        ],

        env: {
            type: 'node'
        },

        compilers: {
            '**/*.ts': w.compilers.typeScript({module: 1}) // 1 for CommonJs
        }
    };
};