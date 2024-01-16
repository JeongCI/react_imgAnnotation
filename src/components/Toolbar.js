
import React from 'react';
import { BboxIcon, Ploygun, HandelIcon, Clean, Undo, Redo, TextIcon, PlusIcon, MiusIcon } from './Icons';

function Toolbar({ onSelectTool }) {
  
  return (
    <div className="Toolbar">
      <ul>
        <li onClick={() => onSelectTool("handle")}> <HandelIcon /></li>
        <li onClick={() => onSelectTool("bbox")}> <BboxIcon /></li>
        <li onClick={() => onSelectTool("polygon")}> <Ploygun /></li>
        <li onClick={() => onSelectTool("text")}> <TextIcon /></li>
        <li onClick={() => onSelectTool("clean")}> <Clean /></li>
        <li onClick={() => onSelectTool("plus")}> <PlusIcon /></li>
        <li onClick={() => onSelectTool("minus")}> <MiusIcon /></li>
        <li onClick={() => onSelectTool("redo")}> <Redo /></li>
        <li onClick={() => onSelectTool("undo")}> <Undo /></li>
      </ul>
    </div>
  );
}

export default Toolbar;
