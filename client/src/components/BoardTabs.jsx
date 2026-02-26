export default function BoardTabs({ boards, activeBoard, onSelect }) {
  return (
    <div className="flex gap-1 px-6 pb-4 overflow-x-auto">
      {boards.map((board) => (
        <button
          key={board.id}
          onClick={() => onSelect(board)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            activeBoard?.id === board.id
              ? 'bg-accent/15 text-accent border border-accent/30'
              : 'text-gray-500 hover:text-accent hover:bg-accent/5'
          }`}
        >
          {board.name}
        </button>
      ))}
    </div>
  );
}
