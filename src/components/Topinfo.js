import React, { useState, useEffect } from 'react';
import {SaveIcon} from './Icons';

const userName = ["Hyunwoo Hong", "Jiyeong Kim", "Sejin Pack"];
const dateOptions = [
    { value: "2024-1m-1w", name: "2024-1m-1w" },
    { value: "2024-2m-1w", name: "2024-2m-1w" },
    { value: "2024-3m-1w", name: "2024-3m-1w" },
];
const SelectBox = (props) => {
    return (
        <select>
            {props.options.map((option) => (
                <option
                    value={option.value}
                    defaultValue={props.defaultValue === option.value}
                >
                    {option.name}
                </option>
            ))}
        </select>
    );
};
function Topinfo() {
    const [lastModifiedTime, setLastModifiedTime] = useState("");
    useEffect(() => {
        const intervalId = setInterval(() => {
            const currentTime = new Date().toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit'
            });

            setLastModifiedTime(currentTime);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);
    return (

        <div className="Topinfo">
            <div className="Userinfo"> <h3>{userName[0]}</h3>
                <SelectBox options={dateOptions} defaultValue="2024-1m-1w"></SelectBox>
            </div>
            <div className="Dateinfo">
                <span>최근수정한 시간:</span>
                <span className="time">{lastModifiedTime}</span>
                <button className="Save">

                 <SaveIcon />Save</button>
            </div>
        </div>
    );
}

export default Topinfo;
