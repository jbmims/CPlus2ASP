/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package krr.cplus2asp;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.UUID;

/**
 *
 * @author root
 */
public class Compiler extends HttpServlet {

    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException 
    {
        //Create the random directory to run our code from.
        String uuid = UUID.randomUUID().toString();       
        String codeDir = uuid;
        File f = new File(codeDir);
        f.mkdir();
  
        //Gets our parameters.
        String code = request.getParameter("code");
        String query = request.getParameter("query");
        String minstep = request.getParameter("minstep");
        String maxstep = request.getParameter("maxstep");
        String sol = request.getParameter("sol");
        String language = request.getParameter("language");
        String line;
        String output = "";
   
        
        //Writes code file
        PrintWriter out = response.getWriter();
        response.setContentType("text/html");
        try(PrintWriter writer = new PrintWriter(codeDir + "/CPlus2ASP"))
        {           
            writer.println(code);
            writer.close();
            
            //Builds command line from parameters.
            Runtime rt = Runtime.getRuntime();

            String cmd = "timeout 10s cplus2asp  --language=" + language + " " + codeDir + "/CPlus2ASP";
            if(!query.isEmpty()) 
                cmd += " --query=" + query;
            if(!minstep.isEmpty()) 
                cmd += " --minstep=" + minstep;            
            if(!maxstep.isEmpty()) 
                cmd += " --maxstep=" + maxstep;
            if(!sol.isEmpty()) 
                cmd += " " + sol;            
            

            //Execute command line and get IO streams from stdin and stderr.
            Process proc = rt.exec(cmd);
            BufferedReader stdInput = new BufferedReader(new InputStreamReader(proc.getInputStream()));
            BufferedReader stdError = new BufferedReader(new InputStreamReader(proc.getErrorStream()));
            
            //Read error stream.
            while((line = stdError.readLine()) != null) 
            {
                if(line != "")   
                {
                    output += "<p class='err'>" + line + "</p>"; 
                }
            }
            stdError.close();
            
            //Read input stream.
            while((line = stdInput.readLine()) != null) 
            { 
                line = line.trim();
                if(!line.isEmpty())
                {
                    if(line.startsWith("ACTIONS:"))
                    {
                        output += "<p class='action'>" + line + "</p>"; 
                    }
                    else if(line.matches("^[0-9]+:.*$")) 
                    {
                        output += "<p class='state'>" + line + "</p>";
                    }
                    else if (line.startsWith("Solution:")) 
                    {
                        output += "<p class='solution'>" + line + "</p>";
                    }
                    else if (line.startsWith("%"))
                    {
                      output += "<p class='comment'>" + line + "</p>";
                    } 
                    else if(line.startsWith("SATISFIABLE")) 
                    {
                        output += "<p class='satisfiable'>" + line + "</p>";
                    }
                    else if(line.startsWith("UNSATISFIABLE")) 
                    {
                        output += "<p class='err'>" + line + "</p>";
                    }
                    else 
                    {
                        output += "<p>" + line + "</p>";
                    }    
                }
            }
            stdInput.close();
            
            //Clean and remove the directory.
            for(int i = 0; i < f.listFiles().length; i++) 
            {
                f.listFiles()[i].delete();
            }
            f.delete();
                    
            if(output.isEmpty())
            {
                output += "<p class='err'>%% Error: Invalid parameter options.</p>";
            }
        }

        catch(Exception ex)
        {
            out.println("<p class='err'>" + ex.getMessage() + "</p>");
            out.flush();
            out.close();
        }
        
        out.println(output);
        out.flush();
        out.close();        
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Receives input and compiles a CPlus2ASP application.";
    }// </editor-fold>

}
