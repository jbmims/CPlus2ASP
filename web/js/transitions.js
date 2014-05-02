function buildTransitionSystem(code) {
    $.ajax({
        type: "GET",
        url:  "Compiler",
        data: { 
            code: code,
            query: "transitions",
            minstep: "",
            maxstep: "",
            sol: "0",
            language: $("#language").val()
        }
    }).done(function(response) {
        generateTransitionModel(response);
    });
}

function generateTransitionModel(compilerOutput) {
    //Create a temporary HTML document to navigate.
    var temp = "<div></div>";
    var sysStr = "{ \"transitions\" : [ ";
    var elements = $(temp).html(compilerOutput).find(".state, .action, .solution:gt(0)");
    var i = 1;
    
    $(temp).html(compilerOutput).find(".state, .action, .solution:gt(0)").each(function() {
        if($(this).hasClass("solution")) {
            sysStr += ",";
        }
        else {
            if($(this).hasClass("state") && $(this).text().indexOf("0:") === 0) {
                sysStr += "{ \"before\" : \"" + $(this).text().replace("0:", "").trim() + "\", ";
            }
            else if($(this).hasClass("state") && $(this).text().indexOf("1:") === 0) {
                sysStr += "\"after\" : \"" + $(this).text().replace("1:", "").trim() + "\" }";
            }
            else if($(this).hasClass("action")) {
                sysStr += "\"actions\" : ";
                sysStr += "\"" + $(this).text().replace("ACTIONS:", "").trim() + "\", ";
            }
        }
    });

    sysStr += "]}";

    var json = JSON.parse(sysStr);
    for(i = 0; i < json.transitions.length; i++) {
        if(json.transitions[i].before === undefined) {
            json.transitions[i].before = "empty";
        }
        if(json.transitions[i].actions === undefined) {
            json.transitions[i].actions = "nothing";
        }    
        if(json.transitions[i].after === undefined) {
            json.transitions[i].before = "empty";
        }
    }
    if(json.transitions.length > 0) {
        renderTransitionSystem(JSON.stringify(json));
    }
}

function renderTransitionSystem(myJson) {
    $("#easel").html("");
    $(".easel-container").show();
    
    //INITIAL declarations
    var stateNames = [];
    var actionNames = [];
    var abTransitions = [];// state X action
    var bcTransitions = [];// action X state
    var maxStrLeng = 0;// maximum string length used for dynamic sizing

    //Above intitialization of myJson is placeholder; reliant on external call.
    var lilith = JSON.parse(myJson);

    // The following sorts the input object tuple array based on their "before" values
    // case is ignored (as in there is no need to set the keys to uppercase) because its irrelevant in the ADL domain
    //console.log("_____<==>Verbose new schema");
    //console.log(JSON.stringify(lilith));
    lilith["transitions"].sort(function (a, b) {
        var keyA = a["before"],
            keyB = b["before"];
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
    //console.log(JSON.stringify(lilith));

    // The following changes lilith into the original compact hierarchical schema
    var transitionSystem = {};
    var curBefore;
    var curActions;
    var curAfter;
    // initilaize the first key, its object and that's first key and its destination to the first tuple
    var prevBefore = lilith["transitions"][0]["before"];
    var prevActions = lilith["transitions"][0]["actions"];
    var prevAfter = lilith["transitions"][0]["after"];

    // for each object check which changed and at that point add a string to array, new secondary key or major key
    for (var through = 0; through < lilith["transitions"].length; through++) {
        // update current
        curBefore = lilith["transitions"][through]["before"];
        curActions = lilith["transitions"][through]["actions"];
        curAfter = lilith["transitions"][through]["after"];
        //create new stuff if something changed or its the first time
        if ((curBefore != prevBefore) || (through == 0)) {
            transitionSystem[curBefore] = {};
            transitionSystem[curBefore][curActions] = [];
            transitionSystem[curBefore][curActions].push(curAfter);
        } else if (curActions != prevActions) {
            transitionSystem[curBefore][curActions] = [];
            transitionSystem[curBefore][curActions].push(curAfter);
        } else if (curAfter != prevAfter) {
            transitionSystem[curBefore][curActions].push(curAfter);
        }
        //update the previous to the current
        prevBefore = curBefore;
        prevActions = curActions;
        prevAfter = curAfter;
    }

/*

- Step 1:
	- Run through the keys and push to the states array.

*/


    for (var k in transitionSystem) {
        if (k.length > maxStrLeng) maxStrLeng = k.length;
        //keeptrack of max string length (needed for dynamic easel resizing)
        stateNames.push(k);
    }

    /*

    - Step 2:
            - for each state
                    - FIND THEIR PLACE IN THE STATE ARRAY
                            - take note (FIR)
                    - map each action and place it in the state array
                            - take note of its place (SEC)
                    - create the Atransition based on this and push it
                            - (FIR) ==> (SEC)
    */
    var placeInStateArray;
    var placeInActArray = 0;
    var placeInAfterArray;
    function findPlaceInStateArray(pSTR) {
        var out = 0;
        for (var i = 0; i < stateNames.length; i++) {
            if (stateNames[i] == pSTR) {
                out = i;
                i = stateNames.length; // to break out
            }
        }
        return out;
    }
    // for each key (state) in the transition system
    for (var k in transitionSystem) {

        placeInStateArray = findPlaceInStateArray(k);

        for (var j in transitionSystem[k]) {
            if (j.length > maxStrLeng) maxStrLeng = j.length;
            actionNames.push(j);
            abTransitions.push([placeInStateArray, placeInActArray]);
            /*
            - for each result state
                - find its place in the state array
                    - take note (THIR)
                - Create the Btransition and push it
                    - (SEC) ==> (THIR)
            */

            for (var o = 0; o < transitionSystem[k][j].length; o++) {
                var afStr = transitionSystem[k][j][o];
                placeInAfterArray = findPlaceInStateArray(afStr);
                ////console.log(placeInAfterArray);
                bcTransitions.push([placeInActArray, placeInAfterArray]);
            }
            placeInActArray++;
        }
    }

    //console.log("THE MAX STRING LENGTH IS " + maxStrLeng);


    /*
    - Step 3:
            - decide which is the longest of 
                    - Actions
                    - States
            - Calculate Max Height
                    - calculate units of height
    */
    var numMaxRows = stateNames.length;
    if (numMaxRows < actionNames.length) numMaxRows = actionNames.length;
    var easeHeight = (numMaxRows * 40) + 20;
    var easeWidth = ((maxStrLeng) * 8 * 3) + 200;

    /*
    Declares the render arrays (separate from the conceptual arrays because render objects need to be instances of prefabs from JointJS
    */
    var graphicalStates = [];
    var graphicalActions = [];
    var graphicalAfter = [];
    var graphicalLinksAB = [];
    var graphicalLinksBC = [];

    /*
    Creates the dynamically sized easel
    */
    var graph = new joint.dia.Graph();
    var paper = new joint.dia.Paper({
        el: $("#easel"),
        width: easeWidth, // ((maxStrLeng)*8 * 3) + 80 // previously 3000
        height: easeHeight,
        gridSize: 1,
        model: graph
    });
    /*
    create the action render states
    */
    var AAA;
    var horizDisplace = 10;
    var virtDisplace = 10;
    var virtDisplaceStateIncr = (easeHeight - 20) / stateNames.length;
    for (var i = 0; i < stateNames.length; i++) {
        AAA = new joint.shapes.basic.Rect({
            position: {
                x: horizDisplace,
                y: virtDisplace
            },
            size: {
                width: (maxStrLeng) * 8,
                height: 30
            },
            attrs: {
                rect: {
                    fill: 'white'
                },
                text: {
                    text: stateNames[i],
                    fill: 'black'
                }
            }
        });
        graphicalStates.push(AAA.clone());
        virtDisplace += virtDisplaceStateIncr;
    }
    /*
    creates the action render states
    */
    var ACT;
    horizDisplace = 10 + (maxStrLeng * 8) + 80;
    virtDisplace = 10;
    var virtDisplaceActionIncr = (easeHeight - 20) / actionNames.length;
    for (var i = 0; i < actionNames.length; i++) {
        ACT = new joint.shapes.basic.Rect({
            position: {
                x: horizDisplace,
                y: virtDisplace
            },
            size: {
                width: (maxStrLeng) * 8,
                height: 30
            },
            attrs: {
                rect: {
                    fill: 'gray',
                    rx: 100,
                    ry: 20,
                    'stroke-width': 2,
                    stroke: 'black'
                },
                text: {
                    text: actionNames[i],
                    fill: 'white'
                }
            }
        });
        graphicalActions.push(ACT.clone());
        virtDisplace += virtDisplaceActionIncr;
    }

    // a for loop that takes the first render state array and deep copies it and translate them to the far right
    for (var i = 0; i < graphicalStates.length; i++) {
        var sta = graphicalStates[i].clone().translate((2 * (maxStrLeng * 8)) + 160);
        graphicalAfter.push(sta);
    }
    // create links
    var link;
    var source;
    var destination;
    //ab links
    for (var i = 0; i < abTransitions.length; i++) {
        source = abTransitions[i][0];
        destination = abTransitions[i][1];
        link = new joint.dia.Link({
            source: {
                id: graphicalStates[source].id
            },
            target: {
                id: graphicalActions[destination].id
            },
            attrs: {
                '.marker-target': {
                    d: 'M 10 0 L 0 5 L 10 10 z'
                }
            }
        });
        graphicalLinksAB.push(link.clone());
    }
    //bc links

    for (var i = 0; i < bcTransitions.length; i++) {
        source = bcTransitions[i][0];
        destination = bcTransitions[i][1];
        link = new joint.dia.Link({
            source: {
                id: graphicalActions[source].id
            },
            target: {
                id: graphicalAfter[destination].id
            },
            attrs: {
                '.marker-target': {
                    d: 'M 10 0 L 0 5 L 10 10 z'
                }
            }
        });
        graphicalLinksBC.push(link);
    }
    
    // add all the render objects to the graph visualization
    graph.addCells(graphicalStates.concat(graphicalActions).concat(graphicalAfter).concat(graphicalLinksAB).concat(graphicalLinksBC)); //uses the dynamically created array as the initializer
    $(".easel-container").hide();
}