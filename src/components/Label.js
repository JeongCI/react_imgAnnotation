import React, { useState } from 'react';
import { EyeIcon, EyeClose, Arrowdown, Arrowup, Folder, SmallClean, LockOpen, LockIcon } from './Icons';

const Labelpice = ["부품1", "부품2", "부품3", "부품4", "부품5", "부품6", "부품7", "부품8", "부품9", "부품10", "부품11", "부품12", "부품13", "부품14", "부품15", "부품16", "부품17", "부품18", "부품19", "부품20", "부품21"];
const Labeldamage = ["손상1", "손상2", "손상3", "손상4", "손상5"];

function Label() {
  const [isSubMenuOpen, setSubMenuOpen] = useState(true);
  const [isDamageSubMenuOpen, setDamageSubMenuOpen] = useState(false);
  const [eyeIconStatus, setEyeIconStatus] = useState({});
  const [allPiceEyeIconsActive, setAllPiceEyeIconsActive] = useState(false);
  const [damageEyeIconsActive, setdamageEyeIconsActive] = useState(false);
  const [lockOpenStatus, setLockOpenStatus] = useState({});
  const [hoverIconActive, setHoverIconActive] = useState(false);

  const toggleSubMenu = () => {
    setSubMenuOpen(!isSubMenuOpen);
  };

  const toggleDamageSubMenu = () => {
    setDamageSubMenuOpen(!isDamageSubMenuOpen);
  };

  const toggleEyeIcon = (index, isDamage) => {
    const key = isDamage ? `damage${index}` : `pice${index}`;
    setEyeIconStatus((prevStatus) => ({ ...prevStatus, [key]: !prevStatus[key] }));
  };

  const toggleAllPiceEyeIcons = () => {
    setAllPiceEyeIconsActive((prev) => !prev);
    setEyeIconStatus((prevStatus) => {
      const updatedStatus = {};
      Labelpice.forEach((_, i) => {
        updatedStatus[`pice${i}`] = !allPiceEyeIconsActive;
      });
      return { ...prevStatus, ...updatedStatus };
    });
  };

  const damageEyeIcons = () => {
    setdamageEyeIconsActive((prev) => !prev);
    setEyeIconStatus((prevStatus) => {
      const updatedStatus = {};
      Labeldamage.forEach((_, i) => {
        updatedStatus[`damage${i}`] = !damageEyeIconsActive;
      });
      return { ...prevStatus, ...updatedStatus };
    });
  };

  const toggleLock = (index, isDamage) => {
    setLockOpenStatus((prevStatus) => ({
      ...prevStatus,
      [isDamage ? `damage${index}` : `pice${index}`]: !prevStatus[isDamage ? `damage${index}` : `pice${index}`],
    }));
  };
  const handleHoverIconClick = (index, isDamage) => {
    setHoverIconActive((prev) => ({
      ...prev,
      [isDamage ? `damage${index}` : `pice${index}`]: !prev[isDamage ? `damage${index}` : `pice${index}`],
    }));
    toggleLock(index, isDamage);
  };

  return (
    <div className="Label">
      <h4 className={isSubMenuOpen ? "ActiveLabel" : ""}>Label</h4>
      <div className="Labeltag">
        <ul className="Menu">
          <li>
            <div>
              <span className={`EyeIcon ${allPiceEyeIconsActive ? "ActiveEyeIcon" : ""}`} onClick={toggleAllPiceEyeIcons}>
                {allPiceEyeIconsActive ? <EyeClose /> : <EyeIcon />}
              </span>
              <span className="Foldericon"><Folder /></span>
              {Labelpice && Labelpice.length && <p>부품({Labelpice.length})</p>}
            </div>
            <div>
              <span className="Arrowicon" onClick={toggleSubMenu}>{isSubMenuOpen ? <Arrowup /> : <Arrowdown />} </span>
            </div>
          </li>
          {isSubMenuOpen && (
            <ul className="Submenu">
              {Labelpice.map((item, index) => (
                <li key={index}>
                  <div>
                    <span
                      className={`Eyeicon ${eyeIconStatus[`pice${index}`] ? "ActiveEyeIcon" : ""}`}
                      onClick={() => toggleEyeIcon(index, false)}
                    >
                      {eyeIconStatus[`pice${index}`] ? <EyeClose /> : <EyeIcon />}
                    </span>

                    <span
                      className={`ItemText ${eyeIconStatus[`pice${index}`] ? "InactiveItemText" : "ActiveItemText"}`}
                    >
                      {item}(1)
                    </span>

                  </div>
                  <div>
                  <span className='Hovericon'>  <SmallClean/></span>
                  <span
                      className={`Hovericon ${hoverIconActive[`pice${index}`] ? "Active" : ""}`}
                      onClick={() => handleHoverIconClick(index, false)}
                    >
                       {lockOpenStatus[`pice${index}`] ?  <LockIcon /> :  <LockOpen />}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <li>
            <div>
              <span className={`EyeIcon ${damageEyeIconsActive ? "ActiveEyeIcon" : ""}`} onClick={damageEyeIcons}>
                {damageEyeIconsActive ? <EyeClose /> : <EyeIcon />}
              </span>
              손상({Labeldamage.length})
            </div>
            <div>
              <span className="Arrowicon" onClick={toggleDamageSubMenu}>{isDamageSubMenuOpen ? <Arrowup /> : <Arrowdown />} </span>
            </div>
          </li>
          {isDamageSubMenuOpen && (
            <ul className="Submenu">
              {Labeldamage.map((item, index) => (
                <li key={index}>
                  <div>
                    <span
                      className={`Eyeicon ${eyeIconStatus[`damage${index}`] ? "ActiveEyeIcon" : ""}`}
                      onClick={() => toggleEyeIcon(index, true)}
                    >
                      {eyeIconStatus[`damage${index}`] ? <EyeClose /> : <EyeIcon />}
                    </span>
                    <span
                      className={`ItemText ${eyeIconStatus[`damage${index}`] ? "InactiveItemText" : "ActiveItemText"}`}
                    >
                      {item}(1)
                    </span>
                  </div>
                  <div>
                 
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
