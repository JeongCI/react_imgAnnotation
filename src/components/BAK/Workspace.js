// Workspace.js
import React, { useState, useRef } from "react";
import Toolbar from './Toolbar';
import Topinfo from './Topinfo';
import Workcanvas from './Workcanvas';
import Label from './Label';

function Workspace() {
  const [selectedTool, setSelectedTool] = useState(null);
  const workcanvasRef = useRef(null);
  
  const onSelectTool = (tool) => {
    console.log("Selected tool:", tool);
    setSelectedTool(tool);

    if (tool === "polygon" && workcanvasRef.current) {
      workcanvasRef.current.startDraw();
    } else if (tool === "bbox" && workcanvasRef.current) {
      workcanvasRef.current.startDraw();
    }
    
  };

  return (
    <div className="Workspace">
      <Topinfo />
      <Toolbar onSelectTool={onSelectTool}/>
      <Workcanvas ref={workcanvasRef} selectedTool={selectedTool}/>
      <Label />
    </div>
  );
}

export default Workspace;
