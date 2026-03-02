import "../assets/css/loading-line.css";

const LoadingLine = ({ width }: { width: string }) => {
    return (
        <div className="loading-line">
            <div className="full" style={{width: width}}>

            </div>
        </div>
    );
}

export default LoadingLine;