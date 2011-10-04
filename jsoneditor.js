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
    $('#json').val(JSON.stringify(json));

}

$('#rebuild').click(function() {
    try {
        json = JSON.parse($('#json').val());
        $('#editor').jsonEditor(json, { change: printJSON });
    } catch (e) {
        alert('Error in parsing json. ' + e);
    }
});


$(document).ready(function() {
    printJSON();
    $('#editor').jsonEditor(json, { change: printJSON });
});

