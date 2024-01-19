// Workspace.js
import React, {useEffect, useRef, useState} from "react";
import Toolbar from './Toolbar';
import Topinfo from './Topinfo';
import Workcanvas from './Workcanvas';
import Label from './Label';

import {label_data} from "../label_data";


function Workspace() {
  const [selectedTool, setSelectedTool] = useState(null);
  const workCanvasRef = useRef(null);

  const [labelData, setLabelData] = useState(label_data);
  const [selectedLabel, setSelectedLabel] = useState(null);

  const [annotations, setAnnotations] = useState({ polygons: [], bboxData: [] });

  const selectLabelHandler = (flag, name) => {
      setSelectedLabel(prevState => labelData[flag].find(item => item.name === name))
  }

  useEffect(() => {
      console.log("selectedLabel : ", selectedLabel)
  }, [selectedLabel]);

  const toggleLabelHandler = (flag, targetItem) => {
      setLabelData((prevData) => {
          const updatedFlag = [...prevData[flag]];
          const targetIndex = updatedFlag.findIndex(item => item === targetItem)
          updatedFlag[targetIndex] = {...updatedFlag[targetIndex], isActive: !updatedFlag[targetIndex].isActive};

          return {
              ...prevData,
              [flag]: updatedFlag,
          };
      });
  }

  const toggleAllItemHandler = (flag, value) => {
      setLabelData(prevData => {
          const updatedFlag = prevData[flag].map((item) => ({...item, isActive: value}));

          return {
              ...prevData,
              [flag]: updatedFlag,
          };
      })
  }

  const handleAnnotationChange = (newAnnotations) => {
    // 주석 정보가 업데이트되면 Workspace 컴포넌트의 state를 업데이트
    setAnnotations(newAnnotations);
  }; 

  const onSelectTool = (tool) => {
      console.log("Selected tool:", tool);
      setSelectedTool(tool);

      if (tool === "polygon" && workCanvasRef.current) {
          workCanvasRef.current.startDraw();
      } else if (tool === "bbox" && workCanvasRef.current) {
          workCanvasRef.current.startDraw();
      } else if (tool === "plus" && workCanvasRef.current) {
          workCanvasRef.current.handleWheel();
      } else if (tool === "minus" && workCanvasRef.current) {
          workCanvasRef.current.handleWheel();
      }
  };

  return (
      <div className="Workspace">
          <Topinfo/>
          <Toolbar onSelectTool={onSelectTool}/>
          <Workcanvas ref={workCanvasRef}
                      selectedTool={selectedTool}
                      selectedLable={selectedLabel}
                      onAnnotationChange={handleAnnotationChange}/>
          <Label labelData={labelData}
                 onSelectLabel={selectLabelHandler}
                 onToggleAllItem={toggleAllItemHandler}
                 onToggleActive={toggleLabelHandler}/>
      </div>
  );
}



export default Workspace;
