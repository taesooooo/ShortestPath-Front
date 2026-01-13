import { Feature } from "ol";
import { LineString } from "ol/geom";
import { Stroke, Style } from "ol/style";

const routeAnimation = (routeCoordinates, source) => {
    let animationId = 0;

    const feature = new Feature({
        geometry: new LineString([]),
    });
    const style = new Style({
        stroke: new Stroke({
            width: 3,
            color: "#60a5fa",
        }),
    });
    feature.setStyle(style);

    let start = 0;
    const duration = 2000;

    const animate = (time) => {
        if (!start) start = time;
        const elapsed = time - start;
        const fraction = Math.min(elapsed / duration, 1);

        const totalLineCount = routeCoordinates.length;
        const currentLineCount = Math.floor(fraction * (totalLineCount - 1));
        const renderCoordinates = routeCoordinates.slice(0, currentLineCount + 1);

        const coordinateA = routeCoordinates[currentLineCount];
        const coordinateB = routeCoordinates[currentLineCount + 1];

        if (coordinateA && coordinateB) {
            const subLine = new LineString([coordinateA, coordinateB]);
            const subFraction = (fraction * (totalLineCount - 1)) - currentLineCount;
            const subCoordinate = subLine.getCoordinateAt(subFraction);

            renderCoordinates.push(subCoordinate)
        }

        feature.getGeometry().setCoordinates(renderCoordinates);

        if (fraction === 1) {
            start = 0;
            animationId = requestAnimationFrame(animate);
        } else {
            animationId = requestAnimationFrame(animate);
        }
    };

    source.clear();
    source.addFeature(feature);
    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
}

export default routeAnimation;