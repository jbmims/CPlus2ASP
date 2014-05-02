$(document).ready(function() {
    
    //Initialize our tabs with Output disabled.
    $("#tabs").tabs({ 
        disabled: [1]
    });
    
    //Autohide our transition system when we tab over to the code.
    $("#tabs").on("tabsactivate",  function(event, ui) {
        if(ui.newPanel.attr("id") === "cplus") {
            $(".easel-container").hide();
        }
    });
    
    //Toggle show the transition system.
    $("#show-tsys").on("click", function() {
        $("#output").hide();
        $(".easel-container").show();
    });
    
    //Toggle show our text output.
    $("#show-output").on("click", function() {
        $("#output").show();
        $(".easel-container").hide();
    });
    
    /* 
     * Define our numberboxes as a "spinner" type that cannot be < 0. 
     * Used for Min/Max Step.
     */
    $(".numberbox").spinner({ "min": 0 });
    
    //Set up our dialog box that is used for setting query parameters.
    $("#dialog").dialog({ "autoOpen": false, "resizable": false, "width": 400 });
    
    //Set up our code mirror instance.
    var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        mode: "cplus2asp",
        theme: "cplus2asp",
        autoCloseBrackets: true,
        matchBrackets: true,
        extraKeys: {"Ctrl-Space": "autocomplete"}
    });	

    //Opens the dialog box when we want to set options & compile.
    $("#compile").on("click", function() {
        $("#dialog").dialog("open");
    });

    //Toggle our text box to only show when we want to use a label for our query.
    $("#query-select").on("change", function() {
        if($(this).val() === "label") {
            $("#query").show();
        }
        else {
            $("#query").hide();
        }
    });
    
    /*
     * Collect our parameters and send an 
     * AJAX call to the server to execute our code.
     */
    $("#run").on("click", function() {
        
        //Only run if we have code of some kind.
        if(myCodeMirror.getValue().trim() !== "") {
            
            var query = "";
            
            /*
             * If we're not using a label, just take the select value.
             * Otherwise, get the label value.
             */
            if($("#query-select").val() !== "label") {
                query = $("#query-select").val();        
            }
            else {
                query = $("#query").val();
            }
            
            //Disable our run button to prevent spamming server.
            $("#run").hide();
            $("#running").show();
            
            //Send our parameters to the server.
            $.ajax({
                type: "GET",
                url:  "Compiler",
                data: { 
                    code: myCodeMirror.getValue(),
                    query: query,
                    minstep: $("#minstep").val(),
                    maxstep: $("#maxstep").val(),
                    sol: $("#sol").val(),
                    language: $("#language").val()
                }
            }).always(function(response) {
                //Renable our tabs and show the output.
                $("#output-panel").html(response);
                $("#tabs").tabs("option", "disabled", false);
                
                //Renable our run button.
                $("#run").show();
                $("#running").hide();

            }).done(function () {
                //Remove "error" class, as this is valid output.
                $("#output-panel").removeClass("err");
                
                //If we opted to show transitions, do that.
                if($("#show-transitions").is(":checked")) {
                    buildTransitionSystem(myCodeMirror.getValue());
                    $("#show-tsys").show();
                }
                
                //Show our output tab.
                $("#output").show();
                $( "#tabs" ).tabs("option", "active", 1);
            }).fail(function () {
                
                //Show our output tab with the error class.
                $("#output-panel").addClass("err"); 
                $( "#tabs" ).tabs("option", "active", 1);
            });
        }
    });
});