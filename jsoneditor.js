var json = {
    "string": "foo",
    "number": 5,
    "array": [1, 2, 3],
    "object": {
        "property": "value",
        "subobj": {
            "arr": ["foo", "ha"],
            "numero": 1
        }
    }
};

function printJSON() {
    $('#json').html(JSON.stringify(json));

}


$(document).ready(function() {
    printJSON();
    $('#editor').jsonEditor(json, { change: printJSON });
});

