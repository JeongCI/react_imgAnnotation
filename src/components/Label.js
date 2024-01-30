import React, {useState} from 'react';
import {Arrowdown, Arrowup, EyeClose, EyeIcon, Folder, LockIcon, LockOpen, SmallClean} from './Icons';

function Label({labelData, onSelectLabel, onToggleActive, onToggleAllItem}) {
    const [isPartSubMenuOpen, setSubMenuOpen] = useState(true);
    const [isDamageSubMenuOpen, setDamageSubMenuOpen] = useState(false);

    const [lockOpenStatus, setLockOpenStatus] = useState({});
    const [hoverIconActive, setHoverIconActive] = useState(false);

    const toggleSubMenu = () => {
        setSubMenuOpen(prevState => !isPartSubMenuOpen);
    };

    const toggleDamageSubMenu = () => {
        setDamageSubMenuOpen(prevState => !isDamageSubMenuOpen);
    };

    const toggleEyeIcon = (flag, item) => {
        onToggleActive(flag, item);
        item.items.forEach(subItem => {
            toggleVisibilityByKey(subItem.id, item.isActive);
        });
    };

    const toggleVisibilityByKey = (key, isActive) => {
        const gElement = document.querySelector(`g[data-key="${key}"]`); // key값이 일치하는 g 태그를 선택
      
        if (gElement) {
          const childElements = gElement.querySelectorAll('*'); // g 태그의 모든 하위 요소를 선택
      
          childElements.forEach((childElement) => {
            // isActive 값에 따라 visibility 속성을 설정하여 보이거나 숨김
            childElement.style.visibility = !isActive ? 'visible' : 'hidden';
          });
        }
    };

    const toggleEyeIcons = (flag) => {
        if (isAllActive(flag)) {
            onToggleAllItem(flag, false);
            
            // 모든 하위 요소를 숨김
            if(flag === 'part') {
                labelData.part.forEach(partItem => {
                    partItem.items.forEach(subItem => {
                        toggleVisibilityByKey(subItem.id, true);
                    });
                });
            } else {
                labelData.damage.forEach(partItem => {
                    partItem.items.forEach(subItem => {
                        toggleVisibilityByKey(subItem.id, true);
                    });
                });
            }
        } else {
            onToggleAllItem(flag, true);
    
            // 모든 하위 요소를 보이도록 함
            if(flag === 'part') {
                labelData.part.forEach(partItem => {
                    partItem.items.forEach(subItem => {
                        toggleVisibilityByKey(subItem.id, false);
                    });
                });
            } else {
                labelData.damage.forEach(partItem => {
                    partItem.items.forEach(subItem => {
                        toggleVisibilityByKey(subItem.id, false);
                    });
                });                
            }
        }
    }

    const isAllActive = (flag) => {
        return labelData[flag].every(item => item.isActive === true)
    }

    const toggleLock = (index, isDamage) => {
        setLockOpenStatus(prevStatus => ({
            ...prevStatus,
            [isDamage ? `damage${index}` : `pice${index}`]: !prevStatus[isDamage ? `damage${index}` : `pice${index}`],
        }));
    };

    const handleHoverIconClick = (index, isDamage) => {
        setHoverIconActive(prev => ({
            ...prev,
            [isDamage ? `damage${index}` : `pice${index}`]: !prev[isDamage ? `damage${index}` : `pice${index}`],
        }));
        toggleLock(index, isDamage);
    };

    // labelData.items 개수 구하기
    const totalLength = () => {
        let total = 0;
        for(let i = 0; i < labelData.part.length; i++) {
            total += labelData.part[i].items.length;
        }
        return total;
    };

    return (
        <div className="Label">
            <h4 className={isPartSubMenuOpen ? "ActiveLabel" : ""}>Label</h4>
            <div className="Labeltag">
                <ul className="Menu">
                    <li>
                        <div>
                            <span className={`EyeIcon ${isAllActive("part") ? "ActiveEyeIcon" : ""}`}
                                  onClick={() => toggleEyeIcons("part")}>
                                {!isAllActive("part") ? <EyeClose/> : <EyeIcon/>}
                            </span>
                            <span className="Foldericon"><Folder/></span>
                            {labelData.part && labelData.part.length && <p>부품({ totalLength() })</p>}
                        </div>
                        <div>
                            <span className="Arrowicon" onClick={toggleSubMenu}>
                                {isPartSubMenuOpen ? <Arrowup/> : <Arrowdown/>}
                            </span>
                        </div>
                    </li>

                    {isPartSubMenuOpen && (
                        <ul className="Submenu">
                            {labelData.part.map((item, index) => (
                                <li key={index} onClick={() => onSelectLabel("part", item.name)}>
                                    <div>
                                        <span
                                            className={`Eyeicon ${item.isActive ? "ActiveEyeIcon" : ""}`}
                                            onClick={() => toggleEyeIcon("part", item)}
                                        >
                                            {!item.isActive ? <EyeClose/> : <EyeIcon/>}
                                        </span>

                                        <span
                                            className={`ItemText ${item.isActive ? "InactiveItemText" : "ActiveItemText"}`}
                                        >
                                            {item.name} {item.items.length}
                                        </span>
                                    </div>

                                    <div>
                                        <span className='Hovericon'><SmallClean/></span>
                                        <span
                                            className={`Hovericon ${hoverIconActive[`part${index}`] ? "Active" : ""}`}
                                            onClick={() => handleHoverIconClick(index, false)}
                                        >
                                            {lockOpenStatus[`part${index}`] ? <LockIcon/> : <LockOpen/>}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <li>
                        <div>
                            <span className={`EyeIcon ${isAllActive("damage") ? "ActiveEyeIcon" : ""}`}
                                  onClick={() => toggleEyeIcons("damage")}>
                                {!isAllActive("damage") ? <EyeClose/> : <EyeIcon/>}
                            </span>
                            손상({labelData.damage.length})
                        </div>
                        <div>
                            <span className="Arrowicon" onClick={toggleDamageSubMenu}>
                                {isDamageSubMenuOpen ? <Arrowup/> : <Arrowdown/>}
                            </span>
                        </div>
                    </li>

                    {isDamageSubMenuOpen && (
                        <ul className="Submenu">
                            {labelData.damage.map((item, index) => (
                                <li key={index} onClick={() => onSelectLabel("damage", item.name)}>
                                    <div>
                                        <span
                                            className={`Eyeicon ${item.isActive ? "ActiveEyeIcon" : ""}`}
                                            onClick={() => toggleEyeIcon("damage", item)}
                                        >
                                            {!item.isActive ? <EyeClose/> : <EyeIcon/>}
                                        </span>
                                        <span
                                            className={`ItemText ${item.isActive ? "InactiveItemText" : "ActiveItemText"}`}
                                        >
                                            {item.name} {item.items.length}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Label;
