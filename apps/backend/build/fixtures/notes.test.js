"use strict";
exports.__esModule = true;
var notes_1 = require("./notes");
test("expect first note to have id of n1", function () {
    expect(notes_1.NOTE_1.id).toBe("n1");
});
