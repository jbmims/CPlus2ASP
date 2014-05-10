CPlus2ASP
=========

CPlus2ASP Web GUI and Compiler Service as a NetBeans 8.0 Project and is dependent on GlassFish 4.

Important files:

1. ~/web/index.html is the main and only HTML page. 

2. ~/web/js/cplus2asp-cm.js is the Code Mirror Mode for CPlus2ASP.

3. ~/web/js/cplus2asp-hint.js is the Auto Hint plug-in for Code Mirror for CPlus2ASP.
 
4. ~/web/js/main.js is the primary UI javascript file for the application.

5. ~/web/js/transitions.js contains all Transition system related code that utilizes JointJS (including appropriate server call).

6. ~/src/java/krr/cplus2asp/Compiler.java is the Java Servlet that contains the code for receiving CPlu2ASP code, compiling it, and emitting the output to the client.
