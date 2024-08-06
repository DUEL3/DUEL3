const CoverComponent = ({ isCoverVisible, onClick, text }) => {
  return (
    <>
      {isCoverVisible && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
          style={{ fontFamily: "Londrina Solid" }}
          onClick={onClick}
        >
          <div className="text-center text-8xl">{text}</div>
        </div>
      )}
    </>
  );
};

export default CoverComponent;
