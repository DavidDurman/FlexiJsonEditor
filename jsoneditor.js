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

$(document).ready(function() {

    $('#json').change(function() {
        try {
            json = JSON.parse($('#json').val());
            $('#editor').jsonEditor(json, { change: printJSON });
        } catch (e) {
            alert('Error in parsing json. ' + e);
        }
    });

    $('#expander').click(function() {
        var editor = $('#editor');
        editor.toggleClass('expanded');
        $(this).text(editor.hasClass('expanded') ? 'Collapse' : 'Expand all');
    });
    
    printJSON();
    $('#editor').jsonEditor(json, { change: printJSON });
});


