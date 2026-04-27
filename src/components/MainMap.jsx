import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { Feature, Map, Overlay, View } from "ol";
import Layer from "ol/layer/Layer";
import { OSM, Source, Vector, XYZ } from "ol/source";

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
import { LuAArrowDown, LuMap, LuMapPin } from "react-icons/lu";
import { unByKey } from "ol/Observable";
import VectorSource from "ol/source/Vector";
import { Style, Circle } from "ol/style";
import { makeRegular } from "ol/geom/Polygon";
import { LineString, MultiPoint, Point } from "ol/geom";
import { useDispatch, useSelector } from "react-redux";
import { findRoute, traceRoute } from "../store/routeSearchSlice";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import { useRouteAnimation } from "../hooks/useRouteAnimation";
import useTraceRouteAnimation from "../hooks/useTraceRouteAnimation";
import { searchRestaurants } from "../store/restaurantSearchSlice";
import FoodOverlay from "./map/FoodOverlay";

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
    const storesSourceRef = useRef(null);

    const [overlayVisibleInfo, setOverlayVisibleInfo] = useState(null);
    const overlayElementRef = useRef(null);
    const overlayRef = useRef(null);

    const { routeResultState, traceRouteResultState, foodStoresState, selectedRestaurant, keyword, category } = useSelector((state) => ({
        routeResultState: state.route.routeResult,
        traceRouteResultState: state.route.traceRouteResult,
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
                    return feature;
                },
                { hitTolerance: 3 },
            );

            if (feature) {
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
    }, []);

    useEffect(() => {
        if (routeResultState.routeList == null || routeResultState.routeList.length == 0) return;
        const map = mapRef.current;
        const routeCoordinates = routeResultState.routeList.map((coordinate) => fromLonLat([coordinate.longitude, coordinate.latitude]));
        map.getView().fit(new LineString(routeCoordinates).getExtent(), {
            padding: [100, 100, 100, 100],
            duration: 500,
        });
    }, [mapRef, routeResultState]);

    const routeList = !isRouteTraceMode ? routeResultState.routeList : traceRouteResultState.traceRoutes;
    const mode = !isRouteTraceMode ? "route" : "trace";
    useRouteAnimation(routeList, routeSourceRef.current, mode);

    const handleContextItemClick = () => {
        setMenuConfig((prev) => ({ ...prev, isVisible: false }));
    };

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

        setOverlayVisibleInfo(selectedRestaurant);
        overlayRef.current.setPosition(coordinates);
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
