import { Feature, Map, View } from "ol";
import Layer from "ol/layer/Layer";
import { OSM, Source, Vector, XYZ } from "ol/source";

import "ol/ol.css";
import { useEffect, useRef, useState } from "react";
import TileLayer from "ol/layer/Tile";
import ControlContainer from "./controls/ControlContainer";
import ContextMenu from "./contextmenu/ContextMenu";
import { fromLonLat, toLonLat, transformExtent } from "ol/proj";
import { GeoJSON } from "ol/format";
import { bbox } from "ol/loadingstrategy";
import VectorLayer from "ol/layer/Vector";
import Icon from "ol/style/Icon";
import { LuAArrowDown, LuMapPin } from "react-icons/lu";
import { unByKey } from "ol/Observable";
import VectorSource from "ol/source/Vector";
import { Style, Circle } from "ol/style";
import { makeRegular } from "ol/geom/Polygon";
import { LineString, MultiPoint, Point } from "ol/geom";
import { useDispatch, useSelector } from "react-redux";
import { findRoute } from "../../store/routeSearchSlice";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

const MainMap = () => {
    const mapRef = useRef(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [menuConfig, setMenuConfig] = useState({ isVisible: false, x: 0, y: 0 });
    const [isMarkerCreating, setMarkerCreating] = useState(false);
    const markerLayerRef = useRef(null);
    const [startMarker, setStartMarker] = useState({ lat: null, lon: null });
    const [endMarker, setEndMarker] = useState({ lat: null, lon: null });
    const routeSourceRef = useRef(null);
    const routeLayerRef = useRef(null);

    const { route: routeState } = useSelector((state) => ({
        route: state.route.routeResult,
    }));
    const dispatch = useDispatch();

    useEffect(() => {
        // 경로를 그릴 레이어 초기화
        if (!routeSourceRef.current) {
            routeSourceRef.current = new VectorSource();
            routeLayerRef.current = new VectorLayer({
                source: routeSourceRef.current,
            });
        }

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                    // source: new XYZ({
                    //     url: "http://localhost:8081/geoserver/gwc/service/tms/1.0.0/shotest:zoom@EPSG:900913@png/{z}/{x}/{-y}.png",
                    // }),
                }),
                new VectorLayer({
                    source: new Vector({
                        format: new GeoJSON(),
                        url: function (extent) {
                            return (
                                "http://localhost:8081/geoserver/shotest/wfs?" +
                                "service=WFS&version=1.0.0&" +
                                "request=GetFeature&" +
                                "typeName=shotest:zoom&" +
                                "outputFormat=application/json&" +
                                "srsname=EPSG:4326&" +
                                `bbox=${transformExtent(extent, "EPSG:3857", "EPSG:4326").join(",")}, EPSG:4326`
                            );
                        },
                        strategy: bbox,
                    }),
                }),
                routeLayerRef.current,
            ],
            view: new View({
                center: fromLonLat([127.0, 37.5]),
                zoom: 7,
            }),
            controls: [],
        });

        const updateZoomLevel = () => {
            const view = map.getView();
            setZoomLevel((prev) => Math.round(view.getZoom()));
        };

        const keys = [];

        keys.push(map.getView().on("change:resolution", updateZoomLevel));
        keys.push(
            map.on("contextmenu", (e) => {
                e.preventDefault();
                setMenuConfig({ isVisible: true, x: e.pixel[0], y: e.pixel[1] });
            })
        );

        keys.push(
            map.on("click", () => {
                setMenuConfig((prev) => ({ ...prev, isVisible: false }));
            })
        );

        updateZoomLevel();

        mapRef.current = map;

        // 클린 업
        return () => {
            map.setTarget(null);
            keys.forEach((key) => unByKey(key));
        };
    }, []);

    useEffect(() => {
        if (routeState.routeList.length === 0) return;

        const routeCoordinates = routeState.routeList.map((coordinate) => fromLonLat([coordinate.longitude, coordinate.latitude]));
        const fullLines = new LineString(routeCoordinates);
        const feature = new Feature({
            geometry: new LineString([routeCoordinates[0]]),
        });
        const style = new Style({
            stroke: new Stroke({
                width: 3,
                color: "#60a5fa",
            }),
        });
        feature.setStyle(style);

        const extent = fullLines.getExtent();
        mapRef.current.getView().fit(extent, {
            padding: [150, 150, 150, 150],
            duration: 500,
        });

        let start = null;
        const duration = 5000; // 전체 경로를 5초 동안 그리도록 설정 (숫자가 클수록 느려짐)

        const animate = (time) => {
            if (!start) start = time;
            const elapsed = time - start;
            const fraction = Math.min(elapsed / duration, 1); // 0에서 1까지의 진행률

            // 현재 진행률(fraction)까지의 좌표를 가져옴
            const currentCoord = fullLines.getCoordinateAt(fraction);

            // 현재까지 그려진 좌표 배열을 만들어서 업데이트
            // 1. 이미 지난 고정 점들을 필터링
            const totalLength = fullLines.getLength();
            const currentLength = totalLength * fraction;

            const partialCoords = [];
            let accumulatedLength = 0;

            for (let i = 0; i < routeCoordinates.length - 1; i++) {
                const segment = new LineString([routeCoordinates[i], routeCoordinates[i + 1]]);
                const segmentLength = segment.getLength();

                partialCoords.push(routeCoordinates[i]);

                if (accumulatedLength + segmentLength > currentLength) {
                    // 현재 진행 중인 구간의 보간된 끝점 추가
                    partialCoords.push(currentCoord);
                    break;
                }
                accumulatedLength += segmentLength;

                // 마지막 점 처리
                if (i === routeCoordinates.length - 2) {
                    partialCoords.push(routeCoordinates[i + 1]);
                }
            }

            feature.getGeometry().setCoordinates(partialCoords);

            if (fraction < 1) {
                requestAnimationFrame(animate);
            } else {
                start = 0;
                requestAnimationFrame(animate);
            }
        };

        routeSourceRef.current.clear();
        routeSourceRef.current.addFeature(feature);
        requestAnimationFrame(animate);
    }, [routeState]);

    const handleZoomIn = () => {
        const map = mapRef.current;
        const view = map?.getView();
        if (view) {
            const zoom = view.getZoom();
            view.animate({ zoom: zoom + 1, duration: 250 });
            setZoomLevel((prev) => Math.round(view.getZoom()));
        }
    };

    const handleZoomOut = () => {
        const map = mapRef.current;
        const view = map?.getView();
        if (view) {
            const zoom = view.getZoom();
            view.animate({ zoom: zoom - 1, duration: 250 });
            setZoomLevel((prev) => Math.round(view.getZoom()));
        }
    };

    const newMarker = (type = "blue") => {
        const map = mapRef.current;
        const markerLayer = markerLayerRef.current;
        const layerSource = markerLayer?.getSource();
        const id = type === "blue" ? 1 : 2;

        const markerFeature = layerSource?.getFeatureById(id);
        if (markerFeature != null) {
            layerSource.removeFeature(markerFeature);
        }

        const marker = new Feature({
            geometry: new Point(0, 0),
        });

        // 블루면 시작, 레드면 종료 마커 설정
        marker.set("type", type === "blue" ? "start" : "end");
        marker.setId(type === "blue" ? 1 : 2);

        const markerStyle = new Style({
            image: new Icon({
                src: `/map-pin-${type}.svg`,
                scale: 1,
                anchor: [0.5, 1],
            }),
        });
        marker.setStyle(markerStyle);

        // 마커 레이어가 없으면 새로 생성 후 마커 피쳐 추가
        if (markerLayer === null) {
            const layer = new VectorLayer({
                source: new VectorSource({
                    features: [marker],
                }),
            });

            map.addLayer(layer);
            markerLayerRef.current = layer;
        } else {
            markerLayer.getSource().addFeature(marker);
        }

        return marker;
    };

    const markerCreate = (makerFinalizeClick, type) => {
        const map = mapRef.current;
        // const initCoordinate = toLonLat(map.getCoordinateFromPixel([e.pageX, e.pageY]));
        const marker = newMarker(type);
        const keys = [];

        keys.push(
            map.on("pointermove", (e) => {
                const coordinate = e.coordinate;
                marker.getGeometry().setCoordinates(coordinate);
            })
        );

        keys.push(
            map.on("click", (e) => {
                keys.forEach((key) => unByKey(key));
                const finalCoordinate = toLonLat(e.coordinate);
                makerFinalizeClick(finalCoordinate);
                setMarkerCreating(false);
            })
        );
    };

    const handleStartMarker = (e) => {
        if (isMarkerCreating) return;

        markerCreate((finalCoordinate) => {
            setStartMarker({ lat: finalCoordinate[1], lon: finalCoordinate[0] });
        }, "blue");

        setMarkerCreating(true);
    };

    const handleEndMarker = (e) => {
        if (isMarkerCreating) return;

        markerCreate((finalCoordinate) => {
            const endCoordinate = { lat: finalCoordinate[1], lon: finalCoordinate[0] };
            setEndMarker(endCoordinate);
            dispatch(findRoute({ start: startMarker, end: endCoordinate }));
        }, "red");

        setMarkerCreating(true);
    };

    return (
        <div ref={mapRef} id="map-container">
            <ControlContainer zoomLevel={zoomLevel} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onStartMarker={handleStartMarker} onEndMarker={handleEndMarker} />
            <ContextMenu menuConfig={menuConfig} item={[{ icon: LuAArrowDown, name: "테스트" }, { name: "테스트" }, { name: "테스트" }]} />
        </div>
    );
};

export default MainMap;
