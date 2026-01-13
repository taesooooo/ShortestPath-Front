import { Feature } from "ol";
import { LineString } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { Stroke, Style } from "ol/style";
import { useEffect } from "react";
import routeAnimation from "../animation/routeAnimation";
import traceRouteAnimation from "../animation/traceRouteAnimation";

export const useRouteAnimation = (routeList, routeSource, mode) => {
    let animationCancle = null;

    useEffect(() => {
        if (routeList == null || routeList.length === 0) return;

        if (mode === "route") {
            const routeCoordinates = routeList.map((coordinate) => fromLonLat([coordinate.longitude, coordinate.latitude]));
            animationCancle = routeAnimation(routeCoordinates, routeSource);
        }
        else if (mode === "trace") {
            const routeCoordinates = routeList.filter((traceRoute) => traceRoute.visitedCoordinates.length != 0)
                .map((route) => route.visitedCoordinates.flatMap((coordinate) => [fromLonLat([route.parentCoordinate.longitude, route.parentCoordinate.latitude]), fromLonLat([coordinate.longitude, coordinate.latitude])]));

            animationCancle = traceRouteAnimation(routeCoordinates, routeSource);

        }
        else {

        }

        return () => {
            routeSource.clear();
            // cancelAnimationFrame(animationIndex);
            animationCancle && animationCancle();
        };
    }, [routeList, routeSource]);

}