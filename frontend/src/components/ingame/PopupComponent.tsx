const PopupComponent = ({
  title,
  description,
  clickOk,
  isCancel,
  clickCancel,
}) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40"
      onClick={() => {
        clickCancel && clickCancel();
      }}
    >
      <div
        className="bg-main border-2 rounded-lg text-center w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-4 pb-2 text-xl">{title}</div>
        {/* To recover stamina you should pay 0.1 ETH */}
        <div className="">{description}</div>
        <div className="flex justify-center mt-8 mb-4">
          <button
            className="p-2 bg-btn text-btntext rounded-md mx-2 w-24"
            onClick={clickOk}
          >
            OK
          </button>
          {isCancel && (
            <button
              className="p-2 bg-gray-600 rounded-md mx-2 w-24"
              onClick={clickCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupComponent;
