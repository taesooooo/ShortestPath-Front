import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { Feature, Map as OlMap, Overlay, View } from "ol";
import { OSM, Vector } from "ol/source";

import "ol/ol.css";
import { useEffect, useRef, useState } from "react";
import TileLayer from "ol/layer/Tile";
import ControlContainer from "./map/controls/ControlContainer";
import ContextMenu from "./map/contextmenu/ContextMenu";
import { fromLonLat, toLonLat, transform, transformExtent } from "ol/proj";
import { GeoJSON } from "ol/format";
import { bbox } from "ol/loadingstrategy";
import VectorLayer from "ol/layer/Vector";
import Icon from "ol/style/Icon";
import { LuMap } from "react-icons/lu";
import { unByKey } from "ol/Observable";
import VectorSource from "ol/source/Vector";
import { Circle as CircleStyle, Fill, Style, Text } from "ol/style";
import { LineString, MultiLineString, Point } from "ol/geom";
import { useDispatch, useSelector } from "react-redux";
import { findRoute, selectRoute, traceRoute } from "../store/routeSearchSlice";
import Stroke from "ol/style/Stroke";
import { searchRestaurants } from "../store/restaurantSearchSlice";
import FoodOverlay from "./map/FoodOverlay";

const isValidCoordinate = (coordinate) => Number.isFinite(coordinate?.longitude) && Number.isFinite(coordinate?.latitude);

const toMapCoordinate = (coordinate) => fromLonLat([coordinate.longitude, coordinate.latitude]);

const toMapLineCoordinates = (coordinates = []) => coordinates.filter(isValidCoordinate).map(toMapCoordinate);

const asArray = (value) => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
};

const getRouteResults = (routeResultState) => asArray(routeResultState).filter(Boolean);

const getCoordinateArray = (coordinates) => (Array.isArray(coordinates) ? coordinates : []);

const getRouteCoordinates = (routeResult) => {
    const routeList = getCoordinateArray(routeResult?.routeList);
    if (routeList.length > 0) return routeList;

    const routeCoordinates = getCoordinateArray(routeResult?.routeCoordinates);
    if (routeCoordinates.length > 0) return routeCoordinates;

    return getCoordinateArray(routeResult?.routeSteps)
        .map((routeStep) => routeStep?.coordinate)
        .filter(isValidCoordinate);
};

const createRouteInfo = (routeResult, routeIndex, source, selectedStep = null) => ({
    source,
    routeIndex,
    start: routeResult?.start ?? null,
    end: routeResult?.end ?? null,
    routeCoordinates: getRouteCoordinates(routeResult),
    routeSteps: routeResult?.routeSteps ?? [],
    traceRoutesCount: routeResult?.traceRoutes?.length ?? 0,
    searchTime: routeResult?.searchTime ?? null,
    selectedStep,
});

const getRouteLines = (routeResultState) =>
    getRouteResults(routeResultState)
        .map((routeResult) => toMapLineCoordinates(getRouteCoordinates(routeResult)))
        .filter((coordinates) => coordinates.length > 0);

const getRouteRenderItems = (routeResultState) =>
    getRouteResults(routeResultState)
        .map((routeResult, routeIndex) => ({
            routeResult,
            routeIndex,
            routeInfo: createRouteInfo(routeResult, routeIndex, "route"),
            lineCoordinates: toMapLineCoordinates(getRouteCoordinates(routeResult)),
        }))
        .filter((routeItem) => routeItem.lineCoordinates.length > 0);

const getDistanceInMeters = (from, to) => {
    const earthRadius = 6371000;
    const toRadians = (value) => (value * Math.PI) / 180;
    const latitudeDistance = toRadians(to.latitude - from.latitude);
    const longitudeDistance = toRadians(to.longitude - from.longitude);
    const fromLatitude = toRadians(from.latitude);
    const toLatitude = toRadians(to.latitude);

    const a = Math.sin(latitudeDistance / 2) ** 2 + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDistance / 2) ** 2;

    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getRouteStepDistance = (routeSteps, startIndex, endIndex) => {
    let distance = 0;

    for (let index = startIndex + 1; index <= endIndex; index++) {
        const previousCoordinate = routeSteps[index - 1]?.coordinate;
        const currentCoordinate = routeSteps[index]?.coordinate;

        if (isValidCoordinate(previousCoordinate) && isValidCoordinate(currentCoordinate)) {
            distance += getDistanceInMeters(previousCoordinate, currentCoordinate);
        }
    }

    return distance;
};

const getGuideSteps = (routeSteps = []) => {
    const guideSteps = [];

    for (let index = 0; index < routeSteps.length; index++) {
        const routeStep = routeSteps[index];

        if (!routeStep?.turnDirection || !isValidCoordinate(routeStep.coordinate)) continue;

        if (routeStep.turnDirection !== "STRAIGHT") {
            guideSteps.push({
                ...routeStep,
                stepIndex: index,
                endStepIndex: index,
                straightCount: 0,
            });
            continue;
        }

        const straightStartIndex = index;
        let straightEndIndex = index;

        while (
            straightEndIndex + 1 < routeSteps.length &&
            routeSteps[straightEndIndex + 1]?.turnDirection === "STRAIGHT" &&
            isValidCoordinate(routeSteps[straightEndIndex + 1]?.coordinate)
        ) {
            straightEndIndex++;
        }

        guideSteps.push({
            ...routeStep,
            coordinate: routeSteps[straightEndIndex].coordinate,
            startCoordinate: routeStep.coordinate,
            endCoordinate: routeSteps[straightEndIndex].coordinate,
            stepIndex: straightStartIndex,
            endStepIndex: straightEndIndex,
            straightCount: straightEndIndex - straightStartIndex + 1,
            distance: getRouteStepDistance(routeSteps, straightStartIndex, straightEndIndex),
        });

        index = straightEndIndex;
    }

    return guideSteps;
};

const getRouteStepFeatures = (routeResultState) =>
    getRouteResults(routeResultState).flatMap((routeResult, routeIndex) =>
        getGuideSteps(routeResult?.routeSteps)
            .filter((routeStep) => isValidCoordinate(routeStep?.coordinate))
            .map((routeStep) => ({
                coordinate: toMapCoordinate(routeStep.coordinate),
                turnDirection: routeStep.turnDirection,
                routeInfo: createRouteInfo(routeResult, routeIndex, "route", {
                    coordinate: routeStep.coordinate,
                    startCoordinate: routeStep.startCoordinate,
                    endCoordinate: routeStep.endCoordinate,
                    turnDirection: routeStep.turnDirection,
                    stepIndex: routeStep.stepIndex,
                    endStepIndex: routeStep.endStepIndex,
                    straightCount: routeStep.straightCount,
                    distance: routeStep.distance,
                }),
                routeIndex,
                stepIndex: routeStep.stepIndex,
                straightCount: routeStep.straightCount,
            })),
    );

const getCoordinateKey = (coordinate) => `${coordinate.latitude.toFixed(7)},${coordinate.longitude.toFixed(7)}`;

const getLineKey = (coordinateA, coordinateB) => [getCoordinateKey(coordinateA), getCoordinateKey(coordinateB)].sort().join("|");

const addCoordinateSide = (coordinateSides, coordinate, searchSide) => {
    const coordinateKey = getCoordinateKey(coordinate);

    if (!coordinateSides.has(coordinateKey)) {
        coordinateSides.set(coordinateKey, new Set());
    }

    coordinateSides.get(coordinateKey).add(searchSide);
};

const getTraceLinesBySearchSide = (traceRoutes = []) => {
    const coordinateSides = new Map();
    const traceSegments = new Map();

    traceRoutes.forEach((traceRoute) => {
        const parentCoordinate = traceRoute?.parentCoordinate;
        const visitedCoordinates = traceRoute?.visitedCoordinates ?? [];
        const searchSide = traceRoute?.searchSide === "REVERSE" ? "REVERSE" : "FORWARD";

        if (!isValidCoordinate(parentCoordinate)) return;

        addCoordinateSide(coordinateSides, parentCoordinate, searchSide);

        visitedCoordinates.filter(isValidCoordinate).forEach((visitedCoordinate) => {
            const lineKey = getLineKey(parentCoordinate, visitedCoordinate);

            addCoordinateSide(coordinateSides, visitedCoordinate, searchSide);

            if (!traceSegments.has(lineKey)) {
                traceSegments.set(lineKey, {
                    parentCoordinate,
                    visitedCoordinate,
                    sides: new Set(),
                });
            }

            traceSegments.get(lineKey).sides.add(searchSide);
        });
    });

    return Array.from(traceSegments.values()).reduce(
        (traceLinesBySearchSide, traceSegment) => {
            const { parentCoordinate, visitedCoordinate, sides } = traceSegment;
            const hasOverlappedSegment = sides.has("FORWARD") && sides.has("REVERSE");
            const hasOverlappedCoordinate =
                coordinateSides.get(getCoordinateKey(parentCoordinate))?.size > 1 ||
                coordinateSides.get(getCoordinateKey(visitedCoordinate))?.size > 1;
            const lineCoordinates = [toMapCoordinate(parentCoordinate), toMapCoordinate(visitedCoordinate)];
            const searchSide = sides.has("REVERSE") ? "REVERSE" : "FORWARD";

            if (hasOverlappedSegment || hasOverlappedCoordinate) {
                traceLinesBySearchSide.OVERLAP.push(lineCoordinates);
                return traceLinesBySearchSide;
            }

            traceLinesBySearchSide[searchSide].push(lineCoordinates);
            return traceLinesBySearchSide;
        },
        {
            FORWARD: [],
            REVERSE: [],
            OVERLAP: [],
        },
    );
};

const createLineFeature = (geometry, color, width = 3, properties = {}) => {
    const feature = new Feature({ geometry });
    Object.entries(properties).forEach(([key, value]) => feature.set(key, value));
    feature.setStyle(
        new Style({
            stroke: new Stroke({
                width,
                color,
            }),
        }),
    );

    return feature;
};

const getRouteStepStyleConfig = (turnDirection) => {
    switch (turnDirection) {
        case "START":
            return { color: "#16a34a", label: "S", radius: 8 };
        case "END":
            return { color: "#dc2626", label: "E", radius: 8 };
        case "LEFT":
            return { color: "#f59e0b", label: "L", radius: 7 };
        case "RIGHT":
            return { color: "#f59e0b", label: "R", radius: 7 };
        case "STRAIGHT":
            return { color: "#0ea5e9", label: "↑", radius: 6 };
        case "U_TURN":
            return { color: "#9333ea", label: "U", radius: 7 };
        default:
            return { color: "#64748b", label: "", radius: 4 };
    }
};

const directionLabels = {
    START: "출발",
    STRAIGHT: "직진",
    LEFT: "좌회전",
    RIGHT: "우회전",
    U_TURN: "유턴",
    END: "도착",
};

const formatDistance = (meters) => {
    if (!Number.isFinite(meters)) return "";
    if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
    return `${Math.round(meters)} m`;
};

const getHoveredRouteStepText = (routeStep) => {
    const label = directionLabels[routeStep?.turnDirection] ?? routeStep?.turnDirection ?? "";

    if (routeStep?.turnDirection !== "STRAIGHT") return label;

    const distanceText = formatDistance(routeStep.distance);
    return distanceText ? `${label} ${distanceText}` : label;
};

const createRouteStepFeature = ({ coordinate, turnDirection, routeInfo, routeIndex, stepIndex }) => {
    const { color, label, radius } = getRouteStepStyleConfig(turnDirection);
    const feature = new Feature({ geometry: new Point(coordinate) });

    feature.set("routeStep", { turnDirection, routeIndex, stepIndex });
    if (routeInfo) {
        feature.set("routeInfo", routeInfo);
    }
    feature.setStyle(
        new Style({
            image: new CircleStyle({
                radius,
                fill: new Fill({ color }),
                stroke: new Stroke({
                    color: "#ffffff",
                    width: 2,
                }),
            }),
            text: label
                ? new Text({
                      text: label,
                      fill: new Fill({ color: "#ffffff" }),
                      font: "bold 11px sans-serif",
                  })
                : undefined,
        }),
    );

    return feature;
};

const createHoveredRouteStepFeature = (routeStep) => {
    const coordinate = routeStep?.coordinate;

    if (!isValidCoordinate(coordinate)) return null;

    const feature = new Feature({
        geometry: new Point(toMapCoordinate(coordinate)),
    });

    feature.setStyle(
        new Style({
            text: new Text({
                text: getHoveredRouteStepText(routeStep),
                offsetY: -18,
                font: "bold 12px sans-serif",
                fill: new Fill({ color: "#ffffff" }),
                backgroundFill: new Fill({ color: "rgba(17, 24, 39, 0.9)" }),
                padding: [4, 6, 4, 6],
            }),
        }),
    );

    return feature;
};

const MainMap = () => {
    proj4.defs("EPSG:5174", "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43");

    // 2. 오픈레이어스에 proj4 등록
    register(proj4);

    const mapRef = useRef(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [menuConfig, setMenuConfig] = useState({ isVisible: false, x: 0, y: 0 });
    const [isMarkerCreating, setMarkerCreating] = useState(false);
    const markerLayerRef = useRef(null);
    const [startMarker, setStartMarker] = useState({ lat: null, lon: null });
    const [endMarker, setEndMarker] = useState({ lat: null, lon: null });
    const [isRouteTraceMode, setRouteTraceMode] = useState(false);
    const routeSourceRef = useRef(null);
    const routeLayerRef = useRef(null);
    const hoveredRouteStepSourceRef = useRef(null);
    const hoveredRouteStepLayerRef = useRef(null);
    const storesSourceRef = useRef(null);

    const [overlayVisibleInfo, setOverlayVisibleInfo] = useState(null);
    const overlayElementRef = useRef(null);
    const overlayRef = useRef(null);

    const { routeResultState, traceRouteResultState, hoveredRouteStep, focusedRouteStep, foodStoresState, selectedRestaurant, keyword, category } = useSelector((state) => ({
        routeResultState: state.route.routeResult,
        traceRouteResultState: state.route.traceRouteResult,
        hoveredRouteStep: state.route.hoveredRouteStep,
        focusedRouteStep: state.route.focusedRouteStep,
        foodStoresState: state.restaurant.restaurants,
        selectedRestaurant: state.restaurant.selectedRestaurant,
        keyword: state.restaurant.keyword,
        category: state.restaurant.category,
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

        if (!hoveredRouteStepSourceRef.current) {
            hoveredRouteStepSourceRef.current = new VectorSource();
            hoveredRouteStepLayerRef.current = new VectorLayer({
                source: hoveredRouteStepSourceRef.current,
                zIndex: 1000,
            });
        }

        const map = new OlMap({
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
                hoveredRouteStepLayerRef.current,
            ],
            view: new View({
                center: fromLonLat([127.0, 37.5]),
                zoom: 7,
            }),
            controls: [],
        });

        const updateZoomLevel = () => {
            const view = map.getView();
            setZoomLevel(Math.round(view.getZoom()));
        };

        const keys = [];

        keys.push(map.getView().on("change:resolution", updateZoomLevel));
        keys.push(
            map.on("contextmenu", (e) => {
                e.preventDefault();
                setMenuConfig({ isVisible: true, x: e.pixel[0], y: e.pixel[1] });
            }),
        );

        keys.push(
            map.on("click", () => {
                setMenuConfig((prev) => ({ ...prev, isVisible: false }));
            }),
        );

        updateZoomLevel();

        const overlay = new Overlay({
            element: overlayElementRef.current,
            positioning: "bottom-center",
            stopEvent: true,
            offset: [0, -30],
            // position: [],
            autoPan: true,
        });

        map.addOverlay(overlay);
        overlayRef.current = overlay;

        // 지도 클릭시 마커를 확인하고 오버레이 표시
        map.on("singleclick", (e) => {
            const feature = map.forEachFeatureAtPixel(
                e.pixel,
                (feature) => {
                    return feature.get("routeInfo") || feature.get("storeInfo") ? feature : null;
                },
                { hitTolerance: 3 },
            );

            if (feature?.get("routeInfo")) {
                dispatch(selectRoute(feature.get("routeInfo")));
                overlay.setPosition(undefined);
                setOverlayVisibleInfo(null);
            } else if (feature?.get("storeInfo")) {
                const coordinates = feature.getGeometry().getCoordinates();
                overlay.setPosition(coordinates);
                setOverlayVisibleInfo(feature.get("storeInfo"));
            } else {
                overlay.setPosition(undefined);
                setOverlayVisibleInfo(null);
            }
        });

        mapRef.current = map;

        // 클린 업
        return () => {
            map.setTarget(null);
            keys.forEach((key) => unByKey(key));
        };
    }, [dispatch]);

    useEffect(() => {
        const map = mapRef.current;
        const routeLines = getRouteLines(routeResultState);

        if (!map || routeLines.length === 0) return;

        map.getView().fit(new MultiLineString(routeLines).getExtent(), {
            padding: [100, 100, 100, 100],
            duration: 500,
        });
    }, [routeResultState]);

    useEffect(() => {
        const routeSource = routeSourceRef.current;

        if (!routeSource) return;

        routeSource.clear();

        if (!isRouteTraceMode) {
            const routeItems = getRouteRenderItems(routeResultState);
            const routeStepFeatures = getRouteStepFeatures(routeResultState).map(createRouteStepFeature);

            routeItems.forEach((routeItem) => {
                routeSource.addFeature(createLineFeature(new LineString(routeItem.lineCoordinates), "#60a5fa", 4, { routeInfo: routeItem.routeInfo }));
            });

            if (routeStepFeatures.length > 0) {
                routeSource.addFeatures(routeStepFeatures);
            }

            return;
        }

        const traceLinesBySearchSide = getTraceLinesBySearchSide(traceRouteResultState.traceRoutes);
        const finalRouteLine = toMapLineCoordinates(getRouteCoordinates(traceRouteResultState));
        const traceRouteInfo = createRouteInfo(
            {
                start: traceRouteResultState.start,
                end: traceRouteResultState.end,
                routeSteps: traceRouteResultState.routeSteps,
                traceRoutes: traceRouteResultState.traceRoutes,
                searchTime: traceRouteResultState.searchTime,
            },
            0,
            "trace",
        );

        if (traceLinesBySearchSide.FORWARD.length > 0) {
            routeSource.addFeature(createLineFeature(new MultiLineString(traceLinesBySearchSide.FORWARD), "#2dd4bf", 2));
        }

        if (traceLinesBySearchSide.REVERSE.length > 0) {
            routeSource.addFeature(createLineFeature(new MultiLineString(traceLinesBySearchSide.REVERSE), "#fb923c", 2));
        }

        if (traceLinesBySearchSide.OVERLAP.length > 0) {
            routeSource.addFeature(createLineFeature(new MultiLineString(traceLinesBySearchSide.OVERLAP), "#fb7185", 3));
        }

        if (finalRouteLine.length > 0) {
            routeSource.addFeature(createLineFeature(new LineString(finalRouteLine), "#38bdf8", 4, { routeInfo: traceRouteInfo }));
        }

        const tracePointFeatures = [
            isValidCoordinate(traceRouteResultState.start)
                ? createRouteStepFeature({
                      coordinate: toMapCoordinate(traceRouteResultState.start),
                      turnDirection: "START",
                      routeInfo: traceRouteInfo,
                      routeIndex: 0,
                      stepIndex: 0,
                  })
                : null,
            isValidCoordinate(traceRouteResultState.end)
                ? createRouteStepFeature({
                      coordinate: toMapCoordinate(traceRouteResultState.end),
                      turnDirection: "END",
                      routeInfo: traceRouteInfo,
                      routeIndex: 0,
                      stepIndex: finalRouteLine.length - 1,
                  })
                : null,
        ].filter(Boolean);

        if (tracePointFeatures.length > 0) {
            routeSource.addFeatures(tracePointFeatures);
        }
    }, [isRouteTraceMode, routeResultState, traceRouteResultState]);

    useEffect(() => {
        const hoveredRouteStepSource = hoveredRouteStepSourceRef.current;

        if (!hoveredRouteStepSource) return;

        hoveredRouteStepSource.clear();

        const hoveredFeature = createHoveredRouteStepFeature(hoveredRouteStep);

        if (hoveredFeature) {
            hoveredRouteStepSource.addFeature(hoveredFeature);
        }
    }, [hoveredRouteStep]);

    useEffect(() => {
        if (!isValidCoordinate(focusedRouteStep?.coordinate)) return;

        const map = mapRef.current;

        if (!map) return;

        map.getView().animate({
            center: toMapCoordinate(focusedRouteStep.coordinate),
            zoom: Math.max(map.getView().getZoom() ?? 16, 16),
            duration: 400,
        });
    }, [focusedRouteStep]);

    const handleContextItemClick = () => {
        setMenuConfig((prev) => ({ ...prev, isVisible: false }));
    };

    const handleZoomIn = () => {
        const map = mapRef.current;
        const view = map?.getView();
        if (view) {
            const zoom = view.getZoom();
            view.animate({ zoom: zoom + 1, duration: 250 });
            setZoomLevel(Math.round(view.getZoom()));
        }
    };

    const handleZoomOut = () => {
        const map = mapRef.current;
        const view = map?.getView();
        if (view) {
            const zoom = view.getZoom();
            view.animate({ zoom: zoom - 1, duration: 250 });
            setZoomLevel(Math.round(view.getZoom()));
        }
    };

    const newMarker = (type = "blue") => {
        const map = mapRef.current;
        const markerLayer = markerLayerRef.current;
        const layerSource = markerLayer?.getSource();
        const id = type === "blue" ? 1 : 2;

        const markerFeature = layerSource?.getFeatureById(id);
        //  기존 마커 제거
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

    const markerCreate = (markingComplete, type) => {
        const map = mapRef.current;
        // const initCoordinate = toLonLat(map.getCoordinateFromPixel([e.pageX, e.pageY]));
        const marker = newMarker(type);
        const keys = [];

        keys.push(
            map.on("pointermove", (e) => {
                const coordinate = e.coordinate;
                marker.getGeometry().setCoordinates(coordinate);
            }),
        );

        keys.push(
            map.on("click", (e) => {
                keys.forEach((key) => unByKey(key));
                const finalCoordinate = toLonLat(e.coordinate);
                markingComplete(finalCoordinate);
            }),
        );
    };

    const handleStartMarker = (isOverlayClick = false) => {
        if (isMarkerCreating) return;

        const markingComplete = (finalCoordinate) => {
            setStartMarker({ lat: finalCoordinate[1], lon: finalCoordinate[0] });
            setMarkerCreating(false);
        };

        if (!isOverlayClick) {
            markerCreate(markingComplete, "blue");

            setMarkerCreating(true);
        } else {
            // 오버레이에서 출발 클릭시 좌표에 출발 마커 표시 및 출발지 설정
            const coordinate = transform([overlayVisibleInfo.x, overlayVisibleInfo.y], "EPSG:5174", "EPSG:4326");
            const marker = newMarker("blue");
            marker.getGeometry().setCoordinates(transform([overlayVisibleInfo.x, overlayVisibleInfo.y], "EPSG:5174", "EPSG:3857"));
            markingComplete(coordinate);
        }
    };

    const handleEndMarker = (isOverlayClick = false) => {
        if (isMarkerCreating) return;

        const markingComplete = (finalCoordinate) => {
            const endCoordinate = { lat: finalCoordinate[1], lon: finalCoordinate[0] };
            setEndMarker(endCoordinate);
            setMarkerCreating(false);
            dispatch(findRoute({ start: startMarker, end: endCoordinate }));
        };

        if (!isOverlayClick) {
            markerCreate(markingComplete, "red");

            setMarkerCreating(true);
        } else {
            // 오버레이에서 도착 클릭시 좌표에 도착 마커 표시 및 도착지 설정
            const coordinate = transform([overlayVisibleInfo.x, overlayVisibleInfo.y], "EPSG:5174", "EPSG:4326");
            const marker = newMarker("red");
            marker.getGeometry().setCoordinates(transform([overlayVisibleInfo.x, overlayVisibleInfo.y], "EPSG:5174", "EPSG:3857"));
            markingComplete(coordinate);
        }

        setRouteTraceMode(false);
    };

    const handleToggleRouteView = () => {
        if (isRouteTraceMode) {
            setRouteTraceMode((prev) => !prev);
        } else {
            dispatch(traceRoute({ start: startMarker, end: endMarker }));
            setRouteTraceMode(true);
        }
    };

    const handleSearchRestaurants = () => {
        const map = mapRef.current;
        const view = map.getView();
        const extent = view.calculateExtent(map.getSize());
        const bbox = transformExtent(extent, "EPSG:3857", "EPSG:4326");

        dispatch(
            searchRestaurants({
                page: 1,
                size: 10,
                keyword,
                category,
                boundingBox: bbox,
            }),
        );
    };

    // 음식점 검색 후 마커 표시
    useEffect(() => {
        if (foodStoresState.length === 0) return;

        const features = foodStoresState.map((store) => {
            if (store.x && store.y) {
                const coordi = transform([store.x, store.y], "EPSG:5174", "EPSG:3857");
                return new Feature({
                    geometry: new Point(coordi),
                    storeInfo: store,
                });
            }

            return null;
        });
        const markerStyle = new Style({
            image: new Icon({
                src: `/map-pin-green.svg`,
                scale: 1,
                anchor: [0.5, 1],
            }),
        });

        if (storesSourceRef.current) {
            storesSourceRef.current.clear();
            storesSourceRef.current.addFeatures(features);
        } else {
            storesSourceRef.current = new VectorSource({
                features: features,
            });

            mapRef.current.addLayer(
                new VectorLayer({
                    style: markerStyle,
                    source: storesSourceRef.current,
                }),
            );
        }

        const extent = storesSourceRef.current.getExtent();
        mapRef.current.getView().fit(extent, {
            padding: [100, 100, 100, 100],
            duration: 500,
        });
    }, [foodStoresState]);

    // 음식점 선택 시 맵 이동
    useEffect(() => {
        if (!selectedRestaurant || !selectedRestaurant.x || !selectedRestaurant.y) return;

        const map = mapRef.current;
        const coordinates = transform([selectedRestaurant.x, selectedRestaurant.y], "EPSG:5174", "EPSG:3857");

        map.getView().animate({
            center: coordinates,
            zoom: 16,
            duration: 500,
        });

        overlayRef.current.setPosition(coordinates);
        queueMicrotask(() => setOverlayVisibleInfo(selectedRestaurant));
    }, [selectedRestaurant]);

    return (
        <div className="relative w-full h-screen">
            <div ref={mapRef} className="w-full h-full" />
            <ControlContainer zoomLevel={zoomLevel} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onStartMarker={handleStartMarker} onEndMarker={handleEndMarker} />
            <ContextMenu
                menuConfig={menuConfig}
                onClick={handleContextItemClick}
                item={[
                    { icon: LuMap, name: !isRouteTraceMode ? "현재 경로 추적" : "현재 경로 확인", action: handleToggleRouteView },
                    { icon: LuMap, name: "현재 화면에서 음식점 조회", action: handleSearchRestaurants },
                ]}
            />
            <div>
                <FoodOverlay ref={overlayElementRef} visibleInfo={overlayVisibleInfo} onStartMarker={handleStartMarker} onEndMarker={handleEndMarker} />
            </div>
        </div>
    );
};

export default MainMap;
