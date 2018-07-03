module.exports = {
    "globals": {
        "ts-jest": {
            "skipBabel": true
        },
    },
    "roots": [
        "<rootDir>/test"
    ],
    "transform": {
        "^.+\\.ts$": "ts-jest"
    },
    "testRegex": "^.+\\.test\\.ts$",
    "moduleFileExtensions": [
        "ts",
    ],
}
