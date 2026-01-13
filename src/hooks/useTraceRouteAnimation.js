import { current } from "@reduxjs/toolkit";
import { Feature } from "ol";
import { LineString, MultiLineString, MultiPoint, Point } from "ol/geom";
import { tile } from "ol/loadingstrategy";
import { fromLonLat } from "ol/proj";
import { Stroke, Style } from "ol/style";
import { useEffect } from "react";


const useTraceRouteAnimation = (traceRouteList, source) => {
    useEffect(() => {
        if (traceRouteList.length === 0) return;

        const routeCoordinates = traceRouteList.filter((traceRoute) => traceRoute.childCoordinates.length != 0)
            .map((route) => route.childCoordinates.flatMap((coordinate) => [fromLonLat([route.parentCoordinate.longitude, route.parentCoordinate.latitude]), fromLonLat([coordinate.longitude, coordinate.latitude])]));

        let index = 0;

        let feature = new Feature({
            geometry: new LineString([])
        });

        const style = new Style({
            stroke: new Stroke({
                width: 3,
                color: "#60a5fa",

            }),
        });
        feature.setStyle(style);

        let start = 0;
        const duration = 300;
        const animate = (time) => {
            if (!start) start = time;

            const currentRouteCoordinates = routeCoordinates[index];
            const currentLine = new LineString(currentRouteCoordinates);
            const fraction = Math.min((time - start) / duration, 1);

            const totalNodes = currentRouteCoordinates.length;
            const currentNodeIndex = Math.floor(fraction * (totalNodes - 1));

            const fractionCoordinate = currentLine.getCoordinateAt(fraction);

            const renderRouteCoordinate = currentRouteCoordinates.slice(0, currentNodeIndex + 1);
            renderRouteCoordinate.push(currentRouteCoordinates[0]);
            renderRouteCoordinate.push(fractionCoordinate);

            feature.getGeometry().setCoordinates(renderRouteCoordinate);


            if (fraction >= 1) {
                index++;
                start = time;
                if (index == routeCoordinates.length) {
                    index = 0;
                    source.clear();
                }

                feature = new Feature({
                    geometry: new LineString([])
                });
                feature.setStyle(style);
                source.addFeature(feature);
            }


            requestAnimationFrame(animate);
        }

        source.addFeature(feature);

        requestAnimationFrame(animate);
    }, [traceRouteList, source])
}

export default useTraceRouteAnimation;