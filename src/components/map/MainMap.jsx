import { Map, View } from "ol";
import Layer from "ol/layer/Layer";
import { OSM, Vector, XYZ } from "ol/source";

import "ol/ol.css";
import { useEffect, useRef, useState } from "react";
import TileLayer from "ol/layer/Tile";
import ControlContainer from "./controls/ControlContainer";
import ContextMenu from "./ContextMenu";
import { fromLonLat, transformExtent } from "ol/proj";
import { GeoJSON } from "ol/format";
import { bbox } from "ol/loadingstrategy";
import VectorLayer from "ol/layer/Vector";
import Icon from "ol/style/Icon";
import { LuAArrowDown } from "react-icons/lu";
import { unByKey } from "ol/Observable";

const MainMap = () => {
    const mapRef = useRef(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [menuConfig, setMenuConfig] = useState({ isVisible: false, x: 0, y: 0 });

    useEffect(() => {
        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    // source: new OSM(),
                    source: new XYZ({
                        url: "http://localhost:8081/geoserver/gwc/service/tms/1.0.0/shotest:zoom@EPSG:900913@png/{z}/{x}/{-y}.png",
                    }),
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

        return () => {
            map.setTarget(null);
            keys.forEach((key) => unByKey(key));
        };
    }, []);

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

    return (
        <div ref={mapRef} id="map-container">
            <ControlContainer zoomLevel={zoomLevel} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
            <ContextMenu menuConfig={menuConfig} item={[{ icon: LuAArrowDown, name: "테스트" }, { name: "테스트" }, { name: "테스트" }]} />
        </div>
    );
};

export default MainMap;
