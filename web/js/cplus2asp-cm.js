// CPlus2Asp mode. Written by Jacob Mims.
// highlights keywords, operators, comments, tokens
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
	"use strict";
	CodeMirror.defineMode("cplus2asp", function(config, parserConfig) {
		
                /* This section defines our vocabulary */
                var keywords = [
                                ":-", "sorts", "objects", "variables", "constants", "tests",
                                "exogenous", "inertial", "label", "query", "rigid",
                                "show", "macros", "include", "action", "noconcurrency", "maxstep"
                            ];
		var builtins = [
                                "nonexecutable", "if", "caused", "causes", "after", 
                                "may", "cause", "impossible", "default", "always",
                                "constraint", "inertialFluent", "simpleFluent", 
                                "exogenousAction",  "sdFluent", "possibly",
                                "mod", "unless", "where"
                            ];
		var operators = ["::", "&", "|", "::=",  ">>", "/\\", "\\=", "->", "->>"];
                var escapeStrings = [ " ", "(", ".", ";" ];
		
                //Simple function to check if the arracy contains a given string.
		function contains(arr, str) {
			for(var i = 0; i < arr.length; i++) {
				if(arr[i] === str) {
					return true;
				}
			}
			return false;
		}
                
		// tokenizers
		function tokenize(stream, state) {

			var ch = stream.peek();

			// Handle Comments
			if (ch === '%') {
				stream.skipToEnd();
				return 'comment';
			}
                        
                        //Iterate until we hit a space.
			while(!stream.eatSpace() && !stream.eol()) {
				stream.next();
                                
                                //Check if we have a match to our vocabulary.
				if (contains(operators, stream.current()) && (stream.peek() == null || contains(escapeStrings, stream.peek()))) {
					return 'operator';
				}
				if (contains(keywords, stream.current()) && (stream.peek() == null || contains(escapeStrings, stream.peek()))) {
					return 'keyword';
				}

				if (contains(builtins, stream.current()) && (stream.peek() == null || contains(escapeStrings, stream.peek()))) {
					return 'builtin';
				}
				if(stream.current().match("^.+:")) {
					return 'variable';
				}							
			}

			return null;
		}
		return {
		    startState: function() {
                        return {
                                tokenize: tokenize,
                                lastToken: null
                        };
		    },	
                    token: function(stream, state) {
                            return tokenize(stream, state);
                    }
		};
	});
	CodeMirror.defineMIME("text/x-cplus2asp", "cplus2asp");
});

