import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { PrveIcon, NextIcon } from './Icons';
import 'swiper/css';
import { v4 as uuidv4 } from 'uuid';

const Labelpice = ["부품1", "부품2", "부품3", "부품4", "부품5", "부품6", "부품7", "부품8", "부품9", "부품10", "부품11", "부품12", "부품13", "부품14", "부품15", "부품16", "부품17", "부품18", "부품19", "부품20", "부품21"];
const labelPart = ["손상1", "손상2", "손상3", "손상4", "손상5"];


const Showcase = ({ selectedTool, onAnnotationChange }) => {
  const [polygons, setPolygons] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const backgroundRef = useRef();
  const svgRef = useRef();
  const image = useRef();  
  const [selectedLabel, setSelectedLabel] = useState(Labelpice[0]);
  const [selectedLabelPart, setselectedLabelPart] = useState(labelPart[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [bboxData, setBboxData] = useState([]);
  const [scale, setScale] = useState(1);
  const [annotationsList, setAnnotationsList] = useState([]);

  useEffect(() => {
    // 삭제 작업 완료 후 주석 정보 업데이트
    updateAnnotations();
  }, [polygons, bboxData]);

  function handleLabelChange(id, newLabel) {
    setPolygons((prevPolygons) =>
      prevPolygons.map((polygon) =>
        polygon.id === id ? { ...polygon, selectedLabel: newLabel } : polygon
      )
      
    );
  
    setBboxData((prevBboxData) =>
      prevBboxData.map((bbox) => (bbox.id === id ? { ...bbox, selectedLabel: newLabel } : bbox))
    );    
  }

  function handleLabelPartChange(id, newLabel) {
    setPolygons((prevPolygons) =>
      prevPolygons.map((polygon) =>
        polygon.id === id ? { ...polygon, selectedLabel: newLabel } : polygon
      )
      
    );
  
    setBboxData((prevBboxData) =>
      prevBboxData.map((bbox) => (bbox.id === id ? { ...bbox, selectedLabel: newLabel } : bbox))
    );    
  }  

  // 키보드 이벤트 처리
  const handleKeyDown = (e) => {
    if (selectedTool === 'polygon' && e.key === 'Enter') {
      // 엔터 키를 누르면 폴리곤 작업 완료
      const position = polygons.findIndex((object) => object.id === selectedObject);
      const items = [...polygons];
      const item = { ...items[position] };
      if(position === -1) {
        return;
      } 

      if (item.data.length < 3) {
        items.splice(position, 1);
        setPolygons(items);
        setHistory((prevHistory) => [...prevHistory, items]);
        setSelectedObject(null); // 새로운 다각형을 선택 상태로 변경하지 않음
      } else {
        finishAnnotation();
        setIsMouseDown(false);
        handleAddAnnotation("polygon", polygons);
        document.removeEventListener('keydown', handleKeyDown);
      }
    }
  };
  
  // const handlePolygonCreation = () => {
  //   // 폴리곤 생성 로직
  
  //   // 현재 폴리곤의 ID 확인
  //   const position = polygons.findIndex((object) => object.id === selectedObject);
  
  //   if (position !== -1) {
  //     // 이미 그려진 다각형을 수정하는 경우
  //     const items = [...polygons];
  //     const item = { ...items[position] };
  
  //     // 기존 다각형이 적어도 3개의 점을 가지고 있어야 함 (폴리곤 조건)
  //     if (item.data.length >= 3) {
  //       // 폴리곤이 완성된 경우 새로운 ID 생성
  //       const newObjectId = uuidv4();
  
  //       // 현재 다각형에 새로운 ID 할당
  //       item.id = newObjectId;
  
  //       items[position] = item;
  //       setPolygons(items);
  //       setHistory((prevHistory) => [...prevHistory, items]);
  //       setSelectedObject(null); // 새로운 다각형을 선택 상태로 변경하지 않음
  //     } else {
  //       // 폴리곤이 3개 미만의 점을 가지고 있는 경우 폴리곤 삭제
  //       items.splice(position, 1);
  //       setPolygons(items);
  //       setHistory((prevHistory) => [...prevHistory, items]);
  //       setSelectedObject(null); // 새로운 다각형을 선택 상태로 변경하지 않음
  //     }
  //   }
  
  //   // 업데이트 및 추가 로직
  //   updateAnnotations(polygons);
    
  
  //   // 이벤트 리스너 등록/해제
  // };

  // undo 리스트
  const handleAddAnnotation = (annotationType, data) => {
    // 새로운 주석 추가 시 현재 상태를 복제하여 업데이트
    setAnnotationsList((prevAnnotationsList) => [
      { type: annotationType, data: data },
      ...prevAnnotationsList,
    ]);
    console.log(annotationsList);
  };
  
  function startDraw(e) {
    // selectedTool이 'polygon'인 경우에만 실행
    if (selectedTool === 'polygon' && e.button !== 1) {
      setIsMouseDown(true);
      // 마우스 클릭 위치 계산
      const { x, y } = svgRef.current.getBoundingClientRect();
      const { clickPositionX, clickPositionY } = getCoordinates(e, x, y);
  
      const position = polygons.findIndex((object) => object.id === selectedObject);
  
      if (position !== -1) {
        // 이미 그려진 다각형을 수정하는 경우
        const items = [...polygons];
        const item = { ...items[position] };
  
        // 클릭한 위치가 기존 점 위에 있는지 확인
        const clickedPointIndex = item.data.findIndex((point) => {
          const distance = Math.sqrt(
            Math.pow(point.x - clickPositionX, 2) + Math.pow(point.y - clickPositionY, 2)
          );
          return distance < 5; // 일정 거리 이내의 점을 클릭으로 간주 (임계값 조절 가능)
        });
  
        if (clickedPointIndex === -1) {
          // 클릭한 위치가 기존 점 위에 없으면 새로운 점 추가
          item.data.push({ x: clickPositionX, y: clickPositionY });
        }
  
        items[position] = item;
        setPolygons(items);
        setHistory((prevHistory) => [...prevHistory, items]);
      } else {
        // 새로운 다각형을 그리는 경우
        const objectId = uuidv4();
        const object = {
          figure: "polygon",
          id: objectId,
          selectedLabel: selectedLabel,
          selectedLabelPart: selectedLabelPart,
          data: [
            {
              x: clickPositionX,
              y: clickPositionY,
            },
          ],
        };
        setPolygons((prevPolygons) => [...prevPolygons, object]);
        setHistory((prevHistory) => [...prevHistory, polygons]);
        setSelectedObject(objectId);
      }
    } else if (selectedTool === 'bbox' && e.button !== 1) {
      // 'bbox' 도구 선택 시 실행 (바운딩 박스 그리기 시작)
      setIsMouseDown(true);
  
      // 마우스 클릭 위치 계산
      const { x, y } = svgRef.current.getBoundingClientRect();
      const { clickPositionX, clickPositionY } = getCoordinates(e, x, y);
  
      // 바운딩 박스의 시작 좌표를 설정
      setBboxData((prevBboxData) => [
        ...prevBboxData,
        {
          figure: 'bbox',
          id: uuidv4(),
          x: clickPositionX,
          y: clickPositionY,
          width: 0,
          height: 0,
          selectedLabel: selectedLabel,
          selectedLabelPart: selectedLabelPart,
        },
      ]);
    } else if(selectedTool === 'handle' && e.button !== 1){ // 폴리곤 점 클릭
      setIsMouseDown(true);
  
      // 마우스 클릭 위치 계산
      const { x, y } = svgRef.current.getBoundingClientRect();
      const { clickPositionX, clickPositionY } = getCoordinates(e, x, y);

      // 클릭한 위치의 폴리곤 ID 찾기
      let clickedPolygonId = null;
      let clickedPointIndex = -1; // 블록 외부에서 정의
      for (const polygon of polygons) {
        clickedPointIndex = polygon.data.findIndex((point) => {
          const distance = Math.sqrt(
            Math.pow(point.x - clickPositionX, 2) + Math.pow(point.y - clickPositionY, 2)
          );
          return distance < 5; // 일정 거리 이내의 점을 클릭으로 간주 (임계값 조절 가능)
        });
    
        if (clickedPointIndex !== -1) {
          clickedPolygonId = polygon.id;
          break; // 클릭한 폴리곤을 찾았으면 루프 종료
        }
      }
    
      // 클릭한 폴리곤 ID를 통해 상태 업데이트 등 수행
      if (clickedPolygonId !== null) {
        const position = polygons.findIndex((object) => object.id === clickedPolygonId);
    
        if (position !== -1) {
          // 이미 그려진 다각형을 수정하는 경우
          const items = [...polygons];
          const item = { ...items[position] };
    
          // 클릭한 위치가 기존 점 위에 있으면 해당 점을 선택한 것으로 처리
          setSelectedPoint({ polygonIndex: position, pointIndex: clickedPointIndex });
    
          items[position] = item;
          setPolygons(items);
          setHistory((prevHistory) => [...prevHistory, items]);
        } else {
          setHistory((prevHistory) => [...prevHistory, polygons]);
        }
      } else {
        return;
      }
    }
  } 
  
  function handleMouseMove(e) {
    if (isMouseDown && selectedTool === 'bbox') {
      const { x, y } = svgRef.current.getBoundingClientRect();
      const { clickPositionX, clickPositionY } = getCoordinates(e, x, y);
      
      setBboxData((prevBboxData) => {
        const updatedBboxData = [...prevBboxData];
        const currentBbox = updatedBboxData[updatedBboxData.length - 1];
      
        // points 배열이 없으면 초기화
        if (!currentBbox.points || !Array.isArray(currentBbox.points)) {
          currentBbox.points = [];
        }
      
        // 새로운 꼭지점의 좌표 추가
        const newPoint = { x: clickPositionX, y: clickPositionY };
      
        // points 배열에 꼭지점이 없거나 하나만 있는 경우 초기값 설정
        if (currentBbox.points.length === 0) {
          currentBbox.points = [newPoint, newPoint];
        } else if (currentBbox.points.length === 1) {
          currentBbox.points.push(newPoint);
        } else {
          // 첫 번째와 마지막 꼭지점만 포함되도록 업데이트
          currentBbox.points[1] = newPoint;
        }
      
        // 바운딩 박스의 너비와 높이를 계산
        const width = newPoint.x - currentBbox.points[0].x;
        const height = newPoint.y - currentBbox.points[0].y;
      
        // 바운딩 박스의 너비와 높이를 업데이트
        currentBbox.width = width;
        currentBbox.height = height;
      
        return updatedBboxData;
      });
    } else if (isMouseDown && selectedTool === 'polygon') {
      if (selectedPoint !== null) {
        // If a point is selected, update its position
        const { x, y } = svgRef.current.getBoundingClientRect();
        const { clickPositionX, clickPositionY } = getCoordinates(e, x, y);
    
        const items = [...polygons];
        const item = { ...items[selectedPoint.polygonIndex] };
        item.data[selectedPoint.pointIndex] = { x: clickPositionX, y: clickPositionY };
        items[selectedPoint.polygonIndex] = item;
        setPolygons(items);
      }
    } else if (isMouseDown && selectedTool === 'handle') { // polygon 점 이동
      if (selectedPoint !== null) {
        // If a point is selected, update its position
        const { x, y } = svgRef.current.getBoundingClientRect();
        const { clickPositionX, clickPositionY } = getCoordinates(e, x, y);
    
        const items = [...polygons];
        const item = { ...items[selectedPoint.polygonIndex] };
        item.data[selectedPoint.pointIndex] = { x: clickPositionX, y: clickPositionY };
        items[selectedPoint.polygonIndex] = item;
        setPolygons(items);
      }
    }
  }

  function handleMouseUp() {
    setIsMouseDown(false);
    setSelectedPoint(null);
    updateAnnotations(bboxData, polygons);
    if(selectedTool === 'bbox') {
      handleAddAnnotation("bbox", bboxData);
    }
  }  

  function getCoordinates(e, offsetX = 0, offsetY = 0) {
    const { clientX, clientY } = e;
    const clickPositionX = clientX - offsetX;
    const clickPositionY = clientY - offsetY;
    return { clickPositionX, clickPositionY };
  }
 
  function deleteAnnotation(id) {
    setPolygons((prevPolygons) => {
      const newPolygons = prevPolygons.filter((object) => object.id !== id);
      return newPolygons;
    });
  
    setBboxData((prevBboxData) => {
      const newBboxData = prevBboxData.filter((bbox) => bbox.id !== id);
      return newBboxData;
    });
    
    console.log(annotationsList);
    for(var i = 0; i < annotationsList.length; i++) {
      console.log("id : " + id);
      const dataValues = Object.values(annotationsList[i].data);
      console.log(dataValues);
      const index = dataValues.findIndex(item => item.id === id);
      console.log(index);
      
      if(index !== -1) {
        annotationsList.splice(i, 1);
      }
    }
  }

  const updateAnnotations = () => {
    // 현재 상태에서 필요한 주석 정보 추출
    const currentPolygons = polygons;
    const currentBboxData = bboxData;
  
    // 상위 컴포넌트로 주석 정보 전달
    onAnnotationChange({
      annotations: [...currentPolygons, ...currentBboxData],
    });
  }; 

  // function newAnnotation() {
  //   setIsDrawing(true);

  //   const newObjectId = uuidv4();
  //   setSelectedObject(newObjectId);
  //   const newPolygon = {
  //     id: newObjectId,
  //     data: [],
  //     selectedLabel: Labelpice[0],
  //   };
  //   setHistory((prevHistory) => [...prevHistory, polygons]);
  //   setRedoHistory([]);
  //   setPolygons((prevPolygons) => [...prevPolygons, newPolygon]);
  // }

  // 이전으로
  window.undoAnnotation = () => {
    console.log(annotationsList);
    // polygons와 bboxData 중 어떤 것이든 데이터가 없으면 바로 리턴
    if (annotationsList.length === 0) return;
  
    // annotationsList type
    const type = annotationsList[0].type;
  
    // 어떤 데이터가 있다면 redoHistory에 현재 상태를 추가
    setRedoHistory((prevRedoHistory) => [...prevRedoHistory, { polygons, bboxData }]);
  
    if (type === "polygon") {
      setPolygons((prevPolygons) => {
        const updatedPolygons = [...prevPolygons];
        if (updatedPolygons.length > 0) {
          const lastPolygon = updatedPolygons[updatedPolygons.length - 1];
          console.log(lastPolygon);
          if (lastPolygon.data.length > 2) {
            lastPolygon.data.pop();
          } else {
            updatedPolygons.pop();
            annotationsList.shift();
          }
        }
        return updatedPolygons;
      });
      updateAnnotations(bboxData, polygons);
    } else if (type === "bbox") {
      setBboxData((prevBboxData) => {
        const updatedBboxData = [...prevBboxData];
        if (updatedBboxData.length > 0) {
          updatedBboxData.pop();
        }
        annotationsList.shift();
        return updatedBboxData;
      });
      updateAnnotations(bboxData, polygons);
    }
  };

  // 원상태로
  function redoAnnotation() {
    if (redoHistory.length === 0) return;
  
    const newPolygons = [...redoHistory[redoHistory.length - 1]];
    setRedoHistory((prevRedoHistory) => [...prevRedoHistory.slice(0, -1)]);
    setPolygons(newPolygons);
  }

  function finishAnnotation() {
    setSelectedObject(null);

    setIsDrawing(false);
  }

  //polygon 선 연결
  function getPositionString(item) {
      const position = item.data.map((coordinate) => {
        return `${coordinate.x}/${coordinate.y} `;
      });
      
      const positionString = position.toString().replaceAll(',', ' ').replaceAll('/', ',');
      return positionString;
  }

  // bbox 이동
  function handleBboxMouseDown(bboxId, e) {
    if(selectedTool === 'handle' && e.button !== 1)
    setBboxData((prevBboxData) => {
      // 새로운 배열 생성
      const updatedBboxData = [...prevBboxData];
      // 해당 ID의 바운딩 박스 찾기
      const currentBboxIndex = updatedBboxData.findIndex((bbox) => bbox.id === bboxId);
  
      if (currentBboxIndex !== -1) {
        // 찾은 바운딩 박스 가져오기
        const currentBbox = updatedBboxData[currentBboxIndex];
  
        // 이동 시작 시의 마우스 위치 기록
        let initialMouseX = e.clientX;
        let initialMouseY = e.clientY;
  
        // 마우스 이동 이벤트 핸들러 등록
        const handleMouseMove = (e) => {
          // 이동한 거리 계산
          const offsetX = e.clientX - initialMouseX;
          const offsetY = e.clientY - initialMouseY;
  
          // 모든 꼭지점 이동 로직 추가
          currentBbox.points.forEach((point) => {
            point.x += offsetX;
            point.y += offsetY;
          });
  
          // 바운딩 박스 자체의 좌표 이동
          currentBbox.x += offsetX;
          currentBbox.y += offsetY;
  
          // 초기 마우스 위치 업데이트
          initialMouseX = e.clientX;
          initialMouseY = e.clientY;
  
          // 업데이트된 데이터로 상태 업데이트
          setBboxData((prevBboxData) => {
            const newBboxData = [...prevBboxData];
            newBboxData[currentBboxIndex] = currentBbox;
            return newBboxData;
          });
        };
  
        // 마우스 이동 및 이동 종료 이벤트 핸들러 등록
        const handleMouseUp = () => {
          // 이동이 끝난 경우, 마우스 이동 이벤트 핸들러 제거
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
  
        // 마우스 이동 및 이동 종료 이벤트 핸들러 등록
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      
  
      return updatedBboxData;
      
    });
  }

  function handlePolygonMouseDown(polygonId, e) {
    if (selectedTool === 'handle' && e.button !== 1) {
      setPolygons((prevPolygons) => {
        // 새로운 배열 생성
        const updatedPolygonData = [...prevPolygons];
        // 해당 ID의 다각형 찾기
        const currentPolygonIndex = updatedPolygonData.findIndex((polygon) => polygon.id === polygonId);
  
        if (currentPolygonIndex !== -1) {
          // 찾은 다각형 가져오기
          const currentPolygon = updatedPolygonData[currentPolygonIndex];
  
          // 이동 시작 시의 마우스 위치 기록
          let initialMouseX = e.clientX;
          let initialMouseY = e.clientY;
  
          // 마우스 이동 이벤트 핸들러 등록
          const handleMouseMove = (e) => {
            // 이동한 거리 계산
            const offsetX = e.clientX - initialMouseX;
            const offsetY = e.clientY - initialMouseY;
  
            // 모든 꼭지점 이동 로직 추가
            currentPolygon.data.forEach((point) => {
              point.x += offsetX;
              point.y += offsetY;
            });
  
            // 초기 마우스 위치 업데이트
            initialMouseX = e.clientX;
            initialMouseY = e.clientY;
  
            // 업데이트된 데이터로 상태 업데이트
            setPolygons((prevPolygons) => {
              const newPolygonData = [...prevPolygons];
              newPolygonData[currentPolygonIndex] = currentPolygon;
              return newPolygonData;
            });
          };
  
          // 마우스 이동 및 이동 종료 이벤트 핸들러 등록
          const handleMouseUp = () => {
            // 이동이 끝난 경우, 마우스 이동 이벤트 핸들러 제거
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
          };
  
          // 마우스 이동 및 이동 종료 이벤트 핸들러 등록
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
        }
  
        return updatedPolygonData;
      });
    }
  } 

  const [swiper, setSwiper] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  const handlePrevClick = () => {
    if (swiper) {
      swiper.slidePrev();
    }
  };

  const handleNextClick = () => {
    if (swiper) {
      swiper.slideNext();
    }
  };

  const swiperParams = {
    slidesPerView: 1,
    onSwiper: setSwiper,
    onSlideChange: (e) => setMainImageIndex(e.activeIndex),
    modules: {
      scrollbar: {
        draggable: false,
      },
    },
    simulateTouch: false,
    noSwiping: true,
    noSwipingClass: 'swiper-no-swiping',
  };
  const totalSlides = swiper?.slides?.length || 0;

  const handleWheel = (e) => {
    if (selectedTool === "plus" || selectedTool === "minus") {
      e.preventDefault(); // 스크롤 이벤트 기본 동작 방지
  
      const scaleFactor = 1.1; // 확대/축소 비율
      const delta = e.deltaY || e.detail || e.wheelDelta;
  
      // 현재 이미지 크기 및 새로운 크기 계산
      const currentScale = scale;
      let newScale = delta > 0 ? currentScale / scaleFactor : currentScale * scaleFactor;
  
      // 최소 및 최대 크기 제한
      const minScale = 0.7;
      const maxScale = 2.5;
      newScale = Math.max(minScale, Math.min(newScale, maxScale));
  
      // 이미지 크기 업데이트
      setScale(newScale);
  
      // 현재 이미지 크기 가져오기
      const currentWidth = image.current.width;
      const currentHeight = image.current.height;
  
      // 확대/축소 비율에 기반하여 새로운 크기 계산
      let newWidth, newHeight;
  
      if (delta > 0) {
        // 축소
        newWidth = currentWidth / scaleFactor;
        newHeight = currentHeight / scaleFactor;
      } else {
        // 확대
        newWidth = currentWidth * scaleFactor;
        newHeight = currentHeight * scaleFactor;
      }
  
      if (newScale > minScale && newScale < maxScale) {
        // 최소 및 최대 확대/축소 배수 설정
        newWidth = Math.max(Math.min(newWidth, currentWidth * maxScale), currentWidth * minScale);
        newHeight = Math.max(Math.min(newHeight, currentHeight * maxScale), currentHeight * minScale);
  
        // 이미지 크기 및 위치 업데이트
        image.current.style.width = `${newWidth}px`;
        image.current.style.height = `${newHeight}px`;
  
        // polygon 좌표 업데이트
        setPolygons((prevPolygons) => {
          return prevPolygons.map((item) => {
            return {
              ...item,
              data: item.data.map((coordinate) => {
                return {
                  x: coordinate.x * (newWidth / currentWidth),
                  y: coordinate.y * (newHeight / currentHeight),
                };
              }),
            };
          });
        });
  
        // bbox 좌표 업데이트
        setBboxData((prevBboxData) => {
          return prevBboxData.map((bbox) => {
            return {
              ...bbox,
              x: bbox.x * (newWidth / currentWidth),
              y: bbox.y * (newHeight / currentHeight),
              width: bbox.width * (newWidth / currentWidth),
              height: bbox.height * (newHeight / currentHeight),
            };
          });
        });
  
        // SVG 크기 업데이트 (이미지 크기와 동일하게 설정)
        svgRef.current.style.width = `${newWidth}px`;
        svgRef.current.style.height = `${newHeight}px`;
      }
    }
  };

  return (
    <div>
      <Swiper {...swiperParams}>
        <SwiperSlide>
          <div className="box" ref={backgroundRef} onWheel={handleWheel}>
            <img src={process.env.PUBLIC_URL + '/caraccident01.jpg'} ref={image} alt="car accident"/>
            <svg ref={svgRef} className="svg" tabIndex="0" onMouseDown={startDraw} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}  onKeyDown={handleKeyDown}>
              {image.current && (
                <rect
                  x="0"
                  y="0"
                  width={image.current.naturalWidth}
                  height={image.current.naturalHeight}
                  fill="transparent"
                  style={{ cursor: 'crosshair' }}
                />
              )}
              <g>
                {polygons.map((item) => (
                  <g key={item.id}>
                    {item.data.map((coordinate, index) => (
                      <circle key={index} cx={coordinate.x} cy={coordinate.y} r="5" fill="blue" />
                    ))}
                    <polygon
                      points={getPositionString(item)}
                      className="polygon"
                      onMouseDown={(e) => handlePolygonMouseDown(item.id, e)}
                      fill="rgba(0, 0, 255, 0.2)" // Add fill color
                      stroke="blue" // Add stroke color
                      strokeWidth="2" // Add stroke width
                    />
                    {/* foreignObject를 사용하여 HTML을 SVG에 삽입 */}
                    <foreignObject x={item.data[0].x} y={item.data[0].y - 100} width="100" height="80">
                      <div className="underBox" key={item.id}>
                        <span>POLYGON</span>
                        <button onClick={() => deleteAnnotation(item.id)}>Delete</button>
                        <div className="underData">
                        <select
                        value={item.selectedLabel}
                        onChange={(e) => handleLabelChange(item.id, e.target.value)} >
                          {Labelpice.map((label, index) => (
                            <option key={index} value={label}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <select
                        value={item.selectedLabelPart}
                        onChange={(e) => handleLabelPartChange(item.id, e.target.value)} >
                          {labelPart.map((label, index) => (
                            <option key={index} value={label}>
                              {label}
                            </option>
                          ))}
                        </select>
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </g>
              <g>
              {bboxData.map((bbox) => (
                <g key={bbox.id}>
                  {/* 좌상단 꼭지점 */}
                  <circle cx={bbox.x} cy={bbox.y} r="5" fill="red" />
                  {/* 우상단 꼭지점 */}
                  <circle cx={bbox.x + bbox.width} cy={bbox.y} r="5" fill="red" />
                  {/* 좌하단 꼭지점 */}
                  <circle cx={bbox.x} cy={bbox.y + bbox.height} r="5" fill="red" />
                  {/* 우하단 꼭지점 */}
                  <circle cx={bbox.x + bbox.width} cy={bbox.y + bbox.height} r="5" fill="red" />

                  {/* 바운딩 박스 */}
                  <rect
                    x={bbox.x}
                    y={bbox.y}
                    width={bbox.width}
                    height={bbox.height}
                    fill="rgba(255, 0, 255, 0.2)"
                    stroke="pink"
                    strokeWidth="2"
                    onMouseDown={(e) => handleBboxMouseDown(bbox.id, e)}
                  />
                  {/* foreignObject를 사용하여 HTML을 SVG에 삽입 */}
                  <foreignObject x={bbox.x} y={bbox.y - 80} width="100" height="80">
                    <div className="underBox" key={bbox.id} >
                      <span>BBOX</span>
                      <button onClick={() => deleteAnnotation(bbox.id)}>Delete</button>
                      <div className="underData">
                      <select
                        value={bbox.selectedLabel}
                        onChange={(e) => handleLabelChange(bbox.id, e.target.value)} >
                        {Labelpice.map((label, index) => (
                          <option key={index} value={label}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={bbox.selectedLabelPart}
                        onChange={(e) => handleLabelPartChange(bbox.id, e.target.value)} >
                          {labelPart.map((label, index) => (
                            <option key={index} value={label}>
                              {label}
                            </option>
                          ))}
                        </select>                      
                      </div>
                    </div>
                  </foreignObject>
                </g>
              ))}
            </g>
            </svg>
          </div>
          {/* {selectedObject != null ? (
            <button onClick={finishAnnotation}>Finish Annotation</button>
          ) : (
            <button onClick={newAnnotation}>New Annotation</button>
          )} */}
          {/* <button onClick={undoAnnotation}>Undo</button> */}
          {/* <button onClick={redoAnnotation}>Redo</button> */}
          <div className="panel">         
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <img src={process.env.PUBLIC_URL + '/caraccident02.jpg'} alt="car accident" />
        </SwiperSlide>
      </Swiper>
      <div className="Pagenavigation">
        <div onClick={handlePrevClick} ref={navigationPrevRef}>
          <PrveIcon />
        </div>
        <div className="SlideCounter">
          {mainImageIndex + 1} / {totalSlides}
        </div>
        <div onClick={handleNextClick} ref={navigationNextRef}>
          <NextIcon />
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
position: relative;
width: 100%;
height: 750px;
margin-bottom: 16px;
overflow:auto;
background-color:#e9e9e9;
}

.svg {
position: absolute;
width: 100%;
height: 100%;
top: 0;
left: 0;
}

.polygon {
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
};

function Workcanvas({ selectedTool,  onAnnotationChange }) {
  // Workcanvas에서 관리하고자 하는 주석 정보를 state로 정의
  const [annotations, setAnnotations] = useState({annotations: [], });

  const addPolygons = (newPolygons) => {
    setAnnotations((prevAnnotations) => ({
      ...prevAnnotations,
      items: [...prevAnnotations.items, ...newPolygons],
    }));
  };
  
  const addBboxData = (newBboxData) => {
    setAnnotations((prevAnnotations) => ({
      ...prevAnnotations,
      items: [...prevAnnotations.items, ...newBboxData],
    }));
  };  

  // Showcase 컴포넌트에서 주석 정보가 업데이트될 때 실행되는 콜백 함수
  const handleAnnotationChange = (newAnnotations) => {
    setAnnotations(newAnnotations);
    // 주석 정보가 업데이트되면 상위 컴포넌트로 전달
    onAnnotationChange(newAnnotations);    
  }; 
  return (
    <div className="Workcanvas">
      <h4>food_20230123.png</h4>
      <div className="canvas">
      <Showcase selectedTool={selectedTool} onAnnotationChange={handleAnnotationChange} />
      </div>
      {/* 주석 정보 확인용 */}
      <div>
        <h5>Annotation Data:</h5>
        <pre>{JSON.stringify(annotations, null, 2)}</pre>
      </div>
    </div>
  );
}

export default Workcanvas;
