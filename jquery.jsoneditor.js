// Simple yet flexible JSON editor plugin.
// Turns any element into a stylable interactive JSON editor.
// Copyright (c) 2011 David Durman
// Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
// Dependencies:
// * jQuery
// * JSON (use json2 library for browsers that do not support JSON natively)
// Example:
//     var myjson = { any: { json: { value: 1 } } };
//     var opt = { change: function() { /* called on every change */ } };
//     /* opt.propertyElement = '<textarea>'; */ // element of the property field, <input> is default
//     /* opt.valueElement = '<textarea>'; */  // element of the value field, <input> is default
//     $('#mydiv').jsonEditor(myjson, opt);
(function($) {
    function JSONEditor(target, json, onchange, propertyElement, valueElement) {
        var opt = {
            target: target,
            onchange: onchange,
            original: json,
            propertyElement: propertyElement,
            valueElement: valueElement
        };
        construct(opt, json, opt.target), $(".property, .value", opt.target).on("blur focus", function() {
            $(this).toggleClass("editing");
        });
    }
    function isObject(o) {
        return Object.prototype.toString.call(o) == "[object Object]";
    }
    function isArray(o) {
        return Object.prototype.toString.call(o) == "[object Array]";
    }
    function isBoolean(o) {
        return Object.prototype.toString.call(o) == "[object Boolean]";
    }
    function isNumber(o) {
        return Object.prototype.toString.call(o) == "[object Number]";
    }
    function isString(o) {
        return Object.prototype.toString.call(o) == "[object String]";
    }
    function feed(o, path, value) {
        var del = arguments.length == 2;
        if (path.indexOf(".") > -1) {
            var diver = o, i = 0, parts = path.split(".");
            for (var len = parts.length; i < len - 1; i++) diver = diver[parts[i]];
            del ? delete diver[parts[len - 1]] : diver[parts[len - 1]] = value;
        } else del ? delete o[path] : o[path] = value;
        return o;
    }
    function def(o, path, defaultValue) {
        path = path.split(".");
        var i = 0;
        while (i < path.length) if ((o = o[path[i++]]) == undefined) return defaultValue;
        return o;
    }
    function error(reason) {
        window.console && console.error(reason);
    }
    function parse(str) {
        var res;
        try {
            res = JSON.parse(str);
        } catch (e) {
            res = null, error("JSON parse failed.");
        }
        return res;
    }
    function stringify(obj) {
        var res;
        try {
            res = JSON.stringify(obj);
        } catch (e) {
            res = "null", error("JSON stringify failed.");
        }
        return res;
    }
    function addExpander(item) {
        if (item.children(".expander").length == 0) {
            var expander = $("<span>", {
                "class": "expander"
            });
            expander.bind("click", function() {
                var item = $(this).parent();
                item.toggleClass("expanded");
            }), item.prepend(expander);
        }
    }
    function construct(opt, json, root, path) {
        path = path || "", root.children(".item").remove();
        for (var key in json) {
            if (!json.hasOwnProperty(key)) continue;
            var item = $("<div>", {
                "class": "item",
                "data-path": path
            }), property = $(opt.propertyElement || "<input>", {
                "class": "property"
            }), value = $(opt.valueElement || "<input>", {
                "class": "value"
            });
            (isObject(json[key]) || isArray(json[key])) && addExpander(item), item.append(property).append(value), root.append(item), property.val(key).attr("title", key);
            var val = stringify(json[key]);
            value.val(val).attr("title", val), assignType(item, json[key]), property.change(propertyChanged(opt)), value.change(valueChanged(opt)), (isObject(json[key]) || isArray(json[key])) && construct(opt, json[key], item, (path ? path + "." : "") + key);
        }
        (isObject(json) || isArray(json)) && addNewValueTrigger(opt, json, root, path);
    }
    function addNewValueTrigger(opt, json, root, path) {
        var item = $("<div>", {
            "class": "item"
        }), span = $(opt.propertyElement || "<span>"), link = $(opt.valueElement || "<a>");
        link.attr("href", "#"), link.html("&#8627; new value"), span.append(link), item.append(span), root.append(item), link.click(function(e) {
            e.preventDefault(), isArray(json) && json.push(null);
            if (isObject(json)) {
                var i = 1, newName = "";
                for (;;) {
                    newName = "newKey" + i;
                    if (!json.hasOwnProperty(newName)) break;
                    i++;
                }
                json[newName] = null;
            }
            construct(opt, json, root, path), opt.onchange(opt.original);
        });
    }
    function updateParents(el, opt) {
        $(el).parentsUntil(opt.target).each(function() {
            var path = $(this).data("path");
            path = (path ? path + "." : path) + $(this).children(".property").val();
            var val = stringify(def(opt.original, path, null));
            $(this).children(".value").val(val).attr("title", val);
        });
    }
    function propertyChanged(opt) {
        return function() {
            var path = $(this).parent().data("path"), val = parse($(this).next().val()), newKey = $(this).val(), oldKey = $(this).attr("title");
            $(this).attr("title", newKey), feed(opt.original, (path ? path + "." : "") + oldKey), newKey && feed(opt.original, (path ? path + "." : "") + newKey, val), updateParents(this, opt), newKey || $(this).parent().remove(), opt.onchange();
        };
    }
    function valueChanged(opt) {
        return function() {
            var key = $(this).prev().val(), val = parse($(this).val() || "null"), item = $(this).parent(), path = item.data("path");
            feed(opt.original, (path ? path + "." : "") + key, val), (isObject(val) || isArray(val)) && !$.isEmptyObject(val) ? (construct(opt, val, item, (path ? path + "." : "") + key), addExpander(item)) : item.find(".expander, .item").remove(), assignType(item, val), updateParents(this, opt), opt.onchange();
        };
    }
    function assignType(item, val) {
        var className = "null";
        isObject(val) ? className = "object" : isArray(val) ? className = "array" : isBoolean(val) ? className = "boolean" : isString(val) ? className = "string" : isNumber(val) && (className = "number"), item.removeClass(types), item.addClass(className);
    }
    $.fn.jsonEditor = function(json, options) {
        options = options || {};
        var K = function() {}, onchange = options.change || K;
        return this.each(function() {
            JSONEditor($(this), json, onchange, options.propertyElement, options.valueElement);
        });
    };
    var types = "object array boolean number string null";
})(jQuery);
