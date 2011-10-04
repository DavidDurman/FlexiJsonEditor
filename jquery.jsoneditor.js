// Simple yet flexible JSON editor plugin.
// Turns any element into a stylable interactive JSON editor.

// Copyright (c) 2011 David Durman

// Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).

// Dependencies:

// * jQuery
// * JSON (use json2 library for browsers that do not support JSON natively)

// Example:

//     var myjson = { any: { json: { value: 1 } } }; 
//     $('#mydiv').jsonEditor(myjson, { change: function() { /* called on every change */ } });

(function( $ ) {

    $.fn.jsonEditor = function(json, options) {
        var K = function() {},
            onchange = options ? (options.change || K) : K;

        return this.each(function() {
            JSONEditor($(this), json, onchange);
        });
        
    };
    
    function JSONEditor(target, json, onchange) {
        var opt = {
            target: target,
            onchange: onchange,
            original: json
        };
        construct(opt, json, opt.target);
        $('.property, .value', opt.target).live('blur focus', function() {
            $(this).toggleClass('editing');
        });
    }

    function isObject(o) { return Object.prototype.toString.call(o) == '[object Object]'; }
    function isArray(o) { return Object.prototype.toString.call(o) == '[object Array]'; }

    // Feeds object `o` with `value` at `path`. If value argument is omitted,
    // object at `path` will be deleted from `o`.
    // Example:
    //      feed({}, 'foo.bar.baz', 10);    // returns { foo: { bar: { baz: 10 } } }
    function feed(o, path, value) {
        var del = arguments.length == 2;
        
        if (path.indexOf('.') > -1) {
            var diver = o,
                i = 0,
                parts = path.split('.');
            for (var len = parts.length; i < len - 1; i++) {
                diver = diver[parts[i]];
            }
            if (del) delete diver[parts[len - 1]];
            else diver[parts[len - 1]] = value;
        } else {
            if (del) delete o[path];
            else o[path] = value;
        }
        return o;
    }

    // Get a property by path from object o if it exists. If not, return defaultValue.
    // Example:
    //     def({ foo: { bar: 5 } }, 'foo.bar', 100);   // returns 5
    //     def({ foo: { bar: 5 } }, 'foo.baz', 100);   // returns 100
    function def(o, path, defaultValue) {
        path = path.split('.');
        var i = 0;
        while (i < path.length) {
            if ((o = o[path[i++]]) == undefined) return defaultValue;
        }
        return o;
    }
    
    function addExpander(item) {
        if (item.children('.expander').length == 0) {
            var expander =   $('<span>',  { 'class': 'expander' });
            expander.bind('click', function() {
                var item = $(this).parent();
                item.toggleClass('expanded');
            });
            item.prepend(expander);
        }
    }

    function construct(opt, json, root, path) {
        path = path || '';

        root.children('.item').remove();
        
        for (var key in json) {
            if (!json.hasOwnProperty(key)) continue;
            
            var item     = $('<div>',   { 'class': 'item', 'data-path': path }),
                property =   $('<input>', { 'class': 'property' }),
                value    =   $('<input>', { 'class': 'value'    });

            if (isObject(json[key]) || isArray(json[key])) {
                addExpander(item);
            }
            item.append(property).append(value);
            root.append(item);
            
            property.val(key);
            value.val(JSON.stringify(json[key]));

            listen(opt, json, property, value, key);
            
            if (isObject(json[key]) || isArray(json[key])) {
                construct(opt, json[key], item, (path ? path + '.' : '') + key);
            }
        }
    }

    function updateParents(el, opt) {
        $(el).parentsUntil(opt.target).each(function() {
            var path = $(this).data('path');
            path = (path ? path + '.' : path) + $(this).children('.property').val();
            $(this).children('.value').val(JSON.stringify(def(opt.original, path, '')));
        });
    }
    
    function listen(opt, json, property, value, key) {

        property.change(function() {
            var path = $(this).parent().data('path'),
                val = JSON.parse($(this).next().val());

            feed(opt.original, (path ? path + '.' : '') + key);
            feed(opt.original, (path ? path + '.' : '') + $(this).val(), val);

            updateParents(this, opt);
            
            opt.onchange();
        });
        
        value.change(function() {
            var key = $(this).prev().val(),
                val = JSON.parse($(this).val()),
                item = $(this).parent(),
                path = item.data('path');

            feed(opt.original, (path ? path + '.' : '') + key, val);
            if (isObject(val) || isArray(val)) {
                construct(opt, val, item, (path ? path + '.' : '') + key);
                addExpander(item);
            }

            updateParents(this, opt);
            
            opt.onchange();
        });    
    }

})( jQuery );
