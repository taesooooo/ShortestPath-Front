import MarkerControl from "./MarkerControl";
import Zoom from "./Zoom";

const ControlContainer = (props) => {
    const { zoomLevel, onZoomIn, onZoomOut } = props;

    return (
        <div className="z-10 flex justify-evenly absolute w-96 h-10 top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg ">
            <Zoom zoomLevel={zoomLevel} onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
            <MarkerControl />
        </div>
    );
};

export default ControlContainer;
