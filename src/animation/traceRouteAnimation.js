import { Feature } from "ol";
import { LineString } from "ol/geom";
import { Stroke, Style } from "ol/style";

const traceRouteAnimation = (routeCoordinates, source) => {

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

    let animationId = 0;
    let index = 0;
    let renderCount = 0;

    const animate = () => {
        renderCount++;
        const currentRouteCoordinates = routeCoordinates[index];
        const renderRouteCoordinate = currentRouteCoordinates.slice(0, renderCount + 1);

        feature.getGeometry().setCoordinates(renderRouteCoordinate);

        if (renderCount + 1 === routeCoordinates[index].length) {
            index++;
            renderCount = 0;

            if (index + 1 === routeCoordinates.length) {
                source.clear();
                index = 0;
            }

            feature = new Feature({
                geometry: new LineString([])
            });
            feature.setStyle(style);

            source.addFeature(feature);

        }

        animationId = requestAnimationFrame(animate);
    }

    source.addFeature(feature);

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
}

export default traceRouteAnimation