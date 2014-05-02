(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    var Pos = CodeMirror.Pos;

    function forEach(arr, f) {
        for (var i = 0, e = arr.length; i < e; ++i)
            f(arr[i]);
    }

    function arrayContains(arr, item) {
        if (!Array.prototype.indexOf) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === item) {
                    return true;
                }
            }
            return false;
        }
        return arr.indexOf(item) != -1;
    }

    function hint(editor, keywords, getToken, options) {
        // Find the token at the cursor
        var cur = editor.getCursor(), token = getToken(editor, cur);
        
        
        // If it's not a 'word-style' token, ignore the token.
        if (!/^[\w$_]*$/.test(token.string)) {
          token =  {start: cur.ch, end: cur.ch, string: "", state: token.state,
                           type: token.string == "." ? "property" : null};
        }
        
        token.state = CodeMirror.innerMode(editor.getMode(), token.state).state;
        
        return {
            list: getCompletions(token, keywords, options),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)
        };
    }

    function cplus2aspHint(editor, options) {
        return hint(editor, cplus2AspKeywords.sort(),
                function(e, cur) {
                    return e.getTokenAt(cur);
                }, options);
    }
    
    //Define our keywords.
    var cplus2AspKeywords = ["sorts", "objects", "variables", "constants", "tests",
                            "exogenous", "inertial", "label", "query", "rigid",
                            "show", "macros", "include", "action", "noconcurrency",
                            "nonexecutable", "if", "caused", "causes", "after", 
                            "may", "cause", "impossible", "default", "always",
                            "constraint", "inertialFluent", "simpleFluent", 
                            "exogenousAction",  "sdFluent", "possibly",
                            "mod", "unless", "where", "maxstep"];

    //Check if we're in the process of completing a keyword.
    function getCompletions(token, keywords) {
        var found = [], start = token.string;
        function maybeAdd(str) {
            if (str.lastIndexOf(start, 0) === 0 && !arrayContains(found, str))
                found.push(str);
        }
            
        forEach(keywords, maybeAdd);
        return found;
    }
    
    CodeMirror.registerHelper("hint", "cplus2asp", cplus2aspHint);
});