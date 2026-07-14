const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");


let backend;


function startBackend(){

    backend = spawn(
        "node",
        [
          path.join(__dirname,"../backend/server.js")
        ]
    );

    backend.stdout.on("data",(data)=>{
        console.log(`Backend: ${data}`);
    });
}


app.whenReady().then(()=>{

    startBackend();

    const win = new BrowserWindow({
        width:1400,
        height:900
    });


    win.loadFile(
        path.join(__dirname,"../frontend/dist/index.html")
    );

});


app.on("window-all-closed",()=>{
    if(backend){
        backend.kill();
    }

    app.quit();
});