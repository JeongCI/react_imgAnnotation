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
    console.log(value);
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
    const annotation = {...newAnnotations};
    
    setLabelData((prevData) => {
      const flag = 'part';
      const updatedFlag = [...prevData[flag]];
  
      // 모든 라벨의 items를 빈 배열로 초기화한다.
      const updatedFlagWithResetItems = updatedFlag.map((label) => ({
        ...label,
        items: [],
      }));
  
      return {
        ...prevData,
        [flag]: updatedFlagWithResetItems,
      };
    });    

    for(var i = 0; i < annotation.annotations.length; i++) {
      const flag = 'part';
      const labelName = newAnnotations.annotations[i].selectedLabel;
      const newItemData = newAnnotations.annotations[i];

      setLabelData((prevData) => {
        const updatedFlag = [...prevData[flag]];

        // labelName이 동일한 라벨을 찾아서 해당 라벨의 items에 newItemData를 추가한다.
        const updatedFlagWithNewItem = updatedFlag.map((label) => ({
          ...label,
          items: label.name === labelName ? [...label.items, newItemData] : label.items,
        }));
        selectLabelHandler(flag, labelName);
  
        return {
          ...prevData,
          [flag]: updatedFlagWithNewItem,
        };
      });
    }
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
    } else if (tool ==='undo') {
      window.undoAnnotation();
    }
  };

  return (
      <div className="Workspace">
          <Topinfo dataFromParent={annotations}/>
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
