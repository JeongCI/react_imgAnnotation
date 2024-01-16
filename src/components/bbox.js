import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Head from "next/head";

export default function Annotate() {
  const [bboxes, setBboxes] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const backgroundRef = useRef();
  const image = useRef();

  function startDraw(e) {
    const { x, y } = backgroundRef.current.getBoundingClientRect();
    const { clickPositionX, clickPositionY } = getCoordinates(e, x, y);

    if (selectedObject !== null) {
      const updatedBboxes = [...bboxes];
      const bboxIndex = bboxes.findIndex((bbox) => bbox.id === selectedObject);

      if (bboxIndex !== -1) {
        updatedBboxes[bboxIndex].end = { x: clickPositionX, y: clickPositionY };
        setBboxes(updatedBboxes);
        setSelectedObject(null);
      }
    } else {
      setSelectedObject(uuidv4());
      setBboxes((prevBboxes) => [...prevBboxes, { id: selectedObject, start: { x: clickPositionX, y: clickPositionY }, end: null }]);
    }
  }

  function getCoordinates(e, offsetX, offsetY) {
    const { clientX, clientY } = e;
    const clickPositionX = clientX - offsetX;
    const clickPositionY = clientY - offsetY;
    return { clickPositionX, clickPositionY };
  }

  function deleteAnnotation(id) {
    const newBboxes = bboxes.filter((bbox) => bbox.id !== id);
    setBboxes(newBboxes);
  }

  return (
    <div>
      <Head>
        <title>Image Annotation</title>
        <meta name="description" content="Image Annotation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container">
        <div>
          <div className="box" ref={backgroundRef} onClick={startDraw}>
            <img
              src={process.env.PUBLIC_URL + '/caraccident01.jpg'}
              alt="Image to annotate"
              ref={image}
            />
            <svg className="svg">
              {image.current && (
                <rect
                  x="0"
                  y="0"
                  width={image.current.naturalWidth}
                  height={image.current.naturalHeight}
                  fill="transparent"
                  style={{ cursor: "crosshair" }}
                />
              )}
              <g>
                {bboxes.map((bbox) => (
                  <rect
                    key={bbox.id}
                    x={bbox.start.x}
                    y={bbox.start.y}
                    width={bbox.end ? bbox.end.x - bbox.start.x : 0}
                    height={bbox.end ? bbox.end.y - bbox.start.y : 0}
                    className="bbox"
                  />
                ))}
              </g>
            </svg>
          </div>
        </div>
        <div className="panel">
          {bboxes.map((bbox) => (
            <div className="object" key={bbox.id}>
              <span>Object ID: {bbox.id}</span>
              <button onClick={() => deleteAnnotation(bbox.id)}>
                Delete Object
              </button>
              <div className="data">
                <span>
                  Start: X: {bbox.start.x}, Y: {bbox.start.y}
                </span>
                {bbox.end && (
                  <span>
                    End: X: {bbox.end.x}, Y: {bbox.end.y}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>
        {`
          rect {
            cursor: crosshair;
          }

          img {
            display: block;
          }

          .container {
            display: flex;
            flex-wrap: wrap;
          }

          .box {
            width: 100%;
            height: 100%;
            position: relative;
            margin-bottom: 16px;
          }

          .svg {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }

          .bbox {
            fill: rgba(255, 0, 0, 0.1);
            stroke: red;
            cursor: crosshair;
            stroke-width: 1;
          }

          .panel {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            align-items: flex-start;
            gap: 16px;
          }

          .object {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            border: 1px solid;
            padding: 16px;
          }

          .data {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          button {
            cursor: pointer;
            border: 1px solid;
            padding: 4px 8px;
            background: white;
          }
        `}
      </style>
    </div>
  );
}
