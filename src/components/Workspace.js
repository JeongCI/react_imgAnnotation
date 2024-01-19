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

  const [annotations, setAnnotations] = useState({annotations: [], });

  const selectLabelHandler = (flag, name) => {
    // 부품을 선택할 때 이전 데이터를 삭제하고 새로운 데이터로 교체
    updateItemInLabelData(flag, name, selectedLabel);
    setSelectedLabel(prevState => labelData[flag].find(item => item.name === name));
  };

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
    
    newAnnotations.annotations.forEach((annotation) => {
      const flag = 'part';
      const labelName = annotation.selectedLabel;
      
      // 이전 데이터를 삭제하고 새로운 데이터로 교체
      selectLabelHandler(flag, labelName);
      toggleAllItemHandler(flag, true);
      updateItemInLabelData(flag, labelName, annotation);
    });
  };
  
  // labelData 상태 업데이트를 위한 함수
  const updateItemInLabelData = (flag, labelName, newItemData) => {
    setLabelData((prevData) => {
      const updatedFlag = [...prevData[flag]];
      const targetItemIndex = updatedFlag.findIndex((item) => item.name === labelName);
  
      if (targetItemIndex !== -1) {
        const updatedItems = [newItemData];
  
        updatedFlag[targetItemIndex] = {
          ...updatedFlag[targetItemIndex],
          items: updatedItems,
        };
  
        return {
          ...prevData,
          [flag]: updatedFlag,
        };
      }
  
      return prevData;
    });
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
